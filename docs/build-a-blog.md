---
title: "Build a Simple Blog Page"
sidebar_label: "Build a Simple Blog Page"
description: A super-beginner, start-to-finish tutorial for building a simple blog page using only HTML, CSS, and vanilla JavaScript -- with an optional section on adding Vite later.
slug: /build-a-blog
tags: [html, css, javascript, beginners, tutorial]
keywords:
  - simple blog html
  - beginner blog tutorial
  - vanilla javascript blog
  - html css js blog
  - vite blog
sidebar_position: 6
---

# Build a Simple Blog Page

This is a start-to-finish tutorial for building a tiny blog page using **only** HTML, CSS, and vanilla JavaScript. No
framework, no build step, no account on any platform. By the end you will have a single working page with two posts, a
sidebar, a dark-mode toggle, human-readable post dates, and a tag filter -- all in three files.

If you want a deeper element-by-element reference while you work, keep [Semantic HTML](./semantic-html.mdx) open in a
second tab.

## What you will build

A single blog page with:

- A site **header** and **navigation**.
- A **main** column with two blog posts, each with a title, date, body, and tag list.
- An **aside** with a short "About" blurb.
- A **footer** with a copyright line.
- A **theme toggle** that switches between light and dark mode and remembers your choice.
- **Relative dates** ("3 days ago") generated at page load.
- **Tag filtering** -- click a tag to show only posts that include it; click again to clear.

## What you need

1. A modern web browser (Chrome, Firefox, Safari, or Edge).
2. A text editor. [VS Code](https://code.visualstudio.com/) is free and a safe default.

That is it. No Node.js yet, no `npm install`.

## Project layout

Create a folder called `my-blog/` with three empty files inside:

```text
my-blog/
├── index.html
├── styles.css
└── app.js
```

All work in this guide happens inside that folder.

## Step 1 -- the HTML skeleton

Open `index.html` and paste this in. Every element here is a **semantic** one -- look up any of them
in [Semantic HTML](./semantic-html.mdx) for details on what they mean.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My First Blog</title>
    <meta name="description" content="A tiny blog built with plain HTML, CSS, and JavaScript.">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site-header">
    <h1>Ada's Blog</h1>
    <nav aria-label="Main">
        <ul>
            <li><a href="#" aria-current="page">Home</a></li>
            <li><a href="#">Archive</a></li>
            <li><a href="#">About</a></li>
        </ul>
    </nav>
    <button id="theme-toggle" type="button" aria-label="Toggle colour theme">Dark mode</button>
</header>

<div class="layout">
    <main>
        <article class="post" data-tags="html,beginners">
            <header>
                <h2>Why I started this blog</h2>
                <time datetime="2026-04-15">15 April 2026</time>
            </header>
            <p>
                I wanted a place to write things down. Nothing fancy -- just one HTML file, one stylesheet,
                and a bit of JavaScript. No build step, no framework, no database.
            </p>
            <p>
                If you can open a text editor and drag a file into a browser, you can do this too.
            </p>
            <footer>
                <ul class="tags" aria-label="Tags">
                    <li><button type="button" class="tag">html</button></li>
                    <li><button type="button" class="tag">beginners</button></li>
                </ul>
            </footer>
        </article>

        <article class="post" data-tags="css,beginners">
            <header>
                <h2>A quick note on CSS Grid</h2>
                <time datetime="2026-04-18">18 April 2026</time>
            </header>
            <p>
                CSS Grid lets you say "give me two columns" in one line. That is the whole trick
                behind the sidebar you see on the right.
            </p>
            <p>
                On narrow screens it collapses to a single column automatically -- no media query needed
                if you use <code>minmax()</code> and <code>auto-fit</code>.
            </p>
            <footer>
                <ul class="tags" aria-label="Tags">
                    <li><button type="button" class="tag">css</button></li>
                    <li><button type="button" class="tag">beginners</button></li>
                </ul>
            </footer>
        </article>
    </main>

    <aside aria-label="About">
        <h2>About</h2>
        <p>
            Hi, I am Ada. I write short notes about the web. This whole site is three files --
            open DevTools and take a look.
        </p>
    </aside>
</div>

<footer class="site-footer">
    <p>&copy; 2026 Ada Lovelace. Built by hand.</p>
</footer>

<script src="app.js"></script>
</body>
</html>
```

Open `index.html` in your browser (double-click it, or drag it onto a browser window). You should see an unstyled page
with headings, paragraphs, and a list of links. Ugly, but correct -- every piece of content is marked up with the right
element.

Why it looks ugly is the point of Step 2.

### Why this markup?

| Element               | Why it is here                                                                                        |
|-----------------------|-------------------------------------------------------------------------------------------------------|
| `<header>` (site)     | The top banner of the page -- title, nav, theme button.                                               |
| `<nav>`               | Grouped navigation links. `aria-label="Main"` distinguishes it from other navs.                       |
| `<main>`              | The dominant content of the page. There must be exactly one `<main>`.                                 |
| `<article>`           | Each blog post stands on its own -- it would still make sense in an RSS reader. That is an article.   |
| `<header>` (per post) | Intro content for the post -- title and date.                                                         |
| `<time datetime>`     | Machine-readable date. JavaScript will read `datetime` to produce "3 days ago".                       |
| `<aside>`             | Content tangentially related to the main content -- here, the "About" box.                           |
| `<footer>` (per post) | Closing content for the post -- here, its tag list.                                                   |
| `<footer>` (site)     | Closing content for the whole page -- copyright.                                                      |

## Step 2 -- style it with CSS

Open `styles.css` and paste this in. It is about 60 lines. Read top to bottom.

```css
/* Reset and defaults */
*, *::before, *::after {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    line-height: 1.6;
    background: var(--bg);
    color: var(--fg);
}

/* Theme tokens */
:root {
    --bg: #ffffff;
    --fg: #1a1a1a;
    --muted: #666;
    --accent: #2a6df4;
    --card: #f5f5f7;
    --border: #e3e3e6;
}

html[data-theme="dark"] {
    --bg: #16171a;
    --fg: #f2f2f2;
    --muted: #a0a0a0;
    --accent: #7aa7ff;
    --card: #1f2025;
    --border: #2b2c32;
}

/* Header + nav */
.site-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
}

