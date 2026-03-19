---
title: "Backgrounds, Borders & Shadows"
sidebar_label: "Backgrounds & Shadows"
description: CSS background images, gradients, background shorthand, border-radius for rounded corners, box-shadow, text-shadow, and multiple backgrounds.
slug: /css/beginners-guide/backgrounds-borders-shadows
tags: [css, beginners]
keywords:
    - css background image
    - css gradient
    - css border-radius
    - css box-shadow
    - css text-shadow
sidebar_position: 10
---

# Backgrounds, Borders & Shadows

Backgrounds, rounded corners, and shadows add visual depth and polish to your designs. This chapter covers every
background technique, border rounding, and shadow effect CSS offers.

## background-color

The simplest background -- a solid colour:

```css
.card {
    background-color: #f5f5f5;
}
```

Already covered in chapter 4. All colour formats (hex, rgb, hsl, named) work here.

## background-image

Load an image as the background:

```css
.hero {
    background-image: url("hero.jpg");
}
```

The image tiles (repeats) by default to fill the element. You almost always need additional properties to control this.

### background-size

Controls how the image is scaled:

| Value     | Behaviour                                             |
|-----------|-------------------------------------------------------|
| `cover`   | Scales to fill the element completely, may crop       |
| `contain` | Scales to fit inside the element, may leave gaps      |
| `100% auto`| Custom width and height values                      |

```css
.hero {
    background-image: url("hero.jpg");
    background-size: cover;
}
```

`cover` is the most common value. It ensures no gaps and is the equivalent of `object-fit: cover` for `<img>` elements.

### background-position

Controls where the image is anchored:

```css
.hero {
    background-image: url("hero.jpg");
    background-size: cover;
    background-position: center;
}
```

Values: `center`, `top`, `bottom`, `left`, `right`, or exact values like `50% 30%` or `20px 100px`.

### background-repeat

Controls tiling behaviour:

| Value       | Behaviour                        |
|-------------|----------------------------------|
| `repeat`    | Tile both directions (default)   |
| `repeat-x`  | Tile horizontally only           |
| `repeat-y`  | Tile vertically only             |
| `no-repeat` | Show the image once              |

```css
.hero {
    background-image: url("hero.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
```

### background-attachment

Controls whether the background scrolls with the page:

| Value    | Behaviour                                 |
|----------|-------------------------------------------|
| `scroll` | Background scrolls with the element       |
| `fixed`  | Background stays fixed (parallax effect)  |
| `local`  | Background scrolls with the element content |

```css
.hero {
    background-image: url("hero.jpg");
    background-size: cover;
    background-attachment: fixed;
}
```

> **Note:** `background-attachment: fixed` creates a parallax-like effect but performs poorly on mobile devices. Use it
> sparingly.

### The background shorthand

Combine all background properties in one declaration:

```css
.hero {
    background: url("hero.jpg") center / cover no-repeat;
}
```

The order: `image` `position` / `size` `repeat` `attachment` `color`. The `/` separates position from size.

## Gradients

Gradients are generated images -- you use them with `background-image` (or the `background` shorthand), not
`background-color`.

### Linear gradients

Create a smooth transition between colours along a line:

```css
.gradient {
    background: linear-gradient(to right, #667eea, #764ba2);
}
```

Directions:

| Value              | Direction            |
|--------------------|----------------------|
| `to right`         | Left to right        |
| `to bottom`        | Top to bottom        |
| `to bottom right`  | Diagonal             |
| `135deg`           | At 135 degrees       |

Multiple colour stops:

```css
.rainbow {
    background: linear-gradient(
        to right,
        #ff6b6b,
        #ffd93d,
        #6bcb77,
        #4d96ff,
        #9b59b6
    );
}
```

Control where each colour starts:

```css
.gradient {
    background: linear-gradient(to right, #667eea 0%, #764ba2 50%, #f093fb 100%);
}
```

### Hard colour stops

For sharp transitions instead of smooth blending, place two colours at the same position:

```css
.flag {
    background: linear-gradient(
        to bottom,
        #000 33%,
        #dd0000 33%,
        #dd0000 66%,
        #ffce00 66%
    );
}
```

