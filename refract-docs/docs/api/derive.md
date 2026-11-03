---
title: derive()
description: Create a cached, read-only value computed from other refractions.
---

# `derive()`

Creates a read-only refraction whose value is computed from other refractions.

```ts
derive<T>(compute: () => T): ReadonlyRefraction<T>
```

Inside components, use `lens.derive()` so the derived value is disposed with the component.

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `compute` | `() => T` | A pure function that reads other refractions and returns a value |

## Returns

A `ReadonlyRefraction<T>` with `value`, `peek()` and `subscribe()`. There is no `set()`.

## Behavior

- **Lazy.** `compute` doesn't run until something reads `value`.
- **Cached.** Reading `value` repeatedly returns the cached result until a dependency changes.
- **Precise.** Only the refractions read during the last run are dependencies.

## Example

```js
const cart = useRefraction([
  { name: "Lamp", price: 40, qty: 1 },
  { name: "Bulb", price: 5, qty: 3 },
]);

export const subtotal = derive(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0),
);
export const freeShipping = derive(() => subtotal.value >= 50);

subtotal.value;     // 55
freeShipping.value; // true
```

## Caveats

- `compute` must not have side effects or call `set()` on other refractions. Use an [effect](./use-effect.md) for that.
- Don't use `derive()` for asynchronous work. Fetch in an effect or optic and store the result in a refraction.
