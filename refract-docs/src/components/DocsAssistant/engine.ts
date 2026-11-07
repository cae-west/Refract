/**
 * Retrieval engine for the "Ask Refract" docs assistant.
 *
 * Questions are matched against heading-level sections of the docs using BM25
 * ranking with field weights (section heading > page title > prose > code),
 * light stemming, camelCase splitting, and a small Refract-specific synonym map
 * so that "React's useState" finds refractions and "custom hook" finds optics.
 * The best section becomes the answer; the next best sections become sources.
 */

export type Paragraph =
  | {type: 'p'; text: string}
  | {type: 'list'; items: string[]}
  | {type: 'table'; rows: string[]};

export type Section = {
  id: string;
  page: string;
  heading: string | null;
  url: string;
  paragraphs: Paragraph[];
  code: {lang: string; code: string}[];
};

export type Index = {
  pages: {title: string; url: string; description?: string}[];
  sections: Section[];
};

export type Source = {page: string; heading: string | null; url: string};

export type Answer = {
  kind: 'answer' | 'fallback' | 'smalltalk';
  intro: string;
  paragraphs: Paragraph[];
  code?: {lang: string; code: string};
  sources: Source[];
  contextText?: string; // retrieved text, sent to an optional LLM endpoint
};

const STOP = new Set(
  'a an and are as at be but by can do does for from how i if in into is it its me my of on or should so that the their them then there these this to use using was we what when where which who why will with you your vs versus about get want need make work works does did'.split(
    ' ',
  ),
);

// Query-side expansions: words people type → words the docs use.
const SYNONYMS: Record<string, string[]> = {
  state: ['refraction'],
  usestate: ['refraction', 'userefraction'],
  signal: ['refraction'],
  store: ['refraction', 'global'],
  variable: ['refraction'],
  reactive: ['refraction'],
  hook: ['optic'],
  custom: ['optic'],
  reuse: ['optic'],
  reusable: ['optic'],
  usememo: ['derive'],
  memo: ['derive'],
  computed: ['derive'],
  calculate: ['derive'],
  compute: ['derive'],
  uselayouteffect: ['useflash'],
  layout: ['useflash', 'measure'],
  before: ['paint'],
  focus: ['useflash'],
  animate: ['transition', 'animation'],
  animation: ['transition'],
  spring: ['transition'],
  websocket: ['stream', 'fromstream'],
  realtime: ['stream', 'live'],
  live: ['stream'],
  socket: ['stream'],
  install: ['installation', 'npm', 'create'],
  setup: ['installation', 'create'],
  start: ['quick', 'create'],
  begin: ['quick', 'introduction'],
  props: ['prop'],
  usecontext: ['context', 'provide'],
  share: ['global', 'local', 'context', 'provide'],
  shared: ['global', 'context'],
  render: ['rerender', 'component'],
  rerender: ['render', 'reactivity'],
  performance: ['reactivity', 'compiler', 'optimize'],
  fast: ['optimize'],
  cleanup: ['cleanup', 'unmount'],
  leak: ['cleanup'],
  test: ['testing', 'render'],
  error: ['troubleshooting', 'onerror'],
  bug: ['troubleshooting'],
  config: ['configuration', 'defineconfig'],
  configure: ['configuration'],
  typescript: ['typescript', 'type'],
  ts: ['typescript'],
  fetch: ['fetch', 'usefetch'],
  api: ['fetch'],
  dark: ['theme'],
  mode: ['theme'],
  difference: ['versus'],
  compare: ['versus', 'react'],
  production: ['stable', 'semantic', 'changelog'],
  stable: ['production', 'semantic'],
  version: ['semantic', 'changelog', 'release'],
  contribute: ['contributing', 'pull'],
  command: ['cli'],
  mount: ['createapp', 'mount'],
  array: ['mutate', 'update'],
  list: ['update', 'map'],
  persist: ['persist', 'localstorage'],
  save: ['persist', 'localstorage'],
  localstorage: ['persist'],
};

