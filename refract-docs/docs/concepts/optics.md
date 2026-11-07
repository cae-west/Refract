---
title: Optics
description: Optics are reusable units of logic. Compose refractions and effects into functions you can share between components.
---

# Optics

An **optic** is a function that packages reusable logic: some state, the effects that keep it up to date, and the values it exposes. If you know React, an optic is Refract's version of a custom hook. Combining optics to build bigger behaviors is called **optical composition**.

```js title="src/optics/useMousePosition.js"
import { useRefraction, useOptic } from "refract";

export function useMousePosition() {
  const pos = useRefraction({ x: 0, y: 0 });

  useOptic(() => {
    const handler = (e) => pos.set({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return pos;
}
```

```jsx
const Cursor = createComponent(() => {
  const pos = useMousePosition();
  return <p>{pos.value.x}, {pos.value.y}</p>;
});
```

## Why optics exist

Many components need the same logic: fetching data, tracking the window size, following online status. Copying that logic into each component duplicates code, and it also duplicates the work: ten components tracking the mouse attach ten listeners. Moving it into a plain module function loses the component lifecycle, so nothing cleans up when components unmount.

An optic packages the state, the effects and the cleanup into one function that any component can call. Optics that call [`useOptic()`](../api/use-optic.md) go further and share one instance between components, so the work isn't duplicated either.

## Rules for optics

1. **Name it `useSomething`.** The prefix signals that it must run during a component's render. The compiler warns when it sees a `use` function called from an event handler or a loop.
2. **Call it at the top level of a component or another optic**, not inside conditions or callbacks.
3. **Return refractions, not raw values**, so callers stay reactive.

## `useOptic` versus `useEffect`

Both run side effects after render and accept a cleanup function. `useOptic` adds two behaviors that make it the better choice inside reusable logic:

| | `useEffect` | `useOptic` |
| --- | --- | --- |
| Re-runs when dependencies change | Yes | Yes |
| **Sharing**: components that call the same optic with the same arguments share its state and one running effect | No | Yes |
| **Transition-aware**: defers re-running while a declarative transition is in progress | No | Yes |
| Typical use | One-off work in one component | Subscriptions and data sources inside optics |

Sharing matters for optics like `useMousePosition`: ten components can call it, and Refract attaches a single `mousemove` listener, not ten. All ten read the same `pos` refraction, so they all update together. The listener is removed when the last component using it unmounts.

## How sharing works

An optic that calls `useOptic` is a **shared optic**. Refract identifies each use of it by the optic and the arguments it was called with:

- Components that call it with equal arguments share one instance: the same refractions, the same return value and one running effect.
- Different arguments create separate instances. `useFetch("/api/user")` and `useFetch("/api/posts")` don't share anything.
- An optic that doesn't call `useOptic`, such as `useCounter` in the [counter tutorial](../guides/counter-app.mdx), is never shared. Each component gets its own state.

```jsx
const Avatar = createComponent(() => {
  const { data } = useFetch("/api/user");
  return <img src={data.value?.avatarUrl} alt="" />;
});

const Greeting = createComponent(() => {
  const { data } = useFetch("/api/user");
  return <p>Hello, {data.value?.name}</p>;
});
```

`Avatar` and `Greeting` share one request and one `data` refraction. When the response arrives, both update.

Because everything inside a shared optic is shared, keep per-component state out of it. Create that state in the component with `lens.useRefraction()`, as the [todo list tutorial](../guides/todo-list.md) does when it copies fetched data into an editable list. The full rules are in the [`useOptic()` reference](../api/use-optic.md#behavior).

## Composing optics

Optics can call other optics. Here `useWindowSize` and `useMediaQuery` combine into a layout optic:

```js
export function useLayout() {
  const size = useWindowSize();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const layout = derive(() => (size.value.width < 640 ? "stacked" : "split"));

  return { layout, prefersReducedMotion };
}
```

## A data-fetching optic

```js title="src/optics/useFetch.js"
import { useRefraction, useOptic } from "refract";

export function useFetch(url) {
  const data = useRefraction(null);
  const error = useRefraction(null);
  const loading = useRefraction(true);

  useOptic(() => {
    const controller = new AbortController();
    loading.set(true);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then(data.set)
      .catch((err) => err.name !== "AbortError" && error.set(err))
      .finally(() => loading.set(false));

    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}
```

Because `useFetch` is a shared optic, two components calling `useFetch("/api/user")` share one request and see the same `data`, `error` and `loading`.

## Related

- [`useOptic()` reference](../api/use-optic.md)
- [Side effects](./side-effects.md)
- [Todo list tutorial](../guides/todo-list.md), which builds on `useFetch`
