---
title: "Color and Contrast"
sidebar_label: "Color & contrast"
description: WCAG contrast targets, color tokens, dark mode, and how to make links identifiable without relying on colour alone.
slug: /web-content/color-and-contrast
tags: [ux, color, accessibility, wcag, design-tokens, dark-mode]
keywords:
  - wcag contrast
  - color tokens
  - dark mode
  - focus indicator
  - link underline
  - 4.5:1
  - color blind
sidebar_position: 6
---

# Color and contrast

Body text must meet **contrast** expectations against its background. WCAG 2.x commonly cites **4.5:1** for normal text and **3:1** for large text (roughly 18px+ regular or 14px+ bold). Interactive components and **focus indicators** also need visible contrast -- see WCAG 2.2. Back to the [section overview](./overview.md).

## Text and UI colors

### Do (tokens with readable defaults)

```css
:root {
    --color-text: #1a1a1a;
    --color-text-muted: #4a4a4a;
    --color-surface: #ffffff;
    --color-link: #0b57d0;
    --color-link-hover: #0842a0;
    --color-focus: #0b57d0;
}

body {
    background: var(--color-surface);
    color: var(--color-text);
}

a {
    color: var(--color-link);
    text-decoration: underline;
    text-underline-offset: 0.15em;
}

a:hover {
    color: var(--color-link-hover);
}

:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
}
```

### Don't (light gray body text on white)

```css
body {
    color: #b0b0b0;
    background: #fff;
}
```

## Dark mode

When you offer **dark mode**, redefine tokens and **re-check** contrast. Pure white on pure black can create halation for some readers -- slightly off-white text on dark gray often reads better.

### Do

```css
[data-theme='dark'] {
    --color-text: #e8e8ea;
    --color-text-muted: #b4b4bc;
    --color-surface: #121214;
    --color-link: #8ab4ff;
    --color-link-hover: #b8d2ff;
}
```

### Don't

```css
/* Assume light-theme hex codes stay readable on dark backgrounds */
[data-theme='dark'] body {
    background: #000;
    color: #888;
}
```

## Links in body copy

Relying on **colour alone** fails WCAG **1.4.1 Use of Color**. Underline links in running text or give another non-colour cue.

### Do

```css
.prose a {
    text-decoration: underline;
}
```

### Don't

```css
.prose a {
    text-decoration: none;
    color: #0b57d0;
}
```

## Related

- [Readability and typography](./readability-and-typography.md) -- type sizing and measure that work alongside colour choices.
- [CSS: Colors and Typography](../../css/beginners-guide/04-colors-and-typography.md) -- the underlying CSS reference for fonts, units, and color.
