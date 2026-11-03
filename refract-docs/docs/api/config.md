---
title: Configuration
description: Every option in refract.config.js.
---

# Configuration

Refract reads `refract.config.js` (or `.ts`) from your project root. Wrap the object in `defineConfig()` to get autocompletion and type checking:

```js title="refract.config.js"
import { defineConfig } from "refract/config";

export default defineConfig({
  compiler: {
    optimize: true,
    sourcemap: "dev",
  },
  jsx: {
    pragma: "automatic",
  },
  devtools: true,
});
```

All options are optional.

## `compiler`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `optimize` | `boolean` | `true` | Bind single-refraction JSX expressions directly to DOM nodes and remove unused reactivity |
| `sourcemap` | `boolean \| "dev"` | `"dev"` | Emit source maps. `"dev"` emits them in development only |
| `target` | `"es2020" \| "es2022" \| "esnext"` | `"es2020"` | JavaScript output target |
| `warnings` | `"error" \| "warn" \| "off"` | `"warn"` | How to report rule violations, such as an optic called inside a condition |

## `jsx`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `pragma` | `"automatic" \| "classic"` | `"automatic"` | `"automatic"` imports JSX helpers for you. `"classic"` requires `import { h } from "refract"` in each file |
| `classAttribute` | `"class" \| "className" \| "both"` | `"both"` | Which attribute names are accepted for CSS classes |

## `devtools`

| Value | Behavior |
| --- | --- |
| `true` | Enable the Refract DevTools browser extension in development |
| `false` | Disable DevTools integration |
| `{ production: true }` | Also enable in production builds (not recommended) |

## `env`

Expose environment variables to your app. Only variables listed here are included in the build:

```js
export default defineConfig({
  env: ["API_URL", "FEATURE_FLAGS"],
});
```

Read them with `import.meta.env.API_URL`.
