# Refract documentation site

The documentation site for **Refract**, a reactive, composable JavaScript framework for building user interfaces. Built with [Docusaurus 3](https://docusaurus.io) and an integrated docs chatbot, **Ask Refract**.

## What's inside

| Area | Contents |
| --- | --- |
| Learn | Introduction, installation, quick start, project structure, TypeScript, six core-concept pages |
| Guides | Three tutorials (counter, todo list, global theme) and four how-to guides (animations, streams, testing, migrating from React) |
| API reference | 14 pages, one per export, each with signature, parameters, returns, examples and caveats |
| Resources | FAQ, troubleshooting, glossary, contributing guide, changelog |
| Search | Offline full-text search (`@easyops-cn/docusaurus-search-local`), no external service |
| Chatbot | **Ask Refract**, a docs assistant available on every page (see below) |

## Run locally

Requires Node.js 18 or later.

```bash
cd refract-docs
npm install
npm start          # dev server at http://localhost:3000
npm run build      # production build in build/, fails on broken links
npm run serve      # preview the production build
```

## The Ask Refract chatbot

The assistant answers questions in plain language using only this documentation, and every answer links to the sections it came from.

How it works:

1. **Indexing (build time).** `plugins/docs-assistant-index` reads every docs page after Docusaurus loads it, splits it into sections at `##` and `###` headings, and writes a JSON index. New or edited pages are indexed automatically on the next build.
2. **Retrieval (in the browser).** `src/components/DocsAssistant/engine.ts` ranks sections with BM25, weighting section headings above page titles, prose and code. It splits camelCase identifiers and expands Refract-specific synonyms, so "the equivalent of useMemo" finds `derive()` and "custom hook" finds optics.
3. **Answering.** The best section's most relevant paragraphs, its first code example and up to three source links are shown. Questions the docs can't answer get a clear "not found" response with starting points, rather than a guess.

The index is loaded lazily the first time someone opens the assistant, so it adds nothing to normal page loads. There is no server and no API key, so the chatbot works on any static host.

### Optional: generate answers with an LLM

Set the `ASSISTANT_ENDPOINT` environment variable at build time to the URL of a serverless function. The assistant then POSTs `{ question, context }`, where `context` is the retrieved doc sections, and displays the function's `{ answer }` with the same source links. If the endpoint fails, the assistant falls back to the local answer. On GitHub Pages, add `ASSISTANT_ENDPOINT` as a repository variable (Settings → Secrets and variables → Actions → Variables).

## Deploy

The site reads `SITE_URL`, `BASE_URL` and `REPO_URL` from the environment, so the same config works on any host.

### GitHub Pages (recommended)

The workflow in `.github/workflows/deploy-docs.yml` builds and publishes the site on every push to `main`.

1. Push this repository to your fork.
2. In the fork, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Open the **Actions** tab and run **Deploy docs to GitHub Pages** (or push a commit).

The site is published at `https://<your-username>.github.io/Refract/`.

### Netlify

Import the repository, set **Base directory** to `refract-docs`, and deploy. `netlify.toml` supplies the build command and output folder. Set `SITE_URL` to your Netlify URL.

### Vercel

Import the repository and set **Root Directory** to `refract-docs`. `vercel.json` supplies the rest.

## Project layout

```text
refract-docs/
├── docs/                         # All documentation pages (Markdown/MDX)
├── plugins/docs-assistant-index/ # Build-time chatbot index
├── src/
│   ├── components/DocsAssistant/ # Chatbot UI and retrieval engine
│   ├── css/custom.css            # Theme: colors, type, tables, admonitions
│   ├── pages/index.tsx           # Homepage
│   └── theme/Footer/             # Mounts the chatbot on every page
├── static/img/                   # Logo, favicon, icons
├── docusaurus.config.ts
└── sidebars.ts                   # Learn, Guides and API reference sidebars
```
