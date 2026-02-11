---
title: "Semantic HTML"
sidebar_label: "Semantic HTML"
description: What semantic HTML is, why it matters, and a practical reference for every relevant element -- document structure, text, lists, tables, forms, media, and interactive elements.
slug: /semantic-html
tags: [html, accessibility, frontend]
keywords:
  - semantic html
  - html elements
  - accessibility
  - html5 elements
  - web standards
sidebar_position: 5
---

# Semantic HTML

Semantic HTML means using elements that describe their **meaning** rather than their appearance. A `<nav>` tells browsers, screen readers, and search engines "this is navigation" -- a `<div class="nav">` tells them nothing.

## Why it matters

| Benefit | Explanation |
|---------|-------------|
| **Accessibility** | Screen readers use semantic elements to build a navigable page outline. A `<main>` element lets users skip to content; headings create a table of contents. |
| **SEO** | Search engines use semantic structure to understand page content. `<article>`, `<h1>`--`<h6>`, and `<time>` all provide ranking signals. |
| **Maintainability** | Semantic markup is self-documenting. Reading `<aside>` is faster than deciphering `<div class="sidebar-content-wrapper">`. |
| **Default behaviour** | Many semantic elements come with built-in functionality -- `<details>` is collapsible, `<dialog>` manages focus, `<form>` handles submission. No JavaScript required. |
| **Interoperability** | RSS readers, read-mode browsers, and AI tools extract content more reliably from semantic markup. |

## Document structure

These elements define the high-level regions of a page.

### header

The introductory content or navigational aids for a page or section. Typically contains a logo, title, and navigation.

```html
<header>
    <a href="/" aria-label="Home">
        <img src="/logo.svg" alt="Company name" width="120" height="40">
    </a>
    <nav aria-label="Main">
        <ul>
            <li><a href="/products">Products</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
        </ul>
    </nav>
</header>
```

A page can have multiple `<header>` elements -- one for the page and one inside each `<article>` or `<section>`.

### nav

A section of navigation links. Use `aria-label` to distinguish multiple `<nav>` elements on the same page.

```html
<nav aria-label="Main">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/docs">Docs</a></li>
        <li><a href="/blog">Blog</a></li>
    </ul>
</nav>

<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/docs">Docs</a></li>
        <li aria-current="page">Semantic HTML</li>
    </ol>
</nav>
```

Not every group of links needs a `<nav>` -- use it for major navigation blocks (main menu, breadcrumbs, table of contents, pagination).

### main

The dominant content of the page. There must be only **one** `<main>` per page, and it must not be nested inside `<header>`, `<nav>`, `<footer>`, `<article>`, or `<aside>`.

```html
<body>
    <header><!-- site header --></header>
    <main>
        <h1>Semantic HTML Reference</h1>
        <p>Content goes here.</p>
    </main>
    <footer><!-- site footer --></footer>
</body>
```

Screen readers offer a "skip to main content" shortcut that targets this element.

### footer

Closing content for a page or section -- copyright notices, contact info, related links.

```html
<footer>
    <p>&copy; 2025 Luca Nerlich. All rights reserved.</p>
    <nav aria-label="Footer">
        <a href="/privacy">Privacy</a>
        <a href="/imprint">Imprint</a>
    </nav>
</footer>
```

Like `<header>`, a page can have multiple footers (one per `<article>` or `<section>`).

### section

A thematic grouping of content, typically with a heading. Use it when content forms a distinct section of a document.

```html
<section aria-labelledby="features-heading">
    <h2 id="features-heading">Features</h2>
    <p>Our platform provides...</p>
</section>

<section aria-labelledby="pricing-heading">
    <h2 id="pricing-heading">Pricing</h2>
    <p>Choose the plan that fits...</p>
</section>
```

**`<section>` vs `<div>`:** If the grouping has a heading and represents a standalone concept, use `<section>`. If you only need a wrapper for styling, use `<div>`.

### article

