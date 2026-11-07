---
title: createComponent()
description: Define a Refract component from a render function.
---

# `createComponent()`

Defines a component from a pure render function.

```ts
createComponent<P = {}>(
  render: (scope: { props: P; children: JSX.Element[]; lens: Lens<P> }) => JSX.Element | null,
  options?: ComponentOptions,
): Component<P>
```

## When to use it

Use `createComponent()` for every component. Wrapping the render function is what lets Refract give the component a [lens](./lens.md), track which refractions it reads, and re-render it only when they change. It also gives you error boundaries (`fallback`) and readable names in DevTools and error messages.

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `render` | `function` | Receives `props`, `children` and `lens`, and returns JSX or `null`. Must be pure |
| `options?` | `ComponentOptions` | Optional settings (below) |

### `ComponentOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | Inferred by the compiler | Display name in DevTools and error messages |
| `defaultProps` | `Partial<P>` | `{}` | Values used when a prop is `undefined` |
| `fallback` | `Component` | none | Rendered if this component throws during render (an error boundary) |

## Returns

A `Component<P>` you can use in JSX as `<Name {...props} />`.

## Examples

### Basic component

```jsx
export const Counter = createComponent(({ lens }) => {
  const count = lens.useRefraction(0);
  return <button onClick={() => count.update((n) => n + 1)}>Clicked {count.value} times</button>;
});
```

### Default props and an error boundary

```jsx
const ErrorNotice = createComponent(() => <p role="alert">This widget failed to load.</p>);

export const Chart = createComponent(
  ({ props }) => <svg height={props.height}>{/* ... */}</svg>,
  { defaultProps: { height: 240 }, fallback: ErrorNotice },
);
```

## Caveats

- Don't call `createComponent()` inside another component's render. Define components at module level so their identity is stable.
- Props are read-only. To change something based on a prop, derive it: `lens.derive(() => props.items.length)`.
