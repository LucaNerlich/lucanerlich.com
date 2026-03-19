---
title: "Responsive Design"
sidebar_label: "Responsive Design"
description: Building layouts that work on every screen size -- the viewport meta tag, media queries, mobile-first development, breakpoints, responsive images, and fluid typography.
slug: /css/beginners-guide/responsive-design
tags: [css, beginners]
keywords:
    - css responsive design
    - css media queries
    - mobile first css
    - css breakpoints
    - responsive images css
sidebar_position: 9
---

# Responsive Design

Responsive design means your web page looks good on **every screen size** -- from a small phone to a wide desktop
monitor. Instead of building separate mobile and desktop sites, you write one set of HTML and CSS that adapts.

## The viewport meta tag

Before writing any responsive CSS, your HTML must include this meta tag in the `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Without it, mobile browsers render the page at a desktop width (typically 980px) and then zoom out to fit the screen.
The result is tiny, unreadable text.

This tag tells the browser: "Use the actual device width as the viewport width and start at 1x zoom."

> **Note:** Every responsive page needs this tag. If your page looks tiny on mobile, this is the first thing to check.

## Media queries

Media queries let you apply CSS rules **only when certain conditions are met**, such as the screen being wider or
narrower than a threshold:

```css
.sidebar {
    display: none;
}

@media (min-width: 768px) {
    .sidebar {
        display: block;
        width: 250px;
    }
}
```

On screens narrower than 768px, the sidebar is hidden. On screens 768px and wider, it appears.

### Syntax

```css
@media (condition) {
    /* CSS rules that apply when the condition is true */
}
```

Common conditions:

| Condition                  | True when                           |
|----------------------------|-------------------------------------|
| `(min-width: 768px)`      | Viewport is 768px or wider          |
| `(max-width: 767px)`      | Viewport is 767px or narrower       |
| `(min-height: 600px)`     | Viewport is 600px or taller         |
| `(orientation: landscape)` | Width is greater than height        |
| `(prefers-color-scheme: dark)` | User prefers dark mode          |
| `(prefers-reduced-motion: reduce)` | User prefers less animation |
| `(hover: hover)`          | Device has a hover-capable pointer  |

You can combine conditions:

```css
@media (min-width: 768px) and (max-width: 1023px) {
    .container {
        padding: 16px;
    }
}
```

## Mobile-first development

There are two approaches to responsive CSS:

1. **Desktop-first** -- write styles for large screens, then use `max-width` queries to override for smaller screens
2. **Mobile-first** -- write styles for small screens, then use `min-width` queries to enhance for larger screens

**Mobile-first is the recommended approach.** Here is why:

- Mobile styles are simpler (single column, stacked layout)
- You progressively **add** complexity for larger screens instead of **removing** it
- Smaller CSS files for mobile users (they only load the base styles)
- Forces you to prioritise content

### Mobile-first example

```css
/* Base: mobile (small screens) */
.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop and up */
@media (min-width: 1024px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

The default is a single column. At 768px, it becomes two columns. At 1024px, three columns.

## Common breakpoints

There is no universally "correct" set of breakpoints, but these are widely used:

| Name      | Min-width | Typical devices                  |
|-----------|-----------|----------------------------------|
| Mobile    | 0         | Phones (portrait)                |
| Tablet    | 768px     | Tablets, phones (landscape)      |
| Desktop   | 1024px    | Laptops, small desktops          |
| Wide      | 1280px    | Large desktops                   |
| Ultra-wide| 1536px    | Ultra-wide monitors              |

> **Tip:** Do not obsess over exact breakpoint values. The best breakpoints are where **your design breaks** -- resize
> the browser and add a breakpoint wherever the layout starts to look bad.

### Defining breakpoints in CSS

With custom properties (chapter 13) you cannot use variables inside `@media` conditions. Instead, document your
breakpoints with comments:

```css
/*
 * Breakpoints:
 *   sm: 640px
 *   md: 768px
 *   lg: 1024px
 *   xl: 1280px
 */

@media (min-width: 768px) {
    /* tablet styles */
}
```

## Responsive layout patterns

### The stack-to-horizontal pattern

The most common responsive pattern. Items stack on mobile, go side by side on desktop:

```css
.features {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

@media (min-width: 768px) {
    .features {
        flex-direction: row;
    }
}
```

### The sidebar pattern

Sidebar hidden on mobile, visible on desktop:

```css
.layout {
    display: grid;
    grid-template-columns: 1fr;
}

.sidebar {
    display: none;
}

@media (min-width: 1024px) {
    .layout {
        grid-template-columns: 250px 1fr;
    }

    .sidebar {
        display: block;
    }
}
```

### The auto-fit grid (no media queries needed)

As covered in chapter 8, this pattern is inherently responsive:

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}
```

## Responsive images

Images should never overflow their container. This base rule handles most cases:

```css
img {
    max-width: 100%;
    height: auto;
}
```

`max-width: 100%` prevents the image from exceeding its container width. `height: auto` maintains the aspect ratio.

### The HTML picture element

For art direction (showing different images at different sizes), use the `<picture>` element:

```html
<picture>
    <source media="(min-width: 1024px)" srcset="hero-wide.jpg" />
    <source media="(min-width: 768px)" srcset="hero-medium.jpg" />
    <img src="hero-small.jpg" alt="Hero image" />
