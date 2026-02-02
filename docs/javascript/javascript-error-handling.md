---
title: "JavaScript Error Handling: Patterns, Types, and Best Practices"
sidebar_label: "Error Handling"
description: Learn practical JavaScript error handling with TypeScript examples. Cover try/catch, async errors, custom error types, and safe logging.
slug: /javascript/error-handling
tags: [javascript, typescript, errors, reliability]
keywords:
  - JavaScript error handling
  - try catch
  - async error handling
  - custom error class
  - Error cause
  - TypeScript errors
sidebar_position: 2
---

# JavaScript Error Handling: Patterns, Types, and Best Practices

Modern JavaScript runs in browsers, Node.js, and edge runtimes, but error handling fundamentals stay the same: detect failures early, report them clearly, and recover when possible. This post focuses on **practical error handling** with **TypeScript examples** and the output you can expect. The goal is to build reliable systems without hiding the real cause of failures.

## Quick start

```ts
function parseUser(input: string): { id: number; name: string } {
    try {
        const value = JSON.parse(input) as { id: number; name: string };
        if (typeof value.id !== "number" || typeof value.name !== "string") {
            throw new Error("Invalid user shape");
        }
        return value;
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        throw new Error(`Failed to parse user: ${message}`);
    }
}

console.log(parseUser('{"id": 1, "name": "Ada"}'));
```

Result:
```text
{ id: 1, name: "Ada" }
```

## Error handling checklist

- **Catch only where you can act**: if you cannot fix or map the error, let it bubble.
- **Preserve the cause**: wrap with context but keep the original error.
- **Avoid swallowing errors**: silent failures are hard to debug.
- **Return safe messages to users**: do not expose internal details.
- **Log with context**: include input identifiers, not raw user data or secrets.

## Understanding Error types

JavaScript has built-in error classes like `Error`, `TypeError`, and `RangeError`. These should be your default. Custom errors are useful when you need to distinguish **expected failures** from **unexpected bugs**.

```ts
class NotFoundError extends Error {
    readonly status = 404;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "NotFoundError";
        if (options?.cause) {
            // @ts-expect-error - cause is available at runtime in modern JS
            this.cause = options.cause;
        }
    }
}

function findUser(id: number): { id: number; name: string } {
    if (id !== 1) {
        throw new NotFoundError(`User ${id} not found`);
    }
    return { id: 1, name: "Ada" };
}

try {
    console.log(findUser(2));
} catch (err) {
    console.log(err instanceof NotFoundError ? err.status : 500);
}
```

Result:
```text
404
```

## Wrapping errors with context

Wrapping errors lets you add higher-level context while preserving the original cause. This is especially useful across layers (data access -> service -> API).

```ts
function readConfig(jsonText: string): { port: number } {
    try {
        return JSON.parse(jsonText) as { port: number };
    } catch (err) {
        const cause = err instanceof Error ? err : undefined;
        const wrapped = new Error("Config JSON is invalid");
        // @ts-expect-error - cause is available at runtime in modern JS
        wrapped.cause = cause;
        throw wrapped;
    }
}

try {
    readConfig("{ bad-json }");
} catch (err) {
    const error = err as Error;
    console.log(error.message);
}
```

Result:
```text
Config JSON is invalid
```

## Sync vs async errors

Synchronous errors are thrown and caught via `try/catch`. Asynchronous errors happen in promises and must be caught with `await` or `.catch()`.

```ts
async function fetchUser(id: number): Promise<string> {
    if (id !== 1) {
        throw new Error("User not found");
    }
    return "Ada";
}

async function example(): Promise<void> {
    try {
        const name = await fetchUser(2);
        console.log(name);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.log(message);
    }
}

example();
```

Result:
```text
User not found
```

## Result objects for expected failures

Some failures are expected (e.g., "user not found"). Throwing exceptions in those cases can make control flow noisy. A **Result object** keeps the error explicit and avoids catch blocks for common cases.

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseId(input: string): Result<number> {
    const value = Number(input);
    if (!Number.isFinite(value)) {
        return { ok: false, error: "id must be a number" };
    }
    return { ok: true, value };
}

const result = parseId("42");
console.log(result);
```

Result:
```text
{ ok: true, value: 42 }
```

This pattern works well at API boundaries and form validation, while internal errors can still throw.

## Handling multiple failures with Promise.allSettled

If you want to run tasks in parallel but keep going even if one fails, `Promise.allSettled` is the safe tool. It returns a result for every promise.

```ts
function task(id: number): Promise<string> {
    if (id === 2) return Promise.reject(new Error("Network timeout"));
    return Promise.resolve(`task-${id} ok`);
}

