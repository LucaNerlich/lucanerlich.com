---
title: "CSS Custom Properties"
sidebar_label: "Custom Properties"
description: CSS custom properties (variables) -- defining, using, scoping, fallback values, theming, building a dark mode toggle, and dynamic updates with JavaScript.
slug: /css/beginners-guide/css-custom-properties
tags: [css, beginners]
keywords:
    - css custom properties
    - css variables
    - css dark mode
    - css theming
    - css var function
sidebar_position: 13
---

# CSS Custom Properties

CSS custom properties (commonly called "CSS variables") let you store values and reuse them throughout your stylesheet.
They make your CSS more maintainable, consistent, and themeable.

## Defining custom properties

Custom properties are defined with a name that starts with `--`:

```css
:root {
    --color-primary: #4a90d9;
    --color-text: #333;
    --color-bg: #ffffff;
    --font-body: system-ui, sans-serif;
    --spacing-md: 16px;
    --radius-md: 8px;
}
```

The `:root` selector targets the `<html>` element. Defining variables here makes them available **everywhere** in your
stylesheet.

## Using custom properties

Reference a custom property with the `var()` function:

```css
.button {
    background-color: var(--color-primary);
    color: var(--color-bg);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
}

h1 {
    color: var(--color-primary);
}

a {
    color: var(--color-primary);
}
```

When you decide to change your primary colour, you update it in **one place** -- the `:root` definition -- and every
element using `var(--color-primary)` updates automatically.

## Fallback values

`var()` accepts a second argument -- a fallback used when the variable is not defined:

```css
.card {
    padding: var(--card-padding, 20px);
    border-radius: var(--card-radius, 8px);
}
```

If `--card-padding` is not defined anywhere, the browser uses `20px`.

Fallbacks can themselves be variables:

```css
.card {
    color: var(--card-text, var(--color-text, #333));
}
```

## Scoping

Custom properties follow the cascade. They can be scoped to any selector, not just `:root`:

```css
:root {
    --color-primary: #4a90d9;
}

.card {
    --color-primary: #e74c3c;
}
```

Inside `.card`, `--color-primary` is red. Everywhere else, it is blue. This is powerful for creating component-level
themes.

### Scoping example

```css
:root {
    --button-bg: #4a90d9;
    --button-text: #fff;
}

.danger {
    --button-bg: #e74c3c;
    --button-text: #fff;
}

.success {
    --button-bg: #28a745;
    --button-text: #fff;
}

.button {
    background-color: var(--button-bg);
    color: var(--button-text);
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
}
```

```html
<button class="button">Default</button>
<button class="button danger">Delete</button>
<button class="button success">Save</button>
```

Each button gets different colours without separate class rules for `background-color`.

## Building a design token system

Custom properties are perfect for design tokens -- the foundational values of your design system:

```css
:root {
    /* Colours */
    --color-primary: #4a90d9;
    --color-primary-light: #7ab3e8;
    --color-primary-dark: #2d6cb4;
    --color-secondary: #6c757d;
    --color-success: #28a745;
    --color-danger: #dc3545;
    --color-warning: #ffc107;
    --color-text: #333;
    --color-text-muted: #666;
    --color-bg: #ffffff;
    --color-bg-subtle: #f8f9fa;
    --color-border: #dee2e6;

    /* Typography */
    --font-body: system-ui, -apple-system, sans-serif;
    --font-heading: Georgia, serif;
    --font-mono: "Fira Code", Consolas, monospace;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.5rem;
    --font-size-2xl: 2rem;
    --line-height: 1.6;

    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;

    /* Borders */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

Now your entire stylesheet references these tokens:

```css
body {
    font-family: var(--font-body);
    font-size: var(--font-size-base);
    line-height: var(--line-height);
    color: var(--color-text);
    background-color: var(--color-bg);
}

h1, h2, h3 {
    font-family: var(--font-heading);
}

.card {
    padding: var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    background-color: var(--color-bg);
}
```

## Dark mode

Custom properties make dark mode straightforward. Define a second set of colour values:

```css
:root {
    --color-text: #333;
    --color-text-muted: #666;
    --color-bg: #ffffff;
    --color-bg-subtle: #f8f9fa;
    --color-border: #dee2e6;
    --color-primary: #4a90d9;
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
    --color-text: #e0e0e0;
    --color-text-muted: #a0a0a0;
    --color-bg: #1a1a2e;
    --color-bg-subtle: #16213e;
    --color-border: #2d3748;
    --color-primary: #7ab3e8;
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
}
```

Toggle dark mode by adding `data-theme="dark"` to the `<html>` element. Every component using these variables
automatically switches colours.

### Respecting system preference

Use a media query to match the user's operating system preference:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --color-text: #e0e0e0;
        --color-text-muted: #a0a0a0;
        --color-bg: #1a1a2e;
        --color-bg-subtle: #16213e;
        --color-border: #2d3748;
        --color-primary: #7ab3e8;
    }
}
```

### Dark mode with a toggle

Combine system preference with a manual toggle:

```css
:root {
    --color-text: #333;
    --color-bg: #fff;
}

@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
        --color-text: #e0e0e0;
        --color-bg: #1a1a2e;
    }
}

[data-theme="dark"] {
    --color-text: #e0e0e0;
    --color-bg: #1a1a2e;
}
```

This defaults to the system preference but lets a toggle override it.

## Updating custom properties with JavaScript

Unlike preprocessor variables (Sass/Less), CSS custom properties are **live**. You can change them at runtime with
JavaScript:

```javascript
document.documentElement.style.setProperty('--color-primary', '#e74c3c');
```

This immediately updates every element using `--color-primary` -- no page reload needed.

A simple theme toggle:

```javascript
const toggle = document.querySelector('.theme-toggle');

toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});
```

## Custom properties in calculations

Use `calc()` with custom properties for dynamic sizing:

```css
:root {
    --base-size: 16px;
    --scale: 1.25;
}

h3 {
    font-size: calc(var(--base-size) * var(--scale));
}

h2 {
    font-size: calc(var(--base-size) * var(--scale) * var(--scale));
}

h1 {
    font-size: calc(var(--base-size) * var(--scale) * var(--scale) * var(--scale));
}
```

## Limitations

- Custom properties cannot be used in **media query conditions**: `@media (min-width: var(--bp))` does not work
- They cannot define **property names**: `var(--my-prop): red` is invalid
- They are inherited by default -- child elements see parent values unless overridden
- No built-in type checking -- any value is accepted

## What you learned

- Custom properties start with `--` and are read with `var()`
- Define global tokens on `:root`; scope component tokens on specific selectors
- `var()` accepts a fallback value as the second argument
- Custom properties enable dark mode by redefining colour tokens
- JavaScript can update custom properties at runtime with `setProperty()`
- Use them for a design token system: colours, spacing, typography, shadows, radii

## Next step

With variables in place, the next chapter explains **specificity and the cascade** -- the rules that determine which
CSS declaration wins when multiple rules target the same element.
