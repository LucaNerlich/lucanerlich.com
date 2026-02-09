---
title: "Objects"
sidebar_label: "Objects"
description: Learn JavaScript objects -- literals, properties, methods, this, destructuring, spread, Object methods, and JSON.
slug: /javascript/beginners-guide/objects
tags: [javascript, beginners, objects, json]
keywords:
  - javascript objects
  - object destructuring
  - JSON
  - object methods
  - this keyword
sidebar_position: 6
---

# Objects

An object is a collection of **key-value pairs**. Objects are the primary way to group related data and behavior in JavaScript.

## Object literals

The most common way to create an object:

```js
const person = {
    name: "Ada",
    age: 36,
    city: "London",
};

console.log(person);
```

Result:
```text
{ name: 'Ada', age: 36, city: 'London' }
```

Keys (also called **properties**) are strings. Values can be anything -- strings, numbers, booleans, arrays, other objects, functions.

## Accessing properties

### Dot notation

```js
const user = { name: "Ada", age: 36 };

console.log(user.name);
console.log(user.age);
```

Result:
```text
Ada
36
```

### Bracket notation

```js
const user = { name: "Ada", age: 36 };

console.log(user["name"]);
console.log(user["age"]);
```

Result:
```text
Ada
36
```

Bracket notation is required when:
- The key is stored in a variable
- The key contains spaces or special characters

```js
const key = "name";
const user = { name: "Ada", "full name": "Ada Lovelace" };

console.log(user[key]);
console.log(user["full name"]);
```

Result:
```text
Ada
Ada Lovelace
```

### Accessing non-existent properties

```js
const user = { name: "Ada" };
console.log(user.email);
```

Result:
```text
undefined
```

No error -- just `undefined`.

### Optional chaining (`?.`)

Safely access deeply nested properties without errors:

```js
const user = {
    name: "Ada",
    address: {
        city: "London",
    },
};

console.log(user.address.city);
console.log(user.address?.zip);
console.log(user.company?.name);
// Without ?. this would throw: user.company.name
```

Result:
```text
London
undefined
undefined
```

## Modifying properties

```js
const car = {
    brand: "Toyota",
    year: 2020,
};

// Update
car.year = 2024;
console.log(car);

// Add
car.color = "blue";
console.log(car);

// Delete
delete car.color;
console.log(car);
```

Result:
```text
{ brand: 'Toyota', year: 2024 }
{ brand: 'Toyota', year: 2024, color: 'blue' }
{ brand: 'Toyota', year: 2024 }
```

Like arrays, `const` prevents reassigning the variable, not modifying the object.

## Checking if a property exists

```js
const user = { name: "Ada", age: 36 };

// 'in' operator
console.log("name" in user);
console.log("email" in user);

// hasOwnProperty
console.log(user.hasOwnProperty("age"));

// Compare to undefined (less reliable)
console.log(user.name !== undefined);
```

Result:
```text
true
false
true
true
```

## Methods

A **method** is a function stored as an object property:

```js
const calculator = {
    add(a, b) {
        return a + b;
    },
    subtract(a, b) {
        return a - b;
    },
};

console.log(calculator.add(5, 3));
console.log(calculator.subtract(10, 4));
```

Result:
```text
8
6
```

The shorthand `add(a, b) {}` is equivalent to `add: function(a, b) {}`.

## The `this` keyword

Inside a method, `this` refers to the object the method belongs to:

```js
const person = {
    name: "Ada",
    greet() {
        return `Hello, I'm ${this.name}`;
    },
};

console.log(person.greet());
```

Result:
```text
Hello, I'm Ada
```

### `this` pitfall with arrow functions

Arrow functions do **not** have their own `this` -- they inherit it from the surrounding scope:

```js
const person = {
    name: "Ada",
    // Arrow function -- 'this' is NOT the object
    greetArrow: () => {
        return `Hello, I'm ${this.name}`;
    },
    // Regular function -- 'this' IS the object
    greetRegular() {
        return `Hello, I'm ${this.name}`;
    },
};

console.log(person.greetRegular());
console.log(person.greetArrow());
```

Result:
```text
Hello, I'm Ada
Hello, I'm undefined
```

**Rule:** Use regular functions (shorthand syntax) for object methods. Use arrow functions for callbacks and standalone functions.

## Computed property names

Use expressions as keys with bracket syntax:

```js
const field = "email";

