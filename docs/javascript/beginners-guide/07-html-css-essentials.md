---
title: "HTML & CSS Essentials"
sidebar_label: "HTML & CSS Essentials"
description: Learn enough HTML and CSS to build web pages -- document structure, semantic elements, forms, CSS selectors, the box model, flexbox, and responsive design.
slug: /javascript/beginners-guide/html-css-essentials
tags: [javascript, beginners, html, css]
keywords:
  - html basics
  - css basics
  - flexbox
  - responsive design
  - semantic html
sidebar_position: 7
---

# HTML & CSS Essentials

Before we can manipulate web pages with JavaScript, we need to understand how they are built. This chapter covers enough HTML and CSS to build real pages. It is not a comprehensive reference -- it is the working knowledge you need for the rest of this guide.

## HTML: the structure

**HTML** (HyperText Markup Language) defines the **structure** of a web page using **elements** (tags).

### A minimal HTML page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a paragraph.</p>
</body>
</html>
```

| Part | Purpose |
|------|---------|
| `<!DOCTYPE html>` | Tells the browser this is an HTML5 document |
| `<html lang="en">` | Root element; `lang` helps screen readers and search engines |
| `<head>` | Metadata -- not displayed on the page |
| `<meta charset="UTF-8">` | Character encoding (supports all languages) |
| `<meta name="viewport" ...>` | Makes the page responsive on mobile devices |
| `<title>` | Browser tab title |
| `<body>` | All visible content goes here |

### Elements and attributes

An HTML element has an **opening tag**, optional **content**, and a **closing tag**:

```html
<p class="intro">This is a paragraph.</p>
```

- `<p>` -- opening tag
- `class="intro"` -- attribute (key-value pair on the tag)
- `This is a paragraph.` -- content
- `</p>` -- closing tag

Some elements are **self-closing** (no content):

```html
<img src="photo.jpg" alt="A photo">
<br>
<hr>
<input type="text">
```

## Common HTML elements

### Headings

Six levels, `<h1>` (most important) through `<h6>` (least):

```html
<h1>Main Title</h1>
<h2>Section Heading</h2>
<h3>Subsection</h3>
```

Use headings in order -- do not skip levels. A page should have exactly one `<h1>`.

### Paragraphs and text

```html
<p>A paragraph of text.</p>
<strong>Bold (important)</strong>
<em>Italic (emphasis)</em>
<code>Inline code</code>
<br>  <!-- Line break -->
<hr>  <!-- Horizontal rule -->
```

### Links

```html
<a href="https://example.com">Visit Example</a>
<a href="/about">About Page</a>
<a href="#section2">Jump to Section 2</a>
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Opens in new tab</a>
```

Always include `rel="noopener noreferrer"` when using `target="_blank"` -- it prevents the linked page from accessing your page's `window.opener`.

### Images

```html
<img src="photo.jpg" alt="Description of the photo" width="400" height="300">
```

The `alt` attribute is required for accessibility -- it describes the image to screen readers and displays if the image fails to load.

### Lists

```html
<!-- Unordered list (bullets) -->
<ul>
    <li>Apple</li>
    <li>Banana</li>
    <li>Cherry</li>
</ul>

<!-- Ordered list (numbers) -->
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>
```

### Tables

```html
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Ada</td>
            <td>36</td>
        </tr>
        <tr>
            <td>Bob</td>
            <td>25</td>
        </tr>
    </tbody>
</table>
```

### Divs and spans

Generic containers:

```html
<!-- Block-level container (takes full width) -->
<div class="card">
    <h2>Card Title</h2>
    <p>Card content.</p>
</div>

<!-- Inline container (flows with text) -->
<p>The price is <span class="price">$9.99</span></p>
```

## Semantic HTML

**Semantic elements** describe their meaning, not just their appearance. Use them instead of generic `<div>` elements:

```html
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>

<main>
    <article>
        <h2>Article Title</h2>
        <p>Article content...</p>
    </article>

    <aside>
        <h3>Related Links</h3>
        <ul>
            <li><a href="#">Link 1</a></li>
        </ul>
    </aside>
</main>

<footer>
    <p>&copy; 2025 My Website</p>
</footer>
```

| Element | Use for |
|---------|---------|
| `<header>` | Page or section header |
| `<nav>` | Navigation links |
| `<main>` | Primary page content (one per page) |
| `<article>` | Self-contained content (blog post, news article) |
| `<section>` | Thematic grouping of content |
| `<aside>` | Sidebar, related content |
| `<footer>` | Page or section footer |

Semantic HTML improves accessibility (screen readers understand the structure), SEO (search engines rank it better), and maintainability.

## Forms

Forms collect user input. They are essential for interactive web pages:

```html
<form id="signup-form">
    <div>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
    </div>

    <div>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
    </div>

    <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" minlength="8" required>
    </div>

    <div>
        <label for="role">Role:</label>
        <select id="role" name="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
        </select>
    </div>

    <div>
        <label>
            <input type="checkbox" name="terms" required>
            I agree to the terms
        </label>
    </div>

    <div>
        <label>Preference:</label>
        <label><input type="radio" name="pref" value="light"> Light</label>
        <label><input type="radio" name="pref" value="dark" checked> Dark</label>
    </div>

    <div>
        <label for="bio">Bio:</label>
        <textarea id="bio" name="bio" rows="4"></textarea>
    </div>

    <button type="submit">Sign Up</button>
