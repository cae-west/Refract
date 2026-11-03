---
title: TypeScript support
description: Type your components, props, refractions and optics.
---

# TypeScript support

Refract is written in TypeScript and ships its own type definitions. Choose **TypeScript** when you run `npm create refract@latest`, or add a `tsconfig.json` to an existing project:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "jsxImportSource": "refract",
    "strict": true
  },
  "include": ["src"]
}
```

`"jsxImportSource": "refract"` tells TypeScript to type-check JSX against Refract's element types.

## Typing props

Pass the props type as a generic to `createComponent()`:

```tsx title="src/components/Badge.tsx"
import { createComponent } from "refract";

type BadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "danger";
};

export const Badge = createComponent<BadgeProps>(({ props }) => (
  <span class={`badge badge--${props.tone ?? "neutral"}`}>{props.label}</span>
));
```

Using the component without `label`, or with an unknown `tone`, is now a type error.

## Typing refractions

The type is inferred from the initial value:

```ts
const count = useRefraction(0); // Refraction<number>
count.set("1"); // ✗ Type error
```

Provide the type explicitly when the initial value does not describe every possible value:

```ts
type User = { id: string; name: string };

const user = useRefraction<User | null>(null);
```

Derived refractions are read-only:

```ts
const doubled = derive(() => count.value * 2); // ReadonlyRefraction<number>
doubled.set(4); // ✗ Property 'set' does not exist
```

## Typing optics

An optic is a plain function, so annotate its return type like any other:

```ts title="src/optics/useToggle.ts"
import { useRefraction, type Refraction } from "refract";

export function useToggle(initial = false): [Refraction<boolean>, () => void] {
  const on = useRefraction(initial);
  return [on, () => on.set(!on.value)];
}
```

## Exported types

| Type | Describes |
| --- | --- |
| `Refraction<T>` | A writable refraction |
| `ReadonlyRefraction<T>` | A derived or stream-backed refraction |
| `Lens<P>` | The lens a component with props `P` receives |
| `Component<P>` | The value returned by `createComponent<P>()` |
| `RefractApp` | The value returned by `createApp()` |
| `EffectCleanup` | `void \| (() => void)`, the return type of effect callbacks |
