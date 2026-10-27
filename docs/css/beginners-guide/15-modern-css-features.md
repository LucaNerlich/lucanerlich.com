---
title: "Modern CSS Features"
sidebar_label: "Modern CSS"
description: Recent CSS additions - native nesting, the :has() selector, container queries, @layer, logical properties, color-mix(), accent-color, and subgrid.
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

You can now nest selectors inside other selectors, reducing repetition and improving readability. For production
rules, Sass differences, and specificity guidance, see the deep dive
[CSS Nesting](../css-nesting.mdx).

```css
.card {
    padding: 24px;
    border: 1px solid #ddd;
    border-radius: 8px;

    & h3 {
        margin: 0 0 8px;
        font-size: 1.25rem;
    }

    & p {
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

- Use `&` when the nested selector would otherwise start with a **type selector** (`& h3`, `& p`)
- Class, attribute, and combinator-based relative selectors can nest directly (`.badge`, `> img`)
- Use `&` to target the parent as a compound selector (`&:hover`, `&.active`). Native CSS has **no selector
  concatenation** (the Sass shorthand that appends a suffix does not exist here) - write the full class name instead.
  A bare pseudo-class nests as a descendant (`parent *:hover`), so use `&:hover` for the parent's own hover
- Do not nest deeper than two or three levels - it hurts readability and increases specificity

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

    & a {
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

`:has()` is a **relational pseudo-class** - it lets you style a parent based on what it contains. This was impossible
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

Media queries respond to the **viewport** size; container queries respond to the size of a **specific container
element**, so components adapt to wherever they are placed.

> **Deep dive:** For the syntax (`container-type`, `@container`, query units), interactive demos, and a full
> comparison with media queries, see [CSS Container Queries](../container-queries.mdx).

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

> **Deep dive:** [Logical Properties](../logical-properties.mdx) covers `inset`, shorthands, and RTL patterns.

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

This mixes 80% of the primary colour with 20% black - creating a darker hover shade dynamically.

```css
.muted {
    color: color-mix(in srgb, var(--color-text) 60%, transparent);
}
```

Mix with `transparent` to create semi-transparent versions of any colour.

> **Deep dive:** [Modern CSS Color](../modern-css-color.mdx) covers `oklch`, relative colours, `light-dark()`, and
> mixing in perceptually uniform spaces.

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

| Feature | What it does | Deep dive |
|---------|--------------|-----------|
| `text-wrap: balance` / `pretty` | Better line breaking for headings and paragraphs | -- |
| `@layer` / `@scope` | Explicit cascade order and subtree scoping | [Cascade Layers & Scope](../cascade-layers-and-scope.mdx) |
| View Transitions | Animate between DOM or page states | [View Transitions API](../view-transitions.mdx) |
| `@starting-style` / discrete transitions | Entry animations for `display` / popovers | [Transitions & Animations](./11-transitions-and-animations.mdx) |
| Popover + anchor positioning | Native overlays positioned against triggers | [Anchor Positioning & Popover](../anchor-positioning-and-popover.mdx) |
| `<dialog>` | Native modal / non-modal dialogs | [Native Overlays & Dialogs](../native-overlays-and-dialogs.mdx) |
| Scroll-driven animations | Drive keyframes from scroll / view progress | [Scroll-Driven Animations](../scroll-driven-animations.mdx) |
| `@property` | Typed, animatable custom properties | [Typed Custom Properties](../typed-custom-properties.mdx) |
| Scroll snap | CSS carousels and snap scrolling | [Scroll Snap & Carousels](../scroll-snap-and-carousels.mdx) |
| `content-visibility` | Skip rendering off-screen subtrees | [content-visibility & perf](../content-visibility-and-perf.mdx) |

Check [caniuse.com](https://caniuse.com) or MDN before relying on a feature without a fallback.

## Browser support strategy

Not all browsers support every modern feature. Follow this approach:

1. **Check support:** Use [caniuse.com](https://caniuse.com) or MDN browser compatibility tables - or query them
   directly in your editor via the [MDN MCP server](../../ai/mdn-mcp-server.md)
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
- **:has()** styles parents based on their children - one of the most powerful modern selectors
- **Container queries** make components respond to their container's size, not the viewport
- **Logical properties** replace left/right/top/bottom with flow-relative directions
- **accent-color** styles native form controls in one line
- **color-mix()** blends colours dynamically without preprocessors
- **Subgrid** aligns nested grid children to the parent grid's tracks
- Use `@supports` and progressive enhancement for features with limited browser support

## Next step

You now know all the CSS tools available. The next chapter covers **architecture and best practices** - how to organise
your CSS files, name your classes, and structure your code for long-term maintainability.
