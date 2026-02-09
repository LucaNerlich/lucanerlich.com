---
title: "Working with Data"
sidebar_label: "Working with Data"
description: Learn how to fetch data from APIs, handle JSON responses, use async/await, and store data with localStorage and sessionStorage.
slug: /javascript/beginners-guide/working-with-data
tags: [javascript, beginners, fetch, api, storage]
keywords:
  - fetch api
  - javascript fetch
  - async await
  - localStorage
  - JSON
sidebar_position: 10
---

# Working with Data

Real web applications need data — from APIs, from the user, from the browser. This chapter covers fetching data from external sources, handling JSON, and storing data locally.

## The Fetch API

`fetch` is the built-in way to make HTTP requests in JavaScript:

```js
fetch("https://jsonplaceholder.typicode.com/users/1")
    .then((response) => response.json())
    .then((data) => console.log(data.name))
    .catch((error) => console.error("Error:", error));
```

Result:
```text
Leanne Graham
```

This uses **promises** — `fetch` returns a promise that resolves to a `Response` object. `.json()` parses the response body as JSON (also returns a promise).

## Promises — a quick overview

A **promise** represents a value that will be available in the future. It has three states:

| State | Meaning |
|-------|---------|
| **Pending** | Operation in progress |
| **Fulfilled** | Operation succeeded, value available |
| **Rejected** | Operation failed, error available |

```js
const promise = fetch("https://jsonplaceholder.typicode.com/users/1");

promise
    .then((response) => {
        console.log("Status:", response.status);
        return response.json();
    })
    .then((user) => {
        console.log("User:", user.name);
    })
    .catch((error) => {
        console.error("Failed:", error.message);
    })
    .finally(() => {
        console.log("Request complete");
    });
```

Result:
```text
Status: 200
User: Leanne Graham
Request complete
```

- `.then()` runs when the promise fulfills
- `.catch()` runs when the promise rejects
- `.finally()` runs either way

For a deep dive into async patterns, see [Async/Await Guide](../async-await-guide.md).

## `async` / `await`

A cleaner syntax for working with promises:

```js
async function getUser(id) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    const user = await response.json();
    return user;
}

async function main() {
    const user = await getUser(1);
    console.log(user.name);
    console.log(user.email);
}

main();
```

Result:
```text
Leanne Graham
Sincere@april.biz
```

`await` pauses execution until the promise resolves. It can only be used inside an `async` function.

## Error handling with fetch

`fetch` only rejects on **network errors** (no internet, DNS failure). HTTP errors like 404 or 500 are **not** rejections — you must check `response.ok`:

```js
async function getUser(id) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function main() {
    try {
        const user = await getUser(1);
        console.log("User:", user.name);
    } catch (error) {
        console.error("Failed to fetch user:", error.message);
    }
}

main();
```

Result:
```text
User: Leanne Graham
```

With an invalid ID (the API returns 404):

```js
try {
    const user = await getUser(9999);
} catch (error) {
    console.error(error.message);
}
```

Result:
```text
HTTP error: 404 Not Found
```

### A reusable fetch helper

```js
async function fetchJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${url}`);
    }

    return await response.json();
}

// Usage
async function main() {
    try {
        const users = await fetchJSON("https://jsonplaceholder.typicode.com/users");
        console.log(`Fetched ${users.length} users`);

        const posts = await fetchJSON("https://jsonplaceholder.typicode.com/posts?userId=1");
        console.log(`User 1 has ${posts.length} posts`);
    } catch (error) {
        console.error("API error:", error.message);
    }
}

main();
```

Result:
```text
Fetched 10 users
User 1 has 10 posts
```

## Sending data with fetch

### POST request

```js
async function createPost(title, body) {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: title,
            body: body,
            userId: 1,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
}

async function main() {
    const post = await createPost("My Title", "My post content");
    console.log("Created post:", post);
}

main();
```

Result:
```text
Created post: { title: 'My Title', body: 'My post content', userId: 1, id: 101 }
```

### Other HTTP methods

```js
// PUT — replace a resource
await fetch("https://api.example.com/users/1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Updated Name" }),
});

// PATCH — partially update a resource
await fetch("https://api.example.com/users/1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Updated Name" }),
});