</form>
```

Key points:
- `<label for="id">` links a label to an input -- clicking the label focuses the input.
- `required`, `minlength`, `type="email"` provide **built-in validation**.
- `name` attributes identify form data when submitted.
- We will handle form submission with JavaScript in the Events chapter.

### Common input types

| Type | Renders as |
|------|-----------|
| `text` | Single-line text field |
| `email` | Text field with email validation |
| `password` | Masked text field |
| `number` | Numeric input with up/down arrows |
| `checkbox` | Toggle on/off |
| `radio` | Select one from a group |
| `date` | Date picker |
| `file` | File upload |
| `hidden` | Invisible (for sending data) |

## CSS: the presentation

**CSS** (Cascading Style Sheets) controls **how** HTML elements look.

### Adding CSS

Three ways to add CSS (in order of preference):

**1. External stylesheet (best practice):**

```html
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```

**2. `<style>` tag in `<head>`:**

```html
<head>
    <style>
        body { font-family: sans-serif; }
    </style>
</head>
```

**3. Inline styles (avoid):**

```html
<p style="color: red;">Red text</p>
```

Always use external stylesheets for real projects. They can be cached, shared across pages, and are easier to maintain.

### CSS selectors

Selectors target which elements to style:

```css
/* Element selector -- all <p> elements */
p {
    color: #333;
}

/* Class selector -- elements with class="card" */
.card {
    border: 1px solid #ddd;
    padding: 16px;
}

/* ID selector -- the element with id="header" */
#header {
    background: #f0f0f0;
}

/* Descendant -- <a> inside <nav> */
nav a {
    text-decoration: none;
}

/* Direct child -- <li> that is a direct child of <ul> */
ul > li {
    list-style: disc;
}

/* Multiple selectors */
h1, h2, h3 {
    font-family: Georgia, serif;
}

/* Attribute selector */
input[type="text"] {
    border: 1px solid #ccc;
}

/* Pseudo-classes */
a:hover {
    color: blue;
}

button:disabled {
    opacity: 0.5;
}

li:first-child {
    font-weight: bold;
}
```

### Specificity

When multiple rules target the same element, **specificity** determines which wins:

| Selector | Specificity | Example |
|----------|-------------|---------|
| Element | Lowest | `p { }` |
| Class | Medium | `.card { }` |
| ID | High | `#header { }` |
| Inline style | Highest | `style="..."` |

When specificity is equal, the **last** rule wins. Prefer classes over IDs for styling.

## The box model

Every HTML element is a rectangular box with four layers:

```text
┌─────────────────────────── Margin ───────────────────────────┐
│  ┌──────────────────────── Border ────────────────────────┐  │
│  │  ┌───────────────────── Padding ────────────────────┐  │  │
│  │  │                                                  │  │  │
│  │  │                   Content                        │  │  │
│  │  │                                                  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

```css
.box {
    width: 200px;        /* content width */
    padding: 20px;       /* space inside the border */
    border: 2px solid #333;
    margin: 16px;        /* space outside the border */
}
```

### `box-sizing: border-box`

By default, `width` sets only the **content** width. With `border-box`, `width` includes padding and border:

```css
/* Apply to everything -- do this in every project */
*, *::before, *::after {
    box-sizing: border-box;
}
```

With `border-box`: a `width: 200px` element with `padding: 20px` and `border: 2px` is **200px total**, not 244px.

## Display and positioning

### Display values

```css
/* Block -- takes full width, stacks vertically */
div { display: block; }

/* Inline -- flows with text, width/height ignored */
span { display: inline; }

/* Inline-block -- flows with text but respects width/height */
.badge { display: inline-block; }

/* None -- removes from the page */
.hidden { display: none; }
```

### Position

```css
/* Static -- default, follows normal flow */
.static { position: static; }

/* Relative -- offset from its normal position */
.relative {
    position: relative;
    top: 10px;
    left: 20px;
}

/* Absolute -- positioned relative to nearest positioned ancestor */
.absolute {
    position: absolute;
    top: 0;
    right: 0;
}

/* Fixed -- positioned relative to the viewport (stays on scroll) */
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
}

