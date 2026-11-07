---
title: Add a global theme
description: Share state across the whole app with a global refraction, persist it, and respect system preferences.
---

# Add a global theme

In this tutorial you add a light and dark theme that any component can read or change, that survives page reloads, and that defaults to the user's system setting.

**What you'll learn:** global refractions, persistence, syncing state with the DOM, wrapping state in an optic.
**Time:** about 20 minutes.

## 1. Create the global refraction

Global state lives at module level:

```js title="src/state/theme.js"
import { useRefraction } from "refract";

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const theme = useRefraction(systemTheme, {
  persist: "app.theme",
  name: "theme",
});
```

`persist` loads a previously saved choice from `localStorage` and saves every change. If nothing is saved, the system preference is used.

## 2. Apply the theme to the page

Sync the refraction with an attribute on `<html>` so CSS can respond. Because this is not tied to any component, use `subscribe()`:

```js title="src/state/theme.js"
const apply = (value) => (document.documentElement.dataset.theme = value);
apply(theme.value);
theme.subscribe(apply);
```

```css title="src/styles.css"
:root { --bg: #ffffff; --text: #1b2340; }
[data-theme="dark"] { --bg: #121827; --text: #e6e9f2; }

body { background: var(--bg); color: var(--text); }
```

## 3. Wrap it in an optic

Components shouldn't need to know how the theme is stored. Expose a small API:

```js title="src/optics/useTheme.js"
import { derive } from "refract";
import { theme } from "../state/theme";

export function useTheme() {
  return {
    theme,
    isDark: derive(() => theme.value === "dark"),
    toggle: () => theme.set(theme.value === "dark" ? "light" : "dark"),
  };
}
```

## 4. Build the toggle

```jsx title="src/components/ThemeToggle.jsx"
import { createComponent } from "refract";
import { useTheme } from "../optics/useTheme";

export const ThemeToggle = createComponent(() => {
  const { isDark, toggle } = useTheme();

  return (
    <button onClick={toggle} aria-pressed={isDark.value}>
      {isDark.value ? "Use light theme" : "Use dark theme"}
    </button>
  );
});
```

Put `<ThemeToggle />` anywhere. Every component that reads `theme` updates when it changes, and nothing else re-renders.

## 5. Follow system changes

Optionally, follow the system setting until the user picks a theme themselves. Because `persist` saves every change, including ones made by this listener, you can't tell from `localStorage` alone whether the user chose a theme. Record the user's choice separately instead.

In `src/state/theme.js`, add a flag and a listener:

```js title="src/state/theme.js"
const CHOSEN_KEY = "app.theme.chosen";

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem(CHOSEN_KEY)) theme.set(e.matches ? "dark" : "light");
  });

export const markThemeChosen = () => localStorage.setItem(CHOSEN_KEY, "true");
```

Then call `markThemeChosen()` in the optic's `toggle`, so only an explicit choice stops the theme following the system:

```js title="src/optics/useTheme.js"
import { theme, markThemeChosen } from "../state/theme";

// inside useTheme()
toggle: () => {
  markThemeChosen();
  theme.set(theme.value === "dark" ? "light" : "dark");
},
```

## Recap

- Module-level `useRefraction()` creates state any module can import.
- `persist` saves state to `localStorage` with one option.
- `subscribe()` connects refractions to code outside components.
- An optic hides storage details behind a small API.
