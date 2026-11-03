---
title: useFlash()
description: Run an effect once, after the first render and before the browser paints.
---

# `useFlash()`

Runs a callback **once**, synchronously after the component's first render and before the browser paints. Use it for work that affects the first frame: measuring layout, setting focus, or starting an entrance animation.

```ts
lens.useFlash(effect: () => EffectCleanup): void
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `effect` | `() => void \| (() => void)` | Runs once. Its cleanup runs on unmount |

## Returns

Nothing.

## Examples

### Focus an input when a dialog opens

```jsx
const Dialog = createComponent(({ lens, children }) => {
  const input = lens.useRefraction(null);
  lens.useFlash(() => input.value?.focus());

  return (
    <div role="dialog" aria-modal="true">
      <input ref={input.set} />
      {children}
    </div>
  );
});
```

### Fade in on mount

```jsx
lens.useFlash(() => {
  const animation = el.value.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  return () => animation.cancel();
});
```

## Caveats

- `useFlash` blocks paint. Keep it fast.
- It has no dependency array and never re-runs. For effects that should re-run, use [`useEffect()`](./use-effect.md).
