---
title: "Architecture & Best Practices"
sidebar_label: "Architecture"
description: Organising CSS for maintainability -- BEM naming, file structure, CSS resets vs normalisers, utility classes, component-scoped styles, and preprocessor overview.
slug: /css/beginners-guide/architecture-and-best-practices
tags: [css, beginners]
keywords:
    - css bem naming
    - css architecture
    - css reset normalize
    - css file structure
    - css best practices
sidebar_position: 16
---

# Architecture & Best Practices

Writing CSS that works is the first step. Writing CSS that stays maintainable as your project grows is the harder
challenge. This chapter covers naming conventions, file organisation, and architectural patterns used in professional
projects.

## The problem

CSS has no built-in scoping mechanism. Every rule is global. On a small project, this is fine. On a large project, it
leads to:

- **Naming conflicts** - two developers independently create a `.title` class with different styles
- **Specificity wars** - selectors grow longer to override other rules
- **Dead CSS** - nobody removes old rules because they are afraid of breaking something
- **Unpredictable side effects** - changing one rule breaks something on a different page

Architecture conventions solve these problems.

## BEM naming convention

**BEM** stands for **Block**, **Element**, **Modifier**. It is the most widely adopted CSS naming convention.

### Structure

```
.block {}
.block__element {}
.block--modifier {}
```

| Part         | What it represents                              | Example                  |
|--------------|-------------------------------------------------|--------------------------|
| **Block**    | A standalone component                          | `.card`                  |
| **Element**  | A part of a block that has no meaning on its own| `.card__title`           |
| **Modifier** | A variation of a block or element               | `.card--featured`        |

### Example

```html
<article class="card card--featured">
    <img class="card__image" src="photo.jpg" alt="Photo" />
    <div class="card__body">
        <h3 class="card__title">Card Title</h3>
        <p class="card__text">Description text here.</p>
        <a class="card__link card__link--primary" href="#">Read more</a>
    </div>
</article>
```

```css
.card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
}

.card--featured {
    border-color: #4a90d9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card__body {
    padding: 20px;
}

.card__title {
    margin: 0 0 8px;
    font-size: 1.25rem;
}

.card__text {
    margin: 0 0 16px;
    color: #666;
}

.card__link {
    text-decoration: none;
    font-weight: 600;
}

.card__link--primary {
    color: #4a90d9;
}
```

### Why BEM works

- **No nesting required** - every class is a single class selector (low, flat specificity)
- **Self-documenting** - `.card__title` clearly belongs to the `.card` block
- **No naming conflicts** - the block name acts as a namespace
- **Easy to find** - search for `.card` to find all card-related CSS

### BEM rules

1. **Never style bare elements inside a block** - use `.card__title` instead of `.card h3`
2. **Keep blocks independent** - a block should not depend on being inside another block
3. **Do not nest elements** - `.card__body__title` is wrong; use `.card__title`
4. **Modifiers extend, not replace** - use both classes: `class="card card--featured"`

## File organisation

### Single file

For small projects (a few pages), one `styles.css` file is fine. Organise it with comment sections:

```css
/* ================================
   Reset
   ================================ */

/* ================================
   Base / Typography
   ================================ */

/* ================================
   Layout
   ================================ */

/* ================================
   Components
   ================================ */

/* ================================
   Utilities
   ================================ */
```

### Multi-file structure

For larger projects, split CSS into multiple files:

```
styles/
  reset.css
  tokens.css
  base.css
  layout.css
  components/
    card.css
    button.css
    nav.css
    form.css
  utilities.css
```

Import them in order in a main file or HTML:

```css
@import "reset.css";
@import "tokens.css";
@import "base.css";
@import "layout.css";
@import "components/card.css";
@import "components/button.css";
@import "components/nav.css";
@import "components/form.css";
@import "utilities.css";
```

> **Note:** In production, use a build tool to bundle these files. `@import` creates additional HTTP requests which slow
> page loads. Build tools like Vite, Webpack, or PostCSS combine them into a single file.

### File ordering principle

The order matters. Load files from **least specific to most specific**:

1. **Reset / normalise** - remove browser defaults
2. **Tokens** - custom properties (colours, fonts, spacing)
3. **Base** - default styles for bare HTML elements
4. **Layout** - page structure (grid, sidebar, container)
5. **Components** - reusable UI components (card, button, nav)
6. **Utilities** - single-purpose overrides (`.hidden`, `.text-center`)

Utilities come last because they must be able to override component styles.