// DELETE — remove a resource
await fetch("https://api.example.com/users/1", {
    method: "DELETE",
});
```

## Query parameters

Build URLs safely using `URLSearchParams`:

```js
const params = new URLSearchParams({
    q: "javascript",
    page: "1",
    limit: "10",
});

const url = `https://api.example.com/search?${params}`;
console.log(url);
```

Result:
```text
https://api.example.com/search?q=javascript&page=1&limit=10
```

`URLSearchParams` handles special characters automatically:

```js
const params = new URLSearchParams({ q: "hello world & more" });
console.log(params.toString());
```

Result:
```text
q=hello+world+%26+more
```

## Parallel requests

When fetching independent data, run requests in parallel:

```js
async function getDashboardData() {
    // Sequential — slow (each waits for the previous)
    // const users = await fetchJSON("/api/users");
    // const posts = await fetchJSON("/api/posts");

    // Parallel — fast (both run at the same time)
    const [users, posts] = await Promise.all([
        fetchJSON("https://jsonplaceholder.typicode.com/users"),
        fetchJSON("https://jsonplaceholder.typicode.com/posts"),
    ]);

    console.log(`${users.length} users, ${posts.length} posts`);
}

getDashboardData();
```

Result:
```text
10 users, 100 posts
```

`Promise.all` runs all promises concurrently and waits for all to complete. If any fails, the entire `Promise.all` rejects.

## Loading data into the DOM

Combine fetch with DOM manipulation to build dynamic pages:

```html
<div id="app">
    <h1>Users</h1>
    <div id="loading">Loading...</div>
    <ul id="user-list"></ul>
    <div id="error" style="display: none; color: red;"></div>
</div>
```

```js
async function loadUsers() {
    const loading = document.querySelector("#loading");
    const list = document.querySelector("#user-list");
    const errorDiv = document.querySelector("#error");

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");

        if (!response.ok) {
            throw new Error(`Failed to load users: ${response.status}`);
        }

        const users = await response.json();

        // Hide loading indicator
        loading.style.display = "none";

        // Build the list
        for (const user of users) {
            const li = document.createElement("li");

            const name = document.createElement("strong");
            name.textContent = user.name;

            const email = document.createElement("span");
            email.textContent = ` — ${user.email}`;

            li.appendChild(name);
            li.appendChild(email);
            list.appendChild(li);
        }
    } catch (error) {
        loading.style.display = "none";
        errorDiv.style.display = "block";
        errorDiv.textContent = error.message;
    }
}

document.addEventListener("DOMContentLoaded", loadUsers);
```

This pattern — loading indicator, fetch data, build DOM, handle errors — is the foundation of every data-driven web page.

## `localStorage` and `sessionStorage`

The browser provides two storage mechanisms for saving data on the client:

| Feature | `localStorage` | `sessionStorage` |
|---------|---------------|-------------------|
| **Persists** | Until manually cleared | Until the tab is closed |
| **Scope** | Shared across tabs (same origin) | Per tab |
| **Size limit** | ~5–10 MB | ~5–10 MB |

### Basic usage

```js
// Store a value
localStorage.setItem("username", "Ada");

// Read a value
const username = localStorage.getItem("username");
console.log(username);

// Remove a value
localStorage.removeItem("username");

// Clear everything
localStorage.clear();
```

Result:
```text
Ada
```

### Storing objects and arrays

`localStorage` only stores **strings**. Use `JSON.stringify` and `JSON.parse`:

```js
const settings = {
    theme: "dark",
    fontSize: 16,
    language: "en",
};

// Save
localStorage.setItem("settings", JSON.stringify(settings));

// Load
const loaded = JSON.parse(localStorage.getItem("settings"));
console.log(loaded);
console.log(loaded.theme);
```

Result:
```text
{ theme: 'dark', fontSize: 16, language: 'en' }
dark
```

### Safe loading with fallback

```js
function loadFromStorage(key, fallback) {
    const stored = localStorage.getItem(key);
    if (stored === null) {
        return fallback;
    }
    try {
        return JSON.parse(stored);
    } catch {
        return fallback;
    }
}

