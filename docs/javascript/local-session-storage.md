---
title: "LocalStorage and SessionStorage in JavaScript: Save, Load, and Remove Data"
sidebar_label: "Local & Session Storage"
description: Learn how to store, load, update, and remove data using localStorage and sessionStorage. Includes JSON parse/stringify patterns and safe helpers.
slug: /javascript/local-session-storage
tags: [javascript, typescript, storage, web]
keywords:
  - localStorage
  - sessionStorage
  - JavaScript storage
  - JSON parse storage
  - web storage API
sidebar_position: 7
---

# LocalStorage and SessionStorage in JavaScript: Save, Load, and Remove Data

The Web Storage API gives you two simple key/value stores: **localStorage** (persistent) and **sessionStorage** (cleared
when the tab closes). This guide shows how to **save, load, update, and remove data**, including JSON handling, safe
parsing, and common pitfalls. Examples are TypeScript and include the expected results.

## Quick start

```ts
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme");

console.log(theme);
```

Result:

```text
dark
```

## Storage checklist

- **Store strings only**: Web Storage stores strings, not objects.
- **Use JSON stringify/parse** for objects.
- **Handle missing keys**: `getItem` can return `null`.
- **Keep keys consistent**: namespace them (e.g., `app:theme`).
- **Avoid secrets**: localStorage is readable by any script on the page.

## localStorage vs sessionStorage

**localStorage** persists across browser restarts.  
**sessionStorage** is scoped to the current tab and cleared on close.

```ts
localStorage.setItem("persisted", "yes");
sessionStorage.setItem("sessionOnly", "yes");

console.log(localStorage.getItem("persisted"));
console.log(sessionStorage.getItem("sessionOnly"));
```

Result:

```text
yes
yes
```

## Save and load strings

```ts
localStorage.setItem("welcome", "Hello");
const value = localStorage.getItem("welcome");

console.log(value);
```

Result:

```text
Hello
```

## Save and load objects with JSON

```ts
type UserPrefs = { theme: string; pageSize: number };
const prefs: UserPrefs = { theme: "dark", pageSize: 20 };

localStorage.setItem("prefs", JSON.stringify(prefs));

const raw = localStorage.getItem("prefs");
const parsed = raw ? (JSON.parse(raw) as UserPrefs) : null;

console.log(parsed);
```

Result:

```text
{ theme: "dark", pageSize: 20 }
```

## Safe JSON parsing

Storage content can be corrupted or edited by the user. Always handle parse errors.

```ts
function safeParse<T>(input: string | null): T | null {
    if (!input) return null;
    try {
        return JSON.parse(input) as T;
    } catch {
        return null;
    }
}

const value = safeParse<{ ok: boolean }>('{"ok":true}');
console.log(value);
```

Result:

```text
{ ok: true }
```

## Remove keys

```ts
localStorage.setItem("temp", "1");
localStorage.removeItem("temp");

console.log(localStorage.getItem("temp"));
```

Result:

```text
null
```

## Clear all storage (use carefully)

```ts
localStorage.setItem("a", "1");
localStorage.setItem("b", "2");
localStorage.clear();

console.log(localStorage.getItem("a"));
```

Result:

```text
null
```

## Update an existing object

Load, update, and save back. This keeps the storage consistent.

```ts
type Cart = { items: number[] };
const initial: Cart = { items: [1, 2] };
localStorage.setItem("cart", JSON.stringify(initial));

const cartRaw = localStorage.getItem("cart");
const cart = cartRaw ? (JSON.parse(cartRaw) as Cart) : { items: [] };
cart.items.push(3);
localStorage.setItem("cart", JSON.stringify(cart));

console.log(cart.items);
```

Result:

```text
[ 1, 2, 3 ]
```

## Namespacing keys

Avoid collisions by using a prefix like `app:`.

```ts
const key = "app:auth:token";
localStorage.setItem(key, "token-value");

console.log(localStorage.getItem(key));
```

Result:

```text
token-value
```

## Storing numbers and booleans

Convert types explicitly when reading back.

```ts
localStorage.setItem("page", String(3));
const page = Number(localStorage.getItem("page"));

console.log(page + 1);
```

Result:

```text
4
```

## Add a simple TTL (expiration)

Web Storage has no built-in expiration. You can store a timestamp and check it when reading.

```ts
type Cached<T> = { value: T; expiresAt: number };

function setWithTtl<T>(key: string, value: T, ttlMs: number): void {
    const payload: Cached<T> = { value, expiresAt: Date.now() + ttlMs };
    localStorage.setItem(key, JSON.stringify(payload));
}

function getWithTtl<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    const parsed = safeParse<Cached<T>>(raw);
    if (!parsed) return null;
    if (parsed.expiresAt < Date.now()) {
        localStorage.removeItem(key);
        return null;
    }
    return parsed.value;
}

setWithTtl("welcome", "hello", 1000);
console.log(getWithTtl("welcome"));
```

Result:

```text
hello
```

## Cross-tab synchronization (storage event)

The `storage` event fires in other tabs when a value changes. Use it to keep UI in sync.

```ts
window.addEventListener("storage", (event) => {
    if (event.key === "theme") {
        console.log(`theme changed to ${event.newValue}`);
    }
});

localStorage.setItem("theme", "light");
```

Result:

```text
theme changed to light
```

Note: the event fires in **other tabs**, not the same tab.

## Common pitfalls

- **Assuming storage is private**: any script on the page can read it.
- **Forgetting to stringify**: objects become `"[object Object]"`.
- **Ignoring nulls**: `getItem` returns `null` when missing.
- **Storing too much**: localStorage limits are small (often ~5MB).
- **Mixing environments**: storage APIs are browser-only.

## Best practices

- **Use consistent key prefixes** (`app:`) for clarity.
- **Parse safely** with a helper like `safeParse`.
- **Avoid sensitive data** in localStorage/sessionStorage.
- **Keep payloads small** for performance.
- **Document your storage keys** in one place.

## FAQ: localStorage and sessionStorage

### How do I store objects in localStorage?

Use `JSON.stringify` on save and `JSON.parse` on load.

```ts
localStorage.setItem("prefs", JSON.stringify({ theme: "dark" }));
const prefs = JSON.parse(localStorage.getItem("prefs") ?? "{}");

console.log(prefs.theme);
```

Result:

```text
dark
```

### What is the difference between localStorage and sessionStorage?

`localStorage` persists across browser restarts. `sessionStorage` is cleared when the tab closes.

```ts
console.log(Boolean(localStorage));
```

Result:

```text
true
```

### How do I remove a key from storage?

Use `removeItem`, or `clear` to remove everything.

```ts
localStorage.setItem("temp", "1");
localStorage.removeItem("temp");
console.log(localStorage.getItem("temp"));
```

Result:

```text
null
```

## Summary

Use localStorage and sessionStorage for small, non-sensitive data. Store strings, stringify objects, parse safely, and
handle missing values. For larger data or sensitive information, use a proper backend or secure storage instead.
