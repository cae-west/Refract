---
title: batch()
description: Group several refraction updates into a single update cycle.
---

# `batch()`

Runs a function and defers all resulting updates until it returns, so subscribers update once.

```ts
batch<T>(fn: () => T): T
```

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