async function run(): Promise<void> {
    const results = await Promise.allSettled([task(1), task(2), task(3)]);
    const summary = results.map((r) =>
        r.status === "fulfilled" ? r.value : `error: ${r.reason.message}`
    );
    console.log(summary);
}

run();
```

Result:
```text
[ "task-1 ok", "error: Network timeout", "task-3 ok" ]
```

## Retry with backoff (when safe)

Retries make sense for flaky networks, not for validation or logic errors. Keep retries bounded and avoid retry storms.

```ts
async function retry<T>(
    task: () => Promise<T>,
    retries: number
): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
        try {
            return await task();
        } catch (err) {
            lastError = err instanceof Error ? err : new Error("Unknown error");
        }
    }
    throw lastError ?? new Error("Retry failed");
}

let attempts = 0;
const flaky = async () => {
    attempts += 1;
    if (attempts < 3) throw new Error("Temporary failure");
    return "ok";
};

retry(flaky, 3).then((value) => console.log(value));
```

Result:
```text
ok
```

## Converting errors to user-friendly messages

Users should see simple messages. Logs should include more details for operators. Keep those two channels separate.

```ts
type PublicError = { status: number; message: string };

function toPublicError(err: unknown): PublicError {
    if (err instanceof NotFoundError) {
        return { status: 404, message: "Resource not found" };
    }
    return { status: 500, message: "Something went wrong" };
}

const publicError = toPublicError(new NotFoundError("User 99 not found"));
console.log(publicError);
```

Result:
```text
{ status: 404, message: "Resource not found" }
```

## Safe logging without leaking data

Logs are for operators, not users. Include identifiers that help trace issues, but avoid raw user input, tokens, or secrets. You can structure logs as simple objects.

```ts
type LogEntry = {
    level: "error";
    message: string;
    requestId: string;
    userId?: string;
};

const entry: LogEntry = {
    level: "error",
    message: "Failed to load profile",
    requestId: "req_7e9c",
    userId: "user_42",
};

console.log(entry);
```

Result:
```text
{ level: "error", message: "Failed to load profile", requestId: "req_7e9c", userId: "user_42" }
```

## Guarding against unknown error shapes

JavaScript allows throwing anything. Always protect against non-Error values.

```ts
function normalizeError(err: unknown): Error {
    if (err instanceof Error) return err;
    return new Error("Unknown error");
}

const error = normalizeError("boom");
console.log(error.message);
```

Result:
```text
Unknown error
```

## Error handling at UI boundaries

UI code should be defensive because user events can be unpredictable. Wrap event handlers to ensure errors are reported and don't break the rest of the page.

```ts
function runSafely<T>(fn: () => T): T | null {
    try {
        return fn();
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.log(`UI error: ${message}`);
        return null;
    }
}

const resultValue = runSafely(() => {
    throw new Error("Button handler failed");
});

console.log(resultValue);
```

Result:
```text
UI error: Button handler failed
null
```

## Common pitfalls

- **Swallowing errors**: `try { ... } catch {}` without a fallback hides problems.
- **Throwing strings**: loses stack traces and type safety.
- **Overusing custom errors**: too many types can make code hard to follow.
- **Mixing user and operator messages**: users should not see internal details.
- **No context**: errors without identifiers (userId, requestId) are harder to trace.

## Best practices

- **Use built-in errors first**: `Error`, `TypeError`, `RangeError`.
- **Wrap with context** when crossing boundaries (IO -> business -> UI).
- **Preserve causes** to make debugging easier.
- **Handle async errors explicitly** with `await` in `try/catch`.
- **Log safely**: avoid personal data or secrets in logs.

## FAQ: JavaScript error handling

### How do I use try/catch in JavaScript?

Wrap the risky code and handle the error in the `catch` block.

```ts
try {
    JSON.parse("{bad json}");
} catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.log(message);
}
```

Result:
```text
Unexpected token b in JSON at position 1
```

### How do I handle async errors with await?

Put `await` inside a `try/catch` in an `async` function.

```ts
async function main(): Promise<void> {
    try {
        await Promise.reject(new Error("Request failed"));
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.log(message);
    }
}

main();
```

Result:
```text
Request failed
```

### Should I create custom error classes?

Yes, when you need to distinguish expected failures from bugs, or map errors to HTTP status codes.

```ts
class ValidationError extends Error {
    readonly status = 400;
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

const err = new ValidationError("Email is invalid");
console.log(err.name);
```

Result:
```text
ValidationError
```

## Summary

Good error handling is a balance: **fail fast**, **fail clearly**, and **recover when you can**. Use `try/catch` for sync code, `await` for async code, preserve causes, and keep user messages safe. Your future self (and your logs) will thank you.
