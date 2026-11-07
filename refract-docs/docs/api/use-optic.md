---
title: useOptic()
description: Run a shared, transition-aware side effect, usually inside a reusable optic.
---

# `useOptic()`

Runs a side effect like [`useEffect()`](./use-effect.md), with two additions: **sharing** and **transition awareness**. It is designed for use inside [optics](../concepts/optics.md).

```ts
useOptic(effect: () => EffectCleanup, deps?: unknown[]): void
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `effect` | `() => void \| (() => void)` | The side effect. Optionally returns a cleanup function |
| `deps?` | `unknown[]` | Values the effect depends on. Refractions are compared by value |

## Returns

Nothing.

## Behavior

**Sharing.** An optic that calls `useOptic` becomes a **shared optic**. Refract identifies each use of it by two things: which optic it is, and the arguments it was called with. Components that call the same optic with equal arguments share one instance of it:

- The optic body runs once, for the first component. Later components get the same return value, including the same refractions, so every component sees the same state.
- The effect runs once, and its cleanup runs when the last component using that instance unmounts or calls the optic with different arguments.

Arguments are compared with `Object.is`, so strings, numbers and refractions work as keys. The [compiler](./config.md#compiler) marks shared optics at build time, which is how Refract knows where one starts and ends.

**Re-running.** Inside a shared instance, the effect re-runs when a value in `deps` changes, exactly like `useEffect`. Every component sharing the instance sees the result.

**Transition awareness.** While a [`useTransition()`](./use-transition.md) animation is running in any component that shares the instance, re-runs are deferred until it settles, so expensive work doesn't stutter animations.

## Example

```js
export function useOnlineStatus() {
  const online = useRefraction(navigator.onLine);

  useOptic(() => {
    const update = () => online.set(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
```

`useOnlineStatus()` takes no arguments, so every component that calls it shares one `online` refraction and one pair of listeners.

## Caveats

- Everything a shared optic creates is shared. For state that belongs to one component, create it in the component with `lens.useRefraction()`, or in a separate optic that doesn't call `useOptic`.
- A shared optic can only see its arguments. Pass anything that should change its behavior as an argument. Each distinct set of arguments gets its own instance.
- Passing a new object or array literal as an argument (`useFetch({ url })`) creates a new instance on every render. Pass primitives or refractions instead.
- Passing the lens as an argument (`useSomething(lens)`) gives each component its own instance, because every component has a different lens.
- Called directly in a component as `lens.useOptic()`, outside an optic, there is nothing to share. It behaves like `useEffect()` with transition awareness.
- Sharing needs the compiler. The CDN build has none, so there `useOptic` never shares and every component gets its own instance.
