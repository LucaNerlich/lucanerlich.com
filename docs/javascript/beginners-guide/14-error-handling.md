---
title: "Error Handling"
sidebar_label: "Error Handling"
description: Handle errors gracefully in JavaScript -- try/catch/finally, error types, custom errors, async error handling, and common patterns.
slug: /javascript/beginners-guide/error-handling
tags: [javascript, beginners, errors, debugging]
keywords:
  - javascript error handling
  - try catch
  - custom errors
  - async error handling
  - error types
sidebar_position: 14
---

# Error Handling

Errors happen. Network requests fail, users enter unexpected data, and code has bugs. Good error handling means your program fails **gracefully** -- it tells the user what went wrong instead of silently breaking or crashing the entire page.

## The `Error` object

JavaScript has a built-in `Error` class. Every error has three key properties:

```js
const error = new Error("Something went wrong");

console.log(error.message); // "Something went wrong"
console.log(error.name);    // "Error"
console.log(error.stack);   // Stack trace showing where the error was created
```

| Property | What it contains |
|----------|-----------------|
| `message` | A human-readable description of what went wrong |
| `name` | The error type (e.g., `"TypeError"`, `"RangeError"`) |
| `stack` | A trace showing the call chain that led to the error |

The `stack` property is invaluable for debugging -- it tells you exactly which function, file, and line number created the error.

## `try` / `catch` / `finally`

The core mechanism for handling errors:

```js
try {
    // Code that might throw an error
    const data = JSON.parse("not valid json");
} catch (error) {
    // Runs only if the try block throws
    console.log("Parsing failed:", error.message);
} finally {
    // Always runs, whether or not an error occurred
    console.log("Done.");
}
```

Result:
```text
Parsing failed: Unexpected token 'o', "not valid json" is not valid JSON
Done.
```

### How the flow works

1. JavaScript executes the `try` block line by line.
2. If no error occurs, the `catch` block is skipped entirely.
3. If an error is thrown, execution jumps immediately to `catch`. The remaining lines in `try` do not run.
4. The `finally` block always runs -- whether there was an error or not. Use it for cleanup (closing files, hiding loaders, resetting state).

### `catch` without `finally`

```js
try {
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    console.log("Error:", error.message);
}
```

### `finally` without `catch`

Rare, but valid -- useful when you want cleanup but want the error to propagate:

```js
try {
    return riskyOperation();
} finally {
    // Cleanup runs even though there is no catch
    console.log("Cleanup complete");
}
```

## Built-in error types

JavaScript has several specific error types that inherit from `Error`:

| Type | When it occurs | Example |
|------|---------------|---------|
| `TypeError` | Wrong type used in an operation | `null.toString()` |
| `ReferenceError` | Using an undeclared variable | `console.log(x)` where `x` is not defined |
| `SyntaxError` | Code cannot be parsed | `JSON.parse("{invalid}")` |
| `RangeError` | A value is outside the allowed range | `new Array(-1)` |
| `URIError` | Invalid use of URI functions | `decodeURIComponent("%")` |

### Checking the error type

Use `instanceof` to handle different errors differently:

```js
try {
    const data = JSON.parse(userInput);
    processData(data);
} catch (error) {
    if (error instanceof SyntaxError) {
        console.log("Invalid JSON format");
    } else if (error instanceof TypeError) {
        console.log("Data has an unexpected structure");
    } else {
        console.log("Unknown error:", error.message);
    }
}
```

## Throwing errors

Use `throw` to create your own errors:

```js
function divide(a, b) {
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }
    return a / b;
}

try {
    console.log(divide(10, 0));
} catch (error) {
    console.log(error.message); // "Cannot divide by zero"
}
```

You can throw any value, but always throw `Error` objects (or subclasses) -- they include the stack trace:

```js
// Good -- includes stack trace
throw new Error("Something failed");

// Bad -- no stack trace, harder to debug
throw "Something failed";
```

### Throwing specific error types

```js
function getUser(id) {
    if (typeof id !== "number") {
        throw new TypeError("id must be a number");
    }
    if (id < 1) {
        throw new RangeError("id must be positive");
    }
    // ... fetch user
}
```

## Custom error classes

For application-specific errors, create your own error classes:

