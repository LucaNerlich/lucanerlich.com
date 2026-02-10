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

Time to put everything together. In this chapter you will build a multi-page personal website using only HTML, CSS, and
vanilla JavaScript. This is the site we will deploy to a VPS in the next chapter.

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

Create `css/styles.css` with the full stylesheet. This covers the layout, components, and responsive behavior for all
pages:

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

If you use VS Code, install the **Live Server** extension. Right-click `index.html` and select "Open with Live Server".
It starts a local server with auto-reload.

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

| Concept           | Where it is used                                                    |
|-------------------|---------------------------------------------------------------------|
| Variables & types | Data storage, form values, boolean flags                            |
| Control flow      | Validation logic, filter conditions                                 |
| Functions         | `initTheme`, `initProjects`, `validateField`, `renderProjects`      |
| Arrays            | Project list, filtering with `.filter()`, iterating with `for...of` |
| Objects           | Project data, form data with `Object.fromEntries`                   |
| HTML & CSS        | Page structure, flexbox layout, CSS custom properties               |
| DOM manipulation  | `createElement`, `querySelector`, `classList`, `textContent`        |
| Events            | Click handlers, form submit, input/blur for validation, delegation  |
| Fetch API         | Loading `projects.json`                                             |
| localStorage      | Theme persistence                                                   |

## Multi-page site architecture

Our portfolio has three pages that share navigation, a footer, styles, and a theme toggle. This works, but as a site
grows, the duplicated HTML becomes a maintenance burden. This section covers how to link between pages properly, how to
structure a larger site, and how to eliminate repetition.

### Linking between pages

#### Relative vs absolute paths

Use **relative paths** when linking between pages on the same site:

```html
<!-- From index.html (root) -->
<a href="projects.html">Projects</a>
<a href="blog/post-1.html">First Post</a>

<!-- From blog/post-1.html (subfolder) -->
<a href="../index.html">Home</a>
<a href="../projects.html">Projects</a>
<a href="post-2.html">Next Post</a>
```

| Path               | Meaning                     |
|--------------------|-----------------------------|
| `projects.html`    | File in the same folder     |
| `blog/post-1.html` | File in a subfolder         |
| `../index.html`    | File one folder up          |
| `../../about.html` | File two folders up         |
| `/index.html`      | Absolute from the site root |

**Relative paths** are preferred because they work regardless of where the site is hosted (a subfolder, a different
domain, or locally). **Absolute paths** (starting with `/`) work too but break if the site is not at the domain root.

#### Anchor links (same-page navigation)

Link to a section within the same page using `#` and an `id`:

```html
<!-- Link -->
<a href="#contact-section">Jump to contact</a>

<!-- Target -->
<section id="contact-section">
    <h2>Contact</h2>
    <!-- ... -->
</section>
```

Combine with page links to jump to a section on a different page:

```html
<!-- From any page, jump to the "skills" section on the about page -->
<a href="about.html#skills">My Skills</a>
```

#### Navigation patterns

For consistent navigation across pages, always use the same HTML structure:

```html
<nav class="site-nav">
    <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="blog/index.html">Blog</a></li>
        <li><a href="contact.html">Contact</a></li>
    </ul>
</nav>
```

The `initActiveNav()` function in `main.js` automatically highlights the current page. This pattern works for any number
of pages -- just add more `<li>` entries.

#### External links

Always use the full URL and open in a new tab:

```html
<a href="https://github.com/username" target="_blank" rel="noopener noreferrer">GitHub</a>
```

`rel="noopener noreferrer"` is a security best practice -- it prevents the linked page from accessing your
`window.opener` object.

### Structuring a larger site

The three-page portfolio is simple, but real sites grow. Here is how to organize a site with more pages:

#### Flat structure (small sites -- up to ~10 pages)

```text
my-website/
├── index.html
├── about.html
├── projects.html
├── contact.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── projects.js
│   └── contact.js
├── images/
│   ├── hero.jpg
│   └── logo.svg
└── data/
    └── projects.json
```

All HTML pages live in the root. Works well when there are few pages.

#### Nested structure (medium to large sites)

