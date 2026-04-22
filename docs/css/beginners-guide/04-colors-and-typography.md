---
title: "Colors & Typography"
sidebar_label: "Colors & Typography"
description: CSS colour formats (named, hex, rgb, hsl), opacity, font properties, text styling, web-safe fonts, and loading Google Fonts.
slug: /css/beginners-guide/colors-and-typography
tags: [css, beginners]
keywords:
    - css colors
    - css hex rgb hsl
    - css font-family
    - css typography
    - google fonts css
sidebar_position: 4
---

# Colors & Typography

Colours and fonts are the two most visible aspects of any design. This chapter covers every way CSS lets you define
colours and control how text looks.

## Colour values

CSS offers several formats for specifying colours. They all produce the same result - pick the one that fits your
workflow.

### Named colours

CSS defines 148 named colours. Some common ones:

| Name          | Colour    | Name          | Colour    |
|---------------|-----------|---------------|-----------|
| `red`         | Red       | `blue`        | Blue      |
| `green`       | Green     | `orange`      | Orange    |
| `white`       | White     | `black`       | Black     |
| `tomato`      | Tomato    | `coral`       | Coral     |
| `navy`        | Navy      | `teal`        | Teal      |
| `transparent` | Invisible | `currentColor`| Inherited |

```css
h1 {
    color: navy;
    background-color: lightyellow;
}
```

Named colours are convenient for quick prototyping but limited for precise design work.

### Hexadecimal (hex)

Hex codes are the most common colour format on the web. They start with `#` followed by six characters (0-9, a-f):

```css
h1 {
    color: #1a1a2e;
    background-color: #f5f5dc;
}
```

The six characters represent three pairs: **red**, **green**, **blue** (RR GG BB). Each pair ranges from `00` (none) to
`ff` (full intensity).

| Hex       | Meaning                  |
|-----------|--------------------------|
| `#000000` | Black (no colour)        |
| `#ffffff` | White (all colours full) |
| `#ff0000` | Pure red                 |
| `#00ff00` | Pure green               |
| `#0000ff` | Pure blue                |
| `#808080` | Medium grey              |

**Shorthand:** When each pair has identical characters, you can shorten to three characters:

```css
#ff0000 → #f00
#336699 → #369
#ffffff → #fff
```

### rgb() and rgba()

The `rgb()` function takes red, green, and blue values from 0 to 255:

```css
h1 {
    color: rgb(26, 26, 46);
    background-color: rgb(245, 245, 220);
}
```

To add transparency, use a fourth value (the **alpha channel**) between 0 (fully transparent) and 1 (fully opaque):

```css
.overlay {
    background-color: rgb(0, 0, 0, 0.5);
}
```

> **Note:** The older `rgba()` syntax still works, but modern CSS allows the alpha value directly inside `rgb()`.

### hsl() and hsla()

HSL stands for **Hue**, **Saturation**, **Lightness**. Many designers prefer it because it maps to how humans think
about colour:

- **Hue** - a degree on the colour wheel (0-360). 0 = red, 120 = green, 240 = blue
- **Saturation** - how vivid the colour is (0% = grey, 100% = full colour)
- **Lightness** - how light or dark (0% = black, 50% = pure colour, 100% = white)

```css
h1 {
    color: hsl(234, 28%, 14%);
}

.muted {
    color: hsl(234, 10%, 50%);
}
```

HSL makes it easy to create colour variations by adjusting a single value:

```css
.primary {
    background-color: hsl(210, 80%, 50%);
}

.primary-light {
    background-color: hsl(210, 80%, 70%);
}

.primary-dark {
    background-color: hsl(210, 80%, 30%);
}
```

All three share the same hue and saturation - only lightness changes.

Alpha transparency works the same way:

```css
.overlay {
    background-color: hsl(0, 0%, 0%, 0.5);
}
```

### Which format to use?

