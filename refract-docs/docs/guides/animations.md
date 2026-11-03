---
title: Animations
description: Animate numbers and elements declaratively with useTransition and useFlash.
---

# Animations

Refract treats animation as state that changes over time. Instead of calling animation functions imperatively, you describe the target value and let [`useTransition()`](../api/use-transition.md) move toward it.

## Animate a number

```jsx
const Score = createComponent(({ props, lens }) => {
  const target = lens.derive(() => props.score);
  const shown = useTransition(target, { duration: 600, easing: "ease-out" });

  return <strong>{Math.round(shown.value)}</strong>;
});
```

When `props.score` changes from 120 to 480, the displayed number counts up over 600 ms.

## Animate a style

Any numeric style can be driven by a transition:

```jsx
const Drawer = createComponent(({ lens, children }) => {
  const open = lens.useRefraction(false);
  const offset = useTransition(lens.derive(() => (open.value ? 0 : 100)), {
    spring: { stiffness: 220, damping: 26 },
  });

  return (
    <>
      <button aria-expanded={open.value} onClick={() => open.set(!open.value)}>Menu</button>
      <aside style={{ transform: `translateX(${offset.value}%)` }}>{children}</aside>
    </>
  );
});
```

`spring` gives a natural, interruptible motion: if the user toggles mid-animation, the drawer reverses from where it is.

## Run code when an animation finishes

Each transition exposes `running`. Watch it with an effect:

```jsx
lens.useEffect(() => {
  if (!offset.running.value && !open.value) setHidden(true);
}, [offset.running]);
```

## Entrance animations

For a one-off animation when a component appears, use [`useFlash()`](../api/use-flash.md) with the Web Animations API:

```jsx
lens.useFlash(() => {
  const a = el.value.animate(
    [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
    { duration: 180, easing: "ease-out" },
  );
  return () => a.cancel();
});
```

## Respect reduced motion

`useTransition()` jumps straight to the target when the user has turned on **reduce motion**, unless you set `respectReducedMotion: false`. For `useFlash` animations, check the preference yourself:

```js
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce) el.value.animate(/* ... */);
```
