---
title: useEffect()
description: Run a side effect after a component renders.
---

# `useEffect()`

Runs a side effect after the component renders and the browser paints, and again when its dependencies change.

```ts
lens.useEffect(effect: () => EffectCleanup, deps?: unknown[]): void
```

`useEffect` is also exported from `"refract"` for use inside optics, where it attaches to the calling component's lens.

## When to use it

Use `useEffect()` to keep a component in sync with something outside Refract: fetching data, starting a timer, subscribing to events, updating the document title, saving to storage. That work can't go in the render function, which must stay pure. `useEffect()` runs it after the browser paints, re-runs it when its dependencies change, and cleans it up when the component unmounts, so you don't leak timers or listeners.

For work that must happen before the first paint, use [`useFlash()`](./use-flash.md). Inside a reusable optic, use [`useOptic()`](./use-optic.md).

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `effect` | `() => void \| (() => void)` | The side effect. Optionally returns a cleanup function |
| `deps?` | `unknown[]` | Values the effect depends on. Refractions are compared by value |

### Dependency behavior

| `deps` | Effect runs |
| --- | --- |
| omitted | After every render |
| `[]` | Once, after the first render |
| `[a, b]` | After the first render and when `a` or `b` changes |

## Returns

Nothing.

## Examples

### Fetch on mount

```jsx
lens.useEffect(() => {
  fetch("/api/profile").then((r) => r.json()).then(profile.set);
}, []);
```

### Sync with the document title

```jsx
lens.useEffect(() => {
  document.title = `(${unread.value}) Inbox`;
}, [unread]);
```

### Subscribe and clean up

```jsx
lens.useEffect(() => {
  const onResize = () => width.set(window.innerWidth);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);
```

## Caveats

- In development with `strict` mode, Refract runs each effect, its cleanup, then the effect again on mount. If that breaks something, your cleanup is incomplete.
- Effects don't run during [server rendering](../concepts/reactivity-model.md#rendering-on-the-server).
- For effects that must run before paint, use [`useFlash()`](./use-flash.md).
