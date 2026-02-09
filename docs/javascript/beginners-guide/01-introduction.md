---
title: "Introduction & Environment Setup"
sidebar_label: "Introduction"
description: What JavaScript is, where it runs, how to set up your development environment, and writing your first program.
slug: /javascript/beginners-guide/introduction
tags: [javascript, beginners]
keywords:
  - javascript introduction
  - learn javascript
  - javascript setup
  - node.js install
  - browser console
sidebar_position: 1
---

# Introduction & Environment Setup

JavaScript is the programming language of the web. Every modern browser runs it, and with Node.js it runs on servers too. This guide takes you from zero to deploying a website on a VPS with nginx — no prior programming experience required.

## What is JavaScript?

JavaScript is a **high-level, interpreted programming language**. That means you write human-readable code and the computer executes it directly — no separate compilation step needed.

Three facts to remember:

1. **It runs in every browser.** Open any website, and JavaScript is powering the interactive parts.
2. **It runs on servers.** Node.js lets you use JavaScript outside the browser.
3. **It is dynamically typed.** You do not need to declare what kind of data a variable holds.

JavaScript was created in 1995 by Brendan Eich at Netscape. Despite the name, it has nothing to do with Java. Today it is one of the most widely used programming languages in the world.

## Where JavaScript runs

### The browser

Every web browser (Chrome, Firefox, Safari, Edge) has a built-in **JavaScript engine**:

| Browser | Engine      |
|---------|-------------|
| Chrome  | V8          |
| Firefox | SpiderMonkey|
| Safari  | JavaScriptCore |
| Edge    | V8          |

When you load a web page, the browser reads the HTML, applies the CSS, and executes any JavaScript it finds. This is **client-side** JavaScript.

### Node.js

Node.js takes Chrome's V8 engine and runs it outside the browser. This lets you use JavaScript for:

- Web servers
- Command-line tools
- File system operations
- Anything a general-purpose language can do

This is **server-side** JavaScript.

### Which one will we use?

Both. We start with Node.js for learning fundamentals (it is simpler to run a script in the terminal), then move to the browser when we start working with HTML and the DOM.

## Setting up your environment

You need three things:

1. **Node.js** — to run JavaScript in the terminal
2. **A code editor** — to write your code
3. **A web browser** — to test browser-based code

### Installing Node.js

Go to [https://nodejs.org](https://nodejs.org) and download the **LTS** (Long Term Support) version. LTS is the stable, recommended release.

**macOS (with Homebrew):**

```bash
brew install node
```

**Windows:**

Download the `.msi` installer from nodejs.org and run it. Accept the defaults.

**Linux (Ubuntu/Debian):**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify the installation

Open a terminal and run:

```bash
node --version
```

Result:
```text
v22.13.1
```

The exact version number will differ — anything `v18` or higher is fine.

Also check that `npm` (Node Package Manager) is installed:

```bash
npm --version
```

Result:
```text
10.9.2
```

### Choosing a code editor

Use any editor you like. Popular choices:

| Editor | Notes |
|--------|-------|
| **VS Code** | Free, excellent JavaScript support, huge extension ecosystem |
| **Cursor** | AI-powered fork of VS Code |
| **WebStorm** | Paid, powerful refactoring and debugging tools |
| **Sublime Text** | Lightweight and fast |

If you have no preference, start with [VS Code](https://code.visualstudio.com/) — it is free and has the best JavaScript tooling out of the box.

### Using the browser console

Every browser has a built-in JavaScript console. To open it:

- **Chrome/Edge:** `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (macOS)
- **Firefox:** `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Option+K` (macOS)
- **Safari:** Enable the Develop menu in Preferences → Advanced, then `Cmd+Option+C`

Type this into the console and press Enter:

```js
console.log("Hello from the browser!");
```

Result:
```text
Hello from the browser!
```

The console is useful for quick experiments. For anything longer than a few lines, use a file.

## Your first JavaScript program

### Running JavaScript with Node.js

Create a file called `hello.js`:

```js
console.log("Hello, world!");
```

Open a terminal, navigate to the folder containing the file, and run:

```bash
node hello.js
```

Result:
```text
Hello, world!
```

That is it. You just ran your first JavaScript program.

### Running JavaScript in the browser

Create a file called `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello from HTML</h1>
    <script>
        console.log("Hello from a script tag!");
        document.body.innerHTML += "<p>JavaScript added this paragraph.</p>";
    </script>
</body>
</html>
```

Open this file in your browser (double-click it or drag it into the browser window). You will see the heading and the paragraph that JavaScript added. Open the console and you will see the log message.

### Linking an external script

Inline scripts work, but it is better practice to keep JavaScript in separate files. Create `app.js`:

```js
console.log("Hello from an external file!");
document.body.innerHTML += "<p>This came from app.js</p>";
```

Update `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello from HTML</h1>
    <script src="app.js"></script>
</body>
</html>
```

Refresh the page. Same result, but now your JavaScript lives in its own file.

## Comments

Comments are notes in your code that JavaScript ignores. Use them to explain **why** something is done, not **what** it does.

```js
// This is a single-line comment

/*
  This is a multi-line comment.
  It can span several lines.
*/

console.log("Comments do not affect execution"); // inline comment
```

Result:
```text
Comments do not affect execution
```

## Semicolons

JavaScript has **automatic semicolon insertion** (ASI) — the engine adds semicolons for you in most cases. However, relying on ASI can cause subtle bugs. The convention in this guide is to **always use semicolons**:

```js
// Recommended
const name = "Ada";
console.log(name);

// Works but not recommended
const name2 = "Grace"
console.log(name2)
```

Both produce the same result, but explicit semicolons make your intent clear.

## Strict mode

Adding `"use strict";` at the top of a file enables stricter parsing and error handling:

```js
"use strict";

// This would silently fail without strict mode,
// but now it throws an error:
undeclaredVariable = 42; // ReferenceError: undeclaredVariable is not defined
```

Strict mode catches common mistakes like:
- Using undeclared variables
- Assigning to read-only properties
- Duplicating parameter names

Always use strict mode. In modern JavaScript modules (which we will cover later), strict mode is enabled automatically.

## How this guide is structured

| Part | Chapters | What you will learn |
|------|----------|-------------------|
| **1 — Fundamentals** | 1–6 | Variables, types, control flow, functions, arrays, objects |
| **2 — The Browser** | 7–10 | HTML/CSS basics, DOM manipulation, events, fetching data |
| **3 — Build & Deploy** | 11–12 | Build a complete website, deploy it to a VPS with nginx |

Each chapter builds on the previous one. Code examples include expected output so you can verify your work. By chapter 12, you will have a website live on the internet.

## Summary

- JavaScript runs in browsers (client-side) and in Node.js (server-side).
- Install Node.js LTS to run JavaScript from the terminal.
- Use any code editor — VS Code is a solid default.
- `console.log()` prints output to the terminal or browser console.
- Use semicolons and strict mode for cleaner, safer code.

Next up: [Variables, Types & Operators](./02-variables-and-types.md) — where you will learn how to store and work with data.
