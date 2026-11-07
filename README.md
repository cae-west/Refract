# Refract

Refract is a JavaScript framework for building user interfaces. Components are plain functions that return JSX, and state lives in refractions: small reactive values that keep track of which components read them. When a refraction changes, Refract re-renders those components and leaves the rest of the page alone.

Documentation: https://cae-west.github.io/Refract/

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

## Installation

To start a new project:

```bash
npm create refract@latest my-app
cd my-app
npm install
npm run dev
```

To add Refract to an existing Vite project:

```bash
npm install refract-js
npm install --save-dev @refract-js/vite-plugin
```

Then register the plugin in `vite.config.js`. The [installation guide](https://cae-west.github.io/Refract/docs/getting-started/installation) has the details, including how to use Refract from a CDN without a build step.

## The basics

Every component receives a lens, which it uses to create state and effects. Anything created through the lens belongs to that component and is cleaned up when the component unmounts.

A refraction created at the top level of a module is shared by everything that imports it, so you can use one for global state such as the current user or theme.

Reusable logic goes in optics, which are functions named `useSomething` that combine refractions and effects. If several components use the same optic with the same inputs, they share a single subscription.

If you've used React, most of this will look familiar. The [migration guide](https://cae-west.github.io/Refract/docs/guides/migrating-from-react) maps React's hooks to their Refract equivalents.

## Documentation

- [Quick start](https://cae-west.github.io/Refract/docs/getting-started/quick-start)
- [Core concepts](https://cae-west.github.io/Refract/docs/concepts/components)
- [Guides and tutorials](https://cae-west.github.io/Refract/docs/guides)
- [API reference](https://cae-west.github.io/Refract/docs/api)

The docs site also has a search box and an assistant that answers questions from the documentation.

## Working on the docs

The documentation site is in `refract-docs/` and is built with [Docusaurus](https://docusaurus.io). To run it locally:

```bash
cd refract-docs
npm install
npm start
```

Pushing to `main` rebuilds the site and publishes it to GitHub Pages. See the [contributing guide](https://cae-west.github.io/Refract/docs/resources/contributing) before opening a pull request.

## License

Apache 2.0. See [LICENSE](LICENSE).
