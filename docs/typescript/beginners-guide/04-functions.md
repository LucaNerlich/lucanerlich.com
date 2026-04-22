---
title: "Functions"
sidebar_label: "Functions"
description: Typed parameters, return types, optional and default parameters, rest params, function overloads, void vs never, and arrow functions in TypeScript.
slug: /typescript/beginners-guide/functions
tags: [typescript, beginners]
keywords:
  - typescript functions
  - function types
  - optional parameters
  - function overloads
  - rest parameters
  - arrow functions typescript
sidebar_position: 4
---

# Functions

Functions are the workhorses of any program, and TypeScript's type system makes them dramatically safer. Typed
parameters prevent you from passing the wrong argument; return type annotations catch inconsistencies in what you
return; and function overloads let you precisely describe APIs that behave differently depending on the input.

## Typed parameters and return types

The most basic improvement TypeScript adds to functions is parameter and return type annotations:

```typescript
function add(a: number, b: number): number {
    return a + b;
}

function greet(name: string): string {
    return `Hello, ${name}!`;
}

function logError(message: string, code: number): void {
    console.error(`[${code}] ${message}`);
}
```

The return type annotation (`: number`, `: string`, `: void`) comes after the closing parenthesis. TypeScript also
infers return types from the function body - the annotation is optional but recommended for public functions:

```typescript
// TypeScript infers the return type as number
function multiply(x: number, y: number) {
    return x * y;
}

// Explicit annotation makes the contract clear and catches mistakes:
function divide(a: number, b: number): number {
    if (b === 0) {
        // return "error"; // Error: Type 'string' is not assignable to type 'number'
        throw new Error("Division by zero");
    }
    return a / b;
}
```

## Optional parameters

Parameters marked with `?` are optional - they can be omitted by the caller, and their type inside the function is
`T | undefined`:

```typescript
function createSlug(text: string, separator?: string): string {
    const sep = separator ?? "-";
    return text
        .toLowerCase()
        .replace(/\s+/g, sep)
        .replace(/[^a-z0-9-_]/g, "");
}

createSlug("Hello World");        // "hello-world"
createSlug("Hello World", "_");   // "hello_world"
```

Optional parameters must come **after** required parameters:

```typescript
// OK
function search(query: string, limit?: number, offset?: number): void { /* ... */ }

// Error: A required parameter cannot follow an optional parameter
// function broken(limit?: number, query: string): void { ... }
```

## Default parameters

Default parameters provide a value when the argument is `undefined` or omitted. They are cleaner than optional
parameters when a sensible default exists:

```typescript
function paginate(
    items: unknown[],
    page: number = 1,
    pageSize: number = 20
): { data: unknown[]; page: number; total: number } {
    const start = (page - 1) * pageSize;
    return {
        data: items.slice(start, start + pageSize),
        page,
        total: items.length,
    };
}

paginate(items);              // page=1, pageSize=20
paginate(items, 2);           // page=2, pageSize=20
paginate(items, 1, 50);       // page=1, pageSize=50
paginate(items, undefined, 50); // page=1 (default), pageSize=50
```

Default parameters give the function a concrete type - no `| undefined` inside the body:

```typescript
function formatDate(date: Date, locale: string = "en-US"): string {
    // locale is string here (not string | undefined), because it has a default
    return date.toLocaleDateString(locale);
}
```

## Rest parameters

Rest parameters collect a variable number of arguments into an array:

```typescript
function sum(...numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);           // 6
sum(10, 20, 30, 40);    // 100
sum();                  // 0

// Rest parameters can follow regular parameters
function logWithPrefix(prefix: string, ...messages: string[]): void {
    messages.forEach(msg => console.log(`[${prefix}] ${msg}`));
}

logWithPrefix("INFO", "Server started", "Listening on port 3000");
```

Rest parameters must be last in the parameter list. Combining with typed tuples (TypeScript 4.0+):

```typescript
type Middleware = [string, (req: Request, res: Response) => void];

function applyMiddleware(app: unknown, ...middleware: Middleware[]): void {
    middleware.forEach(([path, handler]) => {
        console.log(`Registering handler for ${path}`);
    });
}
```

## Function types

Functions are first-class values in TypeScript. You can describe their type and use them as parameters or return values:

```typescript
// Function type annotation
type Predicate<T> = (item: T) => boolean;
type Transformer<T, U> = (input: T) => U;
type Comparator<T> = (a: T, b: T) => number;

// Using function types as parameters
function filter<T>(items: T[], predicate: Predicate<T>): T[] {
    return items.filter(predicate);
}

function sortBy<T>(items: T[], compare: Comparator<T>): T[] {
    return [...items].sort(compare);
}

// Concrete usage
const users = [
    { name: "Charlie", age: 25 },
    { name: "Alice", age: 30 },
    { name: "Bob", age: 20 },
];

const adults = filter(users, u => u.age >= 21);
const sorted = sortBy(users, (a, b) => a.name.localeCompare(b.name));
```

### Inline function type syntax

```typescript
// In interface
interface Button {
    label: string;
    onClick: (event: MouseEvent) => void;
    onHover?: (event: MouseEvent) => void;
}

// In function parameter
function debounce(fn: (...args: unknown[]) => void, ms: number): (...args: unknown[]) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
```

## Arrow functions

Arrow functions in TypeScript are typed the same way as regular functions:

```typescript
// Explicit types
const multiply = (a: number, b: number): number => a * b;

// Type inferred from context
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);    // TypeScript knows n is number
const evens = numbers.filter(n => n % 2 === 0);

// Arrow function stored in a typed variable
type MathOp = (a: number, b: number) => number;

const add: MathOp = (a, b) => a + b;
const subtract: MathOp = (a, b) => a - b;
```