```text
my-website/
├── index.html
├── about.html
├── contact.html
├── blog/
│   ├── index.html          # Blog listing page
│   ├── post-1.html
│   ├── post-2.html
│   └── post-3.html
├── projects/
│   ├── index.html          # Projects listing page
│   ├── weather-app.html    # Individual project pages
│   └── task-manager.html
├── css/
│   ├── base.css            # Reset, variables, typography
│   ├── layout.css          # Nav, footer, grid, containers
│   └── components.css      # Cards, buttons, forms, tags
├── js/
│   ├── main.js             # Shared (theme, nav)
│   ├── blog.js             # Blog-specific
│   ├── projects.js         # Projects-specific
│   └── contact.js          # Contact-specific
├── images/
│   ├── blog/
│   ├── projects/
│   └── shared/
└── data/
    └── projects.json
```

Key principles:

1. **Group pages by section** -- blog posts in `blog/`, project pages in `projects/`
2. **Each section gets an `index.html`** -- this is the listing or landing page for that section
3. **Split CSS by concern** -- base styles, layout, and components in separate files
4. **Mirror the folder structure in images and JS** -- keeps things predictable
5. **Keep shared assets at the top level** -- `css/`, `js/`, and `images/shared/`

#### Loading multiple CSS files

Split styles across files and load them in order:

```html
<head>
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/layout.css">
    <link rel="stylesheet" href="/css/components.css">
</head>
```

`base.css` defines variables and resets, `layout.css` uses them for page structure, and `components.css` styles
individual elements. This order matters -- later files can override earlier ones.

### Reusing code across pages

The biggest pain point of vanilla multi-page sites is duplicated HTML. Every page repeats the same `<nav>`, `<footer>`,
and `<head>` content. Here are several strategies to reduce that repetition.

#### Strategy 1: JavaScript-injected components

Load shared HTML from a separate file using `fetch()`:

Create `components/nav.html`:

```html
<nav class="site-nav">
    <div class="nav-inner">
        <a href="/index.html" class="nav-logo">MyPortfolio</a>
        <ul class="nav-links">
            <li><a href="/index.html">Home</a></li>
            <li><a href="/projects.html">Projects</a></li>
            <li><a href="/blog/index.html">Blog</a></li>
            <li><a href="/contact.html">Contact</a></li>
            <li><button class="theme-toggle" id="theme-toggle">Dark Mode</button></li>
        </ul>
    </div>
</nav>
```

Create `components/footer.html`:

```html
<footer class="site-footer">
    <p>&copy; 2025 MyPortfolio. Built with vanilla HTML, CSS, and JavaScript.</p>
</footer>
```

Add a loader function to `js/main.js`:

```js
async function loadComponent(selector, path) {
    const element = document.querySelector(selector);
    if (!element) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        element.innerHTML = await response.text();
    } catch (error) {
        console.error(`Error loading component: ${error.message}`);
    }
}
```

Now each page just has placeholder elements:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyPortfolio -- About</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<!-- Placeholders for shared components -->
<div id="nav-placeholder"></div>

<main class="main-content">
    <h1>About Me</h1>
    <p>This is the only content unique to this page.</p>
</main>

<div id="footer-placeholder"></div>

<script src="js/main.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", async () => {
        await loadComponent("#nav-placeholder", "components/nav.html");
        await loadComponent("#footer-placeholder", "components/footer.html");
        // Run init functions after components are loaded
        initTheme();
        initActiveNav();
    });
</script>
</body>
</html>
```

**Pros:** Single source of truth for nav and footer. Change once, every page updates.

**Cons:** Requires a web server (will not work by opening `file://` directly). A brief flash may occur before components
load.

#### Strategy 2: reusable CSS utility classes

Instead of writing custom CSS for every element, create reusable utility classes:

```css
/* Spacing */
.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 32px; }
.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }

/* Text */
.text-center { text-align: center; }
.text-muted  { color: var(--color-text-muted); }
.text-small  { font-size: 0.875rem; }

/* Display */
.hidden      { display: none; }
.flex        { display: flex; }
.flex-wrap   { flex-wrap: wrap; }
.gap-1       { gap: 8px; }
.gap-2       { gap: 16px; }

/* Containers */
.container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 24px;
}
```

Now new pages need less custom CSS:

```html
<section class="container mt-4">
    <h2 class="mb-2">Latest Posts</h2>
    <div class="card-grid">
        <!-- cards -->
    </div>
</section>
```

#### Strategy 3: CSS custom properties for theming

We already use CSS custom properties for the theme. Take this further to create a consistent design system:

```css
:root {
    /* Spacing scale */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;

    /* Font sizes */
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 2rem;

    /* Consistent radius and shadow */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
}
```

Every component uses these variables instead of hardcoded values. When you want to adjust spacing or sizing across the
entire site, change one variable.

#### Strategy 4: shared JavaScript modules

Reuse logic by splitting it into focused files:

```text
js/
├── main.js          # Entry point -- loads everything
├── theme.js         # Theme toggle logic
├── nav.js           # Active nav highlighting
├── validation.js    # Form validation (reusable)
└── api.js           # Shared fetch helpers
```

Create a reusable validation module (`js/validation.js`):

```js
"use strict";

function validateRequired(value) {
    return value.trim() !== "";
}

function validateMinLength(value, min) {
    return value.trim().length >= min;
}

function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateField(input) {
    const group = input.closest(".form-group");
    let isValid = true;

    if (input.hasAttribute("required") && !validateRequired(input.value)) {
        isValid = false;
    }

    const minLength = input.getAttribute("minlength");
    if (minLength && !validateMinLength(input.value, Number(minLength))) {
        isValid = false;
    }

    if (input.type === "email" && input.value.trim() !== "") {
        if (!validateEmail(input.value)) {
            isValid = false;
        }
    }

    group.classList.toggle("has-error", !isValid);
    return isValid;
}
```

Now any page with a form can reuse the same validation:

```html
<!-- contact.html -->
<script src="js/validation.js"></script>
<script src="js/contact.js"></script>

<!-- newsletter.html -->
<script src="js/validation.js"></script>
<script src="js/newsletter.js"></script>
```

Both forms get the same validation behavior without duplicating a single line.

#### Strategy 5: data-driven pages

Instead of creating a separate HTML file for each project or blog post, generate pages from data:

```js
// Read the project ID from the URL: project.html?id=3
const params = new URLSearchParams(window.location.search);
const projectId = Number(params.get("id"));

async function loadProject() {
    const response = await fetch("data/projects.json");
    const projects = await response.json();
    const project = projects.find(p => p.id === projectId);

    if (!project) {
        document.querySelector(".main-content").innerHTML = "<h1>Project not found</h1>";
        return;
    }

    document.querySelector("#project-title").textContent = project.title;
    document.querySelector("#project-description").textContent = project.description;
    // ... render the rest
}

document.addEventListener("DOMContentLoaded", loadProject);
```

Now one `project.html` template serves every project. Link to individual projects like this:

```html
<a href="project.html?id=1">Weather App</a>
<a href="project.html?id=2">Task Manager</a>
```

This avoids creating dozens of nearly identical HTML files. The same pattern works for blog posts, team members, product
pages -- any content that shares a structure.

### When to reach for a framework

These strategies work well for small to medium sites (up to ~20-30 pages). Beyond that, you start fighting the
limitations of vanilla HTML:

| Problem                        | Framework solution                                        |
|--------------------------------|-----------------------------------------------------------|
| Duplicated HTML across pages   | Component-based architecture (React, Vue, Svelte)         |
| No templating language         | JSX, Vue templates, Svelte markup                         |
| Manual routing                 | Client-side router or file-based routing (Next.js, Astro) |
| No build step for optimization | Bundlers (Vite, webpack) with minification, tree-shaking  |
| Managing state across pages    | Global state management (Redux, Zustand, Pinia)           |

If you find yourself spending more time managing repetition than building features, it is time to consider a framework.
But understanding vanilla HTML/CSS/JS first makes learning any framework much easier -- you know what the framework is
abstracting away.

Before jumping to a framework though, there is a built-in browser feature that solves the component problem without any
library: **Web Components**.

### Web Components

Web Components are a set of browser-native APIs that let you create **custom, reusable HTML elements** with their own
encapsulated markup, styles, and behavior. No framework, no build step, no npm install -- they work in every modern
browser.

