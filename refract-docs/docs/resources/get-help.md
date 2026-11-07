---
title: Get help
description: Where to find answers, ask questions and report bugs in Refract.
---

# Get help

## Find an answer

Most questions are already answered in these docs. Try these first:

- **Search** with the search box at the top of every page.
- **Ask Refract**, the assistant in the bottom corner, answers questions from the docs and links to its sources.
- The [FAQ](./faq.md) covers common questions, and [Troubleshooting](./troubleshooting.md) is organized by error message.

## Ask a question

If the docs don't answer your question, [open an issue on GitHub](https://github.com/cae-west/Refract/issues/new) and start the title with **Question:**. Include what you're trying to do, what you've tried, and the smallest code example that shows it.

## Report a bug

Before reporting, update to the latest version and check [existing issues](https://github.com/cae-west/Refract/issues) to see whether it has been reported already. Then [open an issue](https://github.com/cae-west/Refract/issues/new) that includes:

1. **What happened**, and what you expected to happen instead.
2. **The smallest code that reproduces the bug.** A single component is ideal.
3. **Any error message**, copied in full.
4. **Your setup.** Run `refract doctor` and paste its output, which lists your Node.js version, Refract packages and bundler:

   ```bash
   npx refract doctor
   ```

A minimal reproduction is the most useful part of a report. For example:

```jsx
import { createApp, createComponent } from "refract";

// Expected: the list shows "b" after clicking. Actual: it doesn't update.
const App = createComponent(({ lens }) => {
  const items = lens.useRefraction(["a"]);
  return <button onClick={() => items.value.push("b")}>{items.value.join(", ")}</button>;
});

createApp(App).mount("#root");
```

Writing the reproduction often reveals the cause. In this example, the array is changed in place, so Refract doesn't see a change. See [Why didn't my component update after I changed an array?](./faq.md#why-didnt-my-component-update-after-i-changed-an-array)

## Report a security issue

Don't report security vulnerabilities in a public issue. Use [GitHub's private vulnerability reporting](https://github.com/cae-west/Refract/security/advisories/new) instead, so the issue can be fixed before it's made public.

## Fix the docs

Found a mistake or something unclear in the docs? Every page has an **Edit this page** link at the bottom. See [Contributing](./contributing.md) for how to run the docs locally and submit a change.
