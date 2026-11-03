---
title: Build a todo list
description: Fetch data with an optic, show loading and error states, and update a list immutably.
---

# Build a todo list

In this tutorial you build a todo list that loads items from an API, lets you add, complete and delete items, and filters by status.

**What you'll learn:** data fetching with optics, loading and error states, immutable list updates, filtering with derived values.
**Time:** about 30 minutes.
**Prerequisites:** finish [Build a counter app](./counter-app.mdx) or the [Quick start](../getting-started/quick-start.mdx).

The examples use the free [JSONPlaceholder](https://jsonplaceholder.typicode.com/) API.

## 1. Create a fetch optic

```js title="src/optics/useFetch.js"
import { useRefraction, useOptic } from "refract";

export function useFetch(url) {
  const data = useRefraction(null);
  const error = useRefraction(null);
  const loading = useRefraction(true);

  useOptic(() => {
    const controller = new AbortController();
    loading.set(true);
    error.set(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then(data.set)
      .catch((err) => err.name !== "AbortError" && error.set(err))
      .finally(() => loading.set(false));

    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}
```

The cleanup aborts the request if the component unmounts or `url` changes before the response arrives.

## 2. Load and display todos

```jsx title="src/TodoApp.jsx"
import { createComponent } from "refract";
import { useFetch } from "./optics/useFetch";

export const TodoApp = createComponent(({ lens }) => {
  const { data, error, loading } = useFetch(
    "https://jsonplaceholder.typicode.com/todos?_limit=5",
  );
  const todos = lens.useRefraction([]);

  lens.useEffect(() => {
    if (data.value) todos.set(data.value);
  }, [data]);

  if (loading.value) return <p>Loading todos…</p>;
  if (error.value) return <p role="alert">Couldn't load todos: {error.value.message}</p>;

  return (
    <ul class="todos">
      {todos.value.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
});
```

The fetched data seeds a local `todos` refraction that the user can then edit.

## 3. Add a todo

```jsx
const draft = lens.useRefraction("");

const addTodo = (event) => {
  event.preventDefault();
  const title = draft.value.trim();
  if (!title) return;
  todos.update((list) => [...list, { id: crypto.randomUUID(), title, completed: false }]);
  draft.set("");
};

<form onSubmit={addTodo}>
  <label for="new-todo">New todo</label>
  <input id="new-todo" value={draft.value} onInput={(e) => draft.set(e.target.value)} />
  <button type="submit">Add</button>
</form>
```

## 4. Complete and delete

Update one item by mapping over the list, and remove one by filtering:

```jsx
const toggle = (id) =>
  todos.update((list) => list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

const remove = (id) => todos.update((list) => list.filter((t) => t.id !== id));

<li key={todo.id}>
  <label>
    <input type="checkbox" checked={todo.completed} onChange={() => toggle(todo.id)} />
    {todo.title}
  </label>
  <button aria-label={`Delete ${todo.title}`} onClick={() => remove(todo.id)}>×</button>
</li>
```

## 5. Filter by status

```jsx
const filter = lens.useRefraction("all"); // "all" | "active" | "done"

const visible = lens.derive(() => {
  if (filter.value === "active") return todos.value.filter((t) => !t.completed);
  if (filter.value === "done") return todos.value.filter((t) => t.completed);
  return todos.value;
});

const remaining = lens.derive(() => todos.value.filter((t) => !t.completed).length);

<nav aria-label="Filter todos">
  {["all", "active", "done"].map((name) => (
    <button key={name} aria-pressed={filter.value === name} onClick={() => filter.set(name)}>
      {name}
    </button>
  ))}
</nav>
<p>{remaining.value} left</p>
```

Render `visible.value` instead of `todos.value` in the list.

## Recap

- Optics like `useFetch` package async work, cleanup and state together.
- Seed editable local state from fetched data with an effect.
- Always update lists immutably with `map`, `filter` and spread.
- Derived values (`visible`, `remaining`) stay in sync automatically.

## Next steps

Make the theme of your app switchable in [Add a global theme](./global-theme.md).