.site-header h1 { margin: 0; font-size: 1.25rem; }
.site-header nav { flex: 1; }
.site-header ul { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; }
.site-header a { color: var(--fg); text-decoration: none; }
.site-header a[aria-current="page"] { color: var(--accent); font-weight: bold; }

/* Layout: main + aside side by side, collapses on narrow screens */
.layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: 2rem;
    max-width: 60rem;
    margin: 2rem auto;
    padding: 0 1.5rem;
}

main { display: grid; gap: 1.5rem; }
aside { align-self: start; padding: 1rem; background: var(--card); border-radius: 0.5rem; }

/* Posts */
.post {
    padding: 1.25rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
}

.post > header h2 { margin: 0 0 0.25rem; }
.post > header time { color: var(--muted); font-size: 0.9rem; }

/* Tags */
.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; list-style: none; margin: 1rem 0 0; padding: 0; }
.tag {
    font: inherit;
    padding: 0.15rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
}
.tag[aria-pressed="true"] { background: var(--accent); color: white; border-color: var(--accent); }

/* Theme button + footer */
#theme-toggle {
    font: inherit;
    padding: 0.35rem 0.8rem;
    background: transparent;
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    cursor: pointer;
}

.site-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    color: var(--muted);
    text-align: center;
}
```

Refresh the page. Now it looks like a blog -- two cards in a column, an "About" panel next to them, and a proper header
and footer. Resize the browser window narrow and the aside will jump below the posts.

### Two things worth understanding

- **CSS custom properties** (the `--bg`, `--fg`, ... at the top). These are variables. `:root` sets the light values;
  `html[data-theme="dark"]` overrides them when the attribute is present. The JavaScript in Step 3 just flips that
  attribute -- no CSS needs to be rewritten at runtime.
- **`repeat(auto-fit, minmax(18rem, 1fr))`**. This is the whole responsive layout. "Fit as many 18rem-wide columns as
  will fit, and let each take an equal share of the remaining space." On a phone you get one column; on a laptop you
  get two.

## Step 3 -- add JavaScript

Open `app.js` and paste this in.

```js
// 1. Theme toggle ---------------------------------------------------
const THEME_KEY = "blog-theme";
const toggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

