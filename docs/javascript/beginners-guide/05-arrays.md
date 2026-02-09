---
title: "Arrays"
sidebar_label: "Arrays"
description: Learn JavaScript arrays — creating, accessing, mutating, iterating with map/filter/reduce, destructuring, and the spread operator.
slug: /javascript/beginners-guide/arrays
tags: [javascript, beginners, arrays]
keywords:
  - javascript arrays
  - array methods
  - map filter reduce
  - destructuring
  - spread operator
sidebar_position: 5
---

# Arrays

An array is an ordered list of values. Arrays are one of the most used data structures in JavaScript.

## Creating arrays

```js
// Array literal (preferred)
const fruits = ["apple", "banana", "cherry"];
console.log(fruits);

// Empty array
const empty = [];
console.log(empty);

// Mixed types (valid but rarely useful)
const mixed = [1, "two", true, null];
console.log(mixed);
```

Result:
```text
[ 'apple', 'banana', 'cherry' ]
[]
[ 1, 'two', true, null ]
```

## Accessing elements

Arrays are **zero-indexed** — the first element is at index `0`:

```js
const colors = ["red", "green", "blue"];

console.log(colors[0]);
console.log(colors[1]);
console.log(colors[2]);
console.log(colors[3]); // out of bounds — undefined, not an error
```

Result:
```text
red
green
blue
undefined
```

### Length

```js
const items = ["a", "b", "c", "d"];
console.log(items.length);
```

Result:
```text
4
```

### Last element

```js
const items = ["a", "b", "c", "d"];
console.log(items[items.length - 1]);

// Modern alternative: at()
console.log(items.at(-1));
console.log(items.at(-2));
```

Result:
```text
d
d
c
```

## Modifying elements

```js
const colors = ["red", "green", "blue"];
colors[1] = "yellow";
console.log(colors);
```

Result:
```text
[ 'red', 'yellow', 'blue' ]
```

Note: even though `colors` is declared with `const`, you can modify the array contents. `const` prevents reassigning the variable, not mutating the value.

## Adding and removing elements

### `push` / `pop` — end of array

```js
const stack = [1, 2, 3];

stack.push(4);
console.log(stack);

const removed = stack.pop();
console.log(removed);
console.log(stack);
```

Result:
```text
[ 1, 2, 3, 4 ]
4
[ 1, 2, 3 ]
```

### `unshift` / `shift` — start of array

```js
const queue = [2, 3, 4];

queue.unshift(1);
console.log(queue);

const first = queue.shift();
console.log(first);
console.log(queue);
```

Result:
```text
[ 1, 2, 3, 4 ]
1
[ 2, 3, 4 ]
```

### `splice` — add or remove at any position

```js
const letters = ["a", "b", "c", "d", "e"];

// Remove 2 elements starting at index 1
const removed = letters.splice(1, 2);
console.log(removed);
console.log(letters);
```

Result:
```text
[ 'b', 'c' ]
[ 'a', 'd', 'e' ]
```

Insert elements:

```js
const nums = [1, 2, 5, 6];

// At index 2, remove 0 elements, insert 3 and 4
nums.splice(2, 0, 3, 4);
console.log(nums);
```

Result:
```text
[ 1, 2, 3, 4, 5, 6 ]
```

Replace elements:

```js
const items = ["a", "b", "c"];

// At index 1, remove 1 element, insert "B"
items.splice(1, 1, "B");
console.log(items);
```

Result:
```text
[ 'a', 'B', 'c' ]
```

## Checking contents

```js
const fruits = ["apple", "banana", "cherry"];

console.log(fruits.includes("banana"));
console.log(fruits.includes("grape"));
console.log(fruits.indexOf("cherry"));
console.log(fruits.indexOf("grape")); // -1 means not found
```

Result:
```text
true
false
2
-1
```

## Iterating over arrays

### `for...of`

The simplest way to loop over values:

```js
const names = ["Alice", "Bob", "Charlie"];

for (const name of names) {
    console.log(name);
}
```

Result:
```text
Alice
Bob
Charlie
```

### `forEach`

A method that calls a function for each element:

```js
const numbers = [10, 20, 30];

numbers.forEach((num, index) => {
    console.log(`Index ${index}: ${num}`);
});
```

Result:
```text
Index 0: 10
Index 1: 20
Index 2: 30
```

`forEach` cannot be stopped early (no `break`). If you need early exit, use `for...of`.

## Transforming arrays

### `map` — transform every element

Creates a **new** array by applying a function to each element:

```js
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);

console.log(doubled);
console.log(numbers); // original unchanged
```

Result:
```text
[ 2, 4, 6, 8, 10 ]
[ 1, 2, 3, 4, 5 ]
```

Practical example — extracting data:

```js
const users = [
    { name: "Ada", age: 36 },
    { name: "Grace", age: 85 },
    { name: "Alan", age: 41 },
];

const names = users.map((user) => user.name);
console.log(names);
```

Result:
```text
[ 'Ada', 'Grace', 'Alan' ]
```

### `filter` — keep elements that match

Creates a new array with only the elements that pass a test:

```js
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = numbers.filter((n) => n % 2 === 0);

console.log(evens);
```

Result:
```text
[ 2, 4, 6, 8, 10 ]
```

Practical example:

```js
const products = [
    { name: "Laptop", price: 999 },
    { name: "Mouse", price: 29 },
    { name: "Monitor", price: 449 },
    { name: "Keyboard", price: 79 },
];

const affordable = products.filter((p) => p.price < 100);
console.log(affordable);
```

Result:
```text
[ { name: 'Mouse', price: 29 }, { name: 'Keyboard', price: 79 } ]
```

### `reduce` — combine elements into a single value

The most powerful (and most confusing) array method:

```js
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((accumulator, current) => {
    return accumulator + current;
}, 0);

console.log(sum);
```

Result:
```text
15
```

How it works, step by step:

| Step | accumulator | current | Result |
|------|-------------|---------|--------|
| 1 | 0 (initial) | 1 | 1 |
| 2 | 1 | 2 | 3 |
| 3 | 3 | 3 | 6 |
| 4 | 6 | 4 | 10 |
| 5 | 10 | 5 | 15 |

Practical example — counting occurrences:

```js
const words = ["apple", "banana", "apple", "cherry", "banana", "apple"];

const counts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
}, {});

console.log(counts);
```

Result:
```text
{ apple: 3, banana: 2, cherry: 1 }
```

### `find` — get the first match

Returns the **first** element that passes the test, or `undefined`:

```js
const users = [
    { name: "Ada", role: "admin" },
    { name: "Bob", role: "user" },
    { name: "Charlie", role: "admin" },
];

const admin = users.find((u) => u.role === "admin");
console.log(admin);
```

Result:
```text
{ name: 'Ada', role: 'admin' }
```

### `findIndex` — get the index of the first match

```js
const numbers = [10, 20, 30, 40];
const index = numbers.findIndex((n) => n > 25);
console.log(index);
```

Result:
```text
2
```

### `some` / `every` — boolean tests

```js
const scores = [85, 92, 78, 95, 88];

const hasHighScore = scores.some((s) => s > 90);
console.log(hasHighScore);

const allPassing = scores.every((s) => s >= 60);
console.log(allPassing);

const allExcellent = scores.every((s) => s >= 90);
console.log(allExcellent);
```

Result:
```text
true
true
false
```

## Chaining methods

Array methods that return arrays can be chained:

```js
const people = [
    { name: "Ada", age: 36 },
    { name: "Bob", age: 17 },
    { name: "Charlie", age: 25 },
    { name: "Diana", age: 15 },
    { name: "Eve", age: 42 },
];

const adultNames = people
    .filter((p) => p.age >= 18)
    .map((p) => p.name)
    .sort();

console.log(adultNames);
```

Result:
```text
[ 'Ada', 'Charlie', 'Eve' ]
```

Read this as: "Take the people, keep only those 18 or older, extract their names, sort alphabetically."

## Sorting

### Default sort (alphabetical)

```js
const fruits = ["cherry", "apple", "banana"];
fruits.sort();
console.log(fruits);
```

Result:
```text
[ 'apple', 'banana', 'cherry' ]
```

**Warning:** the default sort converts elements to strings, which breaks numeric sorting:

```js
const numbers = [10, 2, 30, 4, 5];
numbers.sort();
console.log(numbers);
```

Result:
```text
[ 10, 2, 30, 4, 5 ]
```

### Numeric sort

Provide a compare function:

```js
const numbers = [10, 2, 30, 4, 5];

numbers.sort((a, b) => a - b); // ascending
console.log(numbers);

numbers.sort((a, b) => b - a); // descending
console.log(numbers);
```

Result:
```text
[ 2, 4, 5, 10, 30 ]
[ 30, 10, 5, 4, 2 ]
```

The compare function returns:
- A **negative** number: `a` comes first
- **Zero**: order unchanged
- A **positive** number: `b` comes first

