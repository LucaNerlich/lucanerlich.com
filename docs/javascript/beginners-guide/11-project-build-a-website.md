---
title: "Project: Build a Complete Website"
sidebar_label: "Project: Build a Website"
description: Build a multi-page vanilla JavaScript website from scratch -- navigation, theme toggle, form validation, dynamic content, and local storage.
slug: /javascript/beginners-guide/project-build-a-website
tags: [javascript, beginners, project, html, css]
keywords:
  - vanilla javascript project
  - build a website
  - javascript website
  - multi-page website
  - form validation
sidebar_position: 11
---

# Project: Build a Complete Website

Time to put everything together. In this chapter you will build a multi-page personal website using only HTML, CSS, and vanilla JavaScript. This is the site we will deploy to a VPS in the next chapter.

## What we are building

A personal portfolio site with:

- **Home page** -- introduction and featured projects
- **Projects page** -- filterable project cards loaded from data
- **Contact page** -- form with client-side validation
- **Shared navigation** with active page highlighting
- **Dark/light theme toggle** with localStorage persistence
- **Responsive design** that works on all screen sizes

## Project structure

```text
my-website/
├── index.html          # Home page
├── projects.html       # Projects page
├── contact.html        # Contact page
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── main.js         # Shared functionality (theme, nav)
│   ├── projects.js     # Projects page logic
│   └── contact.js      # Contact form logic
└── data/
    └── projects.json   # Project data
```

Create this folder structure before starting. All paths below are relative to the `my-website/` root.

## Step 1: shared styles

Create `css/styles.css` with the full stylesheet. This covers the layout, components, and responsive behavior for all pages:

```css
/* css/styles.css */

/* ============================================
   Reset & Base
   ============================================ */

*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --color-bg: #ffffff;
    --color-text: #1a1a2e;
    --color-text-muted: #555;
    --color-primary: #0066cc;
    --color-primary-hover: #0052a3;
    --color-border: #e0e0e0;
    --color-card-bg: #f8f9fa;
    --color-nav-bg: #ffffff;
    --color-footer-bg: #f8f9fa;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    --radius: 8px;
    --max-width: 1000px;
}

body.dark-theme {
    --color-bg: #1a1a2e;
    --color-text: #e0e0e0;
    --color-text-muted: #aaa;
    --color-primary: #4dabf7;
    --color-primary-hover: #74c0fc;
    --color-border: #333;
    --color-card-bg: #16213e;
    --color-nav-bg: #0f3460;
    --color-footer-bg: #0f3460;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-bg);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

a {
    color: var(--color-primary);
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

img {
    max-width: 100%;
    height: auto;
}

/* ============================================
   Navigation
   ============================================ */

.site-nav {
    background: var(--color-nav-bg);
    border-bottom: 1px solid var(--color-border);
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow);
}

.nav-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: var(--max-width);
    margin: 0 auto;
    height: 60px;
}

.nav-logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
}

.nav-links {
    display: flex;
    gap: 24px;
    align-items: center;
    list-style: none;
}

.nav-links a {
    color: var(--color-text-muted);
    font-weight: 500;
    padding: 4px 0;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    text-decoration: none;
}

.theme-toggle {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-text);
}

.theme-toggle:hover {
    background: var(--color-card-bg);
}

/* ============================================
   Main Content
   ============================================ */

.main-content {
    flex: 1;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 48px 24px;
    width: 100%;
}

/* ============================================
   Hero Section
   ============================================ */

.hero {
    text-align: center;
    padding: 48px 0;
}

.hero h1 {
    font-size: 2.5rem;
    margin-bottom: 16px;
}

.hero p {
    font-size: 1.25rem;
    color: var(--color-text-muted);
    max-width: 600px;
    margin: 0 auto;
}

/* ============================================
   Cards
   ============================================ */

.card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 32px;
}

.card {
    flex: 1 1 280px;
    background: var(--color-card-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow);
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card h3 {
    margin-bottom: 8px;
    font-size: 1.125rem;
}

.card p {
    color: var(--color-text-muted);
    font-size: 0.9375rem;
}

.card .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
}

.tag {
    display: inline-block;
    background: var(--color-primary);
    color: #fff;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 4px;
}

/* ============================================
   Filters
   ============================================ */

.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
}

.filter-btn {
    padding: 6px 16px;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-bg);
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s, color 0.2s;
}

.filter-btn:hover,
.filter-btn.active {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
}

/* ============================================
   Forms
   ============================================ */

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font-size: 1rem;
    font-family: inherit;
    background: var(--color-bg);
    color: var(--color-text);
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
}

.form-group .error-text {
    color: #e74c3c;
    font-size: 0.8125rem;
    margin-top: 4px;
    display: none;
}

.form-group.has-error input,
.form-group.has-error textarea {
    border-color: #e74c3c;
}

.form-group.has-error .error-text {
    display: block;
}

.submit-btn {
    padding: 12px 32px;
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.submit-btn:hover {
    background: var(--color-primary-hover);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.form-success {
    background: #d4edda;
    color: #155724;
    padding: 16px;
    border-radius: var(--radius);
    margin-top: 16px;
    display: none;
}

/* ============================================
   Footer
   ============================================ */

.site-footer {
    background: var(--color-footer-bg);
    border-top: 1px solid var(--color-border);
    text-align: center;
    padding: 24px;
    color: var(--color-text-muted);
    font-size: 0.875rem;
}

/* ============================================
   Responsive
   ============================================ */

@media (max-width: 640px) {
    .nav-inner {
        flex-direction: column;
        height: auto;
        padding: 12px 0;
        gap: 12px;
    }

    .nav-links {
        gap: 16px;
    }

    .hero h1 {
        font-size: 1.75rem;
    }

    .hero p {
        font-size: 1rem;
    }

    .card {
        flex: 1 1 100%;
    }
}
```