applyTheme(localStorage.getItem(THEME_KEY) ?? "light");

toggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
});

// 2. Relative dates -------------------------------------------------
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeDate(dateString) {
    const diffMs = new Date(dateString).getTime() - Date.now();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return rtf.format(diffDays, "day");
}

document.querySelectorAll("time[datetime]").forEach((el) => {
    el.textContent = relativeDate(el.getAttribute("datetime"));
});

// 3. Tag filter -----------------------------------------------------
let activeTag = null;
const posts = document.querySelectorAll(".post");

document.querySelectorAll(".tag").forEach((btn) => {
    btn.addEventListener("click", () => {
        const clicked = btn.textContent.trim();
        activeTag = activeTag === clicked ? null : clicked;

        document.querySelectorAll(".tag").forEach((t) => {
            t.setAttribute("aria-pressed", t.textContent.trim() === activeTag ? "true" : "false");
        });

        posts.forEach((post) => {
            const tags = (post.dataset.tags ?? "").split(",");
            post.hidden = activeTag !== null && !tags.includes(activeTag);
        });
    });
});
```

Refresh the page. Three things should happen:

1. Click **Dark mode** -- the page flips to dark. Reload -- it stays dark. The choice is stored in `localStorage`.
2. The post dates now read something like "5 days ago" instead of "15 April 2026".
3. Click any tag (for example `css`). The post without that tag disappears and the clicked tag turns blue. Click the
   same tag again -- everything comes back.

### What each block does

| Block         | Concept it teaches                                                                                   |
|---------------|------------------------------------------------------------------------------------------------------|
| Theme toggle  | DOM attributes, event listeners, `localStorage`, CSS custom properties as a single source of truth.  |
| Relative dates| `Intl.RelativeTimeFormat` -- the browser's built-in human-readable dates. No library needed.         |
| Tag filter    | `querySelectorAll`, `dataset`, `hidden` attribute, and toggling state with a single top-level var.   |

## Step 4 (optional) -- load posts from a JSON file

Hard-coded posts are fine for a personal page. If you want the structure to grow, move the posts into a data file.

Create `posts.json` next to `app.js`:

```json
[
    {
        "title": "Why I started this blog",
        "date": "2026-04-15",
        "tags": ["html", "beginners"],
        "body": [
            "I wanted a place to write things down. Nothing fancy -- just one HTML file, one stylesheet, and a bit of JavaScript.",
            "If you can open a text editor and drag a file into a browser, you can do this too."
        ]
    },
    {
        "title": "A quick note on CSS Grid",
        "date": "2026-04-18",
        "tags": ["css", "beginners"],
        "body": [
            "CSS Grid lets you say \"give me two columns\" in one line.",
            "On narrow screens it collapses to a single column -- no media query needed."
        ]
    }
]
```

Delete the two `<article>` elements from `index.html` (leave `<main>` empty). The posts now come from `posts.json`
instead, so the date and tag-filter logic has to wait until the posts have been rendered.

Replace the date and tag-filter blocks in `app.js` with a single `initPosts()` function, and call it once posts are on
the page. The theme toggle stays exactly as it was -- it does not depend on posts.

```js
// Theme toggle -- keep as-is from Step 3.

// Load posts and hydrate -------------------------------------------
async function loadPosts() {
    const res = await fetch("posts.json");
    const posts = await res.json();

    document.querySelector("main").innerHTML = posts.map((p) => `
        <article class="post" data-tags="${p.tags.join(",")}">
            <header>
                <h2>${p.title}</h2>
                <time datetime="${p.date}">${p.date}</time>
            </header>
            ${p.body.map((para) => `<p>${para}</p>`).join("")}
            <footer>
                <ul class="tags" aria-label="Tags">
                    ${p.tags.map((t) => `<li><button type="button" class="tag">${t}</button></li>`).join("")}
                </ul>
            </footer>
        </article>
    `).join("");
}

