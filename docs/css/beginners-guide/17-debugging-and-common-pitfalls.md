---
title: "Debugging & Common Pitfalls"
sidebar_label: "Debugging"
description: Using browser DevTools to debug CSS, understanding margin collapse, overflow issues, centring gotchas, z-index problems, and cross-browser testing.
slug: /css/beginners-guide/debugging-and-common-pitfalls
tags: [css, beginners]
keywords:
    - css debugging
    - css devtools
    - css margin collapse
    - css z-index problems
    - css common mistakes
sidebar_position: 17
---

# Debugging & Common Pitfalls

Even experienced developers spend significant time debugging CSS. This chapter teaches you how to use browser DevTools
systematically and walks through the most common CSS mistakes and how to fix them.

## Browser DevTools deep dive

DevTools are your primary CSS debugging tool. Every major browser has them.

### The Elements panel

1. **Right-click** any element and select "Inspect" (or press F12)
2. The **Elements panel** shows the DOM tree on the left and the **Styles panel** on the right
3. Click any element in the DOM tree to see its CSS rules

### The Styles panel

The Styles panel shows all CSS rules that apply to the selected element, ordered by **specificity** (highest first):

- Rules at the top override rules below them
- **Crossed-out** declarations are overridden by higher-priority rules
- **Greyed-out** properties are inherited but overridden
- **Warning icons** indicate invalid property values

### Editing styles live

- **Click a value** to edit it directly (colours, sizes, fonts)
- **Click the checkbox** next to a declaration to toggle it on/off
- **Click below the last declaration** in a rule to add a new property
- **Click the `+` icon** to add an entirely new CSS rule

### The Computed panel

Shows the **final calculated value** for every CSS property on the selected element. This is what the browser actually
uses after resolving all cascade conflicts, inheritance, and relative units.

Use it when you want to know:

- The actual pixel value of a `rem` or `%` size
- Whether a property was inherited and from which ancestor
- What the browser resolved for `auto` values

### The box model diagram

In the Computed panel (or at the bottom of the Styles panel), you see the visual box model:

- **Content** -- the innermost blue box
- **Padding** -- green around the content
- **Border** -- yellow around the padding
- **Margin** -- orange around the border

Hover over each layer to see it highlighted on the page. Click values in the diagram to edit them.

### The Layout panel

Shows Grid and Flexbox overlays. When you select a grid or flex container:

- **Grid overlay** -- draws grid lines, track sizes, and cell boundaries
- **Flex overlay** -- shows direction, alignment, and free space distribution
- Click the grid/flex badge in the Elements panel to toggle the overlay

These overlays are invaluable for understanding why items are positioned where they are.

## Common pitfall 1: Margin collapse

**Problem:** The vertical space between two elements is not what you expect.

**Cause:** Vertical margins between adjacent block elements **collapse** -- the browser uses only the larger margin,
not the sum of both (covered in chapter 3).

**Example:**

```css
h2 { margin-bottom: 24px; }
p  { margin-top: 16px; }
```

Expected gap: 40px. Actual gap: 24px.

**Fixes:**

- Use `padding` instead of `margin` on one element
- Add a border or padding to the parent element (even `1px` prevents collapse)
- Use Flexbox or Grid on the parent -- flex/grid children do not collapse margins
- Use `gap` instead of margins for spacing between siblings

> **Tip:** Many developers avoid margin collapsing entirely by only using `margin-bottom` (or only `margin-top`) and
> never both.

## Common pitfall 2: Overflow

**Problem:** Content spills outside its container.

**Causes:**

- Fixed `width` or `height` on a container that is too small for its content
- An image wider than its container
- A long unbroken string (URL, code snippet) that does not wrap

**Fixes:**

```css
/* Images */
img {
    max-width: 100%;
    height: auto;
}

/* Long words/URLs */
.text {
    overflow-wrap: break-word;
    word-break: break-word;
}

/* Containers */
.container {
    overflow: auto;
}
```

Use `max-width` instead of `width` and `min-height` instead of `height` to let content flow naturally.

### The overflow property

| Value     | Behaviour                                    |
|-----------|----------------------------------------------|
| `visible` | Content spills out (default)                 |
| `hidden`  | Content is clipped                           |
| `scroll`  | Always shows scrollbars                      |
| `auto`    | Shows scrollbars only when content overflows |
| `clip`    | Like `hidden` but prevents scrolling via JS  |

> **Note:** `overflow: hidden` on a parent can break `position: sticky` on children. If your sticky element is not
> working, check ancestors for `overflow: hidden` or `overflow: auto`.

## Common pitfall 3: Centring

**Problem:** An element will not centre the way you expect.

### Horizontal centring

| What you are centring        | Method                                      |
|------------------------------|---------------------------------------------|
| Inline content (text)        | `text-align: center` on the parent          |
| Block element with width     | `margin: 0 auto` on the element             |
| Flex/grid children           | `justify-content: center` on the container  |

### Vertical centring

| What you are centring        | Method                                                   |
|------------------------------|----------------------------------------------------------|
| Single line of text          | Set `line-height` equal to the container's `height`      |
| Any element (flexbox)        | `align-items: center` + `min-height` on the container    |
| Any element (grid)           | `place-items: center` + `min-height` on the container    |