### Radial gradients

Create a circular or elliptical gradient:

```css
.spotlight {
    background: radial-gradient(circle, #fff, #333);
}
```

Control shape, size, and position:

```css
.glow {
    background: radial-gradient(circle at 30% 50%, #667eea, transparent 60%);
}
```

### Conic gradients

Rotate colours around a centre point:

```css
.color-wheel {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
}
```

## Multiple backgrounds

An element can have **multiple backgrounds**, separated by commas. They stack on top of each other -- the first one is
on top:

```css
.layered {
    background:
        linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7)),
        url("hero.jpg") center / cover no-repeat;
}
```

This is a common pattern: a dark gradient overlay on top of an image, making white text readable on any photo.

## border-radius

Rounds the corners of an element:

```css
.card {
    border-radius: 8px;
}
```

A single value rounds all four corners equally.

### Individual corners

```css
.card {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
}
```

Shorthand (clockwise from top-left):

```css
.card {
    border-radius: 8px 8px 0 0;
}
```

### Circles and pills

```css
.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
}

.pill {
    padding: 6px 16px;
    border-radius: 9999px;
}
```

`50%` on a square element creates a circle. A very large value like `9999px` creates a pill shape on rectangular
elements.

## box-shadow

Adds a shadow behind an element:

```css
.card {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

The syntax: `offset-x` `offset-y` `blur-radius` `spread-radius` `colour`.

| Parameter    | What it does                                     |
|--------------|--------------------------------------------------|
| `offset-x`   | Horizontal offset (positive = right)             |
| `offset-y`   | Vertical offset (positive = down)                |
| `blur-radius` | How blurry the shadow is (larger = softer)       |
| `spread-radius` | Expands or shrinks the shadow (optional)       |
| `colour`     | Shadow colour (usually semi-transparent)         |

### Common shadow presets

```css
/* Subtle elevation */
.shadow-sm {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

/* Medium elevation */
.shadow-md {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Large elevation */
.shadow-lg {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Elevated on hover */
.card:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
}
```

### Multiple shadows

Stack multiple shadows for more realistic depth:

```css
.card {
    box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.12),
        0 4px 8px rgba(0, 0, 0, 0.06);
}
```

### Inset shadows

Add the `inset` keyword for an inner shadow:

```css
.input-field {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## text-shadow

Adds a shadow behind text:

```css
h1 {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
```

Syntax: `offset-x` `offset-y` `blur-radius` `colour`.

```css
.neon {
    color: #fff;
    text-shadow:
        0 0 10px #fff,
        0 0 20px #ff00de,
        0 0 40px #ff00de;
}
```

## outline

Outlines are drawn **outside** the border and do not affect layout:

```css
button:focus {
    outline: 2px solid #4a90d9;
    outline-offset: 2px;
}
```

Unlike borders, outlines do not affect the element's size or position. They are primarily used for **focus indicators**
(accessibility).

> **Note:** Never remove focus outlines (`outline: none`) without providing an alternative focus style. Focus indicators
> are essential for keyboard navigation.

## Practical example

A polished card component combining everything:

```css
.card {
    max-width: 360px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    transition: box-shadow 0.2s ease;
}

.card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.4)),
                url("photo.jpg") center / cover no-repeat;
}

.card-body {
    padding: 20px;
}

.card-body h3 {
    margin: 0 0 8px;
    font-size: 1.25rem;
}

.card-body p {
    margin: 0;
    color: #666;
}
```

## What you learned

- **background-image** with `background-size: cover` fills elements with images
- **Linear**, **radial**, and **conic gradients** create smooth colour transitions
- Multiple backgrounds stack on top of each other
- **border-radius** rounds corners; `50%` makes circles; large values make pills
- **box-shadow** adds depth; stack multiple shadows for realism; use `inset` for inner shadows
- **text-shadow** adds depth behind text
- **Outlines** are for focus indicators and do not affect layout

## Next step

Static styles are powerful, but movement brings interfaces to life. The next chapter covers **transitions and
animations** -- how to smoothly change CSS values over time.
