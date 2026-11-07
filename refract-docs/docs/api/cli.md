---
title: CLI
description: Commands provided by create-refract and the refract command.
---

# CLI

## When to use it

Use `create-refract` to start a new project. It sets up the compiler, a development server and optionally TypeScript, so you don't have to configure a bundler yourself. Inside the project, the `refract` command runs everyday tasks: the development server, production builds and tests.

## `create-refract`

Scaffolds a new project.

```bash
npm create refract@latest [directory] [-- options]
```

| Option | Description |
| --- | --- |
| `--template <name>` | `minimal` or `starter`. Skips the template prompt |
| `--ts` | Use TypeScript. Skips the language prompt |
| `--no-git` | Don't initialize a Git repository |

Example:

```bash
npm create refract@latest dashboard -- --template starter --ts
```

## `refract`

Installed with `refract-js`. Run it through `npx` or your package scripts.

| Command | Description |
| --- | --- |
| `refract dev` | Start the development server with hot updates (default port 5173) |
| `refract build` | Create an optimized production build in `dist/` |
| `refract preview` | Serve the production build locally |
| `refract test` | Run component tests with the built-in test runner |
| `refract doctor` | Check Node.js version, installed packages and bundler setup |

### Common flags

| Flag | Applies to | Description |
| --- | --- | --- |
| `--port <n>` | `dev`, `preview` | Use a different port |
| `--open` | `dev`, `preview` | Open the browser automatically |
| `--analyze` | `build` | Write a bundle-size report to `dist/stats.html` |
| `--watch` | `test` | Re-run tests when files change |