// Synonym keys and values are stemmed once, the same way query words are, so
// keys such as "props" or "shared" match the stemmed tokens. A Map (rather than
// a plain object lookup) means words like "constructor" can't hit
// Object.prototype.
const SYNONYM_MAP = new Map<string, string[]>();
for (const [key, values] of Object.entries(SYNONYMS)) {
  const k = stem(key);
  SYNONYM_MAP.set(k, [...new Set([...(SYNONYM_MAP.get(k) ?? []), ...values.map(stem)])]);
}

function synonymsFor(token: string): string[] {
  return SYNONYM_MAP.get(token) ?? [];
}

function stem(w: string): string {
  if (w.length <= 4) return w;
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 6) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 5) return w.slice(0, -2);
  if (w.endsWith('es') && /(ch|sh|x|ss)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.match(/[A-Za-z][A-Za-z0-9]*/g) ?? []) {
    const lower = raw.toLowerCase();
    if (!STOP.has(lower)) out.push(stem(lower));
    // Split camelCase so "useRefraction" also matches "refraction".
    const parts = raw.split(/(?=[A-Z])/).filter((p) => p.length > 2);
    if (parts.length > 1) {
      for (const p of parts) {
        const pl = p.toLowerCase();
        if (!STOP.has(pl) && pl !== 'use') out.push(stem(pl));
      }
    }
  }
  return out;
}

function paragraphText(p: Paragraph): string {
  if (p.type === 'p') return p.text;
  if (p.type === 'list') return p.items.join(' ');
  return p.rows.join(' ');
}

type Doc = {section: Section; fields: Map<string, number>[]; lengths: number[]};

const FIELD_WEIGHTS = [3.2, 1.8, 1, 0.4]; // heading, page, prose, code

export class AssistantEngine {
  private docs: Doc[];
  private df = new Map<string, number>();
  private avgLen: number[];
  readonly index: Index;

  constructor(index: Index) {
    this.index = index;
    this.docs = index.sections.map((section) => {
      const texts = [
        section.heading ?? section.page,
        section.page,
        section.paragraphs.map(paragraphText).join(' '),
        section.code.map((c) => c.code).join(' '),
      ];
      const fields = texts.map((t) => {
        const tf = new Map<string, number>();
        for (const tok of tokenize(t)) tf.set(tok, (tf.get(tok) ?? 0) + 1);
        return tf;
      });
      const seen = new Set<string>();
      fields.forEach((f) => f.forEach((_, k) => seen.add(k)));
      seen.forEach((k) => this.df.set(k, (this.df.get(k) ?? 0) + 1));
      return {section, fields, lengths: fields.map((f) => [...f.values()].reduce((a, b) => a + b, 0))};
    });
    this.avgLen = FIELD_WEIGHTS.map(
      (_, i) => this.docs.reduce((s, d) => s + d.lengths[i], 0) / Math.max(1, this.docs.length),
    );
  }

  private expand(question: string): Map<string, number> {
    const terms = new Map<string, number>();
    for (const t of tokenize(question)) {
      terms.set(t, Math.max(terms.get(t) ?? 0, 1));
      for (const s of synonymsFor(t)) {
        if (!terms.has(s)) terms.set(s, 0.45);
      }
    }
    return terms;
  }

