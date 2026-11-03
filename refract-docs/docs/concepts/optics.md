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

## Rules for optics

1. **Name it `useSomething`.** The prefix signals that it must run during a component's render. The compiler warns when it sees a `use` function called from an event handler or a loop.
2. **Call it at the top level of a component or another optic**, not inside conditions or callbacks.
3. **Return refractions, not raw values**, so callers stay reactive.

## `useOptic` versus `useEffect`

Both run side effects after render and accept a cleanup function. `useOptic` adds two behaviors that make it the better choice inside reusable logic:

| | `useEffect` | `useOptic` |
| --- | --- | --- |
| Re-runs when dependencies change | Yes | Yes |
| **Dependency-aware caching**: shares one running effect between components with identical dependencies | No | Yes |
| **Transition-aware**: defers re-running while a declarative transition is in progress | No | Yes |
| Typical use | One-off work in one component | Subscriptions and data sources inside optics |

Caching matters for optics like `useMousePosition`: ten components can call it, and Refract attaches a single `mousemove` listener, not ten. The listener is removed when the last component using it unmounts.

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

Because of dependency-aware caching, two components calling `useFetch("/api/user")` share one request.

## Related

- [`useOptic()` reference](../api/use-optic.md)
- [Side effects](./side-effects.md)
- [Todo list tutorial](../guides/todo-list.md), which builds on `useFetch`
