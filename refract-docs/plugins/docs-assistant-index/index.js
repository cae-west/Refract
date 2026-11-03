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

/** Remove front matter, MDX imports/JSX wrappers, and admonition fences. */
function cleanSource(raw) {
  return raw
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^import .*$/gm, '')
    .replace(/^<\/?(Tabs|TabItem|div)[^>]*>\s*$/gm, '')
    .replace(/^:::(\w+)(\[[^\]]*\])?\s*$/gm, (_, type, label) =>
      label ? `${label.slice(1, -1)}:` : '',
    )
    .replace(/^:::\s*$/gm, '');
}

/** Turn inline Markdown into plain text for searching and display. */
function plain(md) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\W)_([^_]+)_(\W|$)/g, '$1$2$3')
    .replace(/<[^>]+>/g, '')
    .replace(/\\\|/g, '|')
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
    if (/^```/.test(line)) inFence = !inFence;
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