## Step 2: shared navigation HTML

Every page includes the same `<nav>` and `<footer>`. Here is the structure (you will repeat it in each HTML file):

```html
<!-- Navigation -- same on every page -->
<nav class="site-nav">
    <div class="nav-inner">
        <a href="index.html" class="nav-logo">MyPortfolio</a>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><button class="theme-toggle" id="theme-toggle">Dark Mode</button></li>
        </ul>
    </div>
</nav>

<!-- Page content goes here -->

<!-- Footer -- same on every page -->
<footer class="site-footer">
    <p>&copy; 2025 MyPortfolio. Built with vanilla HTML, CSS, and JavaScript.</p>
</footer>
```

## Step 3: shared JavaScript (`js/main.js`)

This file handles the theme toggle and active navigation link. It is loaded on every page:

```js
// js/main.js
"use strict";

// ── Theme Toggle ──────────────────────────────────────────────

function initTheme() {
    const toggle = document.querySelector("#theme-toggle");
    if (!toggle) return;

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        toggle.textContent = "Light Mode";
    }

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        toggle.textContent = isDark ? "Light Mode" : "Dark Mode";
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

// ── Active Navigation Link ────────────────────────────────────

function initActiveNav() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-links a");

    for (const link of links) {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("active");
        }
    }
}

// ── Initialize ────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initActiveNav();
});
```

## Step 4: the Home page (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyPortfolio -- Home</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<nav class="site-nav">
    <div class="nav-inner">
        <a href="index.html" class="nav-logo">MyPortfolio</a>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><button class="theme-toggle" id="theme-toggle">Dark Mode</button></li>
        </ul>
    </div>
</nav>

<main class="main-content">
    <section class="hero">
        <h1>Hi, I'm a Web Developer</h1>
        <p>I build things for the web using HTML, CSS, and JavaScript.
           Welcome to my portfolio -- have a look around.</p>
    </section>

    <section>
        <h2>Featured Projects</h2>
        <div class="card-grid">
            <div class="card">
                <h3>Weather App</h3>
                <p>A weather dashboard that fetches real-time data from an API and displays forecasts.</p>
                <div class="tags">
                    <span class="tag">JavaScript</span>
                    <span class="tag">API</span>
                </div>
            </div>
            <div class="card">
                <h3>Task Manager</h3>
                <p>A to-do list app with drag-and-drop, categories, and local storage persistence.</p>
                <div class="tags">
                    <span class="tag">JavaScript</span>
                    <span class="tag">CSS</span>
                </div>
            </div>
            <div class="card">
                <h3>Portfolio Site</h3>
                <p>This very website -- a multi-page portfolio built entirely with vanilla technologies.</p>
                <div class="tags">
                    <span class="tag">HTML</span>
                    <span class="tag">CSS</span>
                    <span class="tag">JavaScript</span>
                </div>
            </div>
        </div>
    </section>