### Sorting objects

```js
const users = [
    { name: "Charlie", age: 25 },
    { name: "Ada", age: 36 },
    { name: "Bob", age: 17 },
];

users.sort((a, b) => a.age - b.age);
console.log(users.map((u) => `${u.name} (${u.age})`));
```

Result:
```text
[ 'Bob (17)', 'Charlie (25)', 'Ada (36)' ]
```

**Important:** `sort()` mutates the original array. If you need the original, copy first:

```js
const original = [3, 1, 2];
const sorted = [...original].sort((a, b) => a - b);

console.log(original);
console.log(sorted);
```

Result:
```text
[ 3, 1, 2 ]
[ 1, 2, 3 ]
```

## Other useful methods

### `concat` — merge arrays

```js
const a = [1, 2];
const b = [3, 4];
const combined = a.concat(b);
console.log(combined);
```

Result:
```text
[ 1, 2, 3, 4 ]
```

### `flat` — flatten nested arrays

```js
const nested = [[1, 2], [3, 4], [5, 6]];
console.log(nested.flat());

const deep = [1, [2, [3, [4]]]];
console.log(deep.flat(Infinity));
```

Result:
```text
[ 1, 2, 3, 4, 5, 6 ]
[ 1, 2, 3, 4 ]
```

### `join` — convert to string

```js
const words = ["Hello", "world"];
console.log(words.join(" "));
console.log(words.join("-"));
console.log(words.join(""));
```

Result:
```text
Hello world
Hello-world
Helloworld
```

### `reverse`

```js
const nums = [1, 2, 3, 4, 5];
nums.reverse();
console.log(nums);
```

Result:
```text
[ 5, 4, 3, 2, 1 ]
```

Like `sort`, `reverse` mutates the original. Copy first with `[...array]` if needed.

### `slice` — extract a portion

```js
const letters = ["a", "b", "c", "d", "e"];

console.log(letters.slice(1, 3));    // index 1 up to (not including) 3
console.log(letters.slice(2));       // from index 2 to end
console.log(letters.slice(-2));      // last 2 elements
console.log(letters);                // original unchanged
```

Result:
```text
[ 'b', 'c' ]
[ 'c', 'd', 'e' ]
[ 'd', 'e' ]
[ 'a', 'b', 'c', 'd', 'e' ]
```

## Destructuring

Extract values from an array into separate variables:

```js
const rgb = [255, 128, 0];
const [red, green, blue] = rgb;

console.log(red);
console.log(green);
console.log(blue);
```

Result:
```text
255
128
0
```

### Skipping values

```js
const data = [1, 2, 3, 4, 5];
const [first, , third] = data;

console.log(first);
console.log(third);
```

Result:
```text
1
3
```

### Rest in destructuring

```js
const [head, ...tail] = [1, 2, 3, 4, 5];

console.log(head);
console.log(tail);
```

Result:
```text
1
[ 2, 3, 4, 5 ]
```

### Default values

```js
const [a = 0, b = 0, c = 0] = [10, 20];

console.log(a);
console.log(b);
console.log(c);
```

Result:
```text
10
20
0
```

### Swapping variables

```js
let x = 1;
let y = 2;

[x, y] = [y, x];

console.log(x);
console.log(y);
```

Result:
```text
2
1
```

## Spread operator

The spread operator `...` expands an array into individual elements:

```js
const first = [1, 2, 3];
const second = [4, 5, 6];

// Merge arrays
const combined = [...first, ...second];
console.log(combined);

// Copy an array
const copy = [...first];
copy.push(99);
console.log(first); // original unchanged
console.log(copy);

// Insert in the middle
const middle = [1, 2, ...second, 9, 10];
console.log(middle);
```

Result:
```text
[ 1, 2, 3, 4, 5, 6 ]
[ 1, 2, 3 ]
[ 1, 2, 3, 99 ]
[ 1, 2, 4, 5, 6, 9, 10 ]
```

## Summary

- Arrays are zero-indexed ordered lists; use `[]` to create them.
- `push`/`pop` (end), `unshift`/`shift` (start), `splice` (anywhere) to add/remove.
- `map` transforms, `filter` selects, `reduce` accumulates, `find` searches.
- `some`/`every` check conditions across all elements.
- Chain methods for expressive data pipelines.
- `sort()` mutates and does alphabetical sorting by default — provide a compare function for numbers.
- Destructuring extracts values; spread `...` copies and merges arrays.

Next up: [Objects](./06-objects.md) — key-value data structures that model real-world entities.
