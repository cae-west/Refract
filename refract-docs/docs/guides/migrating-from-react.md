---
title: Migrating from React
description: How React concepts map to Refract, with side-by-side examples.
---

# Migrating from React

Refract borrows React's component model, so most of your knowledge transfers. This page maps React patterns to their Refract equivalents.

## Concept map

| React | Refract | Notes |
| --- | --- | --- |
| Function component | `createComponent(fn)` | The function receives `{ props, children, lens }` |
| `useState(0)` | `lens.useRefraction(0)` | Returns one object: `.value`, `.set()`, `.update()` |
| `useMemo(() => x, deps)` | `lens.derive(() => x)` | Dependencies are tracked automatically |
| `useEffect(fn, deps)` | `lens.useEffect(fn, deps)` | Refractions in `deps` are compared by value |
| `useLayoutEffect` (mount only) | `lens.useFlash(fn)` | Runs once before paint |
| Custom hook | Optic | Same idea; use `useOptic` for shared subscriptions |
| Context + `useContext` | `lens.provide()` + `lens.context()` | No provider component needed |
| Redux / Zustand store | Module-level `useRefraction()` | Global state is built in |
| `React.memo`, `useCallback` | Not needed | Components only re-render when the state they read changes |
| `createRoot(el).render(<App />)` | `createApp(App).mount(el)` | |

## Side by side

### State and events

```jsx
// React
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

```jsx
// Refract
const Counter = createComponent(({ lens }) => {
  const count = lens.useRefraction(0);
  return <button onClick={() => count.update((c) => c + 1)}>{count.value}</button>;
});
```

### Computed values

```jsx
// React
const total = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);
```

```jsx
// Refract
const total = lens.derive(() => items.value.reduce((s, i) => s + i.price, 0));
```

### Shared state

```jsx
// React: needs a provider or a state library
const ThemeContext = createContext("light");
```

```js
// Refract: a module-level refraction is shared state
export const theme = useRefraction("light");
```

## Things that work differently

- **Read `.value`.** Forgetting `.value` in JSX renders the refraction object, not the value. The compiler warns about this.
- **No stale closures.** Event handlers read `.value` when they run, so they always see the latest state.
- **Parent renders don't cascade.** If you relied on a parent re-render to refresh a child, pass a refraction or a changing prop instead.
- **`class` is preferred** over `className`, though both work by default.