### Arrow functions and this

Arrow functions do not have their own `this` - they capture it from the enclosing scope. This is often what you want
for callbacks:

```typescript
class Timer {
    private count = 0;

    start(): void {
        // Arrow function: this refers to the Timer instance
        setInterval(() => {
            this.count++;
            console.log(`Tick: ${this.count}`);
        }, 1000);
    }
}
```

With a regular function in `setInterval`, `this` would be `undefined` (in strict mode) or the global object - a
classic JavaScript bug.

## void vs never

These two return types both indicate "no meaningful return value" but mean different things:

| Return type | Meaning                                              | Example                          |
|-------------|------------------------------------------------------|----------------------------------|
| `void`      | Function completes normally but returns no value     | `console.log`, event handlers    |
| `never`     | Function never completes (throws or loops forever)   | Error throwers, infinite loops   |

```typescript
function logRequest(url: string): void {
    console.log(`GET ${url}`);
    // returns normally (implicitly returns undefined)
}

function fail(message: string): never {
    throw new Error(message);
    // TypeScript knows this never reaches the end
}

function assertDefined<T>(value: T | null | undefined, name: string): T {
    if (value == null) {
        fail(`${name} is required`); // TypeScript knows execution stops here
    }
    return value; // TypeScript knows value is T (not null/undefined)
}
```

## Function overloads

Overloads let you declare multiple signatures for a single function - useful when the return type depends on the input:

```typescript
// Overload signatures (no implementation body)
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: boolean): string;
function formatValue(value: Date): string;

// Implementation signature (handles all cases)
function formatValue(value: string | number | boolean | Date): string {
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toLocaleString();
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value.toLocaleDateString();
}

formatValue("hello");           // "hello"
formatValue(1234567);           // "1,234,567"
formatValue(true);              // "Yes"
formatValue(new Date());        // "4/18/2026"
```

A more practical example - a function that returns different types based on input:

```typescript
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: "canvas"): HTMLCanvasElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
    return document.createElement(tag);
}

const div = createElement("div");       // HTMLDivElement -- has .innerHTML, etc.
const input = createElement("input");   // HTMLInputElement -- has .value, .checked, etc.
const canvas = createElement("canvas"); // HTMLCanvasElement -- has .getContext(), etc.
```

### Overloads with optional behaviour

```typescript
// parseJSON returns T when a reviver is provided, or unknown without one
function parseJSON(text: string): unknown;
function parseJSON<T>(text: string, validate: (v: unknown) => v is T): T;
function parseJSON<T>(text: string, validate?: (v: unknown) => v is T): unknown | T {
    const parsed = JSON.parse(text);
    if (validate) {
        if (!validate(parsed)) throw new Error("Validation failed");
        return parsed as T;
    }
    return parsed;
}
```

## Generic functions

Functions can be generic, accepting type parameters that are inferred from the arguments:

```typescript
function identity<T>(value: T): T {
    return value;
}

identity("hello");   // T is string, returns string
identity(42);        // T is number, returns number
identity([1, 2, 3]); // T is number[], returns number[]

function first<T>(array: T[]): T | undefined {
    return array[0];
}

function zip<A, B>(a: A[], b: B[]): [A, B][] {
    const length = Math.min(a.length, b.length);
    return Array.from({ length }, (_, i) => [a[i], b[i]]);
}

zip([1, 2, 3], ["a", "b", "c"]); // [1, "a"], [2, "b"], [3, "c"]
```

We cover generics in depth in chapter 6.

## The this parameter

TypeScript lets you declare an explicit `this` parameter to prevent accidental misuse:

```typescript
interface Greeter {
    name: string;
    greet(this: Greeter): string;
}

const greeter: Greeter = {
    name: "World",
    greet() {
        return `Hello, ${this.name}`;
    },
};

greeter.greet(); // OK
const fn = greeter.greet;
// fn(); // Error: The 'this' context of type 'void' is not assignable to type 'Greeter'
```

The `this` parameter is erased in the compiled output - it is purely a type-checking aid.

## Practical example: an HTTP client wrapper

Here is a realistic function design combining several concepts:

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    headers: Record<string, string>;
}

type ApiError = {
    message: string;
    status: number;
    code?: string;
};

async function request<T>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    const { headers = {}, timeout = 10_000 } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: options.signal ?? controller.signal,
        });

        clearTimeout(timeoutId);

        const data: T = await response.json();

        return {
            data,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
        };
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Convenience wrappers
const get = <T>(url: string, options?: RequestOptions) =>
    request<T>("GET", url, undefined, options);

const post = <T>(url: string, body: unknown, options?: RequestOptions) =>
    request<T>("POST", url, body, options);

// Usage
interface User {
    id: number;
    name: string;
    email: string;
}

const { data: user } = await get<User>("/api/users/1");
console.log(user.name); // TypeScript knows user is User
```

## Summary

- Parameter types prevent wrong arguments; return type annotations catch inconsistent returns
- Optional parameters (`?`) and default parameters (`=`) cover different use cases
- Rest parameters (`...args: T[]`) collect variable-length arguments into an array
- Function types (`(a: T) => U`) let you pass functions as parameters or return them
- Arrow functions are typed identically to regular functions; they capture `this` lexically
- `void` means "returns nothing normally"; `never` means "never returns"
- Function overloads let you describe functions whose return type depends on input
- Generic functions infer type parameters from their arguments

Next up: [Classes](./05-classes.md) - class syntax, access modifiers, constructors, inheritance, abstract classes,
and implementing interfaces.