Self-contained content that makes sense on its own -- a blog post, news story, forum post, product card, or comment.

```html
<article>
    <header>
        <h2>Understanding Semantic HTML</h2>
        <time datetime="2025-03-15">15 March 2025</time>
    </header>
    <p>Semantic HTML is the practice of using...</p>
    <footer>
        <p>Written by <a href="/authors/luca">Luca</a></p>
    </footer>
</article>
```

Articles can be nested (e.g. an article with nested comment articles).

### aside

Content tangentially related to the surrounding content -- sidebars, pull quotes, advertising, related links.

```html
<main>
    <article>
        <h1>Building a REST API</h1>
        <p>Start by defining your resources...</p>

        <aside>
            <h2>Related reading</h2>
            <ul>
                <li><a href="/content-modeling">Content Modeling</a></li>
                <li><a href="/web-performance">Web Performance</a></li>
            </ul>
        </aside>
    </article>
</main>
```

### Full page layout

Combining the structural elements:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
<body>
    <header>
        <nav aria-label="Main"><!-- main navigation --></nav>
    </header>

    <main>
        <article>
            <header>
                <h1>Article Title</h1>
                <time datetime="2025-03-15">15 March 2025</time>
            </header>

            <section>
                <h2>First Section</h2>
                <p>Content...</p>
            </section>

            <section>
                <h2>Second Section</h2>
                <p>Content...</p>
            </section>

            <aside>
                <h2>Related</h2>
                <ul><!-- related links --></ul>
            </aside>

            <footer>
                <p>Author info, tags</p>
            </footer>
        </article>
    </main>

    <aside>
        <!-- site-wide sidebar -->
    </aside>

    <footer>
        <p>&copy; 2025</p>
        <nav aria-label="Footer"><!-- footer links --></nav>
    </footer>
</body>
</html>
```

## Headings

Headings (`<h1>` through `<h6>`) create an outline that screen readers and search engines use to understand content hierarchy.

```html
<h1>Page Title</h1>              <!-- one per page -->

<h2>Major Section</h2>
<h3>Subsection</h3>
<h3>Subsection</h3>

<h2>Another Major Section</h2>
<h3>Subsection</h3>
<h4>Sub-subsection</h4>
```

### Rules

- **One `<h1>` per page** -- it represents the page title
- **Do not skip levels** -- go from `<h2>` to `<h3>`, not `<h2>` to `<h4>`
- **Use headings for structure, not styling** -- if you need larger text, use CSS
- **Every `<section>` should have a heading** -- it labels the section for assistive technology

## Text content

### Paragraphs and line breaks

```html
<!-- Paragraph -- the default block of text -->
<p>This is a paragraph of text.</p>

<!-- Line break -- only for content where breaks matter (poems, addresses) -->
<address>
    123 Main Street<br>
    Springfield, IL 62701
</address>
```

Do not use `<br>` for spacing -- use CSS `margin` or `padding` instead.

### Blockquote

For extended quotations from another source:

```html
<blockquote cite="https://www.w3.org/WAI/">
    <p>The power of the Web is in its universality. Access by everyone
    regardless of disability is an essential aspect.</p>
    <footer>-- <cite>Tim Berners-Lee</cite></footer>
</blockquote>
```

### Figure and figcaption

Self-contained content with an optional caption -- images, diagrams, code listings, tables.

```html
<figure>
    <img src="/chart.png" alt="Monthly revenue growth from January to June"
         width="800" height="400">
    <figcaption>Fig. 1: Revenue grew 23% from Q1 to Q2.</figcaption>
</figure>

<!-- Also works for code -->
<figure>
    <pre><code>const greeting = "Hello, world!";</code></pre>
    <figcaption>A simple JavaScript variable declaration.</figcaption>
</figure>
```

### Pre and code

`<pre>` preserves whitespace and line breaks. `<code>` marks inline or block code.

```html
<!-- Inline code -->
<p>Run <code>npm install</code> to install dependencies.</p>

