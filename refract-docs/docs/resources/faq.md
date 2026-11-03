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

### Does Refract support TypeScript?

Yes. Refract is written in TypeScript and ships types. See [TypeScript support](../getting-started/typescript.md).

## State

### When should I use a global refraction instead of a local one?

Start local with `lens.useRefraction()`. Move state to a module-level `useRefraction()` only when unrelated parts of the app need it, such as the current user or theme. See [Local and global refractions](../concepts/refractions.md#local-and-global-refractions).

### Why didn't my component update after I changed an array?

You probably mutated it in place (`list.value.push(item)`). Refract compares values with `Object.is`, so the same array reference looks unchanged. Use `list.update((items) => [...items, item])`.

### What's the difference between `.value` and `.peek()`?

Both return the current value. Reading `.value` during render or in an effect subscribes to changes; `.peek()` doesn't.

## Effects

### Should I use `useEffect` or `useOptic`?

Use `useEffect` for work specific to one component. Use `useOptic` inside reusable optics, especially for subscriptions, so that many components share one listener. See [Side effects](../concepts/side-effects.md).

### Why does my effect run twice in development?

Strict mode runs each effect, its cleanup and the effect again on mount to reveal missing cleanups. It doesn't happen in production. See [`useEffect()` caveats](../api/use-effect.md#caveats).