```js
class ValidationError extends Error {
    constructor(field, message) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

class NotFoundError extends Error {
    constructor(resource, id) {
        super(`${resource} with id ${id} not found`);
        this.name = "NotFoundError";
        this.resource = resource;
        this.id = id;
    }
}

// Usage
function validateEmail(email) {
    if (!email.includes("@")) {
        throw new ValidationError("email", "Email must contain @");
    }
}

try {
    validateEmail("not-an-email");
} catch (error) {
    if (error instanceof ValidationError) {
        console.log(`Field "${error.field}": ${error.message}`);
    }
}
```

Result:
```text
Field "email": Email must contain @
```

Custom error classes let you:
- Add extra properties (like `field`, `resource`, `statusCode`)
- Handle different error categories differently with `instanceof`
- Provide clearer error messages for specific situations

## Error `cause`

Modern JavaScript (ES2022+) lets you chain errors with the `cause` property:

```js
async function loadUserProfile(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error("Failed to load user profile", { cause: error });
    }
}

try {
    await loadUserProfile(42);
} catch (error) {
    console.log(error.message);       // "Failed to load user profile"
    console.log(error.cause.message); // "HTTP 404" (the original error)
}
```

`cause` preserves the original error while wrapping it in a higher-level message. This is useful when a low-level error (network failure) should be reported as a domain-level error (failed to load profile).

## Async error handling

### `try`/`catch` with `async`/`await`

```js
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log("Fetch error:", error.message);
        return null; // Return a fallback value
    }
}

const data = await fetchData("https://api.example.com/items");
```

### `.catch()` on promises

If you prefer the promise chain style:

```js
fetch("https://api.example.com/items")
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log("Data:", data);
    })
    .catch(error => {
        console.log("Error:", error.message);
    });
```

### Handling multiple async operations

```js
async function loadDashboard() {
    try {
        const [users, posts, comments] = await Promise.all([
            fetch("/api/users").then(r => r.json()),
            fetch("/api/posts").then(r => r.json()),
            fetch("/api/comments").then(r => r.json()),
        ]);
        return { users, posts, comments };
    } catch (error) {
        // Any single failure rejects the entire Promise.all
        console.log("Dashboard load failed:", error.message);
        return null;
    }
}
```

If you need partial results even when some requests fail, use `Promise.allSettled`:

```js
const results = await Promise.allSettled([
    fetch("/api/users").then(r => r.json()),
    fetch("/api/posts").then(r => r.json()),
    fetch("/api/comments").then(r => r.json()),
]);

for (const result of results) {
    if (result.status === "fulfilled") {
        console.log("Data:", result.value);
    } else {
        console.log("Failed:", result.reason.message);
    }
}
```

### Unhandled promise rejections

If you forget to handle a rejected promise, the browser logs a warning:

```js
// Bad -- unhandled rejection
async function loadData() {
    const response = await fetch("/api/missing-endpoint");
    return response.json(); // Throws if response is not ok
}

loadData(); // No .catch(), no try/catch -- unhandled rejection
```

Always handle errors in async code. A global safety net can catch anything you miss:

```js
window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    // Log to an error reporting service
});
```

## Error handling in the DOM

### Showing errors to the user

Never show raw error messages to users. Instead, translate them into helpful UI:

```js
const errorDiv = document.querySelector("#error-message");
const dataContainer = document.querySelector("#data");

async function loadItems() {
    errorDiv.style.display = "none";
    dataContainer.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch("/api/items");
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        const items = await response.json();
        renderItems(items);
    } catch (error) {
        // Show a user-friendly message
        errorDiv.textContent = "Could not load items. Please try again later.";
        errorDiv.style.display = "block";
        dataContainer.innerHTML = "";

        // Log the real error for debugging
        console.error("Failed to load items:", error);
    }
}
```

### Validating user input

```js
function validateForm(form) {
    const errors = [];

    const name = form.querySelector("#name").value.trim();
    if (name === "") {
        errors.push({ field: "name", message: "Name is required" });
    }

    const email = form.querySelector("#email").value.trim();
    if (!email.includes("@")) {
        errors.push({ field: "email", message: "Invalid email address" });
    }

    const age = Number(form.querySelector("#age").value);
    if (Number.isNaN(age) || age < 0 || age > 150) {
        errors.push({ field: "age", message: "Age must be between 0 and 150" });
    }

    return errors;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const errors = validateForm(form);

    if (errors.length > 0) {
        for (const { field, message } of errors) {
            const group = form.querySelector(`#${field}`).closest(".form-group");
            group.classList.add("has-error");
            group.querySelector(".error-text").textContent = message;
        }
        return;
    }

    // Submit the form
    submitData(form);
});
```

## Patterns

### Guard clauses -- fail fast

Check for invalid conditions at the top of a function and return or throw early:

```js
// Without guard clauses -- deeply nested
function processOrder(order) {
    if (order) {
        if (order.items.length > 0) {
            if (order.paymentMethod) {
                // actual logic buried here
                return calculateTotal(order);
            } else {
                throw new Error("No payment method");
            }
        } else {
            throw new Error("No items in order");
        }
    } else {
        throw new Error("No order provided");
    }
}

