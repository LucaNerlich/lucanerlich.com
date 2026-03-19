---
title: "Pseudo-classes & Pseudo-elements"
sidebar_label: "Pseudo-classes & Elements"
description: CSS pseudo-classes for targeting element states (:hover, :focus, :nth-child) and pseudo-elements for creating virtual content (::before, ::after).
slug: /css/beginners-guide/pseudo-classes-and-pseudo-elements
tags: [css, beginners]
keywords:
    - css pseudo-class
    - css hover focus
    - css nth-child
    - css before after
    - css pseudo-element
sidebar_position: 12
---

# Pseudo-classes & Pseudo-elements

Pseudo-classes target elements based on their **state** or **position**. Pseudo-elements create **virtual elements**
that do not exist in the HTML. Together, they give you styling power that goes far beyond simple selectors.

## Pseudo-classes

A pseudo-class starts with a single colon (`:`) and targets an element based on a condition.

### User interaction states

These pseudo-classes respond to how the user interacts with an element:

| Pseudo-class | When it applies                                    |
|--------------|----------------------------------------------------|
| `:hover`     | Mouse pointer is over the element                  |
| `:focus`     | Element has keyboard focus (e.g., tabbed to)       |
| `:focus-visible` | Element has focus AND it was keyboard-triggered |
| `:active`    | Element is being clicked/pressed                   |
| `:visited`   | Link has been visited before                       |

```css
a {
    color: #4a90d9;
    text-decoration: underline;
    transition: color 0.15s ease;
}

a:hover {
    color: #2d6cb4;
}

a:focus-visible {
    outline: 2px solid #4a90d9;
    outline-offset: 2px;
}

a:active {
    color: #1a4971;
}

a:visited {
    color: #7b2d8b;
}
```

> **Tip:** When styling links, use the "LVHA" order: `:link`, `:visited`, `:hover`, `:active`. This ensures each state
> correctly overrides the previous one.

#### :focus vs :focus-visible

`:focus` applies whenever an element has focus -- including mouse clicks. `:focus-visible` only applies when the focus
was triggered by keyboard navigation (Tab key). This is better for most cases because you avoid showing focus rings on
mouse-clicked buttons:

```css
button:focus-visible {
    outline: 2px solid #4a90d9;
    outline-offset: 2px;
}
```

### Structural pseudo-classes

These target elements based on their **position** among siblings:

| Pseudo-class         | What it targets                                      |
|----------------------|------------------------------------------------------|
| `:first-child`       | The first child of its parent                        |
| `:last-child`        | The last child of its parent                         |
| `:nth-child(n)`      | The nth child (1-based)                              |
| `:nth-last-child(n)` | The nth child counting from the end                  |
| `:only-child`        | An element that is the only child of its parent      |
| `:first-of-type`     | The first element of its type among siblings         |
| `:last-of-type`      | The last element of its type among siblings          |
| `:nth-of-type(n)`    | The nth element of its type                          |

#### :nth-child patterns

`:nth-child()` accepts numbers, keywords, and formulas:

```css
/* Third item */
li:nth-child(3) {
    color: red;
}

/* Every even item */
li:nth-child(even) {
    background-color: #f9f9f9;
}

/* Every odd item */
li:nth-child(odd) {
    background-color: #fff;
}

/* Every third item */
li:nth-child(3n) {
    font-weight: bold;
}

/* Every third item, starting from the second */
li:nth-child(3n+2) {
    border-left: 3px solid #4a90d9;
}
```

The `An+B` formula: `A` is the cycle size, `B` is the offset. `3n+2` means items 2, 5, 8, 11...

#### Practical example: striped table

```css
table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
}

tr:nth-child(even) {
    background-color: #f8f9fa;
}

tr:hover {
    background-color: #e8f4f8;
}
```

### Form pseudo-classes

Target form elements based on their state:

| Pseudo-class   | When it applies                                   |
|----------------|---------------------------------------------------|
| `:enabled`     | Interactive, not disabled                         |
| `:disabled`    | Has the `disabled` attribute                      |
| `:checked`     | Checkbox or radio is selected                     |
| `:required`    | Has the `required` attribute                      |
| `:optional`    | Does not have `required`                          |
| `:valid`       | Passes HTML validation                            |
| `:invalid`     | Fails HTML validation                             |
| `:placeholder-shown` | Input is showing placeholder text           |

```css
input:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
}

input:valid {
    border-color: #28a745;
}

input:invalid {
    border-color: #dc3545;
}

input:focus:invalid {
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
}

input:required::after {
    content: " *";
    color: red;
}
```

### Negation and matching pseudo-classes

#### :not()

Excludes elements that match a selector:

```css
p:not(.special) {
    color: #333;
}

nav a:not(:last-child) {
    margin-right: 16px;
}
```

#### :is()

Matches any element in a list of selectors. Reduces repetition:

```css
/* Without :is() */
article h1,
article h2,
article h3 {
    color: #1a1a2e;
}

/* With :is() */
article :is(h1, h2, h3) {
    color: #1a1a2e;
}
```

`:is()` takes the **highest specificity** of its arguments.

#### :where()

Same as `:is()` but with **zero specificity**:

```css
:where(article, section, aside) p {
    line-height: 1.6;
}
```

This is useful in base styles that should be easy to override.

### The :empty pseudo-class

Targets elements with no children (no text, no elements, no whitespace):

```css
.message:empty {
    display: none;
}
```

Useful for hiding containers that have no content.

## Pseudo-elements

Pseudo-elements create **virtual elements** that do not exist in the HTML. They use double colons (`::`) to distinguish
them from pseudo-classes.

### ::before and ::after

Insert content before or after an element's actual content:

```css
.required-label::after {
    content: " *";
    color: red;
}
```

```html
<label class="required-label">Email</label>
<!-- Renders as: Email * -->
```

The `content` property is **required**. Without it, the pseudo-element does not appear. Set `content: ""` for purely
decorative elements.

#### Decorative uses

```css
.fancy-heading::before {
    content: "";
    display: block;
    width: 40px;
    height: 4px;
    background-color: #4a90d9;
    margin-bottom: 8px;
}

.external-link::after {
    content: " ↗";
    font-size: 0.8em;
}

.quote::before {
    content: open-quote;
    font-size: 3rem;
    color: #ddd;
}
```

#### Decorative shapes

`::before` and `::after` are fully styleable boxes. You can use them for decorative elements:

```css
.divider {
    text-align: center;
    margin: 32px 0;
}

.divider::before,
.divider::after {
    content: "";
    display: inline-block;
    width: 60px;
    height: 1px;
    background-color: #ccc;
    vertical-align: middle;
    margin: 0 12px;
}
```

> **Note:** `::before` and `::after` are children of the element, positioned inside it. They do not work on
> **replaced elements** like `<img>`, `<input>`, and `<br>` because those elements do not have content to insert
> before or after.

### ::placeholder

Styles the placeholder text in form inputs:

```css
input::placeholder {
    color: #999;
    font-style: italic;
}
```

### ::selection

Styles the text that the user highlights:

```css
::selection {
    background-color: #667eea;
    color: white;
}
```

### ::first-line and ::first-letter

Style the first line or first letter of a block of text:

```css
p::first-letter {
    font-size: 2em;
    font-weight: bold;
    color: #1a1a2e;
    float: left;
    margin-right: 4px;
    line-height: 1;
}

p::first-line {
    font-variant: small-caps;
}
```

This creates a classic "drop cap" effect for the first letter of a paragraph.

### ::marker

Styles list item markers (bullets, numbers):

```css
li::marker {
    color: #4a90d9;
    font-weight: bold;
}

ol li::marker {
    font-size: 1.2em;
}
```

## Combining pseudo-classes and pseudo-elements

You can chain them together:

```css
a:hover::after {
    content: " →";
}

li:first-child::before {
    content: "★ ";
    color: gold;
}

input:focus::placeholder {
    opacity: 0;
}
```

## Practical example: custom checkbox

A fully CSS-styled checkbox using pseudo-elements:

```css
.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
    display: none;
}

.checkbox-wrapper .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #999;
    border-radius: 4px;
    position: relative;
    transition: background-color 0.15s, border-color 0.15s;
}

.checkbox-wrapper input:checked + .checkmark {
    background-color: #4a90d9;
    border-color: #4a90d9;
}

.checkbox-wrapper input:checked + .checkmark::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 6px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
```

```html
<label class="checkbox-wrapper">
    <input type="checkbox" />
    <span class="checkmark"></span>
    Accept terms
</label>
```

## What you learned

- **Pseudo-classes** (`:hover`, `:focus`, `:nth-child`) target elements based on state or position
- `:focus-visible` is better than `:focus` for keyboard-only focus rings
- `:nth-child(An+B)` uses a formula for repeating patterns
- `:is()` reduces selector repetition; `:where()` does the same with zero specificity
- `:not()` excludes elements matching a selector
- **Pseudo-elements** (`::before`, `::after`) create virtual elements with the `content` property
- `::placeholder`, `::selection`, `::first-letter`, and `::marker` style specific parts of elements
- Pseudo-classes and pseudo-elements can be combined

## Next step

Now that you know all the selector powers CSS offers, the next chapter covers **CSS Custom Properties** -- variables
that make your stylesheets dynamic and maintainable.