#### The three core APIs

| API                 | What it does                                        |
|---------------------|-----------------------------------------------------|
| **Custom Elements** | Define new HTML tags (`<my-nav>`, `<project-card>`) |
| **Shadow DOM**      | Encapsulate styles so they do not leak in or out    |
| **HTML Templates**  | Define reusable markup fragments with `<template>`  |

#### Your first custom element

Let us solve our portfolio's biggest problem -- the duplicated nav -- with a Web Component:

```js
// js/components/site-nav.js

class SiteNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
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
        `;
    }
}

customElements.define("site-nav", SiteNav);
```

Now every page just uses the custom tag:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyPortfolio -- About</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<site-nav></site-nav>

<main class="main-content">
    <h1>About Me</h1>
    <p>Only the unique content lives in the HTML file.</p>
</main>

<site-footer></site-footer>

<script src="js/components/site-nav.js"></script>
<script src="js/components/site-footer.js"></script>
<script src="js/main.js"></script>
</body>
</html>
```

Change the nav once in `site-nav.js` and every page updates. No `fetch()`, no server required, no flash of unstyled
content.

**How it works:**

1. `class SiteNav extends HTMLElement` -- create a class that extends the base HTML element
2. `connectedCallback()` -- runs automatically when the element is inserted into the page
3. `customElements.define("site-nav", SiteNav)` -- register the tag name (must contain a hyphen)

#### Adding the Shadow DOM for style encapsulation

Without the Shadow DOM, a component's styles can conflict with the rest of the page. The Shadow DOM creates an isolated
scope:

```js
// js/components/alert-banner.js

class AlertBanner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const type = this.getAttribute("type") || "info";
        const message = this.textContent;

        const colors = {
            info:    { bg: "#e3f2fd", border: "#1976d2", text: "#0d47a1" },
            success: { bg: "#e8f5e9", border: "#388e3c", text: "#1b5e20" },
            warning: { bg: "#fff3e0", border: "#f57c00", text: "#e65100" },
            error:   { bg: "#ffebee", border: "#d32f2f", text: "#b71c1c" },
        };

        const c = colors[type] || colors.info;

        this.shadowRoot.innerHTML = `
            <style>
                .banner {
                    padding: 12px 16px;
                    border-left: 4px solid ${c.border};
                    background: ${c.bg};
                    color: ${c.text};
                    border-radius: 4px;
                    font-family: inherit;
                    margin: 8px 0;
                }
            </style>
            <div class="banner">${message}</div>
        `;
    }
}

customElements.define("alert-banner", AlertBanner);
```

Use it anywhere:

```html
<alert-banner type="success">Your message has been sent.</alert-banner>
<alert-banner type="error">Something went wrong. Please try again.</alert-banner>
<alert-banner type="info">New features are available.</alert-banner>
```

The `.banner` styles inside the Shadow DOM will **never** conflict with `.banner` classes elsewhere on the page. This is
true encapsulation -- no CSS naming conventions or BEM needed.

#### Using attributes and properties

Components become truly reusable when they accept configuration through attributes:

```js
// js/components/project-card.js

class ProjectCard extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("title") || "Untitled";
        const description = this.getAttribute("description") || "";
        const tags = (this.getAttribute("tags") || "").split(",").filter(Boolean);
        const url = this.getAttribute("url") || "#";

        this.innerHTML = `
            <div class="card">
                <h3><a href="${url}">${title}</a></h3>
                <p>${description}</p>
                <div class="tags">
                    ${tags.map(tag => `<span class="tag">${tag.trim()}</span>`).join("")}
                </div>
            </div>
        `;
    }
}

customElements.define("project-card", ProjectCard);
```

Now the HTML is clean and declarative:

```html
<div class="card-grid">
    <project-card
        title="Weather App"
        description="A weather dashboard that fetches real-time data from an API."
        tags="JavaScript, API, CSS"
        url="#"
    ></project-card>

    <project-card
        title="Task Manager"
        description="A to-do list with drag-and-drop and local storage."
        tags="JavaScript, CSS"
        url="#"
    ></project-card>
</div>
```

#### Reacting to attribute changes

Use `observedAttributes` and `attributeChangedCallback` to update the component when attributes change:

```js
class UserBadge extends HTMLElement {
    static observedAttributes = ["name", "role"];

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute("name") || "Anonymous";
        const role = this.getAttribute("role") || "user";

        this.shadowRoot.innerHTML = `
            <style>
                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-family: inherit;
                    background: ${role === "admin" ? "#e3f2fd" : "#f5f5f5"};
                    border: 1px solid ${role === "admin" ? "#1976d2" : "#ddd"};
                }
                .role {
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                }
            </style>
            <span class="badge">
                <span>${name}</span>
                <span class="role">${role}</span>
            </span>
        `;
    }
}

customElements.define("user-badge", UserBadge);
```

```html
<user-badge name="Ada" role="admin"></user-badge>
<user-badge name="Grace" role="editor"></user-badge>
```

Change an attribute from JavaScript and the component re-renders automatically:

```js
document.querySelector("user-badge").setAttribute("role", "viewer");
```

#### Using `<template>` and `<slot>`

The `<template>` element defines markup that is not rendered until cloned. Combine it with `<slot>` to let the consumer
pass content into the component:

```html
<!-- Define the template (once, anywhere in the page) -->
<template id="card-template">
    <style>
        .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            font-family: inherit;
        }
        .card-header {
            font-weight: 700;
            margin-bottom: 8px;
        }
    </style>
    <div class="card">
        <div class="card-header"><slot name="title">Default Title</slot></div>
        <div class="card-body"><slot>Default content</slot></div>
    </div>
</template>
```

```js
class FancyCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        const template = document.getElementById("card-template");
        shadow.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("fancy-card", FancyCard);
```

Use it with slotted content:

```html
<fancy-card>
    <span slot="title">My Custom Title</span>
    <p>This paragraph goes into the default slot.</p>
</fancy-card>
```

Slots let consumers inject their own content while the component controls the layout and styling. This is the same
concept as "children" or "slots" in React, Vue, and Svelte.

#### Lifecycle methods summary

| Method                                           | When it runs                                  |
|--------------------------------------------------|-----------------------------------------------|
| `constructor()`                                  | Element is created (use for Shadow DOM setup) |
| `connectedCallback()`                            | Element is added to the page                  |
| `disconnectedCallback()`                         | Element is removed from the page              |
| `attributeChangedCallback(name, oldVal, newVal)` | An observed attribute changes                 |
| `adoptedCallback()`                              | Element is moved to a new document (rare)     |

#### Organizing components in a project

```text
my-website/
├── js/
│   ├── main.js
│   └── components/
│       ├── site-nav.js
│       ├── site-footer.js
│       ├── project-card.js
│       ├── alert-banner.js
│       └── user-badge.js
├── css/
│   └── styles.css
└── index.html
```

Each component lives in its own file. Load them with `<script>` tags or, in a project with a build step, use `import`:

```js
// With ES modules (requires type="module" on the script tag)
import "./components/site-nav.js";
import "./components/site-footer.js";
import "./components/project-card.js";
```

#### When to use Web Components vs a framework

| Use Web Components when...                                  | Use a framework when...                          |
|-------------------------------------------------------------|--------------------------------------------------|
| You want zero dependencies                                  | You need complex state management                |
| You are building a small/medium site                        | You are building a large single-page app         |
| You want components that work with any framework            | You need server-side rendering                   |
| You are building a shared design system / component library | You need a rich ecosystem of plugins and tooling |
| You want maximum browser compatibility                      | You want a large community and hiring pool       |

Web Components and frameworks are not mutually exclusive. Many teams build Web Components for their shared design system
and use them inside React, Vue, or Angular apps. The browser-native approach means the components work everywhere
without framework lock-in.

## Summary

You now have a complete, working multi-page website built entirely with vanilla HTML, CSS, and JavaScript. The site is:

- **Responsive** -- works on phones, tablets, and desktops
- **Accessible** -- semantic HTML, proper labels, keyboard-navigable forms
- **Interactive** -- theme toggle, filterable projects, form validation
- **Persistent** -- theme preference saved in localStorage

Next up: [Deploying to a VPS with Nginx](./12-deploy-vps-nginx.md) -- putting your site on the internet for the world to
see.
