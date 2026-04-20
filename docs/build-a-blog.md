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

- A **responsive site header** that collapses its nav behind a `☰` button on phones.
- A **main** column with two blog posts, each with a title, date, body, and tag list.
- An **aside** with a short "About" blurb.
- A **multi-column footer** that stacks to one column on narrow screens.
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

Open `styles.css` and paste this in. It is about 60 lines. Read top to bottom. If any selector or property is new to
you, the [CSS Beginners' Guide](./css/beginners-guide/01-introduction.md) has a chapter for each area -- in particular
the [box model](./css/beginners-guide/03-the-box-model.md),
[colors and typography](./css/beginners-guide/04-colors-and-typography.md), and
[Flexbox](./css/beginners-guide/07-flexbox.md) chapters back up what happens in the header and cards below.

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
  attribute -- no CSS needs to be rewritten at runtime. See
  [CSS Custom Properties](./css/beginners-guide/13-css-custom-properties.md) for the full picture (scoping,
  fallbacks, `calc()` integration).
- **`repeat(auto-fit, minmax(18rem, 1fr))`**. This is the whole responsive layout. "Fit as many 18rem-wide columns as
  will fit, and let each take an equal share of the remaining space." On a phone you get one column; on a laptop you
  get two. The [CSS Grid chapter](./css/beginners-guide/08-css-grid.md) covers `auto-fit` vs `auto-fill` and why this
  pattern avoids a media query; [Responsive Design](./css/beginners-guide/09-responsive-design.md) covers the cases
  where a media query is still the right tool.

## Step 3 -- add JavaScript

Open `app.js` and paste this in. Every DOM method here -- `getElementById`, `querySelectorAll`, `addEventListener`,
`dataset`, `setAttribute` -- is covered in depth in [The DOM](./javascript/beginners-guide/08-the-dom.md)
and [Events](./javascript/beginners-guide/09-events.md).

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
| Relative dates| `Intl.RelativeTimeFormat` -- the browser's built-in human-readable dates. See [Intl API Formatting](./javascript/javascript-intl-api-formatting.md) for the sibling APIs (numbers, currency, full dates). |
| Tag filter    | `querySelectorAll`, `dataset`, `hidden` attribute, and toggling state with a single top-level var.   |

## Step 4 -- a responsive header and footer

The layout already reflows because of the `auto-fit` / `minmax()` trick in Step 2 -- resize the window and the aside
drops below the main column. But two places still look cramped on a phone:

- The header nav tries to squeeze logo, three links, and the theme button onto one row.
- The footer is a single line that stays centred even on wide screens.

This step upgrades both -- a proper mobile menu behind a toggle button, and a multi-column footer that stacks on
narrow screens. If you want the theory behind this section, see
[Responsive Design](./css/beginners-guide/09-responsive-design.md) for breakpoints and media queries.

### Part A -- mobile menu in the header

Update the header in `index.html` to add a toggle button and an `id` on the nav so the button can describe what it
controls:

```html
<header class="site-header">
    <h1>Ada's Blog</h1>
    <button id="nav-toggle" class="nav-toggle" type="button"
            aria-expanded="false" aria-controls="main-nav">
        <span aria-hidden="true">☰</span>
        <span class="visually-hidden">Menu</span>
    </button>
    <nav id="main-nav" aria-label="Main">
        <ul>
            <li><a href="#" aria-current="page">Home</a></li>
            <li><a href="#">Archive</a></li>
            <li><a href="#">About</a></li>
        </ul>
    </nav>
    <button id="theme-toggle" type="button" aria-label="Toggle colour theme">Dark mode</button>
</header>
```

Three accessibility details to notice:

| Attribute                | What it does                                                                        |
|--------------------------|-------------------------------------------------------------------------------------|
| `aria-expanded="false"`  | Tells assistive tech whether the menu is currently open -- JS will flip this.       |
| `aria-controls="main-nav"` | Points to the element the button shows/hides.                                     |
| `.visually-hidden` span  | The word "Menu" is read by screen readers but not shown on screen.                  |

Append this to the bottom of `styles.css`:

```css
/* Screen-reader-only text */
.visually-hidden {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Mobile menu toggle -- hidden on wide screens */
.nav-toggle {
    display: none;
    font: inherit;
    font-size: 1.25rem;
    padding: 0.25rem 0.6rem;
    background: transparent;
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    cursor: pointer;
}

/* On narrow screens: show the toggle, hide the nav until it is expanded */
@media (max-width: 40rem) {
    .nav-toggle { display: inline-block; order: 2; }
    .site-header nav { order: 3; flex-basis: 100%; display: none; }
    .nav-toggle[aria-expanded="true"] + nav { display: block; }
    .site-header ul { flex-direction: column; gap: 0.5rem; }
}
```

A couple of things to understand here:

- `@media (max-width: 40rem)` applies the rules inside only when the viewport is **at most** 40rem wide (~640px) --
  roughly phone-sized. Above that, the header keeps its original flex layout.
- `order` re-arranges flex children visually without changing the HTML source order. On mobile we want the toggle to
  sit next to the title and the nav to drop below.
- `.nav-toggle[aria-expanded="true"] + nav` -- the adjacent-sibling combinator. When the button's attribute is `true`,
  the nav directly after it becomes visible. The CSS reacts to the attribute; no `.open` class needed.

Add the handler to the bottom of `app.js`:

```js
// 4. Mobile nav toggle ----------------------------------------------
const navToggle = document.getElementById("nav-toggle");

navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
});
```

Refresh the page and shrink the window below ~640px (or use your browser's device-emulation mode). The nav disappears
and a `☰` button appears in its place. Click it and the nav slides in as a stacked list. Widen the window again and
the button hides itself, the nav reappears inline.

### Part B -- a multi-column footer

Replace the existing `<footer class="site-footer">` block in `index.html` with this richer version:

```html
<footer class="site-footer">
    <div class="footer-columns">
        <section>
            <h3>About</h3>
            <p>A tiny blog about the web, built by hand.</p>
        </section>
        <section>
            <h3>Topics</h3>
            <ul>
                <li><a href="#">HTML</a></li>
                <li><a href="#">CSS</a></li>
                <li><a href="#">JavaScript</a></li>
            </ul>
        </section>
        <section>
            <h3>Elsewhere</h3>
            <ul>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">RSS feed</a></li>
            </ul>
        </section>
    </div>
    <p class="site-footer-copy">&copy; 2026 Ada Lovelace. Built by hand.</p>
</footer>
```

Replace the old `.site-footer` block at the bottom of `styles.css` with this:

```css
.site-footer {
    padding: 2rem 1.5rem;
    border-top: 1px solid var(--border);
    color: var(--muted);
}

.footer-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 1.5rem;
    max-width: 60rem;
    margin: 0 auto;
}

.footer-columns h3 { margin: 0 0 0.5rem; font-size: 1rem; color: var(--fg); }
.footer-columns ul { display: grid; gap: 0.25rem; list-style: none; margin: 0; padding: 0; }
.footer-columns a { color: var(--muted); text-decoration: none; }
.footer-columns a:hover { color: var(--accent); }

.site-footer-copy {
    max-width: 60rem;
    margin: 1.5rem auto 0;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    text-align: center;
    font-size: 0.9rem;
}
```

Notice the pattern is exactly the same one from Step 2 -- `repeat(auto-fit, minmax(10rem, 1fr))`. No media query
needed. On a wide screen you get three columns side by side, on a phone they collapse to one. Same idea, smaller
`minmax` value because footer columns are narrower than content columns.

### When `auto-fit` vs when a media query?

| Use `auto-fit` / `minmax()` when...                       | Use a `@media` query when...                                      |
|----------------------------------------------------------|-------------------------------------------------------------------|
| Items are interchangeable (cards, links, icons).          | You need to hide, re-order, or rewire something (like the nav).   |
| Stacking in one column on narrow screens is the goal.     | You need to switch between two different **types** of layout.     |
| The number of items is variable.                          | The change depends on something other than width (e.g. hover).    |

Both tools live side by side here: the footer uses `auto-fit` because it just needs to flow; the header uses a media
query because the nav morphs into a totally different UI.

## Step 5 (optional) -- load posts from a JSON file

Hard-coded posts are fine for a personal page. If you want the structure to grow, move the posts into a data file.
This is also the point where you need `fetch()` and a local server -- see
[Working with Data](./javascript/beginners-guide/10-working-with-data.md) for the fundamentals and
[Async/Await Patterns](./javascript/async-await-guide.md) for the Promise behaviour behind `await`.

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
a plain nginx VPS). For the VPS route in particular, [Deploy to a VPS with
nginx](./javascript/beginners-guide/12-deploy-vps-nginx.md) walks through the full server-side setup.

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
- Responsive layout falls out of `repeat(auto-fit, minmax())` for the footer and a single `@media` query for the mobile
  nav -- those two tools cover most cases.
- CSS custom properties plus a single `data-theme` attribute is all you need for a dark-mode toggle.
- `Intl.RelativeTimeFormat` and `localStorage` are built into every browser -- no libraries required.
- Vite is optional. Add it when your single-file setup starts to hurt, not before.

## Next steps

- [Semantic HTML](./semantic-html.mdx) -- reference for every element you used here.
- [CSS Beginners' Guide](./css/beginners-guide/01-introduction.md) -- go deeper on selectors, the box model, Grid, and
  Flexbox. The chapters on [CSS Grid](./css/beginners-guide/08-css-grid.md),
  [Responsive Design](./css/beginners-guide/09-responsive-design.md), and
  [CSS Custom Properties](./css/beginners-guide/13-css-custom-properties.md) directly extend what you built here.
- [JavaScript Beginners' Guide](./javascript/beginners-guide/01-introduction.md) -- 15 chapters from `console.log` to
  deploying a site on a VPS. [The DOM](./javascript/beginners-guide/08-the-dom.md),
  [Events](./javascript/beginners-guide/09-events.md), and
  [Working with Data](./javascript/beginners-guide/10-working-with-data.md) cover everything `app.js` and `posts.json`
  touch.
- [Intl API Formatting](./javascript/javascript-intl-api-formatting.md) -- deeper dive on the `Intl` family we used for
  relative dates.
- [Project: Build a Complete Website](./javascript/beginners-guide/11-project-build-a-website.md) -- the multi-page
  portfolio version of this tutorial, with navigation, form validation, and routing.
- [Deploy to a VPS with nginx](./javascript/beginners-guide/12-deploy-vps-nginx.md) -- put the finished blog on the
  internet.
- [Web Performance](./web-performance.md) -- once your blog is live, the Core Web Vitals checklist to keep it fast.
