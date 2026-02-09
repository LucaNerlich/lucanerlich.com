---
title: "The DOM"
sidebar_label: "The DOM"
description: Learn how JavaScript interacts with web pages through the DOM — selecting elements, modifying content, creating and removing elements, and traversing the tree.
slug: /javascript/beginners-guide/the-dom
tags: [javascript, beginners, dom]
keywords:
  - javascript dom
  - querySelector
  - DOM manipulation
  - createElement
  - DOM traversal
sidebar_position: 8
---

# The DOM

The **Document Object Model** (DOM) is the browser's representation of an HTML page as a tree of objects. JavaScript uses the DOM to read and change anything on the page — text, styles, attributes, structure, everything.

## What is the DOM?

When the browser loads an HTML file, it parses the markup and builds a tree structure:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello</h1>
    <p>World</p>
</body>
</html>
```

Becomes this tree:

```text
document
└── html
    ├── head
    │   └── title
    │       └── "My Page"
    └── body
        ├── h1
        │   └── "Hello"
        └── p
            └── "World"
```

Every tag becomes a **node** (an object) in this tree. JavaScript can access and modify any node through the global `document` object.

## Selecting elements

### `querySelector` — select one element

Returns the **first** element that matches a CSS selector:

```js
// By tag
const heading = document.querySelector("h1");
console.log(heading.textContent);

// By class
const card = document.querySelector(".card");

// By ID
const nav = document.querySelector("#main-nav");

// By attribute
const emailInput = document.querySelector('input[type="email"]');

// Nested selector
const firstLink = document.querySelector("nav a");
```

If no element matches, `querySelector` returns `null`. Always check before using:

```js
const element = document.querySelector(".nonexistent");
if (element) {
    console.log(element.textContent);
} else {
    console.log("Element not found");
}
```

Result:
```text
Element not found
```

### `querySelectorAll` — select multiple elements

Returns a **NodeList** of all matching elements:

```js
const paragraphs = document.querySelectorAll("p");
console.log(paragraphs.length);

// Iterate with for...of
for (const p of paragraphs) {
    console.log(p.textContent);
}

// Or with forEach
paragraphs.forEach((p, index) => {
    console.log(`Paragraph ${index}: ${p.textContent}`);
});
```

A NodeList is **not** an array. It supports `forEach` and `for...of`, but not `map`, `filter`, etc. To use array methods, convert it:

```js
const items = document.querySelectorAll("li");
const texts = Array.from(items).map((li) => li.textContent);
console.log(texts);

// Alternative: spread operator
const texts2 = [...items].map((li) => li.textContent);
```

### Older selection methods

You will see these in existing code:

```js
// By ID (returns one element)
const header = document.getElementById("header");

// By class name (returns live HTMLCollection)
const cards = document.getElementsByClassName("card");

// By tag name (returns live HTMLCollection)
const divs = document.getElementsByTagName("div");
```

`querySelector` and `querySelectorAll` are more flexible and are the modern standard. Use them.

## Modifying text content

### `textContent`

Gets or sets the text of an element (ignores HTML):

```html
<p id="greeting">Hello, <strong>world</strong>!</p>
```

```js
const p = document.querySelector("#greeting");

// Read
console.log(p.textContent);

// Write (replaces all content, including child elements)
p.textContent = "Goodbye, world!";
console.log(p.textContent);
```

Result:
```text
Hello, world!
Goodbye, world!
```

### `innerHTML`

Gets or sets the HTML content (parses HTML tags):

```html
<div id="content">
    <p>Original content</p>
</div>
```

```js
const div = document.querySelector("#content");

// Read
console.log(div.innerHTML);

// Write (replaces content with parsed HTML)
div.innerHTML = "<h2>New Title</h2><p>New paragraph</p>";
```

**Security warning:** Never use `innerHTML` with user input — it creates a Cross-Site Scripting (XSS) vulnerability:

```js
// DANGEROUS — never do this
const userInput = '<img src=x onerror="alert(\'hacked\')">';
div.innerHTML = userInput; // executes the attack

// SAFE — use textContent for user input
div.textContent = userInput; // displays as plain text
```

Use `textContent` for plain text. Use `innerHTML` only with trusted, hardcoded content. For building complex elements safely, use `createElement` (covered below).

## Modifying attributes

### `getAttribute` / `setAttribute`

```html
<a id="link" href="https://example.com" target="_blank">Example</a>
```

```js
const link = document.querySelector("#link");

// Read
console.log(link.getAttribute("href"));
console.log(link.getAttribute("target"));

