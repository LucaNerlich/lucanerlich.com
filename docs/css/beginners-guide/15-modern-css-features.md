---
title: "Modern CSS Features"
sidebar_label: "Modern CSS"
description: Recent CSS additions -- native nesting, the :has() selector, container queries, @layer, logical properties, color-mix(), accent-color, and subgrid.
slug: /css/beginners-guide/modern-css-features
tags: [css, beginners]
keywords:
    - css nesting
    - css has selector
    - css container queries
    - css layer
    - modern css 2025
sidebar_position: 15
---

# Modern CSS Features

CSS has evolved rapidly in recent years. Features that previously required preprocessors (Sass, Less) or JavaScript are
now built into the language. This chapter covers the most impactful additions.

## CSS nesting

You can now nest selectors inside other selectors, reducing repetition and improving readability:

```css
.card {
    padding: 24px;
    border: 1px solid #ddd;
    border-radius: 8px;

    h3 {
        margin: 0 0 8px;
        font-size: 1.25rem;
    }

    p {
        margin: 0;
        color: #666;
    }

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    & .badge {
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 4px;
        background-color: #4a90d9;
        color: white;
    }
}
```

### Nesting rules

- Nested selectors that start with a **letter** (like `h3`, `p`) are automatically interpreted as descendants
- Use `&` to reference the parent selector explicitly -- required for pseudo-classes (`:hover`), pseudo-elements
  (`::before`), and class selectors (`.badge`)
- Do not nest deeper than two or three levels -- it hurts readability and increases specificity

### Before vs after nesting

**Without nesting:**

```css
.nav { display: flex; gap: 16px; }
.nav a { color: white; text-decoration: none; }
.nav a:hover { text-decoration: underline; }
.nav .logo { font-weight: bold; font-size: 1.25rem; }
```

**With nesting:**

```css
.nav {
    display: flex;
    gap: 16px;

    a {
        color: white;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    .logo {
        font-weight: bold;
        font-size: 1.25rem;
    }
}
```

Nested CSS groups related rules together, making it easier to see which styles belong to a component.

### Nesting media queries

You can nest `@media` rules inside selectors:

```css
.sidebar {
    display: none;

    @media (min-width: 1024px) {
        display: block;
        width: 250px;
    }
}
```

This keeps the responsive behaviour close to the component it affects.

## The :has() selector

`:has()` is a **relational pseudo-class** -- it lets you style a parent based on what it contains. This was impossible
in CSS until `:has()` arrived.

```css
.card:has(img) {
    padding-top: 0;
}
```

This targets `.card` elements that **contain** an `<img>`. Cards without images keep their normal padding.

### Use cases

#### Style a form based on its validity

```css
form:has(:invalid) .submit-button {
    opacity: 0.5;
    pointer-events: none;
}
```

The submit button looks disabled when any form field is invalid.

#### Highlight a label when its input is focused

```css
.field:has(input:focus) label {
    color: #4a90d9;
}
```

#### Change layout based on child count

```css
.grid:has(> :nth-child(4)) {
    grid-template-columns: repeat(2, 1fr);
}
```

When the grid has four or more direct children, switch to a two-column layout.

#### Style previous siblings

`:has()` combined with the adjacent sibling selector lets you style a previous element based on the next one:

```css
h2:has(+ .subtitle) {
    margin-bottom: 4px;
}
```

Reduce the margin under an `<h2>` when it is immediately followed by a `.subtitle` element.

> **Tip:** Think of `:has()` as "if this element contains..." or "if this element is followed by...". It is one of
> the most powerful additions to CSS in years.

## Container queries

Media queries respond to the **viewport** size. Container queries respond to the size of a **specific container
element**. This makes components truly self-contained -- they adapt to wherever they are placed.

### Defining a container

```css
.card-wrapper {
    container-type: inline-size;
    container-name: card;
}
```

| Property         | Value          | Meaning                                    |
|------------------|----------------|--------------------------------------------|
| `container-type` | `inline-size`  | Track the container's inline (width) size  |
| `container-type` | `size`         | Track both width and height                |
| `container-name` | any name       | Optional name for targeted queries         |

### Querying the container

```css
@container card (min-width: 400px) {
    .card {
        display: flex;
        gap: 16px;
    }

    .card img {
        width: 150px;
    }
}

@container card (max-width: 399px) {
    .card img {
        width: 100%;
    }
}
```

When the `.card-wrapper` is 400px or wider, the card switches to a horizontal layout. When it is narrower, the image
takes full width. This happens regardless of the viewport size.

### Container query units

