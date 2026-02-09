---
title: "Functions"
sidebar_label: "Functions"
description: Learn JavaScript functions -- declarations, expressions, arrow functions, parameters, scope, closures, and callbacks.
slug: /javascript/beginners-guide/functions
tags: [javascript, beginners, functions, scope]
keywords:
  - javascript functions
  - arrow functions
  - function scope
  - closures
  - callbacks
sidebar_position: 4
---

# Functions

A function is a reusable block of code that performs a specific task. Functions are the fundamental building block of any JavaScript program.

## Function declarations

The classic way to define a function:

```js
function greet(name) {
    return `Hello, ${name}!`;
}

const message = greet("Ada");
console.log(message);
```

Result:
```text
Hello, Ada!
```

Anatomy:
- `function` -- the keyword
- `greet` -- the function name
- `(name)` -- the parameter list
- `return` -- sends a value back to the caller
- `greet("Ada")` -- calling the function with the argument `"Ada"`

### Functions without a return value

If a function does not `return` anything, it returns `undefined`:

```js
function logMessage(text) {
    console.log(`[LOG] ${text}`);
}

const result = logMessage("Server started");
console.log(result);
```

Result:
```text
[LOG] Server started
undefined
```

## Function expressions

You can also assign a function to a variable:

```js
const add = function (a, b) {
    return a + b;
};

console.log(add(3, 4));
```

Result:
```text
7
```

The difference from a declaration: function expressions are **not hoisted** (explained below).

## Arrow functions

A shorter syntax introduced in ES6:

```js
const multiply = (a, b) => {
    return a * b;
};

console.log(multiply(3, 4));
```

Result:
```text
12
```

### Implicit return

If the body is a single expression, you can omit the braces and `return`:

```js
const double = (n) => n * 2;
console.log(double(5));

const greet = (name) => `Hello, ${name}!`;
console.log(greet("Grace"));
```

Result:
```text
10
Hello, Grace!
```

### Single parameter shorthand

With exactly one parameter, you can omit the parentheses:

```js
const square = n => n * n;
console.log(square(4));
```

Result:
```text
16
```

### When to use which

| Syntax | Best for |
|--------|----------|
| `function` declaration | Named functions, top-level functions, functions that need hoisting |
| `function` expression | Assigning to variables, passing as arguments |
| Arrow `=>` | Short callbacks, inline functions, methods that do not need their own `this` |

Arrow functions have a different `this` behavior compared to regular functions. This matters when working with objects (covered in the Objects chapter). For now, arrow functions are your go-to for short, simple functions.

## Parameters and arguments

**Parameters** are the names listed in the function definition. **Arguments** are the actual values passed to the function.

### Default parameters

Provide fallback values for missing arguments:

```js
function greet(name = "stranger") {
    return `Hello, ${name}!`;
}

console.log(greet("Ada"));
console.log(greet());
```

Result:
```text
Hello, Ada!
Hello, stranger!
```

### Rest parameters

Collect any number of arguments into an array:

```js
function sum(...numbers) {
    let total = 0;
    for (const num of numbers) {
        total += num;
    }
    return total;
}

console.log(sum(1, 2, 3));
console.log(sum(10, 20, 30, 40));
```

Result:
```text
6
100
```

The rest parameter must be the **last** parameter:

```js
function log(level, ...messages) {
    for (const msg of messages) {
        console.log(`[${level}] ${msg}`);
    }
}

log("INFO", "Server started", "Listening on port 3000");
```

Result:
```text
[INFO] Server started
[INFO] Listening on port 3000
```

## Return values

A function can return any value -- numbers, strings, booleans, arrays, objects, even other functions:

```js
function getUser() {
    return {
        name: "Ada",
        age: 36,
    };
}

const user = getUser();
console.log(user.name);
console.log(user.age);
```

Result:
```text
Ada
36
```

### Early return

`return` exits the function immediately. Use it to handle edge cases first:

```js
function divide(a, b) {
    if (b === 0) {
        return "Cannot divide by zero";
    }
    return a / b;
}

console.log(divide(10, 2));
console.log(divide(10, 0));
```

Result:
```text
5
Cannot divide by zero
```

This pattern -- handling errors early and returning -- is called a **guard clause**. It keeps your code flat instead of deeply nested.

## Scope

**Scope** determines where a variable is accessible.

### Block scope (`let` and `const`)

Variables declared with `let` or `const` are confined to the nearest `{}` block:

```js
if (true) {
    const message = "inside block";
    console.log(message);
}

// console.log(message); // ReferenceError: message is not defined
```

Result:
```text
inside block
```

### Function scope

Variables declared inside a function are not accessible outside it:

```js
function example() {
    const secret = 42;
    console.log(secret);
}

example();
// console.log(secret); // ReferenceError: secret is not defined
```

Result:
```text
42
```

### Global scope

Variables declared outside any function or block are global -- accessible everywhere:

```js
const appName = "MyApp";

function printAppName() {
    console.log(appName); // can access the global variable
}

printAppName();
```

Result:
```text
MyApp
```

Minimize global variables. They can be modified from anywhere, making bugs hard to track.

### Scope chain

Inner functions can access variables from outer functions:

