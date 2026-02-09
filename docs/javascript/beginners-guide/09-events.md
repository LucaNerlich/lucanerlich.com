---
title: "Events & Interactivity"
sidebar_label: "Events"
description: Learn how to handle user interactions in JavaScript — event listeners, the event object, bubbling, delegation, forms, and keyboard/mouse events.
slug: /javascript/beginners-guide/events
tags: [javascript, beginners, events, dom]
keywords:
  - javascript events
  - addEventListener
  - event delegation
  - form handling
  - click events
sidebar_position: 9
---

# Events & Interactivity

Events are how JavaScript responds to user actions — clicks, key presses, form submissions, scrolling, and more. This chapter covers everything you need to make interactive web pages.

## Adding event listeners

The standard way to respond to events is `addEventListener`:

```html
<button id="greet-btn">Say Hello</button>
<p id="output"></p>
```

```js
const button = document.querySelector("#greet-btn");
const output = document.querySelector("#output");

button.addEventListener("click", function () {
    output.textContent = "Hello, World!";
});
```

When the button is clicked, the paragraph shows "Hello, World!".

### With an arrow function

```js
button.addEventListener("click", () => {
    output.textContent = "Hello from an arrow function!";
});
```

### With a named function

```js
function handleClick() {
    output.textContent = "Hello from a named function!";
}

button.addEventListener("click", handleClick);
```

Named functions are useful when you need to **remove** the listener later.

## Removing event listeners

```js
function handleClick() {
    console.log("Clicked!");
}

button.addEventListener("click", handleClick);

// Later, remove it
button.removeEventListener("click", handleClick);
```

**Important:** you must pass the same function reference. Anonymous functions cannot be removed:

```js
// This does NOT work — each arrow function is a different reference
button.addEventListener("click", () => console.log("A"));
button.removeEventListener("click", () => console.log("A")); // does nothing
```

### One-time listeners

Use the `once` option to automatically remove after the first trigger:

```js
button.addEventListener("click", () => {
    console.log("This only fires once");
}, { once: true });
```

## The event object

Every event handler receives an **event object** with details about what happened:

```js
button.addEventListener("click", (event) => {
    console.log("Type:", event.type);
    console.log("Target:", event.target.tagName);
    console.log("X:", event.clientX, "Y:", event.clientY);
    console.log("Timestamp:", event.timeStamp);
});
```

Result (when clicking):
```text
Type: click
Target: BUTTON
X: 150 Y: 200
Timestamp: 12345.67
```

Common properties:

| Property | Description |
|----------|-------------|
| `event.type` | Event name (`"click"`, `"keydown"`, etc.) |
| `event.target` | The element that triggered the event |
| `event.currentTarget` | The element the listener is attached to |
| `event.clientX` / `clientY` | Mouse position relative to viewport |
| `event.key` | Key pressed (for keyboard events) |
| `event.timeStamp` | When the event occurred |

## Common event types

### Mouse events

```js
const box = document.querySelector(".box");

box.addEventListener("click", () => console.log("Clicked"));
box.addEventListener("dblclick", () => console.log("Double-clicked"));
box.addEventListener("mouseenter", () => console.log("Mouse entered"));
box.addEventListener("mouseleave", () => console.log("Mouse left"));
box.addEventListener("mousemove", (e) => {
    console.log(`Mouse at (${e.clientX}, ${e.clientY})`);
});
```

### Keyboard events

```js
document.addEventListener("keydown", (event) => {
    console.log(`Key down: ${event.key}`);
});

document.addEventListener("keyup", (event) => {
    console.log(`Key up: ${event.key}`);
});
```

Common `event.key` values: `"Enter"`, `"Escape"`, `"ArrowUp"`, `"ArrowDown"`, `"a"`, `"A"`, `" "` (space).

```js
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        console.log("Escape pressed — close the modal");
    }

    // Check for modifier keys
    if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); // prevent browser save dialog
        console.log("Ctrl+S pressed — saving...");
    }
});
```

### Focus events

```js
const input = document.querySelector("input");

input.addEventListener("focus", () => {
    console.log("Input focused");
});

input.addEventListener("blur", () => {
    console.log("Input lost focus");
});
```

### Input events

```js
const searchInput = document.querySelector("#search");

// Fires on every keystroke
searchInput.addEventListener("input", (event) => {
    console.log("Current value:", event.target.value);
});

// Fires when the field loses focus after being changed
searchInput.addEventListener("change", (event) => {
    console.log("Changed to:", event.target.value);
});
```

### Scroll events

```js
window.addEventListener("scroll", () => {
    console.log(`Scrolled to: ${window.scrollY}px`);
});
```

