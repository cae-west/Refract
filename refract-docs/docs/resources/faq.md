---
title: FAQ
description: Answers to common questions about Refract.
---

# Frequently asked questions

## General

### Is Refract ready for production?

Yes. Refract has been stable since 1.0 and follows [semantic versioning](https://semver.org/), so minor and patch releases never break your code. See the [changelog](./changelog.md) for what changed in each release.

### How is Refract different from React?

Refract keeps React's component model and JSX but replaces `useState` with **refractions**: reactive values that track who reads them. Only components that read a changed refraction re-render, so you don't need `memo` or `useCallback`. See [Migrating from React](../guides/migrating-from-react.md).

### Do I need a build step?

No, but it's recommended. The compiler enables JSX and optimizations. For quick experiments you can load Refract from a CDN and use `h()` instead of JSX. See [Use Refract without a build step](../getting-started/installation.mdx#use-refract-without-a-build-step).

### Does Refract support server rendering?

Yes. Render to HTML with `renderToString()` from `"refract/server"`, then call `hydrate()` instead of `mount()` in the browser. See [Rendering on the server](../concepts/reactivity-model.md#rendering-on-the-server).

### Does Refract support TypeScript?

Yes. Refract is written in TypeScript and ships types. See [TypeScript support](../getting-started/typescript.md).

## State

### When should I use a global refraction instead of a local one?

Start local with `lens.useRefraction()`. Move state to a module-level `useRefraction()` only when unrelated parts of the app need it, such as the current user or theme:

```js
// Local: belongs to one component and is removed when it unmounts
const open = lens.useRefraction(false);

// Global: created once at the top of a module and shared by every importer
export const currentUser = useRefraction(null);
```

See [Local and global refractions](../concepts/refractions.md#local-and-global-refractions).

### Why didn't my component update after I changed an array?

You probably changed it in place. Refract compares values with `Object.is`, so the same array looks unchanged. Create a new array instead:

```js
// ❌ Same array, so nothing updates
list.value.push(item);

// ✅ New array, so readers update
list.update((items) => [...items, item]);
```

### What's the difference between `.value` and `.peek()`?

Both return the current value. Reading `.value` during render or in an effect subscribes to changes; `.peek()` doesn't. Use `.peek()` when you need a value but shouldn't re-run when it changes:

```js
lens.useEffect(() => {
  // Re-runs when `query` changes, but not when `pageSize` does
  search(query.value, { limit: pageSize.peek() });
}, [query]);
```

## Effects

### Should I use `useEffect` or `useOptic`?

Use `useEffect` for work specific to one component. Use `useOptic` inside reusable optics, especially for subscriptions, so that many components share one listener. See [Side effects](../concepts/side-effects.md).

### Why does my effect run twice in development?

Strict mode runs each effect, its cleanup and the effect again on mount to reveal missing cleanups. It doesn't happen in production. If running twice causes a problem, return a cleanup function that undoes the effect:

```js
lens.useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // Without this, strict mode leaves two timers running
}, []);
```

See [`useEffect()` caveats](../api/use-effect.md#caveats).
