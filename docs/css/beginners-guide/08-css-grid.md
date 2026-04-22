---
title: "CSS Grid"
sidebar_label: "CSS Grid"
description: CSS Grid layout -- defining rows and columns, the fr unit, grid areas, gap, auto-fit/auto-fill, minmax(), and implicit vs explicit grids.
slug: /css/beginners-guide/css-grid
tags: [css, beginners]
keywords:
    - css grid
    - css grid-template-columns
    - css grid-template-areas
    - css grid auto-fit
    - css grid layout
sidebar_position: 8
---

# CSS Grid

CSS Grid is a **two-dimensional** layout system. While Flexbox handles rows **or** columns, Grid handles rows **and**
columns at the same time. It is the most powerful layout tool in CSS.

## When to use Grid vs Flexbox

| Scenario                              | Use          |
|---------------------------------------|--------------|
| Items in a single row or column       | Flexbox      |
| Aligning items along one axis         | Flexbox      |
| A full page layout with rows + columns| Grid         |
| Cards in a responsive grid            | Grid         |
| Both rows and columns matter          | Grid         |

In practice, you often use both together: Grid for the overall page layout, Flexbox for smaller components inside it.

## Grid container and grid items

Set `display: grid` on a container. Its direct children become **grid items**:

```css
.grid {
    display: grid;
}
```

By default, grid items stack vertically (one per row), just like block elements. You need to define columns and rows to
see the grid effect.

## Defining columns and rows

### grid-template-columns

Defines the number and width of columns:

```css
.grid {
    display: grid;
    grid-template-columns: 200px 200px 200px;
}
```

This creates three columns, each 200px wide.

### grid-template-rows

Defines the number and height of rows:

```css
.grid {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    grid-template-rows: 100px 100px;
}
```

Two rows, each 100px tall.

### The fr unit

The `fr` (fraction) unit distributes available space proportionally. It is the most important unit in Grid:

```css
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
}
```

Three equal-width columns that fill all available space. `1fr 2fr 1fr` gives the middle column twice the width of the
side columns.

You can mix `fr` with fixed units:

```css
.layout {
    display: grid;
    grid-template-columns: 250px 1fr;
}
```

A fixed 250px sidebar and a main content area that takes the remaining space.

### The repeat() function

Shorthand for repeating track definitions:

```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}
```

Equivalent to `1fr 1fr 1fr`. You can repeat any pattern:

```css
grid-template-columns: repeat(4, 100px 1fr);
/* = 100px 1fr 100px 1fr 100px 1fr 100px 1fr */
```

## Gap

Just like Flexbox, `gap` adds space between grid items:

```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
```

Set row and column gaps separately:

```css
.grid {
    row-gap: 24px;
    column-gap: 16px;
}
```

## Placing items

Grid items automatically fill cells left to right, top to bottom. You can override this with placement properties.

### Line-based placement

Grid lines are numbered starting at 1. Use `grid-column` and `grid-row` to place items:

```css
.header {
    grid-column: 1 / 4;
}
```

This means: start at column line 1, end at column line 4 - spanning all three columns in a 3-column grid.

```css
.sidebar {
    grid-column: 1 / 2;
    grid-row: 2 / 4;
}
```

The sidebar occupies column 1 and spans rows 2 through 3.

### The span keyword

Instead of specifying end lines, you can use `span`:

```css
.header {
    grid-column: span 3;
}

.feature {
    grid-column: span 2;
    grid-row: span 2;
}
```

`span 3` means "occupy three columns from wherever the item is placed."

## Grid template areas

For complex layouts, named areas are the most readable approach:

```css
.layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header  header"
        "sidebar main"
        "footer  footer";
    min-height: 100vh;
    gap: 0;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

```html
<div class="layout">
    <header class="header">Header</header>
    <aside class="sidebar">Sidebar</aside>
    <main class="main">Main content</main>
    <footer class="footer">Footer</footer>
</div>
```

The `grid-template-areas` property draws a visual map of the layout. Each string is a row; each word is a cell. Repeat
a name to span multiple cells. Use a period (`.`) for empty cells:

```css
grid-template-areas:
    "header header header"
    "sidebar main main"
    ".       footer footer";
