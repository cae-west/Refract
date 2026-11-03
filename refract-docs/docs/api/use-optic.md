---
title: useOptic()
description: Run a shared, transition-aware side effect, usually inside a reusable optic.
---

# `useOptic()`

Runs a side effect like [`useEffect()`](./use-effect.md), with two additions: **dependency-aware caching** and **transition awareness**. It is designed for use inside [optics](../concepts/optics.md).

```ts
useOptic(effect: () => EffectCleanup, deps?: unknown[]): void
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `effect` | `() => void \| (() => void)` | The side effect. Optionally returns a cleanup function |
| `deps?` | `unknown[]` | Values the effect depends on |

## Returns

Nothing.

## Behavior

**Dependency-aware caching.** Refract identifies an optic effect by where it is defined plus its dependency values. If several mounted components run the same `useOptic` call with equal dependencies, the effect runs once and its cleanup runs when the last of those components unmounts.

**Transition awareness.** While a [`useTransition()`](./use-transition.md) animation is running in the same component, re-runs are deferred until the transition settles, so expensive work doesn't stutter animations.

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

No matter how many components call `useOnlineStatus()`, only one pair of listeners is attached.

## Caveats

- Because effects are shared, don't capture component-specific values that aren't in `deps`. They would come from whichever component ran the effect first.
- To opt out of caching, use `useEffect()`.
