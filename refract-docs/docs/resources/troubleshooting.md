---
title: Troubleshooting
description: Fixes for common errors and warnings.
---

# Troubleshooting

## The page shows `[object Refraction]`

You rendered the refraction instead of its value. Add `.value`:

```jsx
<p>{count}</p>        // ✗
<p>{count.value}</p>  // ✓
```

## `Cannot find module 'refract'`

The import alias is registered by the Vite plugin. Check that `@refract-js/vite-plugin` is installed and listed in `plugins` in `vite.config.js`. Run `npx refract doctor` to confirm.

## `LensDisposedError: lens used after unmount`

A callback called a lens method after its component unmounted, often from a late network response. Cancel async work in the effect's cleanup:

```js
lens.useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(/* ... */);
  return () => controller.abort();
}, [url]);
```

## Warning: optic called conditionally

Optics must run on every render, in the same order. Move the condition inside the optic or into the JSX:

```jsx
// ✗
if (props.track) useMousePosition();

// ✓
const pos = useMousePosition();
{props.track && <Cursor pos={pos} />}
```

## My component re-renders too often

Open Refract DevTools and select the component. The **Dependencies** panel lists every refraction it read during its last render. Common causes:

- Reading a large global refraction when you need one field. Derive the field: `const name = derive(() => user.value.name)`.
- Creating a new object in `derive()` on every run. `derive()` compares results with `Object.is`, so a new object always counts as a change. Return primitives, or derive each field separately.

## An effect runs in an infinite loop

The effect sets a refraction listed in its own dependencies. Either remove it from the dependencies, or compute the value with `derive()` instead of an effect.