// Write
link.setAttribute("href", "https://mozilla.org");
console.log(link.getAttribute("href"));

// Remove
link.removeAttribute("target");
console.log(link.getAttribute("target"));
```

Result:
```text
https://example.com
_blank
https://mozilla.org
null
```

### Direct property access

Many attributes are available as properties:

```js
const link = document.querySelector("#link");

// These are equivalent:
console.log(link.href);
console.log(link.getAttribute("href"));

// For boolean attributes:
const input = document.querySelector("input");
input.disabled = true;
input.required = false;

// For value:
const textInput = document.querySelector('input[type="text"]');
textInput.value = "New value";
console.log(textInput.value);
```

### `dataset` — custom data attributes

HTML `data-*` attributes are accessible via `dataset`:

```html
<div id="user" data-user-id="42" data-role="admin">Ada</div>
```

```js
const div = document.querySelector("#user");

console.log(div.dataset.userId); // camelCase conversion
console.log(div.dataset.role);

// Set a new data attribute
div.dataset.status = "active";
// This adds data-status="active" to the HTML
```

Result:
```text
42
admin
```

## Modifying CSS classes

### `classList`

The modern way to work with CSS classes:

```js
const box = document.querySelector(".box");

// Add a class
box.classList.add("highlighted");

// Remove a class
box.classList.remove("old-style");

// Toggle (add if missing, remove if present)
box.classList.toggle("active");

// Check if a class exists
console.log(box.classList.contains("highlighted"));

// Replace a class
box.classList.replace("highlighted", "selected");

// Add multiple classes
box.classList.add("bold", "large", "rounded");
```

### `className`

Gets or sets the entire class string (overwrites all classes):

```js
const box = document.querySelector(".box");

console.log(box.className); // "box highlighted"
box.className = "new-class"; // replaces everything
```

Prefer `classList` — it is safer because it does not overwrite existing classes.

## Modifying inline styles

```js
const box = document.querySelector(".box");

// Set individual properties (camelCase)
box.style.backgroundColor = "#ff0000";
box.style.padding = "20px";
box.style.borderRadius = "8px";
box.style.fontSize = "18px";

// Read
console.log(box.style.backgroundColor);

// Remove a style
box.style.padding = "";
```

Note: `element.style` only reads **inline** styles. To read computed styles (including CSS file styles):

```js
const box = document.querySelector(".box");
const computed = getComputedStyle(box);

console.log(computed.fontSize);
console.log(computed.color);
```

For most styling, **add/remove CSS classes** instead of setting inline styles. It keeps your JavaScript clean and your styles in CSS where they belong.

## Creating elements

### `createElement` and `appendChild`

```js
// Create a new element
const paragraph = document.createElement("p");
paragraph.textContent = "This paragraph was created with JavaScript.";
paragraph.classList.add("dynamic");

// Add it to the page
document.body.appendChild(paragraph);
```

### Building complex structures

```js
function createCard(title, description) {
    const card = document.createElement("div");
    card.classList.add("card");

    const h3 = document.createElement("h3");
    h3.textContent = title;

    const p = document.createElement("p");
    p.textContent = description;

    card.appendChild(h3);
    card.appendChild(p);

    return card;
}

const container = document.querySelector(".grid");
container.appendChild(createCard("Card 1", "First card description"));
container.appendChild(createCard("Card 2", "Second card description"));
```

### `insertBefore`

Insert an element before a specific child:

```js
const list = document.querySelector("ul");
const newItem = document.createElement("li");
newItem.textContent = "Inserted item";

// Insert before the second child
const secondItem = list.children[1];
list.insertBefore(newItem, secondItem);
```

### `insertAdjacentHTML`

Insert HTML at specific positions:

```js
const heading = document.querySelector("h1");

// beforebegin — before the element
heading.insertAdjacentHTML("beforebegin", "<p>Before the heading</p>");

// afterbegin — inside, at the start
heading.insertAdjacentHTML("afterbegin", "<span>★ </span>");

// beforeend — inside, at the end
heading.insertAdjacentHTML("beforeend", "<span> ★</span>");

// afterend — after the element
heading.insertAdjacentHTML("afterend", "<p>After the heading</p>");
```

**Same security warning as `innerHTML`:** do not use with user input.

## Removing elements

```js
// Remove a specific element
const element = document.querySelector(".remove-me");
element.remove();

// Remove a child
const list = document.querySelector("ul");
const firstItem = list.firstElementChild;
list.removeChild(firstItem);

