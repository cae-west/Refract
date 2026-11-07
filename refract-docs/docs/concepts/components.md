---
title: Components
description: How Refract components work, what they receive, and the rules that keep them pure.
---

# Components

A component is a reusable piece of UI. In Refract, a component is a **pure function** that receives its inputs and returns JSX. You create one by passing that function to `createComponent()`:

```jsx
import { createComponent } from "refract";

export const Greeting = createComponent(({ props }) => (
  <p>Hello, {props.name}!</p>
));
```

Use it like an HTML element:

```jsx
<Greeting name="Ada" />
```

## Why components exist

Most interfaces repeat themselves: the same button, card or form field appears in many places. Without components, you copy the markup and its behavior to each place, and every fix has to be made in all of them. A component packages a piece of UI with its state and behavior so you write it once and reuse it.

Refract's components are pure functions, which solves a second problem: knowing what to re-render. A component's output depends only on its props and the refractions it reads, so when data changes, Refract re-renders exactly the components that use it. Pure components are also easy to test, because the same inputs always produce the same output.

## What a component receives

The render function is called with a single object:

| Field | Description |
| --- | --- |
| `props` | The attributes passed to the component, as a read-only object |
| `children` | Any JSX nested inside the component's tags |
| `lens` | The component's scoped toolkit for state, effects and lifecycle. See [Lenses](./lenses.md) |

```jsx
const Card = createComponent(({ props, children, lens }) => {
  const open = lens.useRefraction(true);

  return (
    <section class="card">
      <h2 onClick={() => open.set(!open.value)}>{props.title}</h2>
      {open.value && children}
    </section>
  );
});

<Card title="Shipping">
  <p>Orders ship within two business days.</p>
</Card>
```

## Components are pure

Given the same props and the same refraction values, a component must return the same JSX. In practice that means:

- **Don't** change variables outside the component during render.
- **Don't** start network requests, timers or subscriptions directly in the render body. Put them in an [effect](./side-effects.md).
- **Do** read refractions freely. Reading is how a component subscribes to state.

```jsx
// ✗ Starts a new request on every render
const Profile = createComponent(({ lens }) => {
  const user = lens.useRefraction(null);
  fetch("/api/me").then((r) => r.json()).then(user.set);
  return <p>{user.value?.name}</p>;
});

// ✓ Starts the request once, after the first render
const Profile = createComponent(({ lens }) => {
  const user = lens.useRefraction(null);
  lens.useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(user.set);
  }, []);
  return <p>{user.value?.name}</p>;
});
```

Purity is what lets Refract re-run just one component when its data changes, and skip everything else.

## JSX in Refract

Refract's JSX is close to HTML:

- Use `class` (React's `className` also works).
- Event handlers are camelCase: `onClick`, `onInput`, `onSubmit`.
- Lists need a stable `key` on each item.
- Render nothing with `null`, `false` or `undefined`.

```jsx
<ul>
  {items.value.map((item) => (
    <li key={item.id} class={item.done ? "done" : ""}>
      {item.label}
    </li>
  ))}
</ul>
```

## When a component re-renders

A component re-renders when:

1. A refraction it **read during its last render** changes, or
2. Its parent passes it **different props**.

It does not re-render just because its parent re-rendered. That is the main performance difference from React. See [The reactivity model](./reactivity-model.md) for the details.

## Component options

`createComponent()` takes an optional second argument:

```jsx
export const Avatar = createComponent(
  ({ props }) => <img src={props.src} alt={props.alt} />,
  { name: "Avatar" },
);
```

`name` labels the component in Refract DevTools and error messages. The compiler fills it in from the variable name, so you rarely need it. All options are in the [`createComponent()` reference](../api/create-component.md).

## Related

- [`createComponent()` API reference](../api/create-component.md)
- [Lenses](./lenses.md): everything available on `lens`
