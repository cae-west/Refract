# Refract

**Change one value. Update only what reads it.**

Refract is a reactive JavaScript framework for building user interfaces from pure components and fine-grained state. You describe what the UI should look like for a given state, and Refract updates exactly the parts of the page that depend on the state that changed. Nothing else re-renders.

📖 **Documentation:** [cae-west.github.io/Refract](https://cae-west.github.io/Refract/)

```jsx
import { createApp, createComponent } from "refract";

const Counter = createComponent(({ lens }) => {
  const count = lens.useRefraction(0);

  return (
    <button onClick={() => count.set(count.value + 1)}>
      Clicked {count.value} times
    </button>
  );
});

createApp(Counter).mount("#root");
```

## Why Refract

- **Precise updates.** When state changes, only the components that read it re-render. You don't need `memo`, `useCallback` or manual optimization.
- **Simple state.** A refraction is one object with `.value` and `.set()`. Create it inside a component for local state, or at module level for shared state. No store library required.
- **Reusable logic.** Optics package state and side effects into functions you can share, and components that use the same optic share one subscription.
- **Predictable side effects.** Effects are opt-in, scoped to the component that created them, and cleaned up automatically.
- **Built for live data and motion.** Stream-based updates turn WebSockets and other streams into state, and a declarative animation API animates values without imperative code.
- **Small and fast.** A compiler removes unused reactivity at build time.
- **TypeScript-first.** Written in TypeScript, with types for components, props and state.

## Core concepts

| Concept | What it is |
| --- | --- |
| **Components** | Pure functions, created with `createComponent()`, that return JSX |
| **Refractions** | Reactive units of state: read `.value`, update with `.set()` |
| **Lenses** | Each component's scoped toolkit for its own state, effects and lifecycle |
| **Optics** | Reusable units of logic that combine refractions and effects |
| **Effects** | `useEffect`, `useOptic` and `useFlash` for work outside rendering |

## Get started

Create a new app:

```bash
npm create refract@latest my-app
cd my-app
npm install
npm run dev
```

Or add Refract to an existing Vite project:

```bash
npm install refract-js
npm install --save-dev @refract-js/vite-plugin
```

Then follow the [Quick start](https://cae-west.github.io/Refract/docs/getting-started/quick-start) to build your first app.

## Documentation

| Start here | |
| --- | --- |
| [Introduction](https://cae-west.github.io/Refract/docs) | What Refract is and how the docs are organized |
| [Quick start](https://cae-west.github.io/Refract/docs/getting-started/quick-start) | Build a small app in about ten minutes |
| [Core concepts](https://cae-west.github.io/Refract/docs/concepts/components) | The model behind components, refractions, lenses and optics |
| [Guides](https://cae-west.github.io/Refract/docs/guides) | Tutorials and how-to guides |
| [API reference](https://cae-west.github.io/Refract/docs/api) | Every export, with signatures and examples |
| [Migrating from React](https://cae-west.github.io/Refract/docs/guides/migrating-from-react) | How React patterns map to Refract |

Have a question? Use the **Ask Refract** assistant on any docs page to search the documentation in plain language.

## About this repository

This repository contains the Refract documentation site, built with [Docusaurus](https://docusaurus.io) and published to GitHub Pages automatically on every push to `main`.

```bash
cd refract-docs
npm install
npm start
```

See [`refract-docs/README.md`](refract-docs/README.md) for how the site and its docs assistant are built, and the [contributing guide](https://cae-west.github.io/Refract/docs/resources/contributing) to suggest changes.

## License

[Apache License 2.0](LICENSE)