| Format  | Best for                                     |
|---------|----------------------------------------------|
| Named   | Quick prototyping, reading code              |
| Hex     | Copy-pasting from design tools, most common  |
| `rgb()` | When you need alpha transparency             |
| `hsl()` | Creating colour systems, adjusting shades    |

> **Tip:** Most design tools (Figma, Sketch, Adobe XD) export hex values by default. Use hex for one-off colours and
> HSL when building a colour system with consistent hues.

## The opacity property

The `opacity` property makes an **entire element** transparent, including all its children:

```css
.faded {
    opacity: 0.5;
}
```

Values range from `0` (invisible) to `1` (fully visible).

The key difference from alpha colours: `opacity` affects **everything** inside the element (text, images, child
elements), while `rgb(0, 0, 0, 0.5)` only makes the background transparent.

## Color properties

CSS has two main colour properties:

| Property           | What it colours                        |
|--------------------|----------------------------------------|
| `color`            | Text colour                            |
| `background-color` | Element background                     |

```css
.alert {
    color: #721c24;
    background-color: #f8d7da;
}
```

Other properties that accept colour values include `border-color`, `outline-color`, `box-shadow`, `text-shadow`, and
`text-decoration-color`.

### currentColor

The special keyword `currentColor` refers to the element's `color` value. It is useful for keeping borders, shadows,
and other elements in sync with the text:

```css
.link {
    color: #4a90d9;
    border-bottom: 2px solid currentColor;
}
```

If you change the text colour, the border colour changes automatically.

## Font family

The `font-family` property sets the typeface:

```css
body {
    font-family: Georgia, "Times New Roman", serif;
}
```

The value is a **font stack** - an ordered list of fonts. The browser uses the first available font and falls back to
the next one if it is not installed.

Always end with a **generic family** as the final fallback:

| Generic family  | Style                        | Examples                  |
|-----------------|------------------------------|---------------------------|
| `serif`         | Letters have decorative ends | Georgia, Times New Roman  |
| `sans-serif`    | Clean, no decorative ends    | Arial, Helvetica, Verdana |
| `monospace`     | Fixed-width characters       | Courier New, Consolas     |
| `cursive`       | Handwriting style            | Comic Sans MS             |
| `system-ui`     | OS default UI font           | Varies by platform        |

```css
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

code {
    font-family: "Fira Code", "Cascadia Code", Consolas, monospace;
}
```

> **Note:** Font names with spaces must be quoted: `"Times New Roman"`, `"Fira Code"`.

### Web-safe fonts

These fonts are installed on almost every computer and are safe to use without loading external files:

- **Serif:** Georgia, Times New Roman
- **Sans-serif:** Arial, Verdana, Trebuchet MS, Tahoma
- **Monospace:** Courier New, Lucida Console

### Loading Google Fonts

For a wider selection, load fonts from Google Fonts. Add a `<link>` tag in your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
      rel="stylesheet" />
```

Then use the font in CSS:

```css
body {
    font-family: "Inter", sans-serif;
}
```

> **Tip:** Only load the weights you actually use. Each additional weight increases page load time.

## Font size

The `font-size` property sets how large text appears:

```css
h1 {
    font-size: 36px;
}

p {
    font-size: 18px;
}

small {
    font-size: 14px;
}
```

We cover the different units (`px`, `em`, `rem`) in detail in the next chapter. For now, `px` (pixels) is the simplest
to understand.

## Font weight

The `font-weight` property controls how bold text is:

```css
h1 {
    font-weight: 700;
}

p {
    font-weight: 400;
}

.light {
    font-weight: 300;
}
```

| Value   | Name       |
|---------|------------|
| `100`   | Thin       |
| `300`   | Light      |
| `400`   | Normal     |
| `600`   | Semi-bold  |
| `700`   | Bold       |
| `900`   | Black      |

You can also use keywords: `normal` (= 400) and `bold` (= 700).

> **Note:** The font file must include the weight you request. If you set `font-weight: 300` but the font only has 400
> and 700, the browser will substitute the nearest available weight.

## Font style

The `font-style` property handles italic text:

```css
em {
    font-style: italic;
}