  search(question: string, limit = 5): {section: Section; score: number; matched: number}[] {
    const terms = this.expand(question);
    const N = this.docs.length;
    const k1 = 1.2;
    const b = 0.6;
    const results = this.docs.map((doc) => {
      let score = 0;
      let matched = 0;
      terms.forEach((qWeight, term) => {
        const df = this.df.get(term);
        if (!df) return;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        let termScore = 0;
        doc.fields.forEach((tf, i) => {
          const f = tf.get(term);
          if (!f) return;
          const norm = f / (f + k1 * (1 - b + (b * doc.lengths[i]) / Math.max(1, this.avgLen[i])));
          termScore += FIELD_WEIGHTS[i] * norm;
        });
        if (termScore > 0 && qWeight === 1) matched++;
        score += idf * termScore * qWeight;
      });
      // Reward sections that match more of the words the reader actually typed.
      const typed = [...terms.values()].filter((w) => w === 1).length;
      if (typed) score *= 1 + matched / typed;
      // Overview sections without a heading are less specific than named ones.
      if (!doc.section.heading) score *= 0.85;
      // Prefer explanations over reference odds and ends, unless asked for.
      const url = doc.section.url;
      if (url.includes('/guides/testing') && !terms.has('test') && !terms.has('testing')) score *= 0.6;
      if (url.includes('/resources/glossary')) score *= 0.75;
      if (url.includes('/resources/changelog') && !terms.has('changelog') && !terms.has('release')) score *= 0.5;
      return {section: doc.section, score, matched};
    });
    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  answer(question: string): Answer {
    const small = smallTalk(question);
    if (small) return small;

    const hits = this.search(question, 8);
    const queryTerms = tokenize(question).length;
    const best = hits[0];

    if (!best || best.score < 2.5 || (queryTerms > 0 && best.matched === 0 && best.score < 4)) {
      return {
        kind: 'fallback',
        intro:
          "I couldn't find that in the Refract docs. Try rephrasing with a Refract term like refraction, lens, optic or effect, or start from one of these pages:",
        paragraphs: [],
        sources: [
          {page: 'Introduction', heading: null, url: this.pageUrl('Introduction')},
          {page: 'Quick start', heading: null, url: this.pageUrl('Quick start')},
          {page: 'API reference', heading: null, url: this.pageUrl('API reference')},
        ].filter((s) => s.url),
      };
    }

    const section = best.section;
    const qTokens = new Set(tokenize(question).flatMap((t) => [t, ...synonymsFor(t)]));

    // Keep the most relevant paragraphs, in their original order.
    const scored = section.paragraphs.map((p, i) => {
      const toks = tokenize(paragraphText(p));
      const overlap = toks.filter((t) => qTokens.has(t)).length;
      return {p, i, s: overlap / Math.sqrt(toks.length + 1) + (i === 0 ? 0.35 : 0)};
    });
    const picked = scored
      .filter((x) => x.p.type !== 'p' || x.p.text.trim())
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .sort((a, b) => a.i - b.i)
      .map((x) => x.p);

    const wantsCode = /\b(how|example|show|code|write|create|use|make|build|add|syntax)\b/i.test(question);
    const code = section.code.length && (wantsCode || picked.length < 2) ? section.code[0] : undefined;

    const sources: Source[] = [];
    const seen = new Set<string>();
    for (const h of hits) {
      if (h.score < best.score * 0.45 || sources.length >= 3) break;
      const key = h.section.url.split('#')[0] + (h === best ? '' : h.section.heading ?? '');
      if (seen.has(h.section.url) || (h !== best && seen.has(key))) continue;
      seen.add(h.section.url);
      seen.add(key);
      sources.push({page: h.section.page, heading: h.section.heading, url: h.section.url});
    }

    const where = section.heading ? `“${section.heading}” in ${section.page}` : section.page;
    return {
      kind: 'answer',
      intro: `From ${where}:`,
      paragraphs: picked,
      code,
      sources,
      contextText: hits
        .slice(0, 4)
        .map(
          (h) =>
            `## ${h.section.page}${h.section.heading ? ' › ' + h.section.heading : ''} (${h.section.url})\n` +
            h.section.paragraphs.map(paragraphText).join('\n') +
            (h.section.code[0] ? `\n\`\`\`${h.section.code[0].lang}\n${h.section.code[0].code}\n\`\`\`` : ''),
        )
        .join('\n\n'),
    };
  }

  private pageUrl(title: string): string {
    return this.index.pages.find((p) => p.title === title)?.url ?? '';
  }
}

function smallTalk(q: string): Answer | null {
  const s = q.trim().toLowerCase().replace(/[!.?]+$/, '');
  const reply = (intro: string): Answer => ({kind: 'smalltalk', intro, paragraphs: [], sources: []});
  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(s) && s.split(/\s+/).length <= 3)
    return reply('Hi! Ask me anything about Refract, for example “How do I share state between components?”');
  if (/^(thanks|thank you|thx|cheers|great|perfect|awesome)\b/.test(s) && s.split(/\s+/).length <= 4)
    return reply('Glad that helped. Ask another question any time.');
  if (/^(who|what) are you/.test(s) || /^what can you do/.test(s))
    return reply(
      'I’m the Refract docs assistant. I search these docs for the section that best answers your question, summarize it, and link to the pages I used.',
    );
  return null;
}