**Performance tip:** scroll events fire very rapidly. Use throttling or `requestAnimationFrame` for heavy handlers.

### Page load events

```js
// DOM is ready (HTML parsed, but images/CSS may still be loading)
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM is ready");
});

// Everything is fully loaded (images, CSS, etc.)
window.addEventListener("load", () => {
    console.log("Page fully loaded");
});
```

**Best practice:** place your `<script>` tag at the end of `<body>`, or use `DOMContentLoaded` to ensure the DOM is available before your code runs.

## Preventing default behavior

Some events have built-in browser behavior. Use `preventDefault()` to stop it:

```js
// Prevent a link from navigating
const link = document.querySelector("a");
link.addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Link click prevented");
});

// Prevent form submission (handle it with JavaScript instead)
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Form submission prevented");
});
```

## Event bubbling and capturing

When you click a button inside a `<div>`, the event fires on the button **and** on every ancestor up to `document`. This is called **bubbling**.

```html
<div id="outer">
    <div id="inner">
        <button id="btn">Click me</button>
    </div>
</div>
```

```js
document.querySelector("#outer").addEventListener("click", () => {
    console.log("Outer div clicked");
});

document.querySelector("#inner").addEventListener("click", () => {
    console.log("Inner div clicked");
});

document.querySelector("#btn").addEventListener("click", () => {
    console.log("Button clicked");
});
```

Result (clicking the button):
```text
Button clicked
Inner div clicked
Outer div clicked
```

The event bubbles from the target (button) up through its ancestors.

### Stopping propagation

Prevent the event from reaching parent elements:

```js
document.querySelector("#btn").addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("Button clicked — stopped bubbling");
});

// This will NOT fire when the button is clicked
document.querySelector("#outer").addEventListener("click", () => {
    console.log("Outer div clicked");
});
```

Result (clicking the button):
```text
Button clicked — stopped bubbling
```

Use `stopPropagation` sparingly — it can break other listeners that rely on bubbling.

### Capture phase

Events actually go through three phases:
1. **Capture** — from `document` down to the target
2. **Target** — the element that was clicked
3. **Bubble** — back up from the target to `document`

To listen during the capture phase:

```js
document.querySelector("#outer").addEventListener("click", () => {
    console.log("Outer (capture phase)");
}, true); // third argument = use capture

document.querySelector("#btn").addEventListener("click", () => {
    console.log("Button (target)");
});

document.querySelector("#outer").addEventListener("click", () => {
    console.log("Outer (bubble phase)");
});
```

Result (clicking the button):
```text
Outer (capture phase)
Button (target)
Outer (bubble phase)
```

You will rarely need capture phase listeners, but understanding the flow helps with debugging.

## Event delegation

Instead of attaching listeners to every child element, attach one listener to a parent and use `event.target` to determine which child was clicked:

```html
<ul id="task-list">
    <li>Task 1</li>
    <li>Task 2</li>
    <li>Task 3</li>
</ul>
```

```js
// Without delegation — one listener per item (bad for many items)
document.querySelectorAll("#task-list li").forEach((li) => {
    li.addEventListener("click", () => {
        console.log(`Clicked: ${li.textContent}`);
    });
});

// With delegation — one listener on the parent (good!)
document.querySelector("#task-list").addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        console.log(`Clicked: ${event.target.textContent}`);
    }
});
```

Benefits of delegation:
- **Performance:** one listener instead of many
- **Dynamic elements:** works for elements added later (they bubble to the parent)
- **Less memory:** fewer event listener objects

### Delegation with `closest`

For elements with nested children, `event.target` might be a child of the element you care about:

```html
<ul id="user-list">
    <li data-id="1"><strong>Ada</strong> <span>Admin</span></li>
    <li data-id="2"><strong>Bob</strong> <span>User</span></li>
</ul>
```

```js
document.querySelector("#user-list").addEventListener("click", (event) => {
    const li = event.target.closest("li");
    if (li) {
        console.log(`Clicked user ID: ${li.dataset.id}`);
    }
});
```

`closest` walks up the tree from `event.target` to find the nearest matching ancestor. It handles clicks on `<strong>` or `<span>` inside the `<li>`.

## Form handling

Forms are one of the most common uses of events:

```html
<form id="signup">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required minlength="3">

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <button type="submit">Sign Up</button>
</form>
<div id="result"></div>
```

```js
const form = document.querySelector("#signup");
const result = document.querySelector("#result");

form.addEventListener("submit", (event) => {
    event.preventDefault(); // prevent page reload

    // Access form data
    const formData = new FormData(form);
    const username = formData.get("username");
    const email = formData.get("email");

    // Or access directly
    const usernameAlt = form.elements.username.value;

    result.textContent = `Welcome, ${username} (${email})!`;

    // Clear the form
    form.reset();
});
```

