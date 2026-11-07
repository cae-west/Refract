---
title: useRefraction()
description: Create a writable reactive value.
---

# `useRefraction()`

Creates a refraction: a reactive container for a value.

```ts
useRefraction<T>(initial: T, options?: RefractionOptions<T>): Refraction<T>
```

Called at module level, it creates **global** state. Inside a component, use `lens.useRefraction()` to create **local** state that is disposed with the component. See [Local and global refractions](../concepts/refractions.md#local-and-global-refractions).

## When to use it

Use a refraction for any value that changes and should update the page: form input, toggles, a selected item, fetched data, the current user. Call `lens.useRefraction()` for state that belongs to one component, and the top-level `useRefraction()` for state shared across the app.

If a value can be calculated from other refractions, use [`derive()`](./derive.md) instead. If it never changes, use a plain constant.

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `initial` | `T` | The starting value. Pass a function to compute it lazily on first read |
| `options?` | `RefractionOptions<T>` | Optional settings (below) |

### `RefractionOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `equals` | `(a: T, b: T) => boolean` | `Object.is` | Decides whether a new value counts as a change |
| `name` | `string` | none | Label shown in DevTools |
| `persist` | `string` | none | `localStorage` key. Loads the stored value on creation and saves on every change |

## Returns

A `Refraction<T>`:

| Member | Description |
| --- | --- |
| `value` | The current value. Reading it subscribes the current component, derived value or effect |
| `set(next)` | Replace the value |
| `update(fn)` | Replace the value with `fn(current)` |
| `peek()` | Read the value without subscribing |
| `subscribe(listener)` | Call `listener(value, previous)` on every change. Returns an unsubscribe function |

## Examples

### Local state

```jsx
const Toggle = createComponent(({ lens }) => {
  const on = lens.useRefraction(false);
  return <button onClick={() => on.set(!on.value)}>{on.value ? "On" : "Off"}</button>;
});
```

### Global state that persists

```js title="src/state/settings.js"
export const fontSize = useRefraction(16, { persist: "settings.fontSize", name: "fontSize" });
```

### Custom equality

```js
const position = useRefraction(
  { x: 0, y: 0 },
  { equals: (a, b) => a.x === b.x && a.y === b.y },
);
```

## Caveats

- Never mutate `value` in place (`list.value.push(x)`). Use `set()` or `update()` with a new object or array.
- `persist` values must be JSON-serializable.
