---
title: The reactivity model
description: How Refract tracks dependencies and decides what to update when state changes.
---

# The reactivity model

You can build Refract apps without reading this page. It explains what happens under the hood, which helps when you are debugging an update that did or didn't happen, or tuning performance.

## Automatic dependency tracking

Refract tracks dependencies by observing reads. While a component renders (or a derived refraction or effect runs), Refract records every refraction whose `.value` is read. Those refractions become that component's **dependencies**.

```jsx
const Summary = createComponent(({ lens }) => {
  // Dependencies after this render: user, cart
  return <p>{user.value.name} has {cart.value.length} items</p>;
});
```

Dependencies are recalculated on every run. If a branch stops reading a refraction, the component stops depending on it:

```jsx
// While showDetails is false, changes to details do not re-render this component
{showDetails.value ? <Details data={details.value} /> : null}
```

## The update cycle

```mermaid
flowchart TD
    A["count.set(5)"] --> B{Value changed?<br/>Object.is}
    B -->|No| Z[Stop]
    B -->|Yes| C[Mark dependents dirty]
    C --> D[Recompute dirty derived refractions]
    D --> E[Re-render dirty components<br/>parents before children]
    E --> F[Patch the DOM]
    F --> G[Run effects whose dependencies changed]
```

Three properties fall out of this design:

- **Precision.** Only components that read the changed refraction re-render. Siblings and parents are untouched.
- **Glitch-free.** Derived refractions update before components render, so a component never sees a half-updated state.
- **Batched.** All `.set()` calls in the same event handler, or inside [`batch()`](../api/batch.md), produce one update cycle.

## Rendering and the DOM

Refract uses a lightweight virtual DOM at the component level: when a component re-renders, its new JSX is diffed against the previous output and only changed nodes are patched. Because few components re-render per update, diffs stay small.

With `compiler.optimize` enabled (the default), the [compiler](../api/config.md#compiler) goes further. It detects JSX expressions that read a single refraction, such as `{count.value}`, and binds them directly to a text node, skipping the diff entirely.

## Stream-based updates

Refractions can also be fed by asynchronous streams (WebSockets, server-sent events, async iterators). [`fromStream()`](../api/from-stream.md) turns a stream into a read-only refraction, so live data flows through the same update cycle as user input. See the [Streams guide](../guides/streams.md).

## Related

- [Refractions](./refractions.md)
- [`batch()`](../api/batch.md)
