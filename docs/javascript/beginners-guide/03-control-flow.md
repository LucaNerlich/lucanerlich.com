---
title: "Control Flow"
sidebar_label: "Control Flow"
description: Learn how to make decisions and repeat actions in JavaScript with if/else, switch, ternary operators, and loops.
slug: /javascript/beginners-guide/control-flow
tags: [javascript, beginners, control-flow, loops]
keywords:
  - javascript if else
  - javascript loops
  - switch statement
  - for loop
  - while loop
sidebar_position: 3
---

# Control Flow

Programs need to make decisions and repeat actions. Control flow statements let you do both.

## `if` / `else if` / `else`

The most basic decision structure:

```js
const temperature = 25;

if (temperature > 30) {
    console.log("It's hot");
} else if (temperature > 20) {
    console.log("It's warm");
} else if (temperature > 10) {
    console.log("It's cool");
} else {
    console.log("It's cold");
}
```

Result:
```text
It's warm
```

Rules:
- The condition inside `()` is converted to a boolean.
- Only the **first** matching branch runs.
- `else if` and `else` are optional.
- Always use curly braces `{}`, even for single-line bodies — it prevents bugs when you add lines later.

### Combining conditions

Use logical operators to combine conditions:

```js
const age = 25;
const hasLicense = true;

if (age >= 18 && hasLicense) {
    console.log("You can drive");
}

const isWeekend = true;
const isHoliday = false;

if (isWeekend || isHoliday) {
    console.log("Day off!");
}
```

Result:
```text
You can drive
Day off!
```

### Negation

```js
const isLoggedIn = false;

if (!isLoggedIn) {
    console.log("Please log in");
}
```

Result:
```text
Please log in
```

## Ternary operator

A one-line `if/else`:

```js
const age = 20;
const status = age >= 18 ? "adult" : "minor";
console.log(status);
```

Result:
```text
adult
```

The syntax is `condition ? valueIfTrue : valueIfFalse`. Use it for simple assignments. Do not nest ternaries — they become unreadable:

```js
// Don't do this
const result = a > b ? (a > c ? "a" : "c") : (b > c ? "b" : "c");

// Do this instead
let result;
if (a > b && a > c) {
    result = "a";
} else if (b > c) {
    result = "b";
} else {
    result = "c";
}
```

## `switch`

When comparing a single value against many options:

```js
const day = "Monday";

switch (day) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
        console.log("Weekday");
        break;
    case "Saturday":
    case "Sunday":
        console.log("Weekend");
        break;
    default:
        console.log("Unknown day");
}
```

Result:
```text
Weekday
```

**Important:** Always include `break`. Without it, execution "falls through" to the next case:

```js
const fruit = "apple";

switch (fruit) {
    case "apple":
        console.log("Found apple");
        // No break — falls through!
    case "banana":
        console.log("Found banana");
        break;
    case "cherry":
        console.log("Found cherry");
        break;
}
```

Result:
```text
Found apple
Found banana
```

The fall-through is intentional in the Monday–Friday example above (grouping cases), but it is a common bug when forgotten.

## `for` loop

Repeats code a specific number of times:

```js
for (let i = 0; i < 5; i++) {
    console.log(`Iteration ${i}`);
}
```

Result:
```text
Iteration 0
Iteration 1
Iteration 2
Iteration 3
Iteration 4
```

The three parts:
1. **Initialization:** `let i = 0` — runs once before the loop starts
2. **Condition:** `i < 5` — checked before each iteration; loop stops when `false`
3. **Update:** `i++` — runs after each iteration

### Counting backwards

```js
for (let i = 5; i > 0; i--) {
    console.log(i);
}
```

Result:
```text
5
4
3
2
1
```

### Stepping by more than one

```js
for (let i = 0; i <= 10; i += 2) {
    console.log(i);
}
```

Result:
```text
0
2
4
6
8
10
```

## `while` loop

Repeats while a condition is true:

```js
let count = 0;

while (count < 3) {
    console.log(`Count is ${count}`);
    count++;
}
```

Result:
```text
Count is 0
Count is 1
Count is 2
```

Use `while` when you do not know in advance how many iterations you need:

```js
let number = 1;

while (number < 100) {
    number *= 2;
}

console.log(number);
```

Result:
```text
128
```

### Infinite loops

A `while (true)` loop runs forever unless you `break` out of it:

```js
let attempt = 0;

while (true) {
    attempt++;
    console.log(`Attempt ${attempt}`);

    if (attempt >= 3) {
        console.log("Done");
        break;
    }
}
```

Result:
```text
Attempt 1
Attempt 2
Attempt 3
Done
```

Be careful — if you forget the `break`, the program hangs.

## `do...while` loop

Like `while`, but the body runs **at least once** before the condition is checked:

```js
let input = "";
let attempts = 0;

do {
    input = "valid"; // Simulating user input
    attempts++;
    console.log(`Attempt ${attempts}: got "${input}"`);
} while (input !== "valid");
```

Result:
```text
Attempt 1: got "valid"
```

The body ran once even though the condition was immediately satisfied.

## `for...of` — iterating over values

Iterates over **values** in an iterable (arrays, strings, maps, sets):

```js
const fruits = ["apple", "banana", "cherry"];

for (const fruit of fruits) {
    console.log(fruit);
}
```

Result:
```text
apple
banana
cherry
```

Works on strings too:

```js
for (const char of "hello") {
    console.log(char);
}
```

Result:
```text
h
e
l
l
o
```

## `for...in` — iterating over keys

Iterates over **keys** (property names) of an object:

```js
const person = {
    name: "Ada",
    age: 36,
    city: "London",
};

for (const key in person) {
    console.log(`${key}: ${person[key]}`);
}
```

Result:
```text
name: Ada
age: 36
city: London
```

**Do not use `for...in` on arrays.** It iterates over indices as strings and includes inherited properties. Use `for...of` for arrays.

## `break` and `continue`

### `break` — exit the loop early

```js
for (let i = 0; i < 10; i++) {
    if (i === 5) {
        break;
    }
    console.log(i);
}
```

Result:
```text
0
1
2
3
4
```

### `continue` — skip to the next iteration

```js
for (let i = 0; i < 6; i++) {
    if (i % 2 === 0) {
        continue; // skip even numbers
    }
    console.log(i);
}
```

Result:
```text
1
3
5
```

## Nested loops

Loops inside loops:

```js
for (let row = 1; row <= 3; row++) {
    let line = "";
    for (let col = 1; col <= 3; col++) {
        line += `(${row},${col}) `;
    }
    console.log(line.trim());
}
```

Result:
```text
(1,1) (1,2) (1,3)
(2,1) (2,2) (2,3)
(3,1) (3,2) (3,3)
```

### Labeled loops

Labels let `break` and `continue` target an outer loop:

```js
outer:
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) {
            break outer;
        }
        console.log(`i=${i}, j=${j}`);
    }
}
```

Result:
```text
i=0, j=0
i=0, j=1
i=0, j=2
i=1, j=0
```

Labels are rarely used, but they are good to know about.

## Common patterns

### Summing values

```js
const numbers = [10, 20, 30, 40, 50];
let sum = 0;

for (const num of numbers) {
    sum += num;
}

console.log(sum);
```

Result:
```text
150
```

### Finding a value

```js
const names = ["Alice", "Bob", "Charlie", "Diana"];
let found = null;

for (const name of names) {
    if (name.startsWith("C")) {
        found = name;
        break;
    }
}

console.log(found);
```

Result:
```text
Charlie
```

### Building a string

```js
const words = ["JavaScript", "is", "fun"];
let sentence = "";

for (const word of words) {
    sentence += word + " ";
}

console.log(sentence.trim());
```

Result:
```text
JavaScript is fun
```

### FizzBuzz

The classic beginner exercise:

```js
for (let i = 1; i <= 20; i++) {
    if (i % 15 === 0) {
        console.log("FizzBuzz");
    } else if (i % 3 === 0) {
        console.log("Fizz");
    } else if (i % 5 === 0) {
        console.log("Buzz");
    } else {
        console.log(i);
    }
}
```

Result:
```text
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
16
17
Fizz
19
Buzz
```

## Summary

- `if`/`else if`/`else` for branching decisions.
- Ternary `? :` for simple one-line conditionals.
- `switch` for comparing a value against many options (remember `break`).
- `for` loop when you know the number of iterations.
- `while` loop when the number of iterations is unknown.
- `do...while` when the body must run at least once.
- `for...of` for iterating over array values and strings.
- `for...in` for iterating over object keys (not arrays).
- `break` exits a loop early; `continue` skips to the next iteration.

Next up: [Functions](./04-functions.md) — reusable blocks of code.
