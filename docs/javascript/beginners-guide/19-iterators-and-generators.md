---
title: "Iterators & Generators"
sidebar_label: "Iterators & Generators"
description: Understand JavaScript's iteration protocol - iterables, iterators, generator functions, lazy sequences, iterator helpers, and async iteration with for await...of.
slug: /javascript/beginners-guide/iterators-and-generators
tags: [javascript, beginners, iterators, generators, async]
keywords:
  - javascript iterator
  - javascript generator
  - function*
  - yield
  - Symbol.iterator
  - for await of
  - iterator helpers
sidebar_position: 19
---

# Iterators & Generators

You have used `for...of`, the spread operator `...`, and array destructuring on arrays, strings, Maps, and Sets. They
all work through the same mechanism: the **iteration protocol**. Once you understand it, you can make your own objects
work with all of those features - and write lazy sequences that compute values only when needed.

## The iteration protocol

Two small contracts make iteration work:

- An **iterable** is any object with a `[Symbol.iterator]()` method that returns an iterator.
- An **iterator** is an object with a `next()` method that returns `{ value, done }`.

You can drive an iterator by hand:

```js
const letters = ["a", "b"];
const iterator = letters[Symbol.iterator]();

console.log(iterator.next()); // { value: "a", done: false }
console.log(iterator.next()); // { value: "b", done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

`for...of` does exactly this for you: it asks for an iterator, calls `next()` until `done` is `true`, and hands you each
`value`.

### Built-in iterables

| Iterable                  | Yields                              |
|---------------------------|-------------------------------------|
| Array                     | Each element                        |
| String                    | Each Unicode code point             |
| `Map`                     | `[key, value]` pairs                |
| `Set`                     | Each value                          |
| `arguments`, `NodeList`   | Each item                           |
| `array.entries()`, `map.keys()`, ... | Iterators are iterable too |

Strings iterate by **code point**, not by UTF-16 code unit, so most emoji stay intact:

```js
const text = "hi👋";

console.log(text.length);  // 4 - the emoji uses two UTF-16 code units
console.log([...text]);    // ["h", "i", "👋"]
```

Some characters that look like one symbol are several code points (for example, family emoji or flags). Use
`Intl.Segmenter` when you need to split text into what users see as characters.

### Plain objects are not iterable

```js
const user = { name: "Ada", age: 36 };

for (const item of user) {} // TypeError: user is not iterable
```

Use `Object.keys()`, `Object.values()`, or `Object.entries()` - they return arrays, which are iterable:

```js
for (const [key, value] of Object.entries(user)) {
    console.log(`${key}: ${value}`);
}
```

### What consumes iterables

Anything that accepts an iterable works with every built-in collection and with your own iterables:

```js
const set = new Set([1, 2, 3]);

const copy = [...set];              // spread
const [first, second] = set;        // destructuring
const arr = Array.from(set);        // Array.from
const max = Math.max(...set);       // spread into arguments
const map = new Map([["a", 1]]);    // Map and Set constructors take iterables

console.log(copy, first, second, arr, max); // [1, 2, 3] 1 2 [1, 2, 3] 3
```

`Promise.all()`, `Promise.allSettled()`, and `yield*` (covered below) also accept any iterable.

## Writing a custom iterable

Here is a `range` object that works with `for...of`:

```js
const range = {
    from: 1,
    to: 4,

    [Symbol.iterator]() {
        let current = this.from;
        const last = this.to;

        return {
            next() {
                if (current <= last) {
                    return { value: current++, done: false };
                }
                return { value: undefined, done: true };
            },
        };
    },
};

for (const n of range) {
    console.log(n); // 1, 2, 3, 4
}

console.log([...range]); // [1, 2, 3, 4]
```

Each call to `[Symbol.iterator]()` creates a fresh iterator with its own `current`, so you can loop over `range` as many
times as you like.

### Iterators are one-shot

An **iterator** (as opposed to an iterable like an array) remembers its position. Once it is done, it stays done:

```js
const iterator = [1, 2, 3].values();

console.log([...iterator]); // [1, 2, 3]
console.log([...iterator]); // [] - already exhausted
```

If you need the values more than once, store them in an array, or keep the iterable and ask it for a new iterator.

## Generators

Writing `next()` by hand is tedious. A **generator function** - declared with `function*` - builds the iterator for
you. Inside it, `yield` hands out a value and **pauses** the function until the next value is requested:

```js
function* countTo(limit) {
    for (let i = 1; i <= limit; i++) {
        yield i;
    }
}

const counter = countTo(3); // nothing runs yet - you get a generator object

