---
title: "Async/Await in JavaScript: Practical Patterns and Pitfalls"
sidebar_label: "Async/Await"
description: Learn async/await with TypeScript examples. Understand sequential vs parallel work, error handling, timeouts, and best practices.
slug: /javascript/async-await
tags: [javascript, typescript, async, promises]
keywords:
  - async await
  - JavaScript promises
  - async error handling
  - Promise.all
  - async patterns
sidebar_position: 4
---

# Async/Await in JavaScript: Practical Patterns and Pitfalls

`async/await` is the modern way to write asynchronous JavaScript. It reads like synchronous code but runs on promises.
This guide covers **real-world async patterns**, how to avoid common mistakes, and how to make async code reliable. All
examples are TypeScript and include the output you should expect.

## Quick start

```ts
async function getName(): Promise<string> {
    return "Ada";
}

async function main(): Promise<void> {
    const name = await getName();
    console.log(name);
}

main();
```

Result:

```text
Ada
```

## Async checklist

- **Always `await` the promise** you care about.
- **Use `try/catch` for async errors**.
- **Prefer parallel work** when tasks are independent.
- **Limit concurrency** when tasks are heavy.
- **Add timeouts** for external calls.
- **Avoid top-level unhandled promises**.

## Async functions always return promises

An `async` function wraps its return value in a promise. That means even a plain `return 42` is a `Promise<number>`.

```ts
async function value(): Promise<number> {
    return 42;
}

const result = value();
console.log(result instanceof Promise);
```

Result:

```text
true
```

## Sequential vs parallel

If tasks are independent, run them in parallel with `Promise.all`. If they depend on each other, keep them sequential.

```ts
const task = async (id: number): Promise<string> => `task-${id}`;

async function parallel(): Promise<string[]> {
    const values = await Promise.all([task(1), task(2), task(3)]);
    return values;
}

parallel().then((values) => console.log(values));
```

Result:

```text
[ "task-1", "task-2", "task-3" ]
```

```ts
async function sequential(): Promise<string[]> {
    const a = await task(1);
    const b = await task(2);
    const c = await task(3);
    return [a, b, c];
}

sequential().then((values) => console.log(values));
```

Result:

```text
[ "task-1", "task-2", "task-3" ]
```

## Async mapping with Promise.all

When you need to transform a list with async work, map to promises and `await` the array with `Promise.all`.

```ts
async function enrich(id: number): Promise<string> {
    return `user-${id}`;
}

async function mapAsync(): Promise<void> {
    const ids = [1, 2, 3];
    const values = await Promise.all(ids.map((id) => enrich(id)));
    console.log(values);
}

mapAsync();
```

Result:

```text
[ "user-1", "user-2", "user-3" ]
```

## Error handling with try/catch

Async errors are thrown just like sync errors, but only if you `await` the promise.

```ts
async function fails(): Promise<void> {
    throw new Error("Request failed");
}

async function run(): Promise<void> {
    try {
        await fails();
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.log(message);
    }
}

run();
```

Result:

```text
Request failed
```

## Avoid async in forEach

`Array.forEach` does not await async callbacks. Use `for...of` instead when order matters.

```ts
async function logIds(ids: number[]): Promise<void> {
    for (const id of ids) {
        const value = await Promise.resolve(`id-${id}`);
        console.log(value);
    }
}

logIds([1, 2, 3]);
```

Result:

```text
id-1
id-2
id-3
```

## Promise.allSettled for partial success

Use `Promise.allSettled` when you want all results, even if some tasks fail.

```ts
const maybe = (id: number): Promise<string> => {
    if (id === 2) return Promise.reject(new Error("Timeout"));
    return Promise.resolve(`ok-${id}`);
};

async function runAll(): Promise<void> {
    const results = await Promise.allSettled([maybe(1), maybe(2), maybe(3)]);
    const output = results.map((r) =>
        r.status === "fulfilled" ? r.value : `error: ${r.reason.message}`
    );
    console.log(output);
}

runAll();
```

Result:

```text
[ "ok-1", "error: Timeout", "ok-3" ]
```

## Timeouts with Promise.race

Timeouts are essential for external calls. A simple pattern is to race your task against a timeout promise.