const theme = loadFromStorage("theme", "light");
console.log(theme);
```

Result (if nothing is stored):
```text
light
```

### Practical: persisting a to-do list

```js
const STORAGE_KEY = "todos";

function loadTodos() {
    return loadFromStorage(STORAGE_KEY, []);
}

function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Usage
let todos = loadTodos();
todos.push({ text: "Learn JavaScript", done: false });
todos.push({ text: "Build a website", done: false });
saveTodos(todos);

// Later, or on page reload
const restored = loadTodos();
console.log(restored);
```

Result:
```text
[
  { text: 'Learn JavaScript', done: false },
  { text: 'Build a website', done: false }
]
```

### `sessionStorage`

Works identically to `localStorage`, but data is cleared when the tab closes:

```js
sessionStorage.setItem("tempData", "gone when tab closes");
const temp = sessionStorage.getItem("tempData");
console.log(temp);
```

Result:
```text
gone when tab closes
```

Use `sessionStorage` for data that should not persist (e.g., form state during a checkout flow).

## Putting it all together: a data-driven page

Here is a complete example that fetches user data, displays it, and caches results in `localStorage`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Directory</title>
    <style>
        body {
            font-family: sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .user-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
        }
        .user-card h3 { margin: 0 0 8px; }
        .user-card p { margin: 4px 0; color: #555; }
        .loading { color: #888; font-style: italic; }
        .error { color: red; }
        button {
            padding: 8px 16px;
            margin-bottom: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>User Directory</h1>
    <button id="refresh-btn">Refresh Data</button>
    <div id="status"></div>
    <div id="user-list"></div>

    <script>
        const CACHE_KEY = "cached_users";
        const API_URL = "https://jsonplaceholder.typicode.com/users";

        const statusDiv = document.querySelector("#status");
        const listDiv = document.querySelector("#user-list");
        const refreshBtn = document.querySelector("#refresh-btn");

        function renderUsers(users) {
            listDiv.innerHTML = "";
            for (const user of users) {
                const card = document.createElement("div");
                card.classList.add("user-card");

                const name = document.createElement("h3");
                name.textContent = user.name;

                const email = document.createElement("p");
                email.textContent = user.email;

                const city = document.createElement("p");
                city.textContent = `City: ${user.address.city}`;

                card.appendChild(name);
                card.appendChild(email);
                card.appendChild(city);
                listDiv.appendChild(card);
            }
        }

        async function fetchUsers(useCache = true) {
            // Try cache first
            if (useCache) {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    statusDiv.textContent = "Loaded from cache";
                    statusDiv.className = "";
                    renderUsers(JSON.parse(cached));
                    return;
                }
            }

            statusDiv.textContent = "Loading...";
            statusDiv.className = "loading";

            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const users = await response.json();

                // Cache the result
                localStorage.setItem(CACHE_KEY, JSON.stringify(users));

                statusDiv.textContent = `Loaded ${users.length} users from API`;
                statusDiv.className = "";
                renderUsers(users);
            } catch (error) {
                statusDiv.textContent = `Error: ${error.message}`;
                statusDiv.className = "error";
            }
        }

        refreshBtn.addEventListener("click", () => {
            localStorage.removeItem(CACHE_KEY);
            fetchUsers(false);
        });

        document.addEventListener("DOMContentLoaded", () => fetchUsers());
    </script>
</body>
</html>
```

This example demonstrates:
- Fetching data from an API
- Error handling with user-friendly messages
- Rendering data into the DOM safely (no `innerHTML` with user data)
- Caching with `localStorage` and a refresh button
- Loading states

## Summary

- `fetch` makes HTTP requests; always check `response.ok` for HTTP errors.
- `async`/`await` makes promise-based code read like synchronous code.
- Wrap `fetch` calls in `try`/`catch` for error handling.
- Use `Promise.all` for parallel requests.
- `localStorage` persists data across sessions; `sessionStorage` only until the tab closes.
- Both storage APIs only store strings — use `JSON.stringify`/`JSON.parse` for objects.
- Combine fetch, DOM manipulation, and storage for data-driven pages.

Next up: [Project: Build a Complete Website](./11-project-build-a-website.md) — putting everything together into a real, multi-page site.