| Unit   | Relative to                    |
|--------|--------------------------------|
| `cqw`  | 1% of the container's width    |
| `cqh`  | 1% of the container's height   |
| `cqi`  | 1% of the container's inline size |
| `cqb`  | 1% of the container's block size  |

```css
.card-title {
    font-size: clamp(1rem, 3cqi, 1.5rem);
}
```

The title scales with the container's width, not the viewport.

## Logical properties

Logical properties replace physical directions (left, right, top, bottom) with **flow-relative** ones (inline-start,
inline-end, block-start, block-end). This makes CSS work correctly in right-to-left (RTL) languages and vertical
writing modes.

| Physical property  | Logical equivalent          |
|--------------------|-----------------------------|
| `margin-left`      | `margin-inline-start`       |
| `margin-right`     | `margin-inline-end`         |
| `margin-top`       | `margin-block-start`        |
| `margin-bottom`    | `margin-block-end`          |
| `padding-left`     | `padding-inline-start`      |
| `width`            | `inline-size`               |
| `height`           | `block-size`                |
| `border-left`      | `border-inline-start`       |

Shorthand properties:

```css
.card {
    margin-inline: 16px;
    padding-block: 24px;
}
```

`margin-inline` sets both `margin-inline-start` and `margin-inline-end`. `padding-block` sets both
`padding-block-start` and `padding-block-end`.

> **Tip:** Start using logical properties in new code. They make your CSS automatically work with different text
> directions and are the direction CSS is heading.

## accent-color

Style native form controls (checkboxes, radio buttons, range sliders, progress bars) with a single property:

```css
:root {
    accent-color: #4a90d9;
}
```

This changes the default blue colour of checkboxes, radios, and range inputs to your brand colour, without needing
custom checkbox implementations.

```css
input[type="checkbox"] {
    accent-color: #28a745;
}

input[type="range"] {
    accent-color: #e74c3c;
}
```

## color-mix()

Blend two colours together in CSS without a preprocessor:

```css
.button:hover {
    background-color: color-mix(in srgb, var(--color-primary) 80%, black);
}
```

This mixes 80% of the primary colour with 20% black -- creating a darker hover shade dynamically.

```css
.muted {
    color: color-mix(in srgb, var(--color-text) 60%, transparent);
}
```

Mix with `transparent` to create semi-transparent versions of any colour.

## Subgrid

When you have nested grids, `subgrid` lets a child grid inherit the track definitions of its parent:

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.card {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 3;
}
```

Without subgrid, the titles, descriptions, and buttons inside each card would not align across cards. With subgrid,
the child grid inherits the parent's row tracks, and content aligns perfectly.

## Other modern features

| Feature              | What it does                                                      |
|----------------------|-------------------------------------------------------------------|
| `text-wrap: balance` | Balances text across lines for headings (avoids orphans)          |
| `text-wrap: pretty`  | Optimises line breaking for paragraphs                            |
| `@scope`             | Scopes styles to a specific DOM subtree                           |
| `view-transition`    | Animates between page states (page transitions)                   |
| `@starting-style`    | Defines the starting style for entry animations                   |
| `popover`            | Native popover behaviour with CSS styling                         |
| `anchor positioning` | Position elements relative to other elements without JS           |

These features are at various stages of browser support. Check
[caniuse.com](https://caniuse.com) before using them in production.

## Browser support strategy

Not all browsers support every modern feature. Follow this approach:

1. **Check support:** Use [caniuse.com](https://caniuse.com) or MDN browser compatibility tables
2. **Use progressive enhancement:** Start with styles that work everywhere, layer on modern features
3. **Use @supports:** Test for feature support in CSS:

```css
.card {
    display: flex;
}

@supports (container-type: inline-size) {
    .card-wrapper {
        container-type: inline-size;
    }
}
```

4. **Set acceptable fallbacks:** If nesting is not supported, the browser ignores it and uses the flat rules

## What you learned

- **CSS nesting** groups related rules and reduces repetition
- **:has()** styles parents based on their children -- one of the most powerful modern selectors
- **Container queries** make components respond to their container's size, not the viewport
- **Logical properties** replace left/right/top/bottom with flow-relative directions
- **accent-color** styles native form controls in one line
- **color-mix()** blends colours dynamically without preprocessors
- **Subgrid** aligns nested grid children to the parent grid's tracks
- Use `@supports` and progressive enhancement for features with limited browser support

## Next step

You now know all the CSS tools available. The next chapter covers **architecture and best practices** -- how to organise
your CSS files, name your classes, and structure your code for long-term maintainability.
