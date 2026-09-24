---
title: "User Input Sanitization in JavaScript: Practical and Safe Patterns"
sidebar_label: "Input Sanitization"
description: Learn how to sanitize and validate user input in JavaScript with TypeScript examples. Covers frontend and backend basics, XSS prevention, and safe outputs.
slug: /javascript/user-input-sanitization
tags: [javascript, typescript, security, validation]
keywords:
  - user input sanitization
  - JavaScript input validation
  - XSS prevention
  - HTML escaping
  - safe user input
sidebar_position: 6
---

# User Input Sanitization in JavaScript: Practical and Safe Patterns

User input is untrusted by default. Whether it comes from a form, URL parameters, or an API request, it must be
**validated** and **sanitized** before you use it. This post explains safe, practical patterns for both frontend and
backend scenarios using TypeScript examples and expected output.

## Quick start

```ts
function sanitizeText(input: string): string {
    return input.trim().replace(/\s+/g, " ");
}

console.log(sanitizeText("  hello   world  "));
```

Result:

```text
hello world
```

## Sanitization checklist

- **Validate first**: check type, length, and allowed characters.
- **Normalize input**: trim and collapse whitespace.
- **Escape on output**: especially when rendering to HTML.
- **Prefer allow-lists** over block-lists.
- **Keep raw input** only if you must (for audits or debugging).

## Validation vs sanitization vs encoding

These are related but different:

- **Validation** answers: "Is this input acceptable?"
- **Sanitization** answers: "Can I normalize this input to a safe version?"
- **Encoding/Escaping** answers: "How do I safely output this input in a specific context?"

Most real systems need **all three**.

## Frontend: render text safely

In the browser, the safest default is to **avoid HTML injection entirely** and render text using `textContent`.

```ts
const userInput = "<b>Hi</b>";
const safe = document.createElement("span");
safe.textContent = userInput;

console.log(safe.textContent);
```

Result:

```text
<b>Hi</b>
```

The string is treated as text, not HTML.

## When you must insert text into HTML, escape it

If you cannot use `textContent` and need to build HTML markup with user-provided text, escape that text first. Escaping
displays the input as text; it is not a way to allow rich HTML.

```ts
function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const unsafe = `<img src=x onerror="alert(1)">`;
console.log(escapeHtml(unsafe));
```

Result:

```text
&lt;img src=x onerror=&quot;alert(1)&quot;&gt;
```

## Context-aware encoding

Always encode based on the output context. HTML text, HTML attributes, URLs, and JSON each have different rules. The
attribute helper below is only for quoted text attributes; do not put user input in event handler attributes, style
attributes, or `javascript:` URLs.

```ts
function escapeAttribute(input: string): string {
    return escapeHtml(input).replace(/`/g, "&#96;");
}

const attribute = escapeAttribute(`hello "world"`);
console.log(attribute);
```

Result:

```text
hello &quot;world&quot;
```

## Validate with allow-lists

Allow-lists are safer than trying to block every possible bad input. For usernames, keep it simple.

```ts
function isValidUsername(input: string): boolean {
    return /^[a-z0-9_]{3,20}$/i.test(input);
}

console.log(isValidUsername("luca_nerlich"));
```

Result:

```text
true
```

## Normalize before validating

Normalize whitespace and casing to make validation rules stable.

```ts
function normalizeEmail(input: string): string {
    return input.trim().toLowerCase();
}

console.log(normalizeEmail("  USER@EXAMPLE.COM  "));
```

Result:

```text
user@example.com
```

## Numeric input normalization

Convert numeric input explicitly and reject invalid values early.

```ts
function toPositiveInt(input: string): number | null {
    const value = Number(input);
    if (!Number.isInteger(value) || value <= 0) return null;
    return value;
}

console.log(toPositiveInt("42"));
```

Result:

```text
42
```

## Backend basics: validate request data

In backend code, validation is non-negotiable. Convert types explicitly and reject invalid data early.

```ts
type CreateUserInput = { name: string; age: number };

function validateCreateUser(input: unknown): CreateUserInput | null {
    if (typeof input !== "object" || input === null) return null;
    const value = input as Record<string, unknown>;
    if (typeof value.name !== "string") return null;
    if (typeof value.age !== "number" || !Number.isFinite(value.age)) return null;
    return { name: value.name, age: value.age };
}

const candidate = { name: "Ada", age: 36 };
console.log(validateCreateUser(candidate));
```

Result:

```text
{ name: "Ada", age: 36 }
```

## Encode for URLs

When user input ends up in a URL component, such as a query value, use `encodeURIComponent` to prevent broken URLs or
injection. Do not use it to validate or encode a whole URL; validate protocols and hosts separately.

```ts
const query = "cats & dogs";
const url = `https://example.com/search?q=${encodeURIComponent(query)}`;

