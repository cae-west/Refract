---
title: Glossary
description: Definitions of Refract terms.
---

# Glossary

### Batch

A group of refraction updates processed as a single update cycle. Event handlers are batched automatically; elsewhere, use [`batch()`](../api/batch.md).

### Component

A pure function, wrapped with [`createComponent()`](../api/create-component.md), that returns JSX for its props and state.

### Compiler

The build-time tool, run by the Vite plugin, that transforms JSX and removes unnecessary reactivity. Configured in [`refract.config.js`](../api/config.md).

### Dependency

A refraction read by a component, derived refraction or effect. When a dependency changes, its dependents update.

### Derived refraction

A read-only, cached refraction computed from others with [`derive()`](../api/derive.md).

### Effect

Code that interacts with the world outside rendering, such as fetching or subscribing. See [Side effects](../concepts/side-effects.md).

### Flash

An effect that runs once, before the first paint. See [`useFlash()`](../api/use-flash.md).

### Global refraction

A refraction created at module level, shared by every module that imports it.

### Lens

The scoped object passed to each component that owns its state, effects and lifecycle. See [Lenses](../concepts/lenses.md).

### Local refraction

A refraction created with `lens.useRefraction()`, owned by one component and disposed with it.

### Optic

A reusable function that composes refractions and effects, named `useSomething`. See [Optics](../concepts/optics.md).

### Optical composition

Building complex behavior by combining smaller optics.

### Refraction

A reactive unit of state with `.value`, `.set()` and `.update()`. See [Refractions](../concepts/refractions.md).

### Shared optic

An optic that calls [`useOptic()`](../api/use-optic.md). Components that call it with the same arguments share its state and its effect.

### Transition

A refraction that animates toward a target value. See [`useTransition()`](../api/use-transition.md).
