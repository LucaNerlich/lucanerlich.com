---
title: "Variables, Types & Operators"
sidebar_label: "Variables & Types"
description: Learn about JavaScript variables (let, const, var), primitive data types, type coercion, operators, and template literals.
slug: /javascript/beginners-guide/variables-and-types
tags: [javascript, beginners, variables, types]
keywords:
  - javascript variables
  - let const var
  - javascript data types
  - type coercion
  - template literals
sidebar_position: 2
---

# Variables, Types & Operators

Variables store data. Types describe what kind of data you have. Operators let you do things with that data. This chapter covers all three.

## Declaring variables

JavaScript has three keywords for declaring variables: `let`, `const`, and `var`.

### `let` — a variable that can change

```js
let score = 0;
console.log(score);

score = 10;
console.log(score);
```

Result:
```text
0
10
```

### `const` — a variable that cannot be reassigned

```js
const name = "Ada";
console.log(name);

name = "Grace"; // TypeError: Assignment to constant variable.
```

`const` does not mean the value is immutable — it means the **binding** cannot change. Objects and arrays declared with `const` can still have their contents modified (more on this in later chapters).

### `var` — the old way

```js
var count = 5;
console.log(count);
```

Result:
```text
5
```

`var` is function-scoped instead of block-scoped, which leads to confusing behavior. **Always use `let` or `const` instead.** You will see `var` in older code, but there is no reason to use it in new code.

### When to use `let` vs `const`

Use `const` by default. Switch to `let` only when you need to reassign the variable. This makes your code easier to reason about — if you see `const`, you know the binding never changes.

```js
const API_URL = "https://api.example.com"; // never changes
let retryCount = 0; // will be incremented
```

## Primitive data types

JavaScript has **seven primitive types**. A primitive is a value that is not an object and has no methods of its own (though JavaScript auto-wraps them when you call methods).

### String

Text data, wrapped in quotes:

```js
const single = 'hello';
const double = "hello";
const backtick = `hello`;

console.log(single);
console.log(double);
console.log(backtick);
```

Result:
```text
hello
hello
hello
```

All three quote styles produce the same string. Backticks (template literals) have extra powers — covered below.

### Number

JavaScript has one number type for both integers and decimals:

```js
const integer = 42;
const decimal = 3.14;
const negative = -7;

console.log(integer, decimal, negative);
```

Result:
```text
42 3.14 -7
```

Special number values:

```js
console.log(Infinity);
console.log(-Infinity);
console.log(NaN); // "Not a Number"
console.log(0.1 + 0.2); // floating-point precision
```

Result:
```text
Infinity
-Infinity
NaN
0.30000000000000004
```

The `0.1 + 0.2` result is a famous floating-point quirk, not a JavaScript bug. It happens in every language that uses IEEE 754 floating-point numbers.

### BigInt

For integers larger than `Number.MAX_SAFE_INTEGER` (2^53 - 1):

```js
const big = 9007199254740993n; // note the 'n' suffix
console.log(big);
console.log(typeof big);
```

Result:
```text
9007199254740993n
bigint
```

You will rarely need BigInt, but it exists for when you do.

### Boolean

`true` or `false`:

```js
const isActive = true;
const isDeleted = false;

console.log(isActive);
console.log(isDeleted);
```

Result:
```text
true
false
```

### null

Represents an **intentional** absence of value:

```js
let selectedUser = null;
console.log(selectedUser);
```

Result:
```text
null
```

### undefined

Represents a variable that has been declared but **not assigned**:

```js
let score;
console.log(score);
```

Result:
```text
undefined
```

The difference: `null` means "explicitly nothing", `undefined` means "not yet set".

### Symbol

A unique, immutable identifier. Used mainly for object property keys that should not collide:

```js
const id = Symbol("id");
console.log(id);
console.log(typeof id);
```

Result:
```text
Symbol(id)
symbol
```

Symbols are an advanced feature. You will not need them as a beginner, but knowing they exist is useful.

