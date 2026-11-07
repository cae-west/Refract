---
title: API reference
description: Every public export of the refract package.
sidebar_label: Overview
---

# API reference

Everything below is exported from `"refract"` unless noted.

```js
import { createApp, createComponent, useRefraction, derive } from "refract";
```

## Application

| Export | Description |
| --- | --- |
| [`createApp()`](./create-app.md) | Create an application from a root component and mount it |
| [`createComponent()`](./create-component.md) | Define a component from a render function |
| [Lens](./lens.md) | The scoped toolkit passed to every component |
| [`renderToString()`](../concepts/reactivity-model.md#rendering-on-the-server) | Render an app to HTML on the server (from `"refract/server"`) |

## State

| Export | Description |
| --- | --- |
| [`useRefraction()`](./use-refraction.md) | Create a writable reactive value |
| [`derive()`](./derive.md) | Create a cached, read-only value computed from other refractions |
| [`batch()`](./batch.md) | Group several updates into one render |
| [`fromStream()`](./from-stream.md) | Turn an async iterable or observable into a refraction |

## Effects and optics

| Export | Description |
| --- | --- |
| [`useEffect()`](./use-effect.md) | Run a side effect after render |
| [`useOptic()`](./use-optic.md) | Run a shared, transition-aware side effect inside an optic |
| [`useFlash()`](./use-flash.md) | Run once after the first render, before paint |
| [`useTransition()`](./use-transition.md) | Animate a numeric refraction declaratively |

## Tooling

| Export | Description |
| --- | --- |
| [`defineConfig()`](./config.md) | Type-safe `refract.config.js` (from `"refract/config"`) |
| [CLI](./cli.md) | `create-refract` and the `refract` command |

## Reading these pages

Each reference page follows the same layout: a **signature**, **when to use it**, **parameters**, the **return value**, at least one **example**, and **caveats**. Optional parameters are marked with `?`.