/* Sticky -- switches from relative to fixed at a threshold */
.sticky-nav {
    position: sticky;
    top: 0;
}
```

## Flexbox

Flexbox is the modern way to create layouts. It handles alignment and distribution of space.

### Basic flex layout

```css
.container {
    display: flex;
    gap: 16px; /* space between children */
}
```

```html
<div class="container">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
```

This places items in a **row** by default.

### Direction

```css
.row { flex-direction: row; }        /* default: left to right */
.column { flex-direction: column; }  /* top to bottom */
```

### Alignment

```css
.container {
    display: flex;
    /* Main axis (horizontal in row, vertical in column) */
    justify-content: center;      /* center, flex-start, flex-end, space-between, space-around, space-evenly */
    /* Cross axis (vertical in row, horizontal in column) */
    align-items: center;          /* center, flex-start, flex-end, stretch, baseline */
}
```

### Common patterns

**Centering an element:**

```css
.center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; /* full viewport height */
}
```

**Navigation bar:**

```css
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
}
```

**Card grid:**

```css
.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.card {
    flex: 1 1 300px; /* grow, shrink, base width */
}
```

### Flex item properties

```css
.item {
    flex-grow: 1;    /* how much extra space to take */
    flex-shrink: 0;  /* whether to shrink below basis */
    flex-basis: 200px; /* starting size before grow/shrink */
}

/* Shorthand */
.item { flex: 1 0 200px; }

/* Common shortcuts */
.fill { flex: 1; }        /* grow to fill space */
.fixed { flex: 0 0 200px; } /* fixed 200px, no grow/shrink */
```

## Responsive design

Make your page work on all screen sizes.

### The viewport meta tag

Already in our HTML boilerplate:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Without this, mobile browsers zoom out to fit the desktop layout.

### Media queries

Apply CSS rules based on screen size:

```css
/* Base styles (mobile first) */
.container {
    padding: 16px;
}

.grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Tablet and up (768px) */
@media (min-width: 768px) {
    .grid {
        flex-direction: row;
        flex-wrap: wrap;
    }

    .card {
        flex: 1 1 calc(50% - 16px);
    }
}

/* Desktop (1024px) */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .card {
        flex: 1 1 calc(33.333% - 16px);
    }
}
```

### Responsive units

| Unit | Meaning |
|------|---------|
| `px` | Fixed pixels |
| `%` | Relative to parent |
| `em` | Relative to parent font size |
| `rem` | Relative to root (`<html>`) font size |
| `vw` / `vh` | Percentage of viewport width / height |
| `fr` | Fraction of available space (CSS Grid) |

Prefer `rem` for font sizes and spacing -- it respects user zoom preferences.

### Responsive images

```css
img {
    max-width: 100%;
    height: auto;
}
```

This prevents images from overflowing their container.

## A complete example

Here is a small, responsive page with everything covered so far:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav class="nav">
            <a href="/" class="logo">MySite</a>
            <div class="nav-links">
                <a href="#about">About</a>
                <a href="#projects">Projects</a>
                <a href="#contact">Contact</a>
            </div>
        </nav>
    </header>

    <main>
        <section id="about" class="section">
            <h1>Welcome to My Site</h1>
            <p>I am learning JavaScript and building things for the web.</p>
        </section>

        <section id="projects" class="section">
            <h2>Projects</h2>
            <div class="grid">
                <div class="card">
                    <h3>Project One</h3>
                    <p>A calculator built with vanilla JavaScript.</p>
                </div>
                <div class="card">
                    <h3>Project Two</h3>
                    <p>A weather app using the Fetch API.</p>
                </div>
                <div class="card">
                    <h3>Project Three</h3>
                    <p>A to-do list with local storage.</p>
                </div>
            </div>
        </section>

        <section id="contact" class="section">
            <h2>Contact</h2>
            <form id="contact-form">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>

                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4" required></textarea>

                <button type="submit">Send</button>
            </form>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 My Site. Built with HTML, CSS, and JavaScript.</p>
    </footer>
</body>
</html>
```

```css
/* styles.css */

*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

a {
    color: #0066cc;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* Navigation */
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.logo {
    font-size: 1.25rem;
    font-weight: bold;
    color: #333;
}

.nav-links {
    display: flex;
    gap: 24px;
}

/* Sections */
.section {
    padding: 48px 24px;
    max-width: 1000px;
    margin: 0 auto;
}

/* Cards */
.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 24px;
}

.card {
    flex: 1 1 250px;
    padding: 24px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    background: #fff;
}

.card h3 {
    margin-bottom: 8px;
}

/* Form */
form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 500px;
}

input, textarea {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

button {
    padding: 10px 20px;
    background: #0066cc;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}

button:hover {
    background: #0052a3;
}

/* Footer */
footer {
    text-align: center;
    padding: 24px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    margin-top: 48px;
}

/* Responsive */
@media (max-width: 600px) {
    .nav {
        flex-direction: column;
        gap: 12px;
    }

    .nav-links {
        gap: 16px;
    }
}
```

Save both files in the same folder, open `index.html` in a browser, and resize the window to see the responsive behavior.

## Summary

- **HTML** defines page structure with semantic elements.
- Use `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>` instead of generic `<div>` elements.
- **Forms** collect user input with built-in validation attributes.
- **CSS** controls appearance -- use external stylesheets.
- **Box model:** content + padding + border + margin. Always set `box-sizing: border-box`.
- **Flexbox** handles layout: `display: flex`, `justify-content`, `align-items`, `gap`.
- **Media queries** make pages responsive -- design mobile-first, then add breakpoints.

Next up: [The DOM](./08-the-dom.md) -- using JavaScript to read and change the page.