console.log(counter.next()); // { value: 1, done: false }
console.log(counter.next()); // { value: 2, done: false }
console.log(counter.next()); // { value: 3, done: false }
console.log(counter.next()); // { value: undefined, done: true }

console.log([...countTo(5)]); // [1, 2, 3, 4, 5]
```

A generator object is both an iterator and an iterable, so it works with `for...of`, spread, and destructuring.

### Watch the execution order

Code inside a generator only runs when `next()` is called, and it stops at each `yield`:

```js
function* steps() {
    console.log("start");
    yield "A";
    console.log("between");
    yield "B";
    console.log("end");
}

const gen = steps();
console.log("created");
console.log(gen.next().value);
console.log(gen.next().value);
console.log(gen.next().done);
```

Result:

```text
created
start
A
between
B
end
true
```

### The `return` value is not iterated

A `return` inside a generator finishes it. The returned value appears once in `next()` with `done: true`, but
`for...of` and spread ignore it:

```js
function* withReturn() {
    yield 1;
    return 2;
}

console.log([...withReturn()]); // [1]

const gen = withReturn();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: true }
```

### Generators as custom iterables

The `range` example becomes much shorter when `[Symbol.iterator]` is a generator method:

```js
class Range {
    constructor(from, to, step = 1) {
        this.from = from;
        this.to = to;
        this.step = step;
    }

    *[Symbol.iterator]() {
        for (let n = this.from; n <= this.to; n += this.step) {
            yield n;
        }
    }
}

console.log([...new Range(0, 10, 5)]); // [0, 5, 10]
```

### Delegating with `yield*`

`yield*` yields every value from another iterable:

```js
function* concat(...iterables) {
    for (const iterable of iterables) {
        yield* iterable;
    }
}

console.log([...concat([1, 2], "ab", new Set([3]))]); // [1, 2, "a", "b", 3]
```

It is especially handy for recursive structures, such as walking a tree:

```js
const tree = {
    name: "root",
    children: [
        { name: "a", children: [{ name: "a1", children: [] }] },
        { name: "b", children: [] },
    ],
};

function* walk(node) {
    yield node.name;
    for (const child of node.children) {
        yield* walk(child);
    }
}

console.log([...walk(tree)]); // ["root", "a", "a1", "b"]
```

## Lazy and infinite sequences

Because generators produce values on demand, a sequence can be infinite - as long as the consumer stops at some point:

```js
function* naturals() {
    let n = 0;
    while (true) {
        yield n++;
    }
}

function* take(iterable, count) {
    if (count <= 0) return;
    for (const value of iterable) {
        yield value;
        if (--count <= 0) return;
    }
}

console.log([...take(naturals(), 5)]); // [0, 1, 2, 3, 4]
```

Never spread an infinite generator directly (`[...naturals()]`) - it never finishes and eventually runs out of memory.

### Stopping early cleans up

When a `for...of` loop exits early with `break`, `return`, or a thrown error, JavaScript calls the iterator's
`return()` method. For generators, that runs any `finally` block, so cleanup code is not skipped:

```js
function* withCleanup() {
    try {
        yield 1;
        yield 2;
        yield 3;
    } finally {
        console.log("cleanup");
    }
}

for (const value of withCleanup()) {
    console.log(value);
    if (value === 2) break;
}
```

Result:

```text
1
2
cleanup
```

### Iterator helpers

Arrays have `map` and `filter`, but those build a whole new array at every step. **Iterator helpers** (ES2025 -
Node 22+, Chrome 122+, Firefox 131+, Safari 18.4+) add lazy versions to built-in iterators and generator objects: `map`,
`filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every`, and `find`.

```js
const firstEvenSquares = naturals()
    .filter((n) => n % 2 === 0)
    .map((n) => n * n)
    .take(3)
    .toArray();

console.log(firstEvenSquares); // [0, 4, 16]
```

Only as many numbers are generated as needed - the infinite `naturals()` is safe here because `take(3)` stops it.

To use helpers on an array, get its iterator with `values()` first. A hand-written iterator like the `range` example
above does not inherit the helpers - `Iterator.from()` wraps any iterable or iterator-like object so it gets them:

```js
const firstTwoLong = ["hi", "hello", "hey", "greetings"]
    .values()
    .filter((word) => word.length > 3)
    .take(2)
    .toArray();

console.log(firstTwoLong); // ["hello", "greetings"]

