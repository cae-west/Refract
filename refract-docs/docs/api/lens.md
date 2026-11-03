---
title: Lens
description: Reference for every member of the lens object passed to components.
---

# Lens

The lens is the object every component receives as `lens`. Everything created through it is owned by the component and disposed when the component unmounts. For the concepts, see [Lenses](../concepts/lenses.md).

```ts
interface Lens<P> {
  props: Readonly<P>;
  useRefraction<T>(initial: T, options?: RefractionOptions<T>): Refraction<T>;
  derive<T>(compute: () => T): ReadonlyRefraction<T>;
  useEffect(effect: () => EffectCleanup, deps?: unknown[]): void;
  useOptic(effect: () => EffectCleanup, deps?: unknown[]): void;
  useFlash(effect: () => EffectCleanup): void;
  onMount(callback: () => void): void;
  onUnmount(callback: () => void): void;
  provide(key: string | symbol, value: unknown): void;
  context<T>(key: string | symbol, fallback?: T): T;
}
```

## Members

| Member | Description | Details |
| --- | --- | --- |
| `props` | The component's current props | Same object as the `props` argument |
| `useRefraction()` | Create local state | [`useRefraction()`](./use-refraction.md) |
| `derive()` | Create a local derived value | [`derive()`](./derive.md) |
| `useEffect()` | Side effect after paint | [`useEffect()`](./use-effect.md) |
| `useOptic()` | Shared, transition-aware side effect | [`useOptic()`](./use-optic.md) |
| `useFlash()` | One-time effect before first paint | [`useFlash()`](./use-flash.md) |
| `onMount()` | Callback after the component is first added to the DOM | Equivalent to `useEffect(fn, [])` without cleanup |
| `onUnmount()` | Callback when the component is removed | Runs after effect cleanups |
| `provide()` | Expose a value to descendants | Overrides app-level values with the same key |
| `context()` | Read a value provided by an ancestor or the app | Returns `fallback` if nothing was provided; throws if there is no fallback |

## Example

```jsx
const Panel = createComponent(({ lens, children }) => {
  const expanded = lens.useRefraction(false);
  const label = lens.derive(() => (expanded.value ? "Collapse" : "Expand"));

  lens.onMount(() => console.log("Panel mounted"));
  lens.provide("panelExpanded", expanded);

  return (
    <section>
      <button aria-expanded={expanded.value} onClick={() => expanded.set(!expanded.value)}>
        {label.value}
      </button>
      {expanded.value && children}
    </section>
  );
});
```

## Caveats

- Call lens methods during render, at the top level of the component. Calling `lens.useRefraction()` inside an event handler creates a new refraction on every click.
- Don't store the lens and use it after the component unmounts. Calls on a disposed lens throw `LensDisposedError`.