console.log(url);
```

Result:

```text
https://example.com/search?q=cats%20%26%20dogs
```

## Avoid unsafe sinks

Some APIs interpret strings as code or HTML. Avoid passing user input into these sinks. Prefer safe APIs such as
`textContent`, parameterized queries, and built-in templating that escapes by default.

## Handling rich text safely

If you allow rich text, use a **well-maintained HTML sanitizer** such as DOMPurify, or a server-side equivalent, at the
rendering boundary or before storing/serving it. Keep the allow-list tight and explicitly defined. Sanitized HTML is
only safe for an HTML context -- do not concatenate it into scripts, styles, or URLs. Avoid writing a custom HTML parser
unless you have a strong reason.

For example, allow only the tags and attributes your editor actually needs:

```ts
import DOMPurify from "dompurify";

function sanitizeRichText(dirtyHtml: string): string {
    return DOMPurify.sanitize(dirtyHtml, {
        ALLOWED_TAGS: ["p", "strong", "em", "ul", "ol", "li", "a", "code"],
        ALLOWED_ATTR: ["href", "title"],
    });
}
```

## Content Security Policy as defense in depth

A Content Security Policy (CSP) tells the browser which sources are allowed to load scripts, styles, images, frames,
and other resources. For XSS prevention, its strongest value is blocking unexpected script execution if an unsafe sink
slips through code review. CSP is a second layer of defense, not a replacement for validation, sanitization, and
context-aware output encoding.

A strict starter policy for an application that can add nonces to scripts looks like this:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-random-per-response'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```

Generate a fresh, unpredictable nonce for every response and put the same value on each trusted script tag. If static
HTML cannot generate nonces, use `script-src` hashes for known inline scripts, or better, move scripts into external
files and keep `script-src 'self'`. Do not add `'unsafe-inline'` to `script-src`: it allows inline scripts and event
handler attributes, which defeats most of CSP's XSS protection.

Roll CSP out with a report-only header first so you can see what would break without blocking users:

```http
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'nonce-random-per-response'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; report-to csp-endpoint
```

After reports are clean, switch to the enforcing `Content-Security-Policy` header.

## Trusted Types

Trusted Types reduce DOM-based XSS by requiring dangerous HTML/script sinks, such as `innerHTML`, to receive a trusted
object instead of a plain string. Enable enforcement with CSP where supported:

```http
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types app-html dompurify
```

`trusted-types` lists the policy names the page may create. DOMPurify creates its own internal policy named
`dompurify` when Trusted Types are available, so allow that name too, or DOMPurify cannot parse HTML under enforcement.

Then create one policy that turns untrusted strings into sanitized HTML. Use feature detection so older browsers still
receive sanitized strings:

```ts
type TrustedTypesWindow = Window & typeof globalThis & {
    trustedTypes?: {
        createPolicy: (
            name: string,
            rules: { createHTML: (input: string) => string },
        ) => { createHTML: (input: string) => object };
    };
};

declare const DOMPurify: {
    sanitize(input: string): string;
};

const trustedTypes = (window as TrustedTypesWindow).trustedTypes;
const htmlPolicy = trustedTypes?.createPolicy("app-html", {
    createHTML: (input: string) => DOMPurify.sanitize(input),
});

function sanitizeForHtml(input: string): string | object {
    return htmlPolicy ? htmlPolicy.createHTML(input) : DOMPurify.sanitize(input);
}

function renderUserHtml(content: Element, userHtml: string): void {
    content.innerHTML = sanitizeForHtml(userHtml) as string;
}

const content = document.querySelector("#content");
if (content) {
    renderUserHtml(content, "<p>Hello</p>");
}
```

The policy above is named `app-html`; a `default` policy is also possible, but named policies make the trust boundary
more explicit. Trusted Types are supported in Chromium-based browsers; check MDN for current Firefox and Safari
support before relying on enforcement as a hard requirement.

## Common pitfalls

- **Trusting client-side validation**: users can bypass it.
- **Using block-lists**: they miss new attack patterns.
- **Mixing validation and sanitization**: they solve different problems.
- **Rendering with innerHTML**: avoid it for user input.
- **Logging raw input**: can leak sensitive data.

## Best practices

- **Validate on every boundary** (client and server).
- **Use allow-lists** for IDs, usernames, and tags.
- **Escape output based on context** (HTML text, quoted attributes, URL components, JSON strings); use parameterized
  queries for SQL.
- **Keep validation rules centralized** to avoid drift.
- **Test with malicious-looking inputs**.

## FAQ: input sanitization in JavaScript

### What is the difference between validation and sanitization?

Validation checks that input matches your expected format; sanitization normalizes or escapes it to make it safe.

```ts
const raw = "  hello  ";
const sanitized = raw.trim();
console.log(sanitized);
```

Result:

```text
hello
```

### How do I prevent XSS in JavaScript?

Avoid inserting raw user input into HTML. Use `textContent` or escape the content before rendering.

```ts
const input = "<script>alert(1)</script>";
const safeText = document.createTextNode(input).textContent;
console.log(safeText);
```

Result:

```text
<script>alert(1)</script>
```

### Should I sanitize on the backend if I already do it on the frontend?

Yes. Frontend validation improves UX, but backend validation is the real security boundary.

```ts
const isValid = isValidUsername("user_01");
console.log(isValid);
```

Result:

```text
true
```

## Summary

Sanitization and validation are essential for secure JavaScript. Validate inputs with allow-lists, normalize
consistently, escape output by context, and never rely on the frontend alone.
