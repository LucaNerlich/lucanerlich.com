---
title: "Selectors"
sidebar_label: "Selectors"
description: How CSS targets HTML elements -- element, class, ID, universal, grouping, descendant, child, sibling, and attribute selectors.
slug: /css/beginners-guide/selectors
tags: [css, beginners]
keywords:
    - css selectors
    - css class selector
    - css id selector
    - css descendant selector
    - css attribute selector
sidebar_position: 2
---

# Selectors

A selector is the first part of every CSS rule. It tells the browser **which HTML elements** the rule applies to. Master
selectors and you control exactly where your styles land.

## Element selectors

The simplest selector targets elements by their **tag name**:

```css
h1 {
    color: navy;
}

p {
    font-size: 18px;
}

li {
    margin-bottom: 8px;
}
```

This styles **every** `<h1>`, every `<p>`, and every `<li>` on the page. Element selectors are broad -- they do not
distinguish between different paragraphs or different list items.

## Class selectors

A class selector targets elements that have a specific `class` attribute. Class names start with a **dot** (`.`) in CSS:

```html
<p class="intro">Welcome to the site.</p>
<p>This is a regular paragraph.</p>
<p class="intro">Another intro paragraph.</p>
```

```css
.intro {
    font-size: 20px;
    font-weight: bold;
    color: #1a1a2e;
}
```

Only the two paragraphs with `class="intro"` get styled. The regular paragraph is unaffected.

Key points about classes:

- An element can have **multiple classes**: `<p class="intro highlight">`
- Many elements can share the **same class**
- Class names are **case-sensitive**: `.Intro` and `.intro` are different
- Use lowercase and hyphens for class names: `.main-content`, `.nav-link`, `.error-message`

> **Tip:** Classes are the workhorse of CSS. You will use them far more than any other selector type. When in doubt,
> use a class.

## ID selectors

An ID selector targets the element with a specific `id` attribute. IDs start with a **hash** (`#`) in CSS:

```html
<header id="site-header">
    <h1>My Website</h1>
</header>
```

```css
#site-header {
    background-color: #1a1a2e;
    color: white;
    padding: 20px;
}
```

Important rules for IDs:

- An ID must be **unique** on the page -- only one element can have a given ID
- IDs have **higher specificity** than classes (we cover specificity in chapter 14)
- Prefer classes over IDs for styling -- IDs are better reserved for JavaScript hooks and anchor links

> **Note:** Many experienced developers avoid ID selectors in CSS entirely. Classes give you the same targeting power
> without the specificity issues. We mention IDs so you recognise them in other people's code.

## Universal selector

The universal selector (`*`) targets **every element** on the page:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

This is commonly used in **CSS resets** to remove default browser styles. We cover resets in chapter 16.

> **Note:** The universal selector does not cause performance problems in modern browsers. The old advice to avoid `*`
> is outdated.

## Grouping selectors

When multiple selectors share the same declarations, you can group them with commas:

```css
h1,
h2,
h3 {
    font-family: Arial, sans-serif;
    color: #1a1a2e;
}
```

This is identical to writing three separate rules. Grouping just saves repetition.

You can group any selector types together:

```css
.error,
.warning,
#alert-banner {
    font-weight: bold;
    padding: 12px;
    border-radius: 4px;
}
```

## Descendant selectors

A descendant selector targets elements **nested inside** other elements. You write the selectors separated by a space:

```css
nav a {
    color: white;
    text-decoration: none;
}
```

This targets every `<a>` element that is **inside** a `<nav>` -- at any depth. It does not affect `<a>` elements
outside the nav.

```html
<nav>
    <a href="/">Home</a>           <!-- styled -->
    <div>
        <a href="/about">About</a> <!-- also styled (nested deeper) -->
    </div>
</nav>
<a href="/contact">Contact</a>     <!-- NOT styled -->
```

You can chain multiple levels:

```css
main article p {
    line-height: 1.8;
}
```

This targets `<p>` elements inside `<article>` elements inside `<main>`.

> **Tip:** Keep descendant selectors short -- two or three levels at most. Long chains like
> `div ul li a span` are fragile and break when you restructure your HTML.

## Child selector

The child selector (`>`) targets elements that are **direct children** -- not deeper descendants:

```css
ul > li {
    border-bottom: 1px solid #ddd;
}
```

```html
<ul>
    <li>Direct child -- styled</li>
    <li>
        Direct child -- styled
        <ul>
            <li>Nested li -- NOT styled (not a direct child of the outer ul)</li>
        </ul>
    </li>
</ul>
```

The child selector is more precise than the descendant selector. Use it when you want to target only the first level of
nesting.

## Sibling selectors

Sibling selectors target elements that share the same parent.

### Adjacent sibling (`+`)

Targets the element **immediately after** another element:

```css
h2 + p {
    font-size: 20px;
    color: #555;
}
```

This styles only the first `<p>` that directly follows an `<h2>`. It is useful for styling lead paragraphs after
headings.

```html
<h2>Section Title</h2>
<p>This paragraph is styled (immediately after h2).</p>
<p>This paragraph is NOT styled.</p>
```

### General sibling (`~`)

Targets **all siblings** that come after an element:

```css
h2 ~ p {
    margin-left: 16px;
}
```

This styles every `<p>` that comes after an `<h2>` and shares the same parent -- not just the first one.

## Attribute selectors

Attribute selectors target elements based on their HTML attributes:

| Selector              | What it matches                                      |
|-----------------------|------------------------------------------------------|
| `[href]`              | Any element with an `href` attribute                 |
| `[type="text"]`       | Elements where `type` is exactly `"text"`            |
| `[class~="warning"]`  | Elements whose `class` contains the word `"warning"` |
| `[href^="https"]`     | Elements whose `href` starts with `"https"`          |
| `[href$=".pdf"]`      | Elements whose `href` ends with `".pdf"`             |
| `[href*="example"]`   | Elements whose `href` contains `"example"` anywhere  |

Examples:

```css
a[href^="https"] {
    color: green;
}

input[type="email"] {
    border: 2px solid #4a90d9;
}

a[href$=".pdf"]::after {
    content: " (PDF)";
}
```

Attribute selectors are especially useful for styling form elements and links without adding extra classes.

## Combining selectors

You can combine selector types to be more specific. Write them **without spaces** to target a single element that
matches all conditions:

```css
p.intro {
    font-size: 20px;
}
```

This targets `<p>` elements that also have the class `intro`. A `<div class="intro">` would **not** match.

More examples:

```css
input.large[type="text"] {
    font-size: 24px;
    padding: 12px;
}

a.nav-link:hover {
    color: tomato;
}
```

## Selector summary

| Selector            | Syntax         | Example           | Targets                                    |
|---------------------|----------------|-------------------|--------------------------------------------|
| Element             | `element`      | `p`               | All `<p>` elements                         |
| Class               | `.class`       | `.intro`          | Elements with `class="intro"`              |
| ID                  | `#id`          | `#header`         | The element with `id="header"`             |
| Universal           | `*`            | `*`               | Every element                              |
| Grouping            | `A, B`         | `h1, h2`          | All `<h1>` and `<h2>` elements             |
| Descendant          | `A B`          | `nav a`           | `<a>` inside `<nav>` (any depth)           |
| Child               | `A > B`        | `ul > li`         | `<li>` that is a direct child of `<ul>`    |
| Adjacent sibling    | `A + B`        | `h2 + p`          | `<p>` immediately after `<h2>`             |
| General sibling     | `A ~ B`        | `h2 ~ p`          | All `<p>` after `<h2>` (same parent)       |
| Attribute           | `[attr]`       | `[href$=".pdf"]`  | Elements whose `href` ends with `.pdf`     |
| Combined            | `A.class`      | `p.intro`         | `<p>` with class `intro`                   |

## What you learned

- Selectors target HTML elements for styling
- **Classes** (`.name`) are the most common and flexible selector
- **IDs** (`#name`) are unique per page and have high specificity -- prefer classes
- **Descendant** (`A B`) and **child** (`A > B`) selectors target nested elements
- **Sibling** selectors target elements at the same level
- **Attribute** selectors target elements by their HTML attributes
- You can **combine** selectors for precision and **group** them with commas to reduce repetition

## Next step

Now that you know how to target elements, the next chapter covers the **box model** -- how the browser calculates the
size and spacing of every element on the page.