### Real-time validation

```js
const usernameInput = document.querySelector("#username");
const feedback = document.createElement("span");
usernameInput.parentElement.appendChild(feedback);

usernameInput.addEventListener("input", (event) => {
    const value = event.target.value;

    if (value.length === 0) {
        feedback.textContent = "";
    } else if (value.length < 3) {
        feedback.textContent = "Too short (min 3 characters)";
        feedback.style.color = "red";
    } else if (value.length > 20) {
        feedback.textContent = "Too long (max 20 characters)";
        feedback.style.color = "red";
    } else {
        feedback.textContent = "Looks good!";
        feedback.style.color = "green";
    }
});
```

For more on sanitizing user input, see [User Input Sanitization](../user-input-sanitization.md).

### Checkboxes and radio buttons

```js
// Checkbox
const checkbox = document.querySelector('input[type="checkbox"]');
checkbox.addEventListener("change", () => {
    console.log("Checked:", checkbox.checked);
});

// Radio buttons
document.querySelectorAll('input[name="theme"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
        console.log("Selected theme:", event.target.value);
    });
});
```

### Select dropdown

```js
const select = document.querySelector("select");
select.addEventListener("change", (event) => {
    console.log("Selected:", event.target.value);
});
```

## Practical examples

### Toggle visibility

```html
<button id="toggle-btn">Toggle Content</button>
<div id="content" class="visible">
    <p>This content can be shown or hidden.</p>
</div>
```

```css
.hidden { display: none; }
.visible { display: block; }
```

```js
const toggleBtn = document.querySelector("#toggle-btn");
const content = document.querySelector("#content");

toggleBtn.addEventListener("click", () => {
    content.classList.toggle("hidden");
    content.classList.toggle("visible");

    toggleBtn.textContent = content.classList.contains("hidden")
        ? "Show Content"
        : "Toggle Content";
});
```

### Theme toggle

```js
const themeBtn = document.querySelector("#theme-toggle");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");
    themeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";

    // Save preference
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Restore on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }
});
```

### Dynamic list with add and delete

```html
<div id="todo-app">
    <input type="text" id="todo-input" placeholder="Add a task...">
    <button id="add-btn">Add</button>
    <ul id="todo-list"></ul>
</div>
```

```js
const input = document.querySelector("#todo-input");
const addBtn = document.querySelector("#add-btn");
const list = document.querySelector("#todo-list");

function addTask() {
    const text = input.value.trim();
    if (text === "") return;

    const li = document.createElement("li");
    li.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "8px";
    li.appendChild(deleteBtn);

    list.appendChild(li);
    input.value = "";
    input.focus();
}

// Add on button click
addBtn.addEventListener("click", addTask);

// Add on Enter key
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

// Delete using event delegation
list.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
        event.target.parentElement.remove();
    }
});
```

### Debounced search

Prevent firing on every keystroke — wait until the user stops typing:

```js
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

const searchInput = document.querySelector("#search");
const results = document.querySelector("#results");

const handleSearch = debounce((query) => {
    console.log(`Searching for: ${query}`);
    results.textContent = `Results for "${query}"...`;
}, 300);

searchInput.addEventListener("input", (event) => {
    handleSearch(event.target.value);
});
```

The search function fires 300ms after the user stops typing, instead of on every keystroke.

## Custom events

Create and dispatch your own events:

```js
// Create a custom event
const userLoggedIn = new CustomEvent("userLogin", {
    detail: { username: "Ada", role: "admin" },
});

// Listen for it
document.addEventListener("userLogin", (event) => {
    console.log(`${event.detail.username} logged in as ${event.detail.role}`);
});

// Dispatch it
document.dispatchEvent(userLoggedIn);
```

Result:
```text
Ada logged in as admin
```

Custom events are useful for decoupling components — one part of your code can emit events without knowing who is listening.

## Summary

- `addEventListener` is the standard way to handle events; `removeEventListener` requires the same function reference.
- The **event object** provides details: `type`, `target`, `key`, coordinates, etc.
- `preventDefault()` stops default browser behavior (link navigation, form submission).
- Events **bubble** from child to parent. Use `stopPropagation()` sparingly.
- **Event delegation** attaches one listener to a parent — better performance, works for dynamic elements.
- `closest()` helps find the relevant element in delegated handlers.
- Forms: use `FormData` or `form.elements` to access values, `event.preventDefault()` to handle submission in JavaScript.
- **Debounce** expensive handlers like search to avoid firing on every keystroke.

Next up: [Working with Data](./10-working-with-data.md) — fetching data from APIs and storing data in the browser.