console.log(Iterator.from(new Set([1, 2, 3])).map((n) => n * 10).toArray()); // [10, 20, 30]
```

For older environments, the `take()` generator above shows the pattern: write small generator functions and pass
iterables between them.

## Sending values into a generator

`next()` can take an argument. It becomes the result of the `yield` expression where the generator is paused. The
argument to the **first** `next()` is ignored, because no `yield` is waiting yet:

```js
function* conversation() {
    const name = yield "What is your name?";
    const hobby = yield `Hi ${name}! What do you like?`;
    return `${name} likes ${hobby}.`;
}

const chat = conversation();

console.log(chat.next().value);          // "What is your name?"
console.log(chat.next("Ada").value);     // "Hi Ada! What do you like?"
console.log(chat.next("maths").value);   // "Ada likes maths."
```

Generators also have `return(value)` to finish early and `throw(error)` to raise an error at the paused `yield`. You
rarely need these in everyday code, but they are what libraries use to build state machines and schedulers on top of
generators.

## Async iteration

Some data arrives over time: pages from an API, lines from a file, chunks from a network stream. **Async iterables**
produce promises, and `for await...of` waits for each one.

An **async generator** (`async function*`) can both `await` and `yield`:

```js
async function* fetchAllPages(url) {
    let nextUrl = url;

    while (nextUrl) {
        const response = await fetch(nextUrl);
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const page = await response.json();
        yield page.items;
        nextUrl = page.next; // null or undefined on the last page
    }
}

async function printAllUsers() {
    for await (const users of fetchAllPages("https://api.example.com/users?page=1")) {
        for (const user of users) {
            console.log(user.name);
        }
    }
}
```

The consumer does not know about pagination at all - it just loops. If it breaks out early, no further pages are
requested.

A runnable example without a network:

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function* ticker(count, delayMs) {
    for (let i = 1; i <= count; i++) {
        await sleep(delayMs);
        yield i;
    }
}

for await (const tick of ticker(3, 100)) {
    console.log(`tick ${tick}`);
}
```

Result (one line every 100 ms):

```text
tick 1
tick 2
tick 3
```

Top-level `await` like the loop above works in ES modules and in the browser console. In a CommonJS Node.js script,
wrap it in an `async` function.

`Array.fromAsync()` (Node 22+ and all current browsers) collects an async iterable into an array:

```js
const ticks = await Array.fromAsync(ticker(3, 10));
console.log(ticks); // [1, 2, 3]
```

`for await...of` also works on regular iterables of promises, but `Promise.all()` is usually the better choice there,
because it waits for all promises in parallel instead of one after another.

## When to use what

| Situation                                                  | Reach for                          |
|------------------------------------------------------------|------------------------------------|
| You already have all values in memory                      | Arrays and array methods           |
| Make your own class work with `for...of` and spread        | `*[Symbol.iterator]()` generator   |
| Values are expensive to compute, or the sequence is endless | Generator + iterator helpers      |
| Walking trees or nested structures                         | Recursive generator with `yield*`  |
| Values arrive over time (pages, streams)                   | `async function*` + `for await`    |

## Summary

- An **iterable** has `[Symbol.iterator]()`; an **iterator** has `next()` returning `{ value, done }`.
- `for...of`, spread, destructuring, `Array.from`, and `new Map()`/`new Set()` all use this protocol.
- Arrays, strings, Maps, Sets, and NodeLists are iterable. Plain objects are not - use `Object.entries()`.
- Iterators are **one-shot**: once exhausted, they stay empty.
- **Generators** (`function*` with `yield`) create iterators for you and run lazily, pausing at each `yield`.
- `yield*` delegates to another iterable - ideal for recursion.
- Breaking out of a loop calls the iterator's `return()`, which runs the generator's `finally` block.
- **Iterator helpers** (`map`, `filter`, `take`, ...) chain lazily on built-in iterators and generators; wrap others
  with `Iterator.from()`.
- **Async generators** and `for await...of` handle data that arrives over time.

## Where to go next

This is the last chapter of the beginners guide. To keep going, pick a topic from the standalone guides:

- [Async/Await](../async-await-guide.mdx) - the event loop, running work in parallel, cancellation, and concurrency
  limits.
- [Error Handling](../javascript-error-handling.md) - error wrapping, retries, and global error handlers.
- [Dates and Time](../javascript-dates-and-time.md) - time zones, DST pitfalls, and the Temporal API.
- [Performance Basics](../javascript-performance-basics.md) - measuring and optimizing JavaScript.
- [TypeScript Beginners Guide](../../typescript/beginners-guide/01-introduction.md) - a full guide to static types.

Next up: [Async/Await in JavaScript](../async-await-guide.mdx) - practical patterns and pitfalls for asynchronous code.
