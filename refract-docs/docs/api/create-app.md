---
title: createApp()
description: Create a Refract application from a root component.
---

# `createApp()`

Creates an application instance from a root component. Mount it to render your app into the page.

```ts
createApp(root: Component, options?: AppOptions): RefractApp
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `root` | `Component` | The top-level component, created with `createComponent()` |
| `options?` | `AppOptions` | Optional app-wide settings (below) |

### `AppOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `props` | `object` | `{}` | Props passed to the root component |
| `onError` | `(error, info) => void` | logs to console | Called when a component or effect throws |
| `strict` | `boolean` | `true` in dev | Runs each effect twice in development to surface missing cleanups |

## Returns

A `RefractApp` with these methods. All methods except `unmount()` return the app, so you can chain them.

| Method | Description |
| --- | --- |
| `mount(target)` | Render into `target`, a CSS selector or an `Element`. Throws if the target doesn't exist |
| `unmount()` | Remove the app and run every cleanup |
| `provide(key, value)` | Make a value available to every component through `lens.context(key)` |
| `use(plugin, options?)` | Install a plugin such as `@refract-js/router` |

## Examples

### Mount an app

```js
import { createApp } from "refract";
import { App } from "./App";

createApp(App).mount("#root");
```

### Provide values and report errors

```js
createApp(App, {
  onError(error, info) {
    reportToMonitoring(error, { component: info.componentName });
  },
})
  .provide("apiBase", "https://api.example.com")
  .use(router, { routes })
  .mount("#root");
```

## Caveats

- Call `mount()` once per app. To render in two places, create two apps.
- `provide()` values set on the app are overridden by `lens.provide()` calls with the same key lower in the tree.