The modern approach -- works in virtually every case:

```css
.parent {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}
```

Or with Grid:

```css
.parent {
    display: grid;
    place-items: center;
    min-height: 100vh;
}
```

**Common mistake:** forgetting to give the parent a height. If the parent has no explicit or min height, centring on the
cross axis has no effect because the parent is only as tall as its content.

## Common pitfall 4: z-index not working

**Problem:** You set `z-index: 999` but the element is still behind another one.

**Causes:**

1. The element does not have `position` set. `z-index` only works on positioned elements (`relative`, `absolute`,
   `fixed`, `sticky`).
2. **Stacking contexts.** Each element with a `z-index` and `position` creates a stacking context. An element cannot
   escape its parent's stacking context, no matter how high its `z-index`.

**Fixes:**

1. Add `position: relative` to the element (if it does not have a position)
2. Check whether an ancestor creates a stacking context. Look for ancestors with:
   - `position` + `z-index`
   - `opacity` less than 1
   - `transform`, `filter`, `perspective`, or `will-change`
3. In DevTools, the Layers panel (Chrome) shows stacking contexts visually

**Strategy:** Define a z-index scale using custom properties (chapter 13) and avoid arbitrary values:

```css
:root {
    --z-base: 0;
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-modal-backdrop: 300;
    --z-modal: 400;
    --z-tooltip: 500;
}
```

## Common pitfall 5: Specificity conflicts

**Problem:** Your CSS rule does not apply. DevTools shows it crossed out.

**Debugging steps:**

1. Inspect the element in DevTools
2. Find your rule in the Styles panel
3. See which rule is overriding it (it will be higher in the list)
4. Compare specificity: does the winning rule have an ID, inline style, or more classes?
5. Fix by **reducing the winning selector's specificity** or **increasing yours** (preferably by adding a class, not by
   piling on selectors)

**Fixes:**

- Replace ID selectors with classes
- Remove unnecessary parent selectors (`.page .section .card .title` → `.card__title`)
- Use cascade layers (`@layer`) to control override order regardless of specificity

## Common pitfall 6: The whitespace between inline-block elements

**Problem:** You set elements to `display: inline-block` and there are small gaps between them even though you set
`margin: 0`.

**Cause:** The whitespace in your HTML (spaces, newlines between elements) is rendered as a text space character.

**Fixes:**

- Use Flexbox or Grid instead (the best solution)
- Set `font-size: 0` on the parent and reset it on children (hack)
- Remove whitespace between HTML tags (impractical)

## Common pitfall 7: Elements not responding to width/height

**Problem:** You set `width` or `height` on an element but it has no effect.

**Cause:** The element is `display: inline`. Inline elements ignore `width` and `height`.

**Fix:** Change to `display: inline-block` or `display: block`.

## Common pitfall 8: position: sticky not working

**Problem:** The element does not stick on scroll.

**Checklist:**

1. Did you set a `top`, `right`, `bottom`, or `left` value?
2. Does any ancestor have `overflow: hidden`, `overflow: auto`, or `overflow: scroll`?
3. Is the parent tall enough for the element to scroll within it?
4. Does an ancestor have `contain: paint` or `contain: layout`?

If the answer to question 2 is yes, remove or change the overflow on that ancestor.

## Debugging checklist

When something looks wrong, follow this systematic approach:

1. **Inspect the element** in DevTools
2. **Check the Styles panel** -- is the rule present? Is it crossed out?
3. **Check the Computed panel** -- what is the final computed value?
4. **Check the Box Model diagram** -- is padding, border, or margin unexpected?
5. **Toggle declarations on/off** -- isolate which rule causes the issue
6. **Check the parent** -- many layout issues come from the parent, not the element itself
7. **Check for overflow** -- is the parent clipping the content?
8. **Add a temporary border** -- `border: 2px solid red` makes invisible boxes visible

> **Tip:** The temporary border trick is the oldest debugging technique in CSS. When you cannot figure out where an
> element is or how big it is, give it a bright red border and everything becomes clear.

## Cross-browser testing

CSS can render differently between browsers. Test in:

- **Chrome** (Blink engine)
- **Firefox** (Gecko engine)
- **Safari** (WebKit engine)

Common differences:

- Default font rendering
- Scrollbar styling
- Form element appearance
- Flex/Grid edge cases
- New feature support

Use [caniuse.com](https://caniuse.com) to check browser support before using newer features.

## What you learned

- **DevTools** are your primary CSS debugging tool -- learn the Elements, Styles, Computed, and Layout panels
- **Margin collapse** causes unexpected spacing -- use `gap`, Flexbox/Grid, or one-direction margins
- **Overflow** happens when content exceeds fixed dimensions -- use `max-width` and `min-height`
- **Centring** is solved with `display: flex; justify-content: center; align-items: center`
- **z-index** requires a `position` value and respects stacking contexts
- **Specificity conflicts** are visible in DevTools -- simplify selectors instead of escalating
- **inline-block gaps** come from HTML whitespace -- use Flexbox instead
- Use a **systematic debugging checklist** instead of random trial and error

## Next step

You now have all the knowledge needed to build and debug any CSS layout. The final chapter presents **practice projects**
for you to build from scratch and put everything together.