</main>

<footer class="site-footer">
    <p>&copy; 2025 MyPortfolio. Built with vanilla HTML, CSS, and JavaScript.</p>
</footer>

<script src="js/main.js"></script>
</body>
</html>
```

## Step 5: project data (`data/projects.json`)

Store project data as JSON so we can load and filter it dynamically:

```json
[
    {
        "id": 1,
        "title": "Weather App",
        "description": "A weather dashboard that fetches real-time data from a public API and displays current conditions and 5-day forecasts.",
        "tags": ["JavaScript", "API", "CSS"],
        "url": "#"
    },
    {
        "id": 2,
        "title": "Task Manager",
        "description": "A full-featured to-do list with categories, priority levels, drag-and-drop reordering, and local storage persistence.",
        "tags": ["JavaScript", "CSS", "LocalStorage"],
        "url": "#"
    },
    {
        "id": 3,
        "title": "Portfolio Site",
        "description": "A multi-page personal portfolio built with vanilla HTML, CSS, and JavaScript. Includes theme switching and form validation.",
        "tags": ["HTML", "CSS", "JavaScript"],
        "url": "#"
    },
    {
        "id": 4,
        "title": "Calculator",
        "description": "A fully functional calculator with keyboard support, history, and a clean responsive interface.",
        "tags": ["JavaScript", "HTML", "CSS"],
        "url": "#"
    },
    {
        "id": 5,
        "title": "Quiz Game",
        "description": "An interactive quiz with timed questions, score tracking, and a results summary at the end.",
        "tags": ["JavaScript", "API"],
        "url": "#"
    },
    {
        "id": 6,
        "title": "Markdown Previewer",
        "description": "A split-pane editor that converts Markdown to HTML in real time as you type.",
        "tags": ["JavaScript", "HTML"],
        "url": "#"
    }
]
```

## Step 6: the Projects page (`projects.html` + `js/projects.js`)

### `projects.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyPortfolio -- Projects</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<nav class="site-nav">
    <div class="nav-inner">
        <a href="index.html" class="nav-logo">MyPortfolio</a>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><button class="theme-toggle" id="theme-toggle">Dark Mode</button></li>
        </ul>
    </div>
</nav>

<main class="main-content">
    <h1>Projects</h1>
    <p>Filter by technology or browse all projects.</p>

    <div class="filters" id="filters"></div>
    <div class="card-grid" id="project-list"></div>
    <p id="no-results" style="display: none; color: var(--color-text-muted);">
        No projects match this filter.
    </p>
</main>

<footer class="site-footer">
    <p>&copy; 2025 MyPortfolio. Built with vanilla HTML, CSS, and JavaScript.</p>
</footer>

<script src="js/main.js"></script>
<script src="js/projects.js"></script>
</body>
</html>
```

### `js/projects.js`

```js
// js/projects.js
"use strict";

