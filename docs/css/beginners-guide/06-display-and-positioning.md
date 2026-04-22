---
title: "Display & Positioning"
sidebar_label: "Display & Positioning"
description: How CSS display modes (block, inline, inline-block) and positioning (static, relative, absolute, fixed, sticky) control element flow and placement.
slug: /css/beginners-guide/display-and-positioning
tags: [css, beginners]
keywords:
    - css display property
    - css position absolute
    - css position sticky
    - css z-index
    - css block inline
sidebar_position: 6
---

# Display & Positioning

Every HTML element follows a default flow - block elements stack vertically, inline elements sit side by side. The
`display` and `position` properties let you override that default behaviour.

## Normal flow

Before you change anything, the browser places elements in **normal flow**:

- **Block elements** (`<div>`, `<p>`, `<h1>`-`<h6>`, `<section>`, `<ul>`) start on a new line and stretch to fill the
  full width of their parent
- **Inline elements** (`<span>`, `<a>`, `<strong>`, `<em>`, `<img>`) sit on the same line as surrounding text and only
  take up as much width as their content needs

Understanding normal flow is essential. Every layout technique in CSS either works **within** normal flow or **removes**
elements from it.

## The display property

The `display` property controls how an element behaves in the flow.

### block

A block element takes up the **full width** available and starts on a **new line**:

```css
div {
    display: block;
}
```

Block elements accept `width`, `height`, `margin`, and `padding` on all sides.

### inline

An inline element flows **with the text** and does not start a new line:

```css
span {
    display: inline;
}
```

Important limitations of inline elements:

- `width` and `height` are **ignored**
- `margin-top` and `margin-bottom` are **ignored**
- `padding-top` and `padding-bottom` apply visually but do **not** push other elements away

### inline-block

A hybrid: the element flows inline (sits on the same line as text) but accepts `width`, `height`, and all margins and
padding like a block element:

```css
.badge {
    display: inline-block;
    padding: 4px 12px;
    background-color: #4a90d9;
    color: white;
    border-radius: 12px;
    font-size: 14px;
}
```

`inline-block` is useful for buttons, badges, and navigation links that need block-level sizing but should not break
to a new line.

### none

Removes the element from the page entirely. It takes up no space and is invisible:

```css
.hidden {
    display: none;
}
```

This is different from `visibility: hidden`, which hides the element visually but still reserves its space in the
layout.

| Property             | Visible? | Takes up space? |
|----------------------|----------|-----------------|
| `display: none`      | No       | No              |
| `visibility: hidden` | No       | Yes             |
| `opacity: 0`         | No       | Yes             |

### Display comparison

```css
.block-demo {
    display: block;
    width: 200px;
    padding: 12px;
    margin-bottom: 8px;
    background-color: #e8f4f8;
}

.inline-demo {
    display: inline;
    padding: 4px 8px;
    background-color: #fce4ec;
}

.inline-block-demo {
    display: inline-block;
    width: 150px;
    padding: 12px;
    margin: 4px;
    background-color: #e8f5e9;
}
```

```html
<div class="block-demo">Block 1</div>
<div class="block-demo">Block 2</div>

<span class="inline-demo">Inline 1</span>
<span class="inline-demo">Inline 2</span>
<span class="inline-demo">Inline 3</span>

<div class="inline-block-demo">IB 1</div>
<div class="inline-block-demo">IB 2</div>
<div class="inline-block-demo">IB 3</div>
```

## The position property

The `position` property lets you place elements outside normal flow. It works together with `top`, `right`, `bottom`,
and `left` offset properties.

### static (default)

All elements are `position: static` by default. They follow normal flow. The offset properties (`top`, `right`, etc.)
have no effect.

### relative

The element stays in normal flow (it still occupies its original space) but you can **shift it** from that position:

```css
.nudge {
    position: relative;
    top: 10px;
    left: 20px;
}
```

This moves the element 10px down and 20px to the right **from where it would normally be**. Other elements are not
affected - they do not fill the gap.

`relative` is most often used as a **positioning context** for absolute children (see below).

### absolute

The element is **removed from normal flow**. It does not take up space. It is positioned relative to its **nearest
positioned ancestor** (any ancestor with `position` set to `relative`, `absolute`, `fixed`, or `sticky`). If no
ancestor is positioned, it positions relative to the `<html>` element.

```css
.parent {
    position: relative;
    width: 400px;
    height: 300px;
    background-color: #f0f0f0;
}

.badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 12px;
    background-color: red;
    color: white;
    border-radius: 4px;
}
```