.no-italic {
    font-style: normal;
}
```

Values: `normal`, `italic`, `oblique`.

## Line height

The `line-height` property controls the vertical spacing between lines of text. It is one of the most important
properties for readability:

```css
body {
    line-height: 1.6;
}

h1 {
    line-height: 1.2;
}
```

A **unitless number** like `1.6` means "1.6 times the font size". For 18px text, the line height would be
18 &times; 1.6 = 28.8px.

| Value   | Best for                             |
|---------|--------------------------------------|
| `1.2`   | Headings (tight spacing)             |
| `1.5`   | Body text (comfortable reading)      |
| `1.6`   | Long-form content (generous spacing) |

> **Tip:** Always use unitless values for `line-height`. Values with units (`28px`, `1.5em`) do not scale properly when
> child elements have different font sizes.

## Text alignment

The `text-align` property controls horizontal text alignment:

```css
h1 {
    text-align: center;
}

.right-align {
    text-align: right;
}

p {
    text-align: left;
}

.justified {
    text-align: justify;
}
```

## Text decoration

The `text-decoration` property adds (or removes) underlines, overlines, and strikethroughs:

```css
a {
    text-decoration: none;
}

.deleted {
    text-decoration: line-through;
}

.fancy-underline {
    text-decoration: underline wavy #4a90d9;
}
```

The shorthand accepts up to three values: **line** (`underline`, `overline`, `line-through`, `none`), **style**
(`solid`, `dashed`, `dotted`, `wavy`), and **colour**.

## Text transform

The `text-transform` property changes the capitalisation of text:

```css
.uppercase {
    text-transform: uppercase;
}

.lowercase {
    text-transform: lowercase;
}

.capitalize {
    text-transform: capitalize;
}
```

## Letter and word spacing

Fine-tune spacing between characters and words:

```css
.spaced {
    letter-spacing: 2px;
}

.wide-words {
    word-spacing: 8px;
}
```

Small amounts of `letter-spacing` (0.5-2px) are common on headings and uppercase text to improve readability.

## Putting it together

Here is a complete typography system for a simple page:

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}

body {
    font-family: "Inter", -apple-system, sans-serif;
    font-size: 18px;
    line-height: 1.6;
    color: #333;
    background-color: #fafafa;
    margin: 0;
    padding: 40px;
}

h1, h2, h3 {
    font-family: Georgia, serif;
    color: #1a1a2e;
    line-height: 1.2;
}

h1 {
    font-size: 36px;
    margin-bottom: 12px;
}

h2 {
    font-size: 28px;
    margin-top: 40px;
    margin-bottom: 8px;
}

h3 {
    font-size: 22px;
    margin-top: 32px;
    margin-bottom: 8px;
}

p {
    margin-top: 0;
    margin-bottom: 16px;
}

a {
    color: #4a90d9;
    text-decoration: underline;
}

a:hover {
    color: #2d6cb4;
    text-decoration: none;
}

small {
    font-size: 14px;
    color: #777;
}
```

This gives you a clean, readable typographic foundation to build on.

## What you learned

- CSS supports **named**, **hex**, **rgb()**, and **hsl()** colour formats
- Use alpha values for transparent colours; use `opacity` to fade entire elements
- `font-family` sets the typeface with a **font stack** and generic fallback
- `font-size`, `font-weight`, and `line-height` control text size, boldness, and spacing
- `text-align`, `text-decoration`, and `text-transform` handle alignment, underlines, and capitalisation
- Load custom fonts from **Google Fonts** with a `<link>` tag
- A good typography system uses consistent sizes, weights, and line heights

## Next step

Now that you can control colours and fonts, the next chapter covers **units and sizing** - when to use `px` vs `em` vs
`rem` vs `%` and how each one behaves.