async function initProjects() {
    const listContainer = document.querySelector("#project-list");
    const filtersContainer = document.querySelector("#filters");
    const noResults = document.querySelector("#no-results");

    if (!listContainer || !filtersContainer) return;

    // ── Load project data ─────────────────────────────────────

    let projects = [];

    try {
        const response = await fetch("data/projects.json");
        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status}`);
        }
        projects = await response.json();
    } catch (error) {
        listContainer.innerHTML = "";
        const errorP = document.createElement("p");
        errorP.textContent = `Error loading projects: ${error.message}`;
        errorP.style.color = "red";
        listContainer.appendChild(errorP);
        return;
    }

    // ── Build filter buttons ──────────────────────────────────

    const allTags = [...new Set(projects.flatMap((p) => p.tags))].sort();

    function createFilterButton(label, isActive) {
        const btn = document.createElement("button");
        btn.classList.add("filter-btn");
        if (isActive) btn.classList.add("active");
        btn.textContent = label;
        return btn;
    }

    const allBtn = createFilterButton("All", true);
    filtersContainer.appendChild(allBtn);

    for (const tag of allTags) {
        filtersContainer.appendChild(createFilterButton(tag, false));
    }

    // ── Render projects ───────────────────────────────────────

    function renderProjects(filter) {
        listContainer.innerHTML = "";

        const filtered = filter === "All"
            ? projects
            : projects.filter((p) => p.tags.includes(filter));

        if (filtered.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        for (const project of filtered) {
            const card = document.createElement("div");
            card.classList.add("card");

            const title = document.createElement("h3");
            title.textContent = project.title;

            const desc = document.createElement("p");
            desc.textContent = project.description;

            const tags = document.createElement("div");
            tags.classList.add("tags");
            for (const tag of project.tags) {
                const span = document.createElement("span");
                span.classList.add("tag");
                span.textContent = tag;
                tags.appendChild(span);
            }

            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(tags);
            listContainer.appendChild(card);
        }
    }

    // ── Filter click handler (delegation) ─────────────────────

    let activeFilter = "All";

    filtersContainer.addEventListener("click", (event) => {
        if (!event.target.classList.contains("filter-btn")) return;

        activeFilter = event.target.textContent;

        // Update active state
        for (const btn of filtersContainer.querySelectorAll(".filter-btn")) {
            btn.classList.toggle("active", btn.textContent === activeFilter);
        }

        renderProjects(activeFilter);
    });

    // ── Initial render ────────────────────────────────────────

    renderProjects("All");
}

document.addEventListener("DOMContentLoaded", initProjects);
```

## Step 7: the Contact page (`contact.html` + `js/contact.js`)

### `contact.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyPortfolio -- Contact</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<nav class="site-nav">
    <div class="nav-inner">
        <a href="index.html" class="nav-logo">MyPortfolio</a>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><button class="theme-toggle" id="theme-toggle">Dark Mode</button></li>
        </ul>
    </div>
</nav>

<main class="main-content">
    <h1>Contact Me</h1>
    <p>Send me a message and I will get back to you as soon as possible.</p>

    <form id="contact-form" style="max-width: 500px; margin-top: 32px;" novalidate>
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required minlength="2">
            <div class="error-text">Please enter your name (at least 2 characters).</div>
        </div>

        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
            <div class="error-text">Please enter a valid email address.</div>
        </div>

        <div class="form-group">
            <label for="subject">Subject</label>
            <input type="text" id="subject" name="subject" required minlength="3">
            <div class="error-text">Please enter a subject (at least 3 characters).</div>
        </div>

        <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="5" required minlength="10"></textarea>
            <div class="error-text">Please enter a message (at least 10 characters).</div>
        </div>

        <button type="submit" class="submit-btn">Send Message</button>
    </form>

    <div class="form-success" id="success-message">
        Thank you! Your message has been sent successfully.
    </div>
</main>

<footer class="site-footer">
    <p>&copy; 2025 MyPortfolio. Built with vanilla HTML, CSS, and JavaScript.</p>
</footer>

<script src="js/main.js"></script>
<script src="js/contact.js"></script>
</body>
</html>
```

### `js/contact.js`

```js
// js/contact.js
"use strict";

function initContactForm() {
    const form = document.querySelector("#contact-form");
    const successMessage = document.querySelector("#success-message");

    if (!form) return;

    // ── Validation rules ──────────────────────────────────────

    function validateField(input) {
        const group = input.closest(".form-group");
        let isValid = true;

        // Required check
        if (input.hasAttribute("required") && input.value.trim() === "") {
            isValid = false;
        }

        // Minlength check
        const minLength = input.getAttribute("minlength");
        if (minLength && input.value.trim().length < Number(minLength)) {
            isValid = false;
        }

        // Email format check
        if (input.type === "email" && input.value.trim() !== "") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                isValid = false;
            }
        }

        // Update UI
        if (isValid) {
            group.classList.remove("has-error");
        } else {
            group.classList.add("has-error");
        }

        return isValid;
    }

    // ── Real-time validation on blur ──────────────────────────

    const inputs = form.querySelectorAll("input, textarea");

    for (const input of inputs) {
        input.addEventListener("blur", () => {
            validateField(input);
        });

        // Clear error while typing
        input.addEventListener("input", () => {
            const group = input.closest(".form-group");
            if (group.classList.contains("has-error")) {
                validateField(input);
            }
        });
    }

    // ── Form submission ───────────────────────────────────────

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Validate all fields
        let allValid = true;
        for (const input of inputs) {
            if (!validateField(input)) {
                allValid = false;
            }
        }

        if (!allValid) {
            // Focus the first invalid field
            const firstError = form.querySelector(".has-error input, .has-error textarea");
            if (firstError) {
                firstError.focus();
            }
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // In a real app, you would send this to a server.
        // For this demo, we log it and show a success message.
        console.log("Form submitted:", data);

        // Show success message
        form.style.display = "none";
        successMessage.style.display = "block";

        // Reset after 5 seconds (for demo purposes)
        setTimeout(() => {
            form.reset();
            form.style.display = "block";
            successMessage.style.display = "none";

            // Clear any error states
            for (const group of form.querySelectorAll(".form-group")) {
                group.classList.remove("has-error");
            }
        }, 5000);
    });
}