// With guard clauses -- flat and readable
function processOrder(order) {
    if (!order) throw new Error("No order provided");
    if (order.items.length === 0) throw new Error("No items in order");
    if (!order.paymentMethod) throw new Error("No payment method");

    return calculateTotal(order);
}
```

Guard clauses make functions easier to read by handling edge cases first and keeping the main logic at the top level.

### Default values as fallbacks

```js
function getConfig(userConfig) {
    return {
        theme: userConfig?.theme ?? "light",
        language: userConfig?.language ?? "en",
        pageSize: userConfig?.pageSize ?? 20,
    };
}

// Even with undefined input, you get a valid config
const config = getConfig(undefined);
// { theme: "light", language: "en", pageSize: 20 }
```

### Retry pattern

For transient failures (network issues), retry before giving up:

```js
async function fetchWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.log(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts`, { cause: error });
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}
```

### Result pattern -- errors as values

Instead of throwing, return an object that indicates success or failure:

```js
function parseAge(input) {
    const age = Number(input);
    if (Number.isNaN(age)) {
        return { ok: false, error: "Not a number" };
    }
    if (age < 0 || age > 150) {
        return { ok: false, error: "Age out of range" };
    }
    return { ok: true, value: age };
}

const result = parseAge("abc");
if (result.ok) {
    console.log("Age:", result.value);
} else {
    console.log("Error:", result.error);
}
```

This pattern avoids exceptions for expected failures (invalid user input is not exceptional -- it is normal). Reserve `throw` for truly unexpected situations.

## Anti-patterns

### Empty catch blocks

```js
// Bad -- errors are silently swallowed
try {
    doSomething();
} catch (error) {
    // nothing here
}

// Good -- at minimum, log the error
try {
    doSomething();
} catch (error) {
    console.error("doSomething failed:", error);
}
```

### Catching too broadly

```js
// Bad -- catches everything, including programming bugs
try {
    const result = calculateTotal(items);
    const formatted = formatCurrency(result);
    displayOnPage(formatted);
} catch (error) {
    console.log("Something went wrong");
}

// Better -- catch only where the error can actually occur
let result;
try {
    result = calculateTotal(items);
} catch (error) {
    console.error("Calculation failed:", error);
    result = 0;
}

const formatted = formatCurrency(result);
displayOnPage(formatted);
```

### Using exceptions for control flow

```js
// Bad -- using try/catch as an if-statement
try {
    const user = users.find(u => u.id === id);
    if (!user) throw new Error("not found");
    return user;
} catch {
    return defaultUser;
}

// Good -- use normal control flow
const user = users.find(u => u.id === id);
return user ?? defaultUser;
```

### Catching and re-throwing without adding value

```js
// Bad -- pointless catch
try {
    return await loadData();
} catch (error) {
    throw error; // Does nothing useful
}

// Good -- add context when re-throwing
try {
    return await loadData();
} catch (error) {
    throw new Error("Failed to initialize dashboard", { cause: error });
}
```

## Summary

- **`try`/`catch`/`finally`** is the core error handling mechanism -- `finally` always runs.
- JavaScript has built-in error types (`TypeError`, `RangeError`, `SyntaxError`, `ReferenceError`) -- use `instanceof` to distinguish them.
- **Always throw `Error` objects** (not strings) to get stack traces.
- **Custom error classes** let you add properties and handle errors by category.
- **Error `cause`** (ES2022) chains errors to preserve the original failure.
- Use **`try`/`catch` with `async`/`await`** for async errors; use `Promise.allSettled` when you need partial results.
- **Guard clauses** keep functions flat and readable by failing fast.
- **The result pattern** (returning `{ ok, value, error }`) avoids exceptions for expected failures.
- Never swallow errors with empty `catch` blocks -- at minimum, log them.

For advanced patterns including TypeScript error types, error boundaries, and structured logging, see the [Error Handling reference](/javascript/error-handling).

Next up: [Regular Expressions](./15-regular-expressions.md) -- pattern matching for validation, parsing, and search-and-replace.