```js
function outer() {
    const x = 10;

    function inner() {
        const y = 20;
        console.log(x + y); // inner can access x from outer
    }

    inner();
    // console.log(y); // ReferenceError: y is not defined
}

outer();
```

Result:
```text
30
```

## Hoisting

**Function declarations** are hoisted -- you can call them before they appear in the code:

```js
console.log(greet("Ada"));

function greet(name) {
    return `Hello, ${name}!`;
}
```

Result:
```text
Hello, Ada!
```

**Function expressions and arrow functions are NOT hoisted:**

```js
// console.log(add(1, 2)); // ReferenceError: Cannot access 'add' before initialization

const add = (a, b) => a + b;
console.log(add(1, 2));
```

Result:
```text
3
```

`var` declarations are hoisted too, but only the declaration -- not the assignment. This is another reason to avoid `var`.

## Closures

A **closure** is a function that remembers the variables from the scope where it was created, even after that scope has finished executing:

```js
function createCounter() {
    let count = 0;

    return function () {
        count++;
        return count;
    };
}

const counter = createCounter();
console.log(counter());
console.log(counter());
console.log(counter());
```

Result:
```text
1
2
3
```

The inner function "closes over" the `count` variable. Each call to `createCounter()` creates a new, independent counter:

```js
const counterA = createCounter();
const counterB = createCounter();

console.log(counterA()); // 1
console.log(counterA()); // 2
console.log(counterB()); // 1 -- independent from counterA
```

Result:
```text
1
2
1
```

Closures are fundamental to JavaScript. They power patterns like data privacy, factory functions, and event handlers.

### Practical closure: private state

```js
function createWallet(initialBalance) {
    let balance = initialBalance;

    return {
        deposit(amount) {
            balance += amount;
            return balance;
        },
        withdraw(amount) {
            if (amount > balance) {
                return "Insufficient funds";
            }
            balance -= amount;
            return balance;
        },
        getBalance() {
            return balance;
        },
    };
}

const wallet = createWallet(100);
console.log(wallet.getBalance());
console.log(wallet.deposit(50));
console.log(wallet.withdraw(30));
console.log(wallet.getBalance());
// balance is not directly accessible
// console.log(wallet.balance); // undefined
```

Result:
```text
100
150
120
120
```

## Callbacks

A **callback** is a function passed as an argument to another function:

```js
function doTask(taskName, onComplete) {
    console.log(`Starting: ${taskName}`);
    // ... do work ...
    onComplete(taskName);
}

function handleComplete(name) {
    console.log(`Finished: ${name}`);
}

doTask("Download file", handleComplete);
```

Result:
```text
Starting: Download file
Finished: Download file
```

Callbacks are commonly used with array methods (next chapter) and asynchronous operations.

### Anonymous callbacks

You can pass an arrow function directly instead of defining a named function:

```js
doTask("Process data", (name) => {
    console.log(`Done processing: ${name}`);
});
```

Result:
```text
Starting: Process data
Done processing: Process data
```

## Higher-order functions

A **higher-order function** is a function that takes a function as an argument or returns a function. You have already seen both:

- `doTask` takes a callback -- higher-order (takes a function)
- `createCounter` returns a function -- higher-order (returns a function)

```js
function repeat(n, action) {
    for (let i = 0; i < n; i++) {
        action(i);
    }
}

repeat(3, (i) => console.log(`Step ${i}`));
```

Result:
```text
Step 0
Step 1
Step 2
```

Higher-order functions are everywhere in JavaScript -- array methods like `map`, `filter`, and `reduce` (covered in the next chapter) are all higher-order functions.

## Pure functions

A **pure function** always returns the same output for the same input and has no side effects:

```js
// Pure -- same input always gives same output
function add(a, b) {
    return a + b;
}

// Impure -- modifies external state
let total = 0;
function addToTotal(amount) {
    total += amount; // side effect
    return total;
}

console.log(add(2, 3)); // always 5
console.log(add(2, 3)); // always 5

console.log(addToTotal(10)); // 10
console.log(addToTotal(10)); // 20 -- different result for same input
```

Result:
```text
5
5
10
20
```

Prefer pure functions when possible -- they are easier to test, debug, and reason about.

## Immediately Invoked Function Expressions (IIFE)

A function that runs immediately after it is defined:

```js
(function () {
    const secret = "hidden";
    console.log(`IIFE running with secret: ${secret}`);
})();
```

Result:
```text
IIFE running with secret: hidden
```

IIFEs were historically used to create private scope before `let`/`const` and modules existed. You will see them in older code.

## Summary

- **Function declarations** are hoisted; **expressions** and **arrow functions** are not.
- Arrow functions `=>` provide concise syntax with implicit return for single expressions.
- **Default parameters** provide fallback values; **rest parameters** collect extra arguments into an array.
- **Guard clauses** (early returns) keep code flat and readable.
- **Scope** determines variable accessibility: block, function, or global.
- **Closures** let inner functions remember outer variables -- key for private state and factories.
- **Callbacks** are functions passed to other functions -- foundational to async JavaScript.
- **Pure functions** are predictable and testable -- prefer them when possible.

Next up: [Arrays](./05-arrays.md) -- ordered collections of data and the powerful methods to work with them.
