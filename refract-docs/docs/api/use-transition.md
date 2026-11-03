---
title: useTransition()
description: Animate between values of a numeric refraction declaratively.
---

# `useTransition()`

Returns a read-only refraction that smoothly animates toward the value of a source refraction whenever the source changes. It is the core of Refract's declarative animation API.

```ts
useTransition(
  source: ReadonlyRefraction<number>,
  options?: TransitionOptions,
): ReadonlyRefraction<number> & { running: ReadonlyRefraction<boolean> }
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `source` | `ReadonlyRefraction<number>` | The value to animate toward |
| `options?` | `TransitionOptions` | Settings (below) |

### `TransitionOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `duration` | `number` (ms) | `250` | Length of the animation |
| `easing` | `"linear" \| "ease-in" \| "ease-out" \| "ease-in-out" \| (t) => number` | `"ease-out"` | Timing function |
| `spring` | `{ stiffness: number; damping: number }` | none | Use spring physics instead of `duration` and `easing` |
| `respectReducedMotion` | `boolean` | `true` | Jump straight to the target when the user prefers reduced motion |

## Returns

A read-only refraction with the current animated value, plus `running`, which is `true` while an animation is in progress.

## Example

```jsx
import { createComponent, useTransition } from "refract";

const ProgressBar = createComponent(({ props, lens }) => {
  const target = lens.derive(() => props.percent);
  const width = useTransition(target, { duration: 400 });

  return (
    <div class="progress" role="progressbar" aria-valuenow={props.percent}>
      <div class="progress__fill" style={{ width: `${width.value}%` }} />
    </div>
  );
});
```

More patterns are in the [Animations guide](../guides/animations.md).

## Caveats

- Only numbers are animated. To animate colors or positions, transition each number separately and combine them with `derive()`.
