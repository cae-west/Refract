---
title: Testing components
description: Render components, interact with them and assert on the result using Refract's test utilities.
---

# Testing components

Refract ships a test runner (`refract test`) and a small set of utilities in `refract/testing`. Tests run in a simulated DOM, so they are fast and don't need a browser.

## Your first test

```jsx title="src/Counter.test.jsx"
import { render, fireEvent } from "refract/testing";
import { Counter } from "./Counter";

test("increments when clicked", async () => {
  const screen = render(<Counter />);
  const button = screen.getByRole("button");

  expect(button.textContent).toBe("Clicked 0 times");

  await fireEvent.click(button);

  expect(button.textContent).toBe("Clicked 1 times");
});
```

Run it:

```bash
npx refract test
```

`fireEvent` returns a promise that resolves after Refract has processed the update cycle, so `await` it before asserting.

## Testing global state

Global refractions persist between tests. Reset them in `beforeEach`:

```js
import { theme } from "../state/theme";

beforeEach(() => theme.set("light"));
```

## Testing optics

Use `renderOptic()` to call an optic outside a real component:

```js
import { renderOptic } from "refract/testing";
import { useCounter } from "./useCounter";

test("useCounter steps by the configured amount", () => {
  const { result } = renderOptic(() => useCounter(0));

  result.step.set(5);
  result.increase();

  expect(result.count.value).toBe(5);
});
```

## Mocking fetch

```js
import { mockFetch } from "refract/testing";

mockFetch("/api/todos", [{ id: 1, title: "Write docs", completed: false }]);
```

## Utilities

| Utility | Description |
| --- | --- |
| `render(jsx)` | Mount a component and return query helpers (`getByRole`, `getByText`, `queryByLabelText`, …) |
| `fireEvent.<type>(el, init?)` | Dispatch an event and wait for updates |
| `renderOptic(fn)` | Run an optic inside a temporary component |
| `flush()` | Wait for pending effects and transitions |
| `mockFetch(url, body, init?)` | Respond to matching `fetch` calls |