```html
<div class="parent">
    <span class="badge">New</span>
    <p>Card content here.</p>
</div>
```

The badge is pinned to the top-right corner of `.parent` because `.parent` has `position: relative`.

> **Tip:** The "relative parent, absolute child" pattern is one of the most common in CSS. Whenever you need to position
> something inside a container, set the container to `position: relative` and the child to `position: absolute`.

### fixed

The element is removed from normal flow and positioned relative to the **viewport**. It stays in the same spot even
when the user scrolls:

```css
.back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 16px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
}
```

Common use cases: sticky navigation bars, "back to top" buttons, floating action buttons, and modal overlays.

> **Note:** Fixed elements are positioned relative to the viewport, but this changes if an ancestor has a `transform`,
> `perspective`, or `filter` property set. This is a common gotcha.

### sticky

A hybrid of relative and fixed. The element behaves like `relative` until the user scrolls past a threshold, then it
"sticks" in place like `fixed`:

```css
.sticky-header {
    position: sticky;
    top: 0;
    background-color: white;
    padding: 12px;
    border-bottom: 1px solid #ddd;
    z-index: 10;
}
```

```html
<header class="sticky-header">
    <nav>Site Navigation</nav>
</header>
<main>
    <p>Lots of content...</p>
</main>
```

The header scrolls normally with the page until it reaches the top of the viewport, then it sticks there.

Requirements for sticky to work:

1. A `top`, `right`, `bottom`, or `left` value must be set
2. The parent must not have `overflow: hidden` or `overflow: auto`
3. The parent must have enough content for scrolling to occur

### Position summary

| Position   | In normal flow? | Positioned relative to              | Scrolls with page? |
|------------|-----------------|--------------------------------------|---------------------|
| `static`   | Yes            | N/A (default)                        | Yes                 |
| `relative` | Yes            | Its own normal position              | Yes                 |
| `absolute` | No             | Nearest positioned ancestor          | Yes                 |
| `fixed`    | No             | Viewport                             | No                  |
| `sticky`   | Yes (until stuck) | Scroll container / viewport       | Until threshold     |

## z-index

When positioned elements overlap, `z-index` controls which one appears on top:

```css
.box-a {
    position: relative;
    z-index: 1;
}

.box-b {
    position: relative;
    z-index: 2;
}
```

`.box-b` appears on top because it has a higher `z-index`.

Important rules:

- `z-index` only works on **positioned** elements (anything except `static`)
- Higher values appear on top of lower values
- Negative values are allowed
- `z-index` creates **stacking contexts** - a `z-index` on a parent element groups all its children into a single
  layer. A child cannot escape its parent's stacking context no matter how high its `z-index` is.

> **Tip:** Avoid using arbitrary high values like `z-index: 9999`. Instead, define a simple scale in your project:

```css
:root {
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-modal-backdrop: 300;
    --z-modal: 400;
    --z-tooltip: 500;
}
```

## Practical example: card with badge and sticky nav

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}

body {
    font-family: sans-serif;
    margin: 0;
}

.nav {
    position: sticky;
    top: 0;
    display: flex;
    gap: 24px;
    padding: 16px 24px;
    background-color: #1a1a2e;
    color: white;
    z-index: 100;
}

.nav a {
    color: white;
    text-decoration: none;
}

.content {
    padding: 24px;
}

.card {
    position: relative;
    max-width: 320px;
    padding: 24px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
}

.card .badge {
    position: absolute;
    top: -8px;
    right: -8px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: bold;
    background-color: #e74c3c;
    color: white;
    border-radius: 12px;
}
```

```html
<nav class="nav">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
</nav>

<div class="content">
    <div class="card">
        <span class="badge">Sale</span>
        <h3>Product Name</h3>
        <p>A great product at a great price.</p>
    </div>
</div>
```

This example combines sticky positioning (the nav), relative/absolute positioning (the card with its badge), and
z-index management.

## What you learned

- **Block** elements stack vertically; **inline** elements flow with text; **inline-block** is a useful hybrid
- `display: none` removes an element completely; `visibility: hidden` hides it but keeps its space
- `position: relative` shifts an element from its normal position and serves as a positioning context
- `position: absolute` removes an element from flow and positions it relative to a positioned ancestor
- `position: fixed` pins an element to the viewport; `position: sticky` pins it after scrolling past a threshold
- `z-index` controls stacking order but only works on positioned elements

## Next step

Display and position give you control over individual elements. The next chapter introduces **Flexbox** - a dedicated
layout system for arranging groups of elements in rows or columns.