<!-- Block code -->
<pre><code>function greet(name) {
    return `Hello, ${name}!`;
}</code></pre>
```

### Horizontal rule

A thematic break between sections (not just a visual line):

```html
<section>
    <h2>Chapter 1</h2>
    <p>Content...</p>
</section>

<hr>

<section>
    <h2>Chapter 2</h2>
    <p>Content...</p>
</section>
```

## Inline text semantics

These elements give meaning to words and phrases within a block of text.

| Element | Meaning | Example |
|---------|---------|---------|
| `<strong>` | Strong importance | `<strong>Warning:</strong> this will delete all data.` |
| `<em>` | Stress emphasis | `You <em>must</em> restart the server.` |
| `<mark>` | Highlighted / relevant text | `Search results for <mark>semantic</mark> HTML.` |
| `<del>` | Deleted / removed text | `Price: <del>$49</del> <ins>$29</ins>` |
| `<ins>` | Inserted / added text | Used alongside `<del>` for edits |
| `<abbr>` | Abbreviation | `<abbr title="Hypertext Markup Language">HTML</abbr>` |
| `<cite>` | Title of a work | `<cite>The Pragmatic Programmer</cite>` |
| `<time>` | Machine-readable date/time | `<time datetime="2025-03-15">15 March 2025</time>` |
| `<kbd>` | Keyboard input | `Press <kbd>Ctrl</kbd>+<kbd>S</kbd> to save.` |
| `<samp>` | Sample output | `The console prints <samp>Hello, world!</samp>` |
| `<var>` | Variable | `Let <var>x</var> be the number of users.` |
| `<small>` | Side comment, fine print | `<small>Terms and conditions apply.</small>` |
| `<sub>` | Subscript | `H<sub>2</sub>O` |
| `<sup>` | Superscript | `E = mc<sup>2</sup>` |
| `<q>` | Inline quotation | `She said <q>it works on my machine</q>.` |
| `<dfn>` | Definition term | `A <dfn>CDN</dfn> is a content delivery network.` |
| `<data>` | Machine-readable value | `<data value="42">forty-two</data>` |

### strong vs b, em vs i

| Semantic | Visual equivalent | When to use semantic |
|----------|------------------|---------------------|
| `<strong>` | `<b>` | Content is important -- screen readers change tone |
| `<em>` | `<i>` | Stress emphasis changes the meaning of the sentence |

Use `<b>` and `<i>` only for stylistic purposes without semantic meaning (e.g. a product name in bold, a foreign phrase in italics).

### time

The `datetime` attribute makes dates machine-readable for search engines, calendar apps, and translation tools:

```html
<time datetime="2025-03-15">15 March 2025</time>
<time datetime="14:30">2:30 PM</time>
<time datetime="2025-03-15T14:30:00+01:00">15 March 2025, 2:30 PM CET</time>
<time datetime="P3D">3 days</time>
```

## Lists

### Unordered list

Items where order does not matter:

```html
<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>
```

### Ordered list

Items where order matters -- steps, rankings, instructions:

```html
<ol>
    <li>Clone the repository</li>
    <li>Install dependencies</li>
    <li>Start the dev server</li>
</ol>

<!-- Start from a different number -->
<ol start="5">
    <li>Fifth item</li>
    <li>Sixth item</li>
</ol>

<!-- Reversed -->
<ol reversed>
    <li>Bronze</li>
    <li>Silver</li>
    <li>Gold</li>
</ol>
```

### Description list

Key-value pairs -- glossaries, metadata, FAQs:

```html
<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language -- the standard language for web pages.</dd>

    <dt>CSS</dt>
    <dd>Cascading Style Sheets -- controls the visual presentation of HTML.</dd>

    <dt>JavaScript</dt>
    <dd>A programming language for interactive web content.</dd>
