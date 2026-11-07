// Builds the knowledge base for the "Ask Refract" docs assistant.
//
// After every docs page is loaded, this plugin reads each Markdown source,
// splits it into sections at ## and ### headings, and writes the sections to a
// JSON module. The assistant lazy-loads that module the first time someone
// opens it, so the index never weighs down normal page loads.
//
// Because the index is generated from the docs on every build, new or edited
// pages become answerable without any manual step.

const fs = require('fs');
const path = require('path');
const {createSlugger} = require('@docusaurus/utils');

const ALIAS = '@refract/assistant-index';

/**
 * Remove front matter, MDX imports/JSX wrappers, and admonition fences.
 * Lines inside fenced code blocks are left alone, so code examples keep their
 * `import` lines and JSX.
 */
function cleanSource(raw) {
  const lines = raw
    .replace(/\r\n?/g, '\n')
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .split('\n');
  let inFence = false;
  const out = [];
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (/^import .*$/.test(line)) continue;
    if (/^\s*<\/?(Tabs|TabItem|div)[^>]*>\s*$/.test(line)) continue;
    const admonition = /^:::(\w+)(\[[^\]]*\])?\s*$/.exec(line);
    if (admonition) {
      if (admonition[2]) out.push(`${admonition[2].slice(1, -1)}:`);
      continue;
    }
    if (/^:::\s*$/.test(line)) continue;
    out.push(line);
  }
  return out.join('\n');
}

/**
 * Turn inline Markdown into plain text for searching and display.
 * Inline code spans are set aside first so that JSX inside backticks, such as
 * `<ThemeToggle />`, isn't mistaken for an HTML tag and stripped.
 */
function plain(md) {
  const spans = [];
  return md
    .replace(/`[^`]+`/g, (span) => `\u0000${spans.push(span) - 1}\u0000`)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\W)_([^_]+)_(\W|$)/g, '$1$2$3')
    .replace(/<[^>]+>/g, '')
    .replace(/\\\|/g, '|')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)])
    .trim();
}

/** Split a doc into heading-level sections with prose, tables and code kept apart. */
function toSections(doc, raw) {
  const slugger = createSlugger();
  const lines = cleanSource(raw).split('\n');
  const sections = [];
  let current = {heading: null, anchor: '', level: 1, lines: []};
  let inFence = false;

  const flush = () => {
    const body = current.lines.join('\n');
    const code = [];
    const prose = body.replace(/```([\w-]*)[^\n]*\n([\s\S]*?)```/g, (_, lang, src) => {
      if (lang !== 'mermaid') code.push({lang: lang || 'text', code: src.trimEnd()});
      return '\n';
    });

    const paragraphs = [];
    for (const block of prose.split(/\n\s*\n/)) {
      const text = block.trim();
      if (!text || /^#\s/.test(text)) continue;
      if (/^\|/.test(text)) {
        // Tables become "cell — cell" rows so they stay readable as text.
        const rows = text
          .split('\n')
          .filter((r) => !/^\|\s*-/.test(r))
          .map((r) =>
            r.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => plain(c)).filter(Boolean).join(' — '),
          );
        paragraphs.push({type: 'table', rows});
      } else if (/^(\s*[-*]|\s*\d+\.)\s/.test(text)) {
        paragraphs.push({
          type: 'list',
          items: text.split(/\n(?=\s*(?:[-*]|\d+\.)\s)/).map((i) => plain(i.replace(/^\s*(?:[-*]|\d+\.)\s+/, ''))),
        });
      } else {
        paragraphs.push({type: 'p', text: plain(text.replace(/\n/g, ' '))});
      }
    }

    if (paragraphs.length || code.length) {
      sections.push({
        id: `${doc.id}#${current.anchor}`,
        page: doc.title,
        heading: current.heading,
        url: doc.permalink + (current.anchor ? `#${current.anchor}` : ''),
        paragraphs,
        code,
      });
    }
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const m = !inFence && /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      const text = m[2].replace(/`/g, '');
      current = {heading: text, anchor: slugger.slug(text), level: m[1].length, lines: []};
    } else {
      current.lines.push(line);
    }
  }
  flush();
  return sections;
}

module.exports = function docsAssistantIndex(context) {
  let indexPath;

  return {
    name: 'docs-assistant-index',

    async allContentLoaded({allContent, actions}) {
      const docsPlugin = allContent['docusaurus-plugin-content-docs'].default;
      const docs = docsPlugin.loadedVersions.flatMap((v) => v.docs);
      const sections = [];

      for (const doc of docs) {
        const file = path.join(context.siteDir, doc.source.replace(/^@site\//, ''));
        const raw = await fs.promises.readFile(file, 'utf8');
        sections.push(...toSections(doc, raw));
      }

      const pages = docs.map((d) => ({title: d.title, url: d.permalink, description: d.description}));
      indexPath = await actions.createData(
        'assistant-index.json',
        JSON.stringify({generated: new Date().toISOString(), pages, sections}),
      );
    },

    configureWebpack() {
      return {resolve: {alias: {[ALIAS]: indexPath}}};
    },
  };
};
