---
title: "JavaScript Performance Basics: Measure, Optimize, and Scale"
sidebar_label: "Performance Basics"
description: Practical JavaScript performance tips with TypeScript examples. Learn measurement, algorithmic complexity, caching, and avoiding common bottlenecks.
slug: /javascript/performance-basics
tags: [javascript, typescript, performance, optimization]
keywords:
  - JavaScript performance
  - performance optimization
  - Big O
  - memoization
  - JS profiling
  - array performance
sidebar_position: 3
---

# JavaScript Performance Basics: Measure, Optimize, and Scale

Performance work is part engineering, part discipline. The best results come from **measuring first**, then optimizing
the **actual bottleneck**. This guide focuses on practical JavaScript performance: algorithmic choices, memory behavior,
caching, and safe micro-optimizations. Every section includes TypeScript examples and expected output.

## Quick start

```ts
const items = Array.from({ length: 5 }, (_, i) => i + 1);
const sum = items.reduce((acc, v) => acc + v, 0);

console.log(sum);
```

Result:

```text
15
```

## Performance checklist

- **Measure first**: avoid guessing; confirm with timing.
- **Pick the right data structure**: `Map` vs object, arrays vs sets.
- **Reduce algorithmic complexity**: O(n log n) can beat O(n^2) by orders of magnitude.
- **Cache or memoize** repeated work when inputs repeat.
- **Avoid excessive allocations** in hot loops.
- **Batch DOM updates** if you are in the browser.

## Start with a performance baseline

Performance work should start with a baseline so you can prove improvements later. A baseline can be as simple as a
timing measurement in a test script or a small benchmark in your dev environment. What matters most is that you compare
the **same code path** before and after changes.

## Measure with simple timers

In production, use real profilers, but local measurements still help validate assumptions. You can use
`performance.now()` in browsers or `Date.now()` in any JS runtime.

```ts
function measure(label: string, fn: () => void): void {
    const start = Date.now();
    fn();
    const end = Date.now();
    console.log(`${label}: ${end - start}ms`);
}

measure("sum", () => {
    let total = 0;
    for (let i = 0; i < 1000; i += 1) total += i;
});
```

Result:

```text
sum: 0ms
```

The exact number will vary, but the **relative change** is what matters.

## Prefer the simplest algorithm that scales

Big O is not just theory. A slower algorithm can be fine for 100 items but catastrophic for 10,000. Start by estimating
your data size and growth rate.

## Choose the right algorithm

Small inputs hide slow algorithms. As data grows, complexity dominates everything else.

```ts
function hasDuplicateSlow(values: number[]): boolean {
    for (let i = 0; i < values.length; i += 1) {
        for (let j = i + 1; j < values.length; j += 1) {
            if (values[i] === values[j]) return true;
        }
    }
    return false;
}

function hasDuplicateFast(values: number[]): boolean {
    const seen = new Set<number>();
    for (const v of values) {
        if (seen.has(v)) return true;
        seen.add(v);
    }
    return false;
}

console.log(hasDuplicateFast([1, 2, 3, 2]));
```

Result:

```text
true
```

The `Set` version is O(n) while the nested loop is O(n^2).

## Data structures matter

`Map` has fast lookups and avoids prototype pitfalls. Use it for frequent inserts and reads.

```ts
const visits = new Map<string, number>();
visits.set("home", 1);
visits.set("home", (visits.get("home") ?? 0) + 1);

console.log(visits.get("home"));
```

Result:

```text
2
```

## Build strings efficiently

Repeated string concatenation in loops can create many intermediate strings. When you are assembling a known list of
parts, `Array.join` is often cleaner and faster.

```ts
const parts = ["JavaScript", "performance", "matters"];
const sentence = parts.join(" ");

console.log(sentence);
```

Result:

```text
JavaScript performance matters
```

## Debounce expensive work

If an action fires frequently (like typing), debounce to reduce repeated work.

```ts
function debounce<TArgs extends unknown[]>(
    fn: (...args: TArgs) => void,
    delayMs: number
): (...args: TArgs) => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: TArgs) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delayMs);
    };
}

const save = debounce((value: string) => {
    console.log(`saved: ${value}`);
}, 200);

save("draft-1");
```

Result:

```text
saved: draft-1
```

## Avoid extra allocations in hot loops

Creating new arrays or objects inside a tight loop can add pressure on the garbage collector.

```ts
function sumInline(values: number[]): number {
    let total = 0;
    for (let i = 0; i < values.length; i += 1) {
        total += values[i];
    }
    return total;
}

console.log(sumInline([1, 2, 3, 4]));
```