const user = {
    name: "Ada",
    [field]: "ada@example.com",
    [`${field}Verified`]: true,
};

console.log(user);
```

Result:
```text
{ name: 'Ada', email: 'ada@example.com', emailVerified: true }
```

## Shorthand properties

When a variable name matches the property name:

```js
const name = "Ada";
const age = 36;

// Without shorthand
const user1 = { name: name, age: age };

// With shorthand
const user2 = { name, age };

console.log(user1);
console.log(user2);
```

Result:
```text
{ name: 'Ada', age: 36 }
{ name: 'Ada', age: 36 }
```

## Iterating over objects

### `Object.keys()` -- get all keys

```js
const user = { name: "Ada", age: 36, city: "London" };
console.log(Object.keys(user));
```

Result:
```text
[ 'name', 'age', 'city' ]
```

### `Object.values()` -- get all values

```js
const user = { name: "Ada", age: 36, city: "London" };
console.log(Object.values(user));
```

Result:
```text
[ 'Ada', 36, 'London' ]
```

### `Object.entries()` -- get key-value pairs

```js
const user = { name: "Ada", age: 36, city: "London" };
console.log(Object.entries(user));
```

Result:
```text
[ [ 'name', 'Ada' ], [ 'age', 36 ], [ 'city', 'London' ] ]
```

### Looping with `for...in`

```js
const scores = { math: 95, english: 87, science: 92 };

for (const subject in scores) {
    console.log(`${subject}: ${scores[subject]}`);
}
```

Result:
```text
math: 95
english: 87
science: 92
```

### Looping with `Object.entries` and `for...of`

```js
const scores = { math: 95, english: 87, science: 92 };

for (const [subject, score] of Object.entries(scores)) {
    console.log(`${subject}: ${score}`);
}
```

Result:
```text
math: 95
english: 87
science: 92
```

This pattern (destructuring in the loop) is clean and widely used.

## Destructuring

Extract properties into separate variables:

```js
const user = { name: "Ada", age: 36, city: "London" };
const { name, age, city } = user;

console.log(name);
console.log(age);
console.log(city);
```

Result:
```text
Ada
36
London
```

### Renaming during destructuring

```js
const user = { name: "Ada", age: 36 };
const { name: userName, age: userAge } = user;

console.log(userName);
console.log(userAge);
```

Result:
```text
Ada
36
```

### Default values

```js
const user = { name: "Ada" };
const { name, age = 0, role = "user" } = user;

console.log(name);
console.log(age);
console.log(role);
```

Result:
```text
Ada
0
user
```

### Nested destructuring

```js
const company = {
    name: "TechCorp",
    address: {
        city: "London",
        country: "UK",
    },
};

const {
    name,
    address: { city, country },
} = company;

console.log(name);
console.log(city);
console.log(country);
```

Result:
```text
TechCorp
London
UK
```

### Destructuring in function parameters

Very common pattern:

```js
function createUser({ name, age, role = "user" }) {
    return `${name} (${age}) -- ${role}`;
}

const result = createUser({ name: "Ada", age: 36, role: "admin" });
console.log(result);

const result2 = createUser({ name: "Bob", age: 25 });
console.log(result2);
```

Result:
```text
Ada (36) -- admin
Bob (25) -- user
```

## Spread operator

Copy and merge objects:

```js
const defaults = { theme: "dark", language: "en", fontSize: 14 };
const userPrefs = { theme: "light", fontSize: 16 };

// Merge -- later properties overwrite earlier ones
const settings = { ...defaults, ...userPrefs };
console.log(settings);

// Copy
const copy = { ...defaults };
copy.theme = "blue";
console.log(defaults.theme); // original unchanged
console.log(copy.theme);
```

Result:
```text
{ theme: 'light', language: 'en', fontSize: 16 }
dark
blue
```

### Rest with objects

Collect remaining properties:

```js
const user = { name: "Ada", age: 36, city: "London", role: "admin" };
const { name, ...rest } = user;

console.log(name);
console.log(rest);
```

Result:
```text
Ada
{ age: 36, city: 'London', role: 'admin' }
```

This is useful for removing properties or separating known fields from the rest.

## Comparing objects

Objects are compared by **reference**, not by value:

```js
const a = { name: "Ada" };
const b = { name: "Ada" };
const c = a;

console.log(a === b); // different objects, same content
console.log(a === c); // same reference
```

Result:
```text
false
true
```

To compare contents, you need to check each property or use `JSON.stringify` (for simple cases):

```js
const a = { name: "Ada", age: 36 };
const b = { name: "Ada", age: 36 };