// Remove all children
const container = document.querySelector(".container");
container.innerHTML = ""; // quick but creates XSS risk if mixed with user content

// Safer way to clear children
while (container.firstChild) {
    container.removeChild(container.firstChild);
}
```

## Cloning elements

```js
const original = document.querySelector(".card");

// Shallow clone (element only, no children)
const shallow = original.cloneNode(false);

// Deep clone (element and all descendants)
const deep = original.cloneNode(true);

document.body.appendChild(deep);
```

## Traversing the DOM

Navigate between related elements:

```html
<ul id="menu">
    <li>Home</li>
    <li>About</li>
    <li>Contact</li>
</ul>
```

```js
const list = document.querySelector("#menu");

// Children
console.log(list.children.length);
console.log(list.firstElementChild.textContent);
console.log(list.lastElementChild.textContent);

// Parent
const firstItem = list.firstElementChild;
console.log(firstItem.parentElement.id);

// Siblings
const about = list.children[1];
console.log(about.previousElementSibling.textContent);
console.log(about.nextElementSibling.textContent);

// Closest ancestor matching a selector
const item = document.querySelector("li");
const closestUl = item.closest("ul");
console.log(closestUl.id);
```

Result:
```text
3
Home
Contact
menu
Home
Contact
menu
```

### Element vs Node traversal

| Element property | Node property | Difference |
|-----------------|---------------|------------|
| `children` | `childNodes` | `childNodes` includes text nodes and comments |
| `firstElementChild` | `firstChild` | Same |
| `parentElement` | `parentNode` | Same |
| `nextElementSibling` | `nextSibling` | Same |

Use the **Element** versions (left column) unless you specifically need to work with text nodes.

## Document fragments

When adding many elements, using a `DocumentFragment` avoids repeated reflows:

```js
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
    const li = document.createElement("li");
    li.textContent = `Item ${i + 1}`;
    fragment.appendChild(li);
}

// One single DOM update instead of 100
document.querySelector("ul").appendChild(fragment);
```

## Getting element dimensions and position

```js
const box = document.querySelector(".box");

// Size including padding and border
const rect = box.getBoundingClientRect();
console.log(`Width: ${rect.width}, Height: ${rect.height}`);
console.log(`Top: ${rect.top}, Left: ${rect.left}`);
console.log(`Bottom: ${rect.bottom}, Right: ${rect.right}`);

// Size properties
console.log(`offsetWidth: ${box.offsetWidth}`);   // width + padding + border
console.log(`clientWidth: ${box.clientWidth}`);    // width + padding (no border)
console.log(`scrollHeight: ${box.scrollHeight}`);  // total scrollable height
```

## Practical example: building a list from data

```html
<div id="app">
    <h1>Users</h1>
    <ul id="user-list"></ul>
</div>
```

```js
const users = [
    { name: "Ada", role: "Admin" },
    { name: "Bob", role: "User" },
    { name: "Charlie", role: "User" },
    { name: "Diana", role: "Moderator" },
];

const list = document.querySelector("#user-list");

for (const user of users) {
    const li = document.createElement("li");

    const nameSpan = document.createElement("strong");
    nameSpan.textContent = user.name;

    const roleSpan = document.createElement("span");
    roleSpan.textContent = ` — ${user.role}`;

    li.appendChild(nameSpan);
    li.appendChild(roleSpan);
    list.appendChild(li);
}
```

This renders:
```text
• Ada — Admin
• Bob — User
• Charlie — User
• Diana — Moderator
```

## When to use which approach

| Task | Method |
|------|--------|
| Set plain text | `textContent` |
| Set HTML from trusted source | `innerHTML` (never with user input) |
| Build elements from user data | `createElement` + `textContent` |
| Add/remove CSS classes | `classList.add()` / `.remove()` / `.toggle()` |
| Change styles dynamically | Prefer toggling classes; use `style` for computed values |
| Add many elements at once | `DocumentFragment` |

## Summary

- The DOM is the browser's tree representation of an HTML page.
- `querySelector` and `querySelectorAll` select elements using CSS selectors.
- `textContent` safely sets text; `innerHTML` parses HTML (avoid with user input).
- `classList` manages CSS classes; `style` sets inline styles.
- `createElement` + `appendChild` builds new elements safely.
- `remove()` and `removeChild()` delete elements from the page.
- `parentElement`, `children`, `closest()` navigate the tree.
- Use `DocumentFragment` for batch DOM updates.

Next up: [Events & Interactivity](./09-events.md) — making your page respond to user actions.
