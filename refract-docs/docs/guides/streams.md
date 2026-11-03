---
title: Streams and live data
description: Show real-time data from WebSockets, server-sent events or async iterators.
---

# Streams and live data

Refract has native support for stream-based UI updates. [`fromStream()`](../api/from-stream.md) turns any stream into a read-only refraction, so live data flows through the same update cycle as clicks and keystrokes.

## From a WebSocket

```js title="src/state/presence.js"
import { fromStream } from "refract";

export const onlineUsers = fromStream((emit) => {
  const ws = new WebSocket("wss://chat.example.com/presence");
  ws.onmessage = (event) => emit(JSON.parse(event.data).users);
  return () => ws.close();
}, []);
```

```jsx
const Presence = createComponent(() => <p>{onlineUsers.value.length} people online</p>);
```

The socket opens when a component first reads `onlineUsers` and closes when the last reader unmounts.

## From server-sent events

```js
export const buildLog = fromStream((emit) => {
  const source = new EventSource("/api/builds/42/log");
  const lines = [];
  source.onmessage = (event) => {
    lines.push(event.data);
    emit([...lines]);
  };
  return () => source.close();
}, []);
```

## From an async iterator

Any async iterable works, including async generator functions:

```js
async function* countdown(from) {
  for (let n = from; n >= 0; n--) {
    yield n;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const remaining = fromStream(countdown(10), 10);
```

## Combine streams with derived values

Derived refractions work with stream-backed refractions like any other:

```js
const prices = fromStream(priceFeed, {});
const holdings = useRefraction({ BTC: 0.5, ETH: 4 });

export const portfolioValue = derive(() =>
  Object.entries(holdings.value).reduce(
    (sum, [symbol, qty]) => sum + (prices.value[symbol] ?? 0) * qty,
    0,
  ),
);
```

## Handle errors and reconnection

Pass `onError` to handle failures. To reconnect, reopen the socket inside the subscribe function:

```js
export const feed = fromStream((emit) => {
  let ws;
  let retry;
  const connect = () => {
    ws = new WebSocket(URL);
    ws.onmessage = (e) => emit(JSON.parse(e.data));
    ws.onclose = () => (retry = setTimeout(connect, 2000));
  };
  connect();
  return () => {
    clearTimeout(retry);
    ws.onclose = null;
    ws.close();
  };
}, null, { onError: (err) => console.warn("Feed error", err) });
```
