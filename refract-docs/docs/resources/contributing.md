---
title: Contributing
description: How to improve the Refract documentation.
---

# Contributing

Thanks for helping improve the Refract documentation. Fixes, clearer explanations, new examples and new guides are all welcome. This page explains how to run the docs locally, the conventions we follow, and how to submit a change.

## Run the docs locally

The site is built with [Docusaurus](https://docusaurus.io). You need Node.js 18 or later.

```bash
git clone https://github.com/<your-username>/Refract.git
cd Refract/refract-docs
npm install
npm start
```

The site opens at `http://localhost:3000` and reloads as you edit.

## Where things live

| Path | Contents |
| --- | --- |
| `docs/getting-started/` | Installation and first steps |
| `docs/concepts/` | Explanations of the mental model |
| `docs/guides/` | Tutorials and how-to guides |
| `docs/api/` | One page per export |
| `docs/resources/` | FAQ, troubleshooting, glossary, this page |
| `sidebars.ts` | Sidebar order. Add new pages here |
| `src/components/DocsAssistant/` | The **Ask Refract** chatbot |

## Style guide

- **Write for the task.** Lead with what the reader can do, then explain.
- **Use second person and active voice.** "Run the command", not "The command should be run".
- **Show code on every page.** Every example must use the API exactly as documented in the reference.
- **Use sentence case** for headings.
- **Follow the reference template** for API pages: signature, parameters, returns, examples, caveats.
- **Link, don't repeat.** Explain a concept once and link to it elsewhere.

## Submit a change

1. Create a branch: `git checkout -b docs/describe-your-change`.
2. Make your edits and run `npm run build`. The build fails on broken links, so fix any it reports.
3. Commit with a clear message, such as `docs: add caveats to useOptic`.
4. Open a pull request describing what changed and why.

The chatbot's search index is rebuilt automatically during `npm run build`, so new pages become answerable without extra steps.