## The `typeof` operator

`typeof` returns a string describing the type of a value:

```js
console.log(typeof "hello");
console.log(typeof 42);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
console.log(typeof Symbol("x"));
console.log(typeof 123n);
```

Result:
```text
string
number
boolean
undefined
object
symbol
bigint
```

Notice that `typeof null` returns `"object"`. This is a [well-known historical bug](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#typeof_null) in JavaScript that was never fixed because too much code depends on it.

## Template literals

Backtick strings support **interpolation** and **multi-line** text:

```js
const name = "Ada";
const age = 36;

// Interpolation with ${}
const greeting = `Hello, ${name}! You are ${age} years old.`;
console.log(greeting);

// Expressions work too
console.log(`2 + 3 = ${2 + 3}`);

// Multi-line
const poem = `Roses are red,
Violets are blue,
JavaScript is fun,
And so are you.`;
console.log(poem);
```

Result:
```text
Hello, Ada! You are 36 years old.
2 + 3 = 5
Roses are red,
Violets are blue,
JavaScript is fun,
And so are you.
```

Use template literals whenever you need to embed values in strings. They are cleaner than string concatenation.

## Type coercion

JavaScript **automatically converts** types when it thinks you need it to. This is called **coercion** and it is the source of many beginner mistakes.

### String coercion

The `+` operator with a string converts the other value to a string:

```js
console.log("5" + 3);
console.log("hello" + true);
console.log(1 + "2" + 3);
```

Result:
```text
53
hellotrue
123
```

The first `1 + "2"` produces `"12"` (string), then `"12" + 3` produces `"123"`.

### Number coercion

Other arithmetic operators convert strings to numbers:

```js
console.log("5" - 3);
console.log("5" * 2);
console.log("10" / 2);
```

Result:
```text
2
10
5
```

### Explicit conversion

Do not rely on coercion. Convert explicitly:

```js
// String to number
const input = "42";
const num = Number(input);
console.log(num, typeof num);

// Number to string
const count = 10;
const str = String(count);
console.log(str, typeof str);

// To boolean
console.log(Boolean(0));
console.log(Boolean(""));
console.log(Boolean("hello"));
console.log(Boolean(1));
```

Result:
```text
42 number
10 string
false
false
true
true
```

### Falsy values

These values are `false` when converted to boolean:

| Value | Type |
|-------|------|
| `false` | boolean |
| `0` | number |
| `-0` | number |
| `0n` | bigint |
| `""` | string (empty) |
| `null` | null |
| `undefined` | undefined |
| `NaN` | number |

Everything else is **truthy** — including `"0"`, `"false"`, `[]`, and `{}`.

```js
if ("0") {
    console.log("The string '0' is truthy!");
}

if ([]) {
    console.log("An empty array is truthy!");
}
```

Result:
```text
The string '0' is truthy!
An empty array is truthy!
```

## Arithmetic operators

```js
console.log(10 + 3);  // Addition
console.log(10 - 3);  // Subtraction
console.log(10 * 3);  // Multiplication
console.log(10 / 3);  // Division
console.log(10 % 3);  // Remainder (modulo)
console.log(10 ** 3); // Exponentiation
```

Result:
```text
13
7
30
3.3333333333333335
1
1000
```

### Increment and decrement

```js
let count = 5;

count++;
console.log(count); // 6

count--;
console.log(count); // 5

// Prefix vs postfix
let a = 5;
console.log(a++); // prints 5, then increments
console.log(a);   // 6

let b = 5;
console.log(++b); // increments first, then prints 6
console.log(b);   // 6
```

Result:
```text
6
5
5
6
6
6
```

### Assignment operators

Shorthand for modifying a variable:

```js
let x = 10;

x += 5;  // x = x + 5
console.log(x); // 15

x -= 3;  // x = x - 3
console.log(x); // 12

x *= 2;  // x = x * 2
console.log(x); // 24

x /= 4;  // x = x / 4
console.log(x); // 6

x %= 4;  // x = x % 4
console.log(x); // 2
```

Result:
```text
15
12
24
6
2
```

## Comparison operators

Comparisons return a boolean (`true` or `false`):

```js
console.log(5 > 3);   // greater than
console.log(5 < 3);   // less than
console.log(5 >= 5);  // greater than or equal
console.log(5 <= 4);  // less than or equal
```

Result:
```text
true
false
true
false
```

### Equality: `===` vs `==`

**Always use `===` (strict equality).** It checks both value and type:

```js
console.log(5 === 5);    // true — same value, same type
console.log(5 === "5");  // false — different types
console.log(5 == "5");   // true — coerces the string to a number
console.log(null == undefined); // true — special case
console.log(null === undefined); // false — different types
```

Result:
```text
true
false
true
true
false
```

`==` (loose equality) performs type coercion before comparing, which leads to [surprising results](https://dorey.github.io/JavaScript-Equality-Table/). Avoid it.

Similarly, use `!==` (strict inequality) instead of `!=`:

```js
console.log(5 !== "5"); // true
console.log(5 != "5");  // false (coercion strikes again)
```

Result:
```text
true
false
```

## Logical operators

```js
// AND — true only if both sides are true
console.log(true && true);   // true
console.log(true && false);  // false

// OR — true if either side is true
console.log(false || true);  // true
console.log(false || false); // false

// NOT — inverts the boolean
console.log(!true);  // false
console.log(!false); // true
```

Result:
```text
true
false
true
false
false
true
```

### Short-circuit evaluation

`&&` and `||` do not always return booleans — they return the value that determined the result:

```js
// || returns the first truthy value (or the last value)
console.log("hello" || "world"); // "hello"
console.log(0 || "fallback");   // "fallback"
console.log(null || undefined || "found"); // "found"

// && returns the first falsy value (or the last value)
console.log("hello" && "world"); // "world"
console.log(0 && "never");      // 0
```

Result:
```text
hello
fallback
found
world
0
```

This pattern is commonly used for default values:

```js
const username = null;
const displayName = username || "Anonymous";
console.log(displayName);
```

Result:
```text
Anonymous
```

### Nullish coalescing (`??`)

`||` treats `0`, `""`, and `false` as falsy. If you only want to fall back on `null` or `undefined`, use `??`:

```js
const count = 0;
console.log(count || 10);  // 10 — 0 is falsy
console.log(count ?? 10);  // 0 — 0 is not null/undefined
```

Result:
```text
10
0
```

## String operations

```js
const first = "Hello";
const second = "World";

// Concatenation
console.log(first + " " + second);

// Length
console.log(first.length);

// Accessing characters
console.log(first[0]);
console.log(first.charAt(1));

// Case
console.log(first.toUpperCase());
console.log(first.toLowerCase());

// Searching
console.log(first.includes("ell"));
console.log(first.startsWith("He"));
console.log(first.indexOf("l"));

// Extracting
console.log(first.slice(1, 4));

// Trimming whitespace
console.log("  hello  ".trim());

// Splitting
console.log("a,b,c".split(","));

// Replacing
console.log("hello world".replace("world", "JavaScript"));
```

Result:
```text
Hello World
5
H
e
HELLO
hello
true
true
2
ell
hello
[ 'a', 'b', 'c' ]
hello JavaScript
```

## Summary

- Use `const` by default, `let` when you need to reassign. Avoid `var`.
- JavaScript has seven primitive types: string, number, bigint, boolean, null, undefined, symbol.
- `typeof` reveals a value's type (with the `null` quirk).
- Template literals (backticks) support interpolation and multi-line strings.
- Type coercion is implicit and often surprising — convert explicitly with `Number()`, `String()`, `Boolean()`.
- Always use `===` and `!==` for comparisons.
- `??` is safer than `||` for default values when `0`, `""`, or `false` are valid.

Next up: [Control Flow](./03-control-flow.md) — making decisions and repeating actions.