```ts
function timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timed out")), ms);
    });
}

async function slowTask(): Promise<string> {
    return "done";
}

Promise.race([slowTask(), timeout(100)])
    .then((value) => console.log(value))
    .catch((err: Error) => console.log(err.message));
```

Result:

```text
done
```

Note: in real code, the timeout may win if the task is truly slow.

## Cancellation with AbortController

When working with browser APIs like `fetch`, use `AbortController` to cancel requests. This prevents wasted work and can
improve UX.

```ts
const controller = new AbortController();
const { signal } = controller;

async function run(): Promise<void> {
    controller.abort();
    console.log(signal.aborted);
}

run();
```

Result:

```text
true
```

## Concurrency limits

Launching too many promises at once can overwhelm APIs or your runtime. Use a simple limiter to cap concurrency.

```ts
async function runWithLimit<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
): Promise<T[]> {
    const results: T[] = [];
    const queue = [...tasks];
    const workers = Array.from({ length: limit }, async () => {
        while (queue.length > 0) {
            const task = queue.shift();
            if (!task) break;
            results.push(await task());
        }
    });
    await Promise.all(workers);
    return results;
}

const tasks = [1, 2, 3, 4].map((id) => async () => `job-${id}`);
runWithLimit(tasks, 2).then((values) => console.log(values));
```

Result:

```text
[ "job-1", "job-2", "job-3", "job-4" ]
```

## Avoiding unhandled rejections

If you start a promise and do not `await` or `catch` it, errors can be dropped.

```ts
async function safeFireAndForget(task: Promise<void>): Promise<void> {
    task.catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.log(`Unhandled: ${message}`);
    });
}

safeFireAndForget(Promise.reject(new Error("boom")));
```

Result:

```text
Unhandled: boom
```

## Keep a clear async boundary

Wrap top-level async code in a single `main` function so it is easier to handle errors in one place.

```ts
async function main(): Promise<void> {
    console.log("start");
}

main().catch((err) => console.log(err instanceof Error ? err.message : "Unknown"));
```

Result:

```text
start
```

## Async iteration for streams

If you are consuming a stream or paginated API, `for await...of` keeps code readable and memory usage low.

```ts
async function* numbers(): AsyncGenerator<number> {
    yield 1;
    yield 2;
    yield 3;
}

async function consume(): Promise<void> {
    const out: number[] = [];
    for await (const n of numbers()) {
        out.push(n);
    }
    console.log(out);
}

consume();
```

Result:

```text
[ 1, 2, 3 ]
```

## Common pitfalls

- **Forgetting `await`**: `const value = getData()` yields a promise, not data.
- **Using `forEach` with async**: it does not await; use `for...of`.
- **Parallelizing dependent work**: leads to race conditions.
- **Swallowing errors**: avoid `.catch(() => {})` unless you rethrow.
- **Unbounded concurrency**: can cause rate limits or memory spikes.

## Best practices

- **Be explicit about parallelism**: `Promise.all` vs sequential `await`.
- **Use `allSettled` for partial success**.
- **Prefer small async functions** for easier reasoning.
- **Document timeouts and retry policy**.
- **Return typed results** to avoid ambiguous promises.

## FAQ: async/await

### How does async/await work in JavaScript?

`async` functions always return a promise. `await` pauses execution until that promise resolves or rejects.

```ts
async function value(): Promise<number> {
    return 42;
}

value().then((v) => console.log(v));
```

Result:

```text
42
```

### How do I run multiple async tasks in parallel?

Use `Promise.all` for independent tasks.

```ts
const a = Promise.resolve("A");
const b = Promise.resolve("B");
Promise.all([a, b]).then((values) => console.log(values));
```

Result:

```text
[ "A", "B" ]
```

### What is the safest pattern for async errors?

Wrap the `await` in `try/catch` and normalize the error type.

```ts
async function safe(): Promise<void> {
    try {
        await Promise.reject(new Error("Bad"));
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.log(message);
    }
}

safe();
```

Result:

```text
Bad
```

## Summary

`async/await` makes async code readable, but you still need to be explicit about parallelism, timeouts, and error
handling. Use `Promise.all` where possible, `allSettled` for partial success, and always make errors observable.