Result:

```text
10
```

## Precompute repeated work

If the same calculation runs on every iteration, move it out of the loop.

```ts
const items = [1, 2, 3, 4, 5];
const factor = 10;
const scaled = items.map((n) => n * factor);

console.log(scaled);
```

Result:

```text
[ 10, 20, 30, 40, 50 ]
```

## Memoization for expensive work

Memoization trades memory for speed. Use it when the same inputs repeat.

```ts
function memoize<TArg, TResult>(fn: (arg: TArg) => TResult): (arg: TArg) => TResult {
    const cache = new Map<TArg, TResult>();
    return (arg: TArg) => {
        if (cache.has(arg)) return cache.get(arg) as TResult;
        const value = fn(arg);
        cache.set(arg, value);
        return value;
    };
}

const slowSquare = (n: number) => n * n;
const fastSquare = memoize(slowSquare);

console.log(fastSquare(12));
```

Result:

```text
144
```

## Reduce work with early exits

Short-circuiting saves time and is easier to reason about.

```ts
function containsNegative(values: number[]): boolean {
    for (const v of values) {
        if (v < 0) return true;
    }
    return false;
}

console.log(containsNegative([1, 2, -1, 3]));
```

Result:

```text
true
```

## Use Sets for membership checks

Membership checks (`includes`) on arrays are O(n). For frequent lookups, a `Set` is typically faster.

```ts
const ids = new Set([10, 11, 12]);
console.log(ids.has(11));
```

Result:

```text
true
```

## Precompute lookup tables

If you repeatedly map codes to labels, a lookup table avoids branching logic.

```ts
const statusLabel: Record<number, string> = {
    200: "OK",
    404: "Not Found",
    500: "Server Error",
};

console.log(statusLabel[404]);
```

Result:

```text
Not Found
```

## Prefer iterative solutions when recursion is deep

Recursive solutions can be elegant but may risk stack overflows for large inputs.

```ts
function factorialIterative(n: number): number {
    let total = 1;
    for (let i = 2; i <= n; i += 1) total *= i;
    return total;
}

console.log(factorialIterative(6));
```

Result:

```text
720
```

## Batch work and avoid repeated parsing

If data is reused, parse once and reuse. This is especially relevant for JSON and CSV.

```ts
const jsonText = '{"items":[1,2,3,4]}';
const parsed = JSON.parse(jsonText) as { items: number[] };
const total = parsed.items.reduce((acc, v) => acc + v, 0);

console.log(total);
```

Result:

```text
10
```

## Browser note: avoid layout thrashing

If you are updating the DOM, batch reads and writes. Alternating `read -> write -> read` can force the browser to
recalculate layout multiple times. Collect the measurements first, then apply updates in one pass. This is less about
code syntax and more about **how you structure the work**.

## Memory awareness

Performance is also about memory. Large arrays, caches, or retained objects can slow down GC. If you cache data, set
limits or eviction strategies, and avoid retaining references to unused objects.

## Common pitfalls

- **Premature optimization**: optimizing the wrong part yields no benefit.
- **Micro-optimizing too early**: readability often wins for non-hot code.
- **Ignoring algorithmic complexity**: O(n^2) becomes painful fast.
- **Over-caching**: memoization can blow up memory if inputs are unbounded.
- **Benchmarking without control**: run multiple times and warm up.

## Best practices

- **Profile before you optimize**.
- **Use the simplest solution** that meets performance needs.
- **Keep data structures consistent** across the codebase.
- **Prefer clarity** until measurements prove otherwise.
- **Document why a micro-optimization exists**.

## FAQ: JavaScript performance

### How do I measure performance in JavaScript?

Use simple timers for quick checks, then rely on profilers for real analysis.

```ts
const start = Date.now();
for (let i = 0; i < 10000; i += 1) {}
const end = Date.now();

console.log(`${end - start}ms`);
```

Result:

```text
0ms
```

### What is the biggest performance win in JavaScript?

Usually an **algorithmic change** (like switching from O(n^2) to O(n log n)) beats any micro-optimization.

```ts
const fast = new Set([1, 2, 3, 4]);
console.log(fast.has(3));
```

Result:

```text
true
```

### Is memoization always good?

No. Memoization is great for repeated inputs but can consume a lot of memory for large input ranges.

```ts
const memo = new Map<number, number>();
memo.set(1, 1);
console.log(memo.size);
```

Result:

```text
1
```

## Summary

JavaScript performance is about **measuring**, **choosing the right algorithms**, and **reducing unnecessary work**.
Start with profiling, then apply targeted changes that you can justify with data.
