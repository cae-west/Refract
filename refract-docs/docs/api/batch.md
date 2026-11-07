---
title: batch()
description: Group several refraction updates into a single update cycle.
---

# `batch()`

Runs a function and defers all resulting updates until it returns, so subscribers update once.

```ts
batch<T>(fn: () => T): T
```

## When to use it

Each update outside an event handler starts its own update cycle. When an async callback sets three refractions, components that read all three render three times, and in between they briefly show a mix of old and new values. Wrap the updates in `batch()` so they apply together and components render once.

You don't need `batch()` inside event handlers, because Refract batches those automatically.

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `fn` | `() => T` | A function that calls `set()` or `update()` on one or more refractions |

## Returns

Whatever `fn` returns.

## Example

Updates inside event handlers are batched automatically. Use `batch()` in async callbacks, timers and code outside components:

```js
import { batch } from "refract";

socket.on("snapshot", (data) => {
  batch(() => {
    users.set(data.users);
    messages.set(data.messages);
    lastSync.set(Date.now());
  });
  // Components that read all three render once, not three times.
});
```

## Caveats

- Inside `fn`, reading a refraction you just set returns the new value.
- Nested `batch()` calls are merged into the outermost one.