</dl>
```

A `<dt>` can have multiple `<dd>` values, and multiple `<dt>` terms can share a `<dd>`.

## Tables

Tables are for **tabular data** -- never for layout.

```html
<table>
    <caption>Quarterly Revenue (in thousands)</caption>
    <thead>
        <tr>
            <th scope="col">Quarter</th>
            <th scope="col">Revenue</th>
            <th scope="col">Growth</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Q1 2025</th>
            <td>$120</td>
            <td>+5%</td>
        </tr>
        <tr>
            <th scope="row">Q2 2025</th>
            <td>$148</td>
            <td>+23%</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th scope="row">Total</th>
            <td>$268</td>
            <td>--</td>
        </tr>
    </tfoot>
</table>
```

### Table elements

| Element | Purpose |
|---------|---------|
| `<table>` | Table container |
| `<caption>` | Visible title / description of the table |
| `<thead>` | Header row group |
| `<tbody>` | Body row group |
| `<tfoot>` | Footer row group (summaries, totals) |
| `<tr>` | Table row |
| `<th>` | Header cell -- use `scope="col"` or `scope="row"` for accessibility |
| `<td>` | Data cell |
| `<colgroup>` / `<col>` | Column styling (width, background) |

### Accessibility tips

- Always use `<caption>` -- it tells screen readers what the table contains
- Use `scope="col"` on column headers and `scope="row"` on row headers
- For complex tables with merged cells, use `headers` attribute to associate data cells with their headers

## Forms

Forms are where semantic HTML provides the most built-in functionality for free.

### Basic form structure

```html
<form action="/subscribe" method="post">
    <fieldset>
        <legend>Newsletter Signup</legend>

        <div>
            <label for="email">Email address</label>
            <input type="email" id="email" name="email"
                   required autocomplete="email"
                   placeholder="you@example.com">
        </div>

        <div>
            <label for="name">Full name</label>
            <input type="text" id="name" name="name"
                   required autocomplete="name">
        </div>

        <button type="submit">Subscribe</button>
    </fieldset>
</form>
```

### fieldset and legend

Group related fields and give the group a label:

```html
<fieldset>
    <legend>Shipping address</legend>
    <!-- address fields -->
</fieldset>

<fieldset>
    <legend>Billing address</legend>
    <!-- address fields -->
</fieldset>
```

Screen readers announce the `<legend>` when entering a fieldset, giving users context.

### label

Every input needs a label. Use `for` to associate them:

```html
<!-- Explicit association (preferred) -->
<label for="username">Username</label>
<input type="text" id="username" name="username">

<!-- Implicit association (wrapping) -->
<label>
    Username
    <input type="text" name="username">
</label>
```

**Never use `placeholder` as a replacement for `<label>`** -- placeholders disappear on focus and are not reliably read by screen readers.

### Input types

Using the correct `type` gives you free validation, the right mobile keyboard, and autofill support:

| Type | Purpose | Mobile keyboard |
|------|---------|----------------|
| `text` | Generic text | Standard |
| `email` | Email address | @ key, .com shortcut |
| `tel` | Phone number | Numeric dialpad |
| `url` | URL | .com, / keys |
| `number` | Numeric value | Number pad |
| `password` | Password | Obscured input |
| `search` | Search query | Search/enter key |
| `date` | Date picker | Native date picker |
| `time` | Time picker | Native time picker |
| `datetime-local` | Date and time | Combined picker |
| `color` | Colour picker | Native colour picker |
| `range` | Slider | Slider control |
| `file` | File upload | File browser |
| `checkbox` | Boolean toggle | Checkmark |
| `radio` | One-of-many selection | Radio button |
| `hidden` | Hidden value (not for secrets) | Not visible |

### select

Dropdown selection:

```html
<label for="country">Country</label>
<select id="country" name="country">
    <option value="">-- Select --</option>
    <optgroup label="Europe">
        <option value="de">Germany</option>
        <option value="fr">France</option>
    </optgroup>
    <optgroup label="North America">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
    </optgroup>
