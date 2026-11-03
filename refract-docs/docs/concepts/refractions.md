---
title: Refractions
description: Refractions are Refract's reactive units of state. Learn how to create, read, update and share them.
---

# Refractions

A **refraction** is a reactive container for a value. When the value changes, everything that read it updates automatically: components re-render, derived values recalculate and effects re-run.

```js
import { useRefraction } from "refract";

const theme = useRefraction("light");

theme.value;        // "light"
theme.set("dark");
theme.value;        // "dark"
```

The name comes from optics: one beam of state passes through your app and is *refracted* into every place that depends on it.

## Reading a refraction

Read the current value with `.value`. Inside a component, derived refraction or effect, reading `.value` also **subscribes** to the refraction, so Refract knows to update that code when the value changes.

```jsx
const Status = createComponent(({ lens }) => {
  const online = lens.useRefraction(navigator.onLine);
  return <p>{online.value ? "Online" : "Offline"}</p>; // subscribes
});
```

To read without subscribing, use `.peek()`. This is useful in event handlers and logs, where you want the current value but don't want to create a dependency:

```js
console.log("Clicked at count", count.peek());
```

## Updating a refraction

| Method | Use it when |
| --- | --- |
| `set(next)` | You have the new value |
| `update(fn)` | The new value depends on the current one |

```js
count.set(10);
count.update((n) => n + 1);
todos.update((list) => list.filter((t) => !t.done));
```

Refract compares the new value with the old one using `Object.is`. If they are equal, nothing updates. This is why you must never mutate objects or arrays in place:

```js
// ✗ Same array reference: no update happens
todos.value.push(newTodo);

// ✓ New array: subscribers update
todos.update((list) => [...list, newTodo]);
```

Several updates in the same event handler are batched automatically into one render. To batch updates elsewhere, such as in a timer or a promise callback, wrap them in [`batch()`](../api/batch.md).

## Local and global refractions

Where you create a refraction decides who can see it and how long it lives.

| | Local | Global |
| --- | --- | --- |
| Created with | `lens.useRefraction()` inside a component | `useRefraction()` at module level |
| Visible to | That component (and children you pass it to) | Any module that imports it |
| Lifetime | Disposed when the component unmounts | Lives as long as the page |
| Good for | Form inputs, toggles, UI state | Current user, theme, cart, feature flags |

```js title="src/state/theme.js"
import { useRefraction } from "refract";

export const theme = useRefraction("light"); // global
```

```jsx title="src/components/ThemeToggle.jsx"
import { theme } from "../state/theme";

export const ThemeToggle = createComponent(() => (
  <button onClick={() => theme.set(theme.value === "light" ? "dark" : "light")}>
    Switch to {theme.value === "light" ? "dark" : "light"} mode
  </button>
));
```

:::tip
Start local. Promote state to a global refraction only when unrelated parts of the app need it. The [Global theme tutorial](../guides/global-theme.md) walks through this.
:::

## Derived refractions

When a value can be calculated from other refractions, derive it instead of storing it:

```js
import { useRefraction, derive } from "refract";

const items = useRefraction([{ price: 4 }, { price: 6 }]);
const total = derive(() => items.value.reduce((sum, i) => sum + i.price, 0));

total.value; // 10
```

A derived refraction is read-only, is cached, and recalculates only when a refraction it read changes. Inside components, use `lens.derive()` so it is disposed with the component.

## Subscribing outside components

Use `.subscribe()` to react to changes from plain JavaScript, for example to sync with a non-Refract library. It returns an unsubscribe function:

```js
const stop = theme.subscribe((value, previous) => {
  document.documentElement.dataset.theme = value;
});

// later
stop();
```

## Related

- [`useRefraction()` reference](../api/use-refraction.md)
- [`derive()` reference](../api/derive.md)
- [The reactivity model](./reactivity-model.md): how subscriptions are tracked