## CSS resets and normalisers

Browsers apply default styles to HTML elements. These defaults vary between browsers, causing inconsistencies.

### CSS reset

A reset removes **all** default styles:

```css
*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

A more comprehensive version:

```css
*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
}

body {
    min-height: 100vh;
    line-height: 1.6;
}

img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
}

input, button, textarea, select {
    font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
}
```

### Normaliser

A normaliser (like Normalize.css) **keeps** useful defaults but makes them consistent across browsers. It is less
aggressive than a reset.

### Which to use?

| Approach   | Best for                                          |
|------------|---------------------------------------------------|
| Reset      | Full control; you define every style from scratch  |
| Normaliser | Keeping sensible defaults; less CSS to write       |

Most modern projects use a lightweight reset (like the one above) rather than a full normaliser.

## Utility classes

Utility classes apply a single style:

```css
.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.mt-0 { margin-top: 0; }
.mt-4 { margin-top: 16px; }
.mt-8 { margin-top: 32px; }
.hidden { display: none; }
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

Use utilities for one-off adjustments instead of creating new component classes:

```html
<p class="card__text mt-4 text-center">Centred text with extra top margin.</p>
```

The `.sr-only` class is especially important - it hides content visually but keeps it available to screen readers.

### Utility-first CSS (Tailwind approach)

The utility-first approach (popularised by Tailwind CSS) composes entire designs from small utility classes:

```html
<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
    <img class="h-12 w-12" src="logo.png" alt="Logo" />
    <div>
        <div class="text-xl font-medium text-black">Company Name</div>
        <p class="text-slate-500">A great product.</p>
    </div>
</div>
```

Utility-first CSS avoids naming problems entirely - you never write class names at all. The trade-off is longer HTML
and a different mental model.

## Component-scoped styles

In modern frameworks (React, Vue, Svelte), CSS can be scoped to a component automatically:

- **CSS Modules** - class names are made unique at build time (`.card_abc123`)
- **Vue `<style scoped>`** - adds a data attribute to scope selectors
- **Svelte** - scopes styles by default
- **Shadow DOM** - fully encapsulated styles (Web Components)

These approaches solve the global scope problem at the framework level. If you are using a framework, consider them.

## CSS preprocessors

Preprocessors like **Sass** and **Less** extend CSS with variables, nesting, mixins, and functions. They compile to
standard CSS.

With the arrival of native CSS custom properties (chapter 13) and native nesting (chapter 15), the gap between
preprocessors and plain CSS has narrowed significantly. Consider whether you still need a preprocessor.

| Feature          | Native CSS | Sass |
|------------------|-----------|------|
| Variables        | Yes (custom properties) | Yes ($variables) |
| Nesting          | Yes (native) | Yes |
| Mixins           | No | Yes |
| Loops/conditions | No | Yes |
| Colour functions | `color-mix()` | Full suite |
| File splitting   | `@import` (needs bundler) | `@use`, `@forward` |

> **Tip:** For new projects, start with plain CSS. Add Sass only if you need mixins, loops, or other features that
> native CSS does not support.

## General best practices

1. **Use a consistent naming convention** (BEM or similar)
2. **Keep selectors short and flat** - prefer `.card-title` over `div.card > h3.title`
3. **Avoid IDs for styling** - use classes exclusively
4. **Avoid `!important`** unless there is no other way
5. **Use custom properties for values that repeat** (colours, spacing, fonts)
6. **Write mobile-first** - base styles for small screens, `min-width` media queries for larger
7. **Delete unused CSS** - dead code grows silently and increases file size
8. **Use `box-sizing: border-box` globally** - add the reset to every project
9. **Comment section boundaries**, not individual properties
10. **Run your styles through a linter** (Stylelint) to catch errors and enforce conventions

## What you learned

- **BEM** (Block__Element-Modifier) keeps naming predictable and specificity flat
- Organise CSS files from least specific (reset) to most specific (utilities)
- Use a **CSS reset** to remove inconsistent browser defaults
- **Utility classes** handle one-off adjustments; utility-first frameworks take this to the extreme
- Frameworks offer **component-scoped styles** (CSS Modules, Scoped styles) to solve global scope
- **Sass** is less necessary now that CSS has native variables and nesting
- Keep selectors flat, use classes, avoid `!important`, and delete dead CSS

## Next step

With good architecture in place, the final technical chapter covers **debugging and common pitfalls** - how to use
DevTools effectively and avoid the most frequent CSS mistakes.
