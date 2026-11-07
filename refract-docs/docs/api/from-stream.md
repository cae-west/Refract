---
title: fromStream()
description: Turn an async iterable or observable into a read-only refraction.
---

# `fromStream()`

Creates a read-only refraction that updates every time a stream emits a value.

```ts
fromStream<T>(
  source: AsyncIterable<T> | Observable<T> | ((emit: (value: T) => void) => () => void),
  initial: T,
  options?: { onError?: (error: unknown) => void },
): ReadonlyRefraction<T>
```

## When to use it

Use `fromStream()` for data that arrives over time from outside your app: WebSocket messages, server-sent events, an async iterator. Without it, every component that needs live data repeats the same pattern: subscribe in an effect, copy each message into a refraction, and unsubscribe on unmount. `fromStream()` does this once. The stream starts when something first reads the refraction and stops when nothing does.

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `source` | async iterable, observable, or subscribe function | Where values come from. A subscribe function receives `emit` and returns a teardown function |
| `initial` | `T` | Value before the first emission |
| `options.onError?` | `function` | Called if the stream errors. Without it, the error is passed to the app's `onError` |

## Returns

A `ReadonlyRefraction<T>`. The stream starts when the refraction is first read and stops when nothing reads it any more.

## Example

```js
import { fromStream } from "refract";

export const price = fromStream((emit) => {
  const ws = new WebSocket("wss://example.com/prices/BTC");
  ws.onmessage = (event) => emit(JSON.parse(event.data).price);
  return () => ws.close();
}, 0);
```

```jsx
const Ticker = createComponent(() => <p>BTC: ${price.value.toFixed(2)}</p>);
```

For a full walkthrough, see the [Streams guide](../guides/streams.md).

## Caveats

- High-frequency streams (more than 60 updates a second) are throttled to one update per animation frame.