</select>
```

### textarea

Multi-line text input:

```html
<label for="message">Message</label>
<textarea id="message" name="message" rows="5" cols="40"
          maxlength="1000" placeholder="Your message..."></textarea>
```

### output

Displays the result of a calculation or user action:

```html
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
    <input type="number" id="a" name="a" value="0"> +
    <input type="number" id="b" name="b" value="0"> =
    <output name="result" for="a b">0</output>
</form>
```

### progress and meter

```html
<!-- Progress: task completion (uploading, loading) -->
<label for="upload">Upload progress:</label>
<progress id="upload" value="70" max="100">70%</progress>

<!-- Meter: scalar measurement within a known range -->
<label for="disk">Disk usage:</label>
<meter id="disk" value="0.7" min="0" max="1"
       low="0.3" high="0.8" optimum="0.1">70%</meter>
```

| Element | Use for | Semantics |
|---------|---------|-----------|
| `<progress>` | Task completion (upload, loading bar) | Represents progress toward a goal |
| `<meter>` | Scalar measurement (disk usage, score, rating) | Represents a value within a known range |

## Interactive elements

### details and summary

A native collapsible disclosure widget -- no JavaScript required:

```html
<details>
    <summary>System requirements</summary>
    <ul>
        <li>Node.js 18+</li>
        <li>npm 9+</li>
        <li>Git 2.30+</li>
    </ul>
</details>

<!-- Open by default -->
<details open>
    <summary>Quick start</summary>
    <pre><code>npm create next-app@latest</code></pre>
</details>
```

### dialog

A modal or non-modal dialog box with built-in focus management:

```html
<dialog id="confirm-dialog">
    <h2>Confirm deletion</h2>
    <p>Are you sure you want to delete this item?</p>
    <form method="dialog">
        <button value="cancel">Cancel</button>
        <button value="confirm">Delete</button>
    </form>
</dialog>

<button onclick="document.getElementById('confirm-dialog').showModal()">
    Delete item
</button>
```

When opened with `.showModal()`:

- A backdrop overlay appears automatically
- Focus is trapped inside the dialog
- Pressing <kbd>Esc</kbd> closes it
- The `<form method="dialog">` closes the dialog on submit

## Media

### picture

Serve different image formats and sizes based on browser support and viewport:

```html
<picture>
    <source srcset="photo.avif" type="image/avif">
    <source srcset="photo.webp" type="image/webp">
    <img src="photo.jpg" alt="Description of the image"
         width="800" height="600" loading="lazy">
</picture>
```

See the [Web Performance -- Images](/web-performance#images) section for responsive image patterns with `srcset` and `sizes`.

### video

```html
<video controls width="720" height="480" preload="metadata"
       poster="thumbnail.jpg">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    <track kind="captions" src="captions-en.vtt"
           srclang="en" label="English" default>
    <p>Your browser does not support HTML video.
       <a href="video.mp4">Download the video</a>.</p>
</video>
```

- **`poster`** -- thumbnail shown before playback
- **`preload="metadata"`** -- loads duration and dimensions without downloading the full video
- **`<track>`** -- captions, subtitles, or descriptions for accessibility

### audio

```html
<audio controls preload="metadata">
    <source src="podcast.mp3" type="audio/mpeg">
    <source src="podcast.ogg" type="audio/ogg">
    <p>Your browser does not support HTML audio.
       <a href="podcast.mp3">Download the episode</a>.</p>
</audio>
```

## Less common but useful elements

### address

Contact information for the nearest `<article>` or `<body>` ancestor:

```html
<address>
    <a href="mailto:luca.nerlich@gmail.com">luca.nerlich@gmail.com</a><br>
    <a href="https://github.com/LucaNerlich">GitHub</a>
</address>
```

Not for arbitrary postal addresses -- use `<p>` for those.

### template

A fragment of HTML that is not rendered but can be cloned by JavaScript:

```html
<template id="card-template">
    <article class="card">
        <h3></h3>
        <p></p>
    </article>