</picture>
```

### Object-fit for fixed-size images

When images must fit a fixed container, use `object-fit`:

```css
.thumbnail {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
}
```

| Value     | Behaviour                                     |
|-----------|-----------------------------------------------|
| `cover`   | Fills the container, crops excess              |
| `contain` | Fits inside the container, may leave gaps      |
| `fill`    | Stretches to fill (distorts aspect ratio)      |
| `none`    | Natural size, may overflow                     |

## Responsive typography

Font sizes should scale between breakpoints. Use `clamp()` for fluid scaling without media queries:

```css
body {
    font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
}

h1 {
    font-size: clamp(1.75rem, 1.5rem + 2vw, 3.5rem);
}

h2 {
    font-size: clamp(1.5rem, 1.25rem + 1.5vw, 2.5rem);
}
```

Or use media queries for step-based changes:

```css
body {
    font-size: 16px;
}

@media (min-width: 768px) {
    body {
        font-size: 18px;
    }
}

@media (min-width: 1280px) {
    body {
        font-size: 20px;
    }
}
```

## Responsive spacing

Scale padding and margins at different breakpoints:

```css
.section {
    padding: 24px 16px;
}

@media (min-width: 768px) {
    .section {
        padding: 48px 32px;
    }
}

@media (min-width: 1280px) {
    .section {
        padding: 64px 48px;
    }
}
```

## Container width

Prevent content from stretching too wide on large screens:

```css
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

@media (min-width: 768px) {
    .container {
        padding: 0 24px;
    }
}
```

## Testing responsive designs

1. **Browser DevTools** -- toggle the device toolbar (Ctrl+Shift+M / Cmd+Shift+M) to simulate different screen sizes
2. **Resize the browser window** -- drag the edge of the window and watch your layout adapt
3. **Test on real devices** -- simulators are good but real devices reveal issues with touch, scrolling, and viewport
   quirks

> **Tip:** Always test at sizes **between** your breakpoints, not just at the breakpoints themselves. The design should
> look good at every width, not just at 768px and 1024px.

## Complete responsive example

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}

body {
    font-family: system-ui, sans-serif;
    font-size: clamp(1rem, 0.9rem + 0.4vw, 1.2rem);
    line-height: 1.6;
    margin: 0;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

.nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #1a1a2e;
    color: white;
}

.hero {
    padding: 48px 16px;
    text-align: center;
}

.hero h1 {
    font-size: clamp(2rem, 1.5rem + 3vw, 4rem);
    margin-bottom: 16px;
}

.features {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 32px 16px;
}

@media (min-width: 768px) {
    .features {
        grid-template-columns: repeat(2, 1fr);
        padding: 48px 24px;
    }
}

@media (min-width: 1024px) {
    .features {
        grid-template-columns: repeat(3, 1fr);
        padding: 64px 32px;
    }
}

.feature-card {
    padding: 24px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: white;
}
```

## What you learned

- The `<meta name="viewport">` tag is required for responsive pages
- **Media queries** apply CSS conditionally based on viewport size (or other conditions)
- **Mobile-first** means writing base styles for small screens and using `min-width` queries for larger ones
- Breakpoints should be based on where your design breaks, not on specific device sizes
- `max-width: 100%` and `height: auto` make images responsive
- `clamp()` creates fluid typography that scales smoothly
- Use a `.container` with `max-width` and `margin: 0 auto` to constrain content width

## Next step

Your layouts are now responsive. The next chapter covers **backgrounds, borders, and shadows** -- the visual effects
that add depth and polish to your designs.