console.log(JSON.stringify(a) === JSON.stringify(b));
```

Result:
```text
true
```

Note: `JSON.stringify` comparison is fragile -- it depends on property order and does not handle all types. For robust deep comparison, use a library or write a recursive function.

## JSON

**JSON** (JavaScript Object Notation) is a text format for data exchange. It looks like JavaScript objects but with stricter rules:
- Keys must be double-quoted strings
- No trailing commas
- No functions, `undefined`, or `Symbol`

### `JSON.stringify` -- object to JSON string

```js
const user = { name: "Ada", age: 36, active: true };
const json = JSON.stringify(user);

console.log(json);
console.log(typeof json);
```

Result:
```text
{"name":"Ada","age":36,"active":true}
string
```

Pretty-print with indentation:

```js
const user = { name: "Ada", age: 36 };
console.log(JSON.stringify(user, null, 2));
```

Result:
```text
{
  "name": "Ada",
  "age": 36
}
```

### `JSON.parse` -- JSON string to object

```js
const json = '{"name":"Ada","age":36}';
const user = JSON.parse(json);

console.log(user);
console.log(user.name);
```

Result:
```text
{ name: 'Ada', age: 36 }
Ada
```

**Always wrap `JSON.parse` in a try/catch** -- invalid JSON throws an error:

```js
try {
    const data = JSON.parse("not valid json");
} catch (error) {
    console.log("Parse error:", error.message);
}
```

Result:
```text
Parse error: Unexpected token 'o', "not valid json" is not valid JSON
```

For a deep dive into JSON handling, see the [JSON Parsing Guide](../json-parsing-guide.md).

## Nested objects

Objects inside objects:

```js
const school = {
    name: "Tech Academy",
    address: {
        street: "123 Main St",
        city: "London",
    },
    students: [
        { name: "Ada", grade: "A" },
        { name: "Bob", grade: "B" },
    ],
};

console.log(school.address.city);
console.log(school.students[0].name);
console.log(school.students.length);
```

Result:
```text
London
Ada
2
```

### Shallow vs deep copies

The spread operator makes a **shallow** copy -- nested objects are still shared:

```js
const original = {
    name: "Ada",
    scores: [90, 85, 92],
};

const shallow = { ...original };
shallow.name = "Bob";
shallow.scores.push(100); // modifies the shared array!

console.log(original.name);    // unchanged
console.log(original.scores);  // changed!
```

Result:
```text
Ada
[ 90, 85, 92, 100 ]
```

For a **deep** copy, use `structuredClone`:

```js
const original = {
    name: "Ada",
    scores: [90, 85, 92],
};

const deep = structuredClone(original);
deep.scores.push(100);

console.log(original.scores);
console.log(deep.scores);
```

Result:
```text
[ 90, 85, 92 ]
[ 90, 85, 92, 100 ]
```

## `Object.freeze` and `Object.assign`

### `Object.freeze` -- prevent modifications

```js
const config = Object.freeze({
    apiUrl: "https://api.example.com",
    timeout: 5000,
});

config.timeout = 9999; // silently ignored (throws in strict mode)
console.log(config.timeout);
```

Result:
```text
5000
```

Note: `freeze` is shallow. Nested objects can still be modified.

### `Object.assign` -- copy properties

```js
const target = { a: 1 };
const source = { b: 2, c: 3 };

Object.assign(target, source);
console.log(target);
```

Result:
```text
{ a: 1, b: 2, c: 3 }
```

In modern code, the spread operator `{...target, ...source}` is preferred over `Object.assign`.

## Summary

- Objects are key-value pairs created with `{}`.
- Access properties with dot notation (`obj.key`) or brackets (`obj["key"]`).
- Optional chaining `?.` prevents errors on nested access.
- Methods are functions on objects; use regular functions (not arrows) for methods that need `this`.
- `Object.keys()`, `.values()`, `.entries()` iterate over objects.
- Destructuring extracts properties; spread `...` copies and merges objects.
- JSON is the standard text format for data exchange -- use `JSON.stringify` and `JSON.parse`.
- Shallow copies share nested references; use `structuredClone` for deep copies.

Next up: [HTML & CSS Essentials](./07-html-css-essentials.md) -- the building blocks of web pages, just enough to start using JavaScript in the browser.