```

> **Tip:** Grid template areas are excellent for page-level layouts. The visual representation in the CSS directly
> mirrors the visual result, making the code self-documenting.

## Alignment in Grid

Grid supports the same alignment properties as Flexbox, plus a few extras.

### Container-level alignment

| Property          | Axis    | What it aligns                              |
|-------------------|---------|---------------------------------------------|
| `justify-items`   | Inline  | All items within their cells (horizontal)   |
| `align-items`     | Block   | All items within their cells (vertical)     |
| `justify-content` | Inline  | The entire grid within the container        |
| `align-content`   | Block   | The entire grid within the container        |

```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 200px);
    justify-content: center;
    align-items: center;
    min-height: 400px;
}
```

### Item-level alignment

| Property       | Axis    | What it aligns                         |
|----------------|---------|----------------------------------------|
| `justify-self` | Inline  | A single item within its cell          |
| `align-self`   | Block   | A single item within its cell          |

```css
.special {
    justify-self: end;
    align-self: start;
}
```

### The place shorthand

`place-items`, `place-content`, and `place-self` combine the align and justify versions:

```css
.grid {
    place-items: center;
}
```

## Responsive grids with auto-fit and auto-fill

The most powerful responsive Grid pattern uses `auto-fit` or `auto-fill` with `minmax()`:

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}
```

This creates a responsive grid where:

- Each column is at least 280px wide
- Columns expand to fill available space (up to `1fr`)
- The browser automatically creates as many columns as fit
- No media queries needed

### auto-fit vs auto-fill

| Keyword     | Behaviour when there are few items               |
|-------------|---------------------------------------------------|
| `auto-fit`  | Collapses empty tracks, items stretch to fill     |
| `auto-fill` | Keeps empty tracks, items stay at minimum size    |

In most cases, `auto-fit` is what you want.

### minmax()

The `minmax(min, max)` function sets a minimum and maximum size for a grid track:

```css
grid-template-columns: minmax(200px, 1fr) 3fr;
```

The first column is at least 200px but can grow up to `1fr`. The second column gets `3fr`.

## Implicit vs explicit grid

The **explicit grid** is what you define with `grid-template-columns` and `grid-template-rows`. If items overflow past
your defined tracks, the browser creates **implicit** tracks automatically.

Control the size of implicit tracks:

```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 150px;
}
```

`grid-auto-rows: 150px` makes any extra rows 150px tall. Without it, implicit rows auto-size to fit their content.

Use `minmax()` for flexible implicit rows:

```css
.grid {
    grid-auto-rows: minmax(100px, auto);
}
```

## Practical examples

### Photo gallery

```css
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.gallery img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
}
```

### Holy Grail layout

The classic header/sidebar/main/footer layout:

```css
.page {
    display: grid;
    grid-template-columns: 220px 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header  header"
        "sidebar main"
        "footer  footer";
    min-height: 100vh;
}

.page > header  { grid-area: header;  padding: 16px; background: #1a1a2e; color: white; }
.page > aside   { grid-area: sidebar; padding: 16px; background: #f5f5f5; }
.page > main    { grid-area: main;    padding: 24px; }
.page > footer  { grid-area: footer;  padding: 16px; background: #333; color: white; }
```

### Dashboard with different-sized cards

```css
.dashboard {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 180px;
    gap: 16px;
}

.dashboard .wide {
    grid-column: span 2;
}

.dashboard .tall {
    grid-row: span 2;
}

.dashboard .large {
    grid-column: span 2;
    grid-row: span 2;
}
```

## What you learned

- CSS Grid is two-dimensional - it handles rows **and** columns
- `grid-template-columns` and `grid-template-rows` define the grid structure
- The `fr` unit distributes space proportionally; `repeat()` avoids repetition
- `gap` adds space between tracks
- Items can be placed by line numbers (`grid-column: 1 / 3`), by span (`span 2`), or by named areas
- `auto-fit` with `minmax()` creates responsive grids without media queries
- Implicit tracks handle overflow items automatically

## Next step

Grid and Flexbox handle layout. The next chapter covers **responsive design** - media queries, breakpoints, and
mobile-first development to make your layouts work on every screen size.