function initPosts() {
    // Relative dates
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    document.querySelectorAll("time[datetime]").forEach((el) => {
        const diffDays = Math.round(
            (new Date(el.getAttribute("datetime")).getTime() - Date.now()) / 86_400_000
        );
        el.textContent = rtf.format(diffDays, "day");
    });

    // Tag filter
    let activeTag = null;
    const posts = document.querySelectorAll(".post");

    document.querySelectorAll(".tag").forEach((btn) => {
        btn.addEventListener("click", () => {
            const clicked = btn.textContent.trim();
            activeTag = activeTag === clicked ? null : clicked;

            document.querySelectorAll(".tag").forEach((t) => {
                t.setAttribute("aria-pressed", t.textContent.trim() === activeTag ? "true" : "false");
            });

            posts.forEach((post) => {
                const tags = (post.dataset.tags ?? "").split(",");
                post.hidden = activeTag !== null && !tags.includes(activeTag);
            });
        });
    });
}

await loadPosts();
initPosts();
```

Because this uses top-level `await`, change the script tag in `index.html` to a module:

```html
<script type="module" src="app.js"></script>
```

### The one gotcha

`fetch("posts.json")` does **not** work when you open `index.html` by double-clicking it -- the URL is `file://` and
browsers block `fetch` from local files for security. You now need a tiny local server. That is a good excuse to
introduce Vite.

## Bonus -- use Vite when the single-file setup is not enough

[Vite](https://vite.dev) is a **dev server** and **bundler**. You do not need it to build a blog, but it gives you:

- A local server (so `fetch` works).
- **Hot module replacement** -- save a file, the page updates without a full reload.
- A production build command that minifies and fingerprints your assets.

To try it, install [Node.js LTS](https://nodejs.org/) first, then from a terminal:

```bash
npm create vite@latest my-blog -- --template vanilla
cd my-blog
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

Vite's vanilla template ships with a sample `main.js` that prints a counter -- delete its contents and drop in your own
`index.html`, `styles.css`, `app.js`, `posts.json`. One change is needed: in a Vite project the CSS is imported from
JavaScript, not from a `<link>` tag. Add this at the top of `app.js`:

```js
import "./styles.css";
```

and remove the `<link rel="stylesheet" href="styles.css">` line from `index.html`. Everything else -- the semantic
markup, the CSS, the JS logic -- stays the same.

When you are ready to publish:

```bash
npm run build
```

You get a `dist/` folder with static HTML, CSS, and JS that can be dropped onto any static host (GitHub Pages, Netlify,
a plain nginx VPS).

### When is Vite worth it?

| Situation                                       | Vite? |
|-------------------------------------------------|-------|
| One HTML file, no `fetch`, just learning        | No    |
| You want `fetch("posts.json")` to work locally  | Yes   |
| You are about to split JS into multiple modules | Yes   |
| You want to use TypeScript, SCSS, or JSX later  | Yes   |

Stick with plain files as long as the project fits in your head. Reach for Vite the moment it does not.

## Summary

- Three files -- `index.html`, `styles.css`, `app.js` -- are enough to build a real blog page.
- Semantic elements (`<header>`, `<main>`, `<article>`, `<aside>`, `<footer>`, `<time>`) make your markup readable and
  accessible for free. See [Semantic HTML](./semantic-html.mdx) for the full list.
- CSS custom properties plus a single `data-theme` attribute is all you need for a dark-mode toggle.
- `Intl.RelativeTimeFormat` and `localStorage` are built into every browser -- no libraries required.
- Vite is optional. Add it when your single-file setup starts to hurt, not before.

## Next steps

- [Semantic HTML](./semantic-html.mdx) -- reference for every element you used here.
- [CSS Beginners' Guide](./css/beginners-guide/01-introduction.md) -- go deeper on selectors, the box model, Grid, and
  Flexbox.
- [JavaScript Beginners' Guide](./javascript/beginners-guide/01-introduction.md) -- 15 chapters from `console.log` to
  deploying a site on a VPS.
- [Project: Build a Complete Website](./javascript/beginners-guide/11-project-build-a-website.md) -- the multi-page
  portfolio version of this tutorial, with navigation, form validation, and routing.