</template>

<script>
const template = document.getElementById('card-template');
const clone = template.content.cloneNode(true);
clone.querySelector('h3').textContent = 'Card Title';
clone.querySelector('p').textContent = 'Card description.';
document.body.appendChild(clone);
</script>
```

### slot (Web Components)

A placeholder inside a Web Component's shadow DOM that receives content from the light DOM. See the [JavaScript: Web Components](/javascript/beginners-guide/project-build-a-website#web-components) section for details.

### map and area

Image maps -- clickable regions on an image:

```html
<img src="floor-plan.png" alt="Office floor plan"
     usemap="#office" width="600" height="400">
<map name="office">
    <area shape="rect" coords="0,0,200,200"
          href="/rooms/meeting" alt="Meeting room">
    <area shape="circle" coords="400,300,50"
          href="/rooms/kitchen" alt="Kitchen">
</map>
```

Rarely used today -- CSS and SVG overlays are more flexible.

## Anti-patterns

### Div soup

```html
<!-- Bad: divs everywhere, no meaning -->
<div class="header">
    <div class="nav">
        <div class="nav-item"><a href="/">Home</a></div>
    </div>
</div>
<div class="main">
    <div class="article">
        <div class="title">My Post</div>
    </div>
</div>

<!-- Good: semantic elements -->
<header>
    <nav aria-label="Main">
        <ul>
            <li><a href="/">Home</a></li>
        </ul>
    </nav>
</header>
<main>
    <article>
        <h1>My Post</h1>
    </article>
</main>
```

### Other common mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using `<div>` for everything | No semantic meaning for assistive tech or SEO | Use the right element for the content |
| Skipping heading levels (`<h1>` then `<h4>`) | Broken document outline | Go `<h1>`, `<h2>`, `<h3>` in order |
| Using `<table>` for page layout | Screen readers announce it as data, confusing users | Use CSS Grid or Flexbox |
| Using `<br>` for spacing | Fragile, not the element's purpose | Use CSS margin/padding |
| Placeholder instead of label | Disappears on focus, poor accessibility | Always use `<label>` |
| Click handlers on `<div>` or `<span>` | Not keyboard accessible, no focus, no role | Use `<button>` or `<a>` |
| Using `<a>` without `href` | Not focusable or keyboard navigable | Add `href`, or use `<button>` for actions |
| `<b>` and `<i>` for emphasis | No semantic meaning | Use `<strong>` and `<em>` |

## Quick reference

A cheat sheet for choosing the right element:

| You want to... | Use |
|----------------|-----|
| Wrap the page header | `<header>` |
| Create a navigation menu | `<nav>` |
| Mark the main content area | `<main>` |
| Wrap the page footer | `<footer>` |
| Create a sidebar or tangential content | `<aside>` |
| Group content with a heading | `<section>` |
| Mark standalone, redistributable content | `<article>` |
| Show a date or time | `<time datetime="...">` |
| Display an image with a caption | `<figure>` + `<figcaption>` |
| Quote a block of text | `<blockquote>` |
| Define a term | `<dfn>` |
| Show an abbreviation | `<abbr title="...">` |
| Group related form fields | `<fieldset>` + `<legend>` |
| Create a collapsible section | `<details>` + `<summary>` |
| Show a modal dialog | `<dialog>` |
| Display key-value pairs | `<dl>` + `<dt>` + `<dd>` |
| Show task progress | `<progress>` |
| Show a measurement in a range | `<meter>` |
| Emphasize importance | `<strong>` |
| Add stress emphasis | `<em>` |
| Highlight a search term | `<mark>` |

## Summary

Semantic HTML is not extra work -- it is the **default** way to write HTML. Every time you reach for a `<div>` or `<span>`, ask: "Is there an element that already describes what this content is?" If yes, use it. You get accessibility, SEO, built-in behaviour, and self-documenting code for free.
