---
title: Changelog
description: Notable changes in each Refract release.
---

# Changelog

Refract follows [semantic versioning](https://semver.org/).

## 1.4.0

- **New:** [`fromStream()`](../api/from-stream.md) accepts async iterables, observables and subscribe functions.
- **New:** `persist` option for [`useRefraction()`](../api/use-refraction.md).
- **Improved:** high-frequency streams are throttled to one update per animation frame.

## 1.3.0

- **New:** [`useTransition()`](../api/use-transition.md) supports spring physics.
- **New:** `refract doctor` CLI command.
- **Fixed:** `useOptic` cleanup ran early when two components shared an effect and one unmounted.

## 1.2.0

- **New:** `lens.provide()` and `lens.context()`.
- **Changed:** `useFlash` cleanup now runs on unmount, matching `useEffect`.

## 1.0.0

- First stable release: `createApp`, `createComponent`, refractions, lenses, optics, `useEffect`, `useOptic` and `useFlash`.