document.addEventListener("DOMContentLoaded", initContactForm);
```

## Step 8: testing locally

### Option 1: VS Code Live Server

If you use VS Code, install the **Live Server** extension. Right-click `index.html` and select "Open with Live Server". It starts a local server with auto-reload.

### Option 2: Node.js `http-server`

Install a simple static server:

```bash
npm install -g http-server
```

Navigate to your project folder and run:

```bash
http-server -p 8080
```

Open `http://localhost:8080` in your browser.

### Option 3: Python's built-in server

If you have Python installed:

```bash
# Python 3
python3 -m http.server 8080
```

### What to test

Walk through this checklist:

- [ ] All three pages load without errors (check the browser console)
- [ ] Navigation links work and the active page is highlighted
- [ ] Theme toggle switches between light and dark mode
- [ ] Theme preference persists across page reloads
- [ ] Projects page loads project data and displays cards
- [ ] Filter buttons work -- clicking a technology shows only matching projects
- [ ] Contact form validates on blur and on submit
- [ ] Invalid fields show error messages and highlight red
- [ ] Submitting a valid form shows the success message
- [ ] The site looks good on mobile (resize your browser or use dev tools responsive mode)

## What you have built

This project uses everything from the previous chapters:

| Concept | Where it is used |
|---------|-----------------|
| Variables & types | Data storage, form values, boolean flags |
| Control flow | Validation logic, filter conditions |
| Functions | `initTheme`, `initProjects`, `validateField`, `renderProjects` |
| Arrays | Project list, filtering with `.filter()`, iterating with `for...of` |
| Objects | Project data, form data with `Object.fromEntries` |
| HTML & CSS | Page structure, flexbox layout, CSS custom properties |
| DOM manipulation | `createElement`, `querySelector`, `classList`, `textContent` |
| Events | Click handlers, form submit, input/blur for validation, delegation |
| Fetch API | Loading `projects.json` |
| localStorage | Theme persistence |

## Summary

You now have a complete, working multi-page website built entirely with vanilla HTML, CSS, and JavaScript. The site is:
- **Responsive** -- works on phones, tablets, and desktops
- **Accessible** -- semantic HTML, proper labels, keyboard-navigable forms
- **Interactive** -- theme toggle, filterable projects, form validation
- **Persistent** -- theme preference saved in localStorage

Next up: [Deploying to a VPS with Nginx](./12-deploy-vps-nginx.md) -- putting your site on the internet for the world to see.
