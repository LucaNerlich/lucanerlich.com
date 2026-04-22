---
title: "Basic Types"
sidebar_label: "Basic Types"
description: TypeScript's primitive types, type inference, type annotations, arrays, tuples, and the any, unknown, never, and void types.
slug: /typescript/beginners-guide/basic-types
tags: [typescript, beginners]
keywords:
  - typescript types
  - string number boolean
  - type inference
  - typescript array
  - typescript tuple
  - any unknown never
sidebar_position: 2
---

# Basic Types

TypeScript's type system starts with the same primitives JavaScript has - `string`, `number`, `boolean` - and adds
structure, safety, and several new types that help you express intent clearly. This chapter covers every primitive type
you will encounter daily, plus arrays, tuples, and the special types `any`, `unknown`, `never`, and `void`.

## Primitive types

### string

```typescript
const greeting: string = "Hello, TypeScript";
const template: string = `Welcome, ${greeting}`;
const multiLine: string = `
    Line one
    Line two
`;

// All three string literal forms work: single quotes, double quotes, backticks
const a = 'single';
const b = "double";
const c = `backtick template literal`;
```

### number

TypeScript (like JavaScript) has a single `number` type for all numeric values - integers and floats alike:

```typescript
const age: number = 30;
const price: number = 19.99;
const negative: number = -5;
const hex: number = 0xff;       // 255
const binary: number = 0b1010;  // 10
const octal: number = 0o17;     // 15
const million: number = 1_000_000; // Underscores as separators (ES2021+)
```

### boolean

```typescript
const isActive: boolean = true;
const hasPermission: boolean = false;

// Boolean expressions have type boolean
const isAdult: boolean = age >= 18;
```

### Type inference - let TypeScript do the work

You do **not** need to annotate every variable. TypeScript infers types from the assigned value:

```typescript
const name = "Alice";       // inferred as string
const count = 42;           // inferred as number
const enabled = true;       // inferred as boolean
const ratio = 3.14;         // inferred as number

// TypeScript knows these are wrong without any annotation:
const copy = name;
// copy.toFixed(); // Error: Property 'toFixed' does not exist on type 'string'
```

> **Best practice:** Let TypeScript infer types for local variables. Add explicit annotations for function parameters,
> return types, and public API shapes where inference would not be obvious.

### When to add explicit annotations

```typescript
// OK: inference works perfectly
const items = ["apple", "banana", "cherry"];

// Better with annotation: the intent is a specific type, not the inferred literal
let status: string = "pending"; // without annotation, "pending" becomes string anyway
// But for an empty variable that will be assigned later, annotation is required:
let userId: number;
userId = 42;

// Function parameters always need annotations (inference cannot guess them)
function multiply(x: number, y: number): number {
    return x * y;
}
```

## null and undefined

In TypeScript with `strict: true` (which enables `strictNullChecks`), `null` and `undefined` are their own types and
cannot be assigned to `string`, `number`, etc. without explicitly allowing it:

```typescript
let name: string = "Alice";
// name = null;      // Error: Type 'null' is not assignable to type 'string'
// name = undefined; // Error: Type 'undefined' is not assignable to type 'string'

// To allow null or undefined, use a union type:
let nickname: string | null = null;
nickname = "Ali"; // OK

let middleName: string | undefined = undefined;
middleName = "Marie"; // OK
```

This is where TypeScript saves you from the most common JavaScript runtime error: `TypeError: Cannot read properties of
null (reading 'x')`. If a variable can be `null`, the compiler forces you to check before using it:

```typescript
function getLength(text: string | null): number {
    if (text === null) {
        return 0;
    }
    return text.length; // TypeScript knows text is string here
}
```

## any

`any` opts a variable out of type checking entirely. It is the escape hatch:

```typescript
let value: any = "hello";
value = 42;          // OK
value = true;        // OK
value = { x: 1 };   // OK
value.foo.bar.baz(); // OK -- but will crash at runtime!
```

Avoid `any` as much as possible. It defeats the purpose of TypeScript. Common situations where you might see it:

- Legacy JavaScript code being gradually migrated
- Third-party libraries with no type definitions
- Truly dynamic data you have not yet modelled

> **Rule of thumb:** Every `any` is a place where TypeScript cannot help you. Prefer `unknown` (see below) when you
> must accept arbitrary data.

## unknown

`unknown` is the type-safe alternative to `any`. Like `any`, it accepts all values. Unlike `any`, you cannot _use_ an
`unknown` value without first narrowing its type:

```typescript
function processInput(value: unknown): string {
    // value.toUpperCase(); // Error: Object is of type 'unknown'

    if (typeof value === "string") {
        return value.toUpperCase(); // OK: TypeScript knows it's a string here
    }

    if (typeof value === "number") {
        return value.toFixed(2); // OK: TypeScript knows it's a number here
    }

    return String(value);
}
```

Use `unknown` for:
- Parsing JSON from external sources
- Data coming over the network
- Plugin systems where the input type is not known in advance

```typescript
async function fetchUser(id: number): Promise<unknown> {
    const response = await fetch(`/api/users/${id}`);
    return response.json(); // JSON.parse always returns unknown safely
}

// Caller must narrow the type before using it
const data = await fetchUser(1);
if (typeof data === "object" && data !== null && "name" in data) {
    console.log((data as { name: string }).name);
}
```

## never

`never` is the type of things that can never happen. It has two primary uses:

### 1. Functions that never return

```typescript
function throwError(message: string): never {
    throw new Error(message);
}

function infiniteLoop(): never {
    while (true) {
        // This function never returns
    }
}
```

### 2. Exhaustive checks in switch statements

This is `never`'s most powerful use. The compiler ensures you have handled every case:

```typescript
type Shape = "circle" | "square" | "triangle";

function describeShape(shape: Shape): string {
    switch (shape) {
        case "circle":
            return "Round";
        case "square":
            return "Four equal sides";
        case "triangle":
            return "Three sides";
        default:
            // If you forget a case, TypeScript errors here
            const exhaustiveCheck: never = shape;
            throw new Error(`Unhandled shape: ${exhaustiveCheck}`);
    }
}
```

If you later add `"hexagon"` to the `Shape` union without updating the switch, the compiler will catch it.

## void

`void` is the return type of functions that do not return a value:

```typescript
function logMessage(message: string): void {
    console.log(`[LOG] ${message}`);
    // no return statement (or return; with no value)
}

// void is different from undefined -- void means "I don't care about the return value"
// whereas undefined is a concrete value
const result: void = logMessage("hello"); // result is void
```

## The type comparison table

| Type        | Can hold                     | Can use without narrowing | Best for                                          |
|-------------|------------------------------|---------------------------|---------------------------------------------------|
| `string`    | Text values                  | Yes                       | Names, messages, identifiers                       |
| `number`    | All numbers                  | Yes                       | Counts, prices, indices                            |
| `boolean`   | `true` / `false`             | Yes                       | Flags, conditions                                  |
| `null`      | `null` only                  | Yes (it is just null)     | Explicit "no value"                                |
| `undefined` | `undefined` only             | Yes (it is just undefined)| Missing or uninitialized                           |
| `any`       | Anything                     | Yes (unsafe)              | Migration, extreme dynamism (avoid)                |
| `unknown`   | Anything                     | No - must narrow first   | External data, JSON parsing                        |
| `never`     | Nothing (unreachable)        | N/A                       | Exhaustive checks, functions that never return     |
| `void`      | No meaningful return value   | N/A                       | Function return types                              |

## Arrays

TypeScript arrays are typed collections of a single element type:

```typescript
// Two equivalent syntaxes
const numbers: number[] = [1, 2, 3, 4, 5];
const strings: Array<string> = ["a", "b", "c"];

// TypeScript infers array types
const inferred = [1, 2, 3]; // inferred as number[]
const mixed = [1, "hello"]; // inferred as (number | string)[]

// Array methods preserve types
const doubled = numbers.map(n => n * 2); // number[]
const filtered = strings.filter(s => s.length > 1); // string[]

// Accessing elements
const first = numbers[0]; // number
const maybeUndefined = numbers[99]; // number (TypeScript doesn't track out-of-bounds by default)
```

### Readonly arrays

Prevent mutations by marking an array as readonly:

```typescript
const config: readonly string[] = ["debug", "verbose"];
// config.push("quiet"); // Error: Property 'push' does not exist on type 'readonly string[]'
// config[0] = "silent"; // Error: Index signature in type 'readonly string[]' only permits reading

// ReadonlyArray<T> is equivalent
const ids: ReadonlyArray<number> = [1, 2, 3];
```

### Arrays of objects

```typescript
interface User {
    id: number;
    name: string;
}

const users: User[] = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
];

const names: string[] = users.map(u => u.name); // ["Alice", "Bob"]
const alice = users.find(u => u.name === "Alice"); // User | undefined
```

## Tuples

A tuple is a fixed-length array where each element has a specific type and position:

```typescript
// A tuple of [string, number]
const person: [string, number] = ["Alice", 30];

const name = person[0]; // string
const age = person[1];  // number
// const bad = person[2]; // Error: Tuple type '[string, number]' of length '2' has no element at index '2'

// Destructuring works naturally
const [personName, personAge] = person;
```

### Named tuple elements (TypeScript 4.0+)

Names in tuple types make the code self-documenting:

```typescript
type Coordinate = [x: number, y: number, z?: number];

const point: Coordinate = [10, 20];
const point3d: Coordinate = [10, 20, 30];

function distanceTo([x1, y1]: Coordinate, [x2, y2]: Coordinate): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
```

### Tuples as return values

Tuples are commonly used to return multiple values from a function - similar to how React hooks work:

```typescript
function useState<T>(initial: T): [T, (newValue: T) => void] {
    let value = initial;
    const setter = (newValue: T) => {
        value = newValue;
    };
    return [value, setter];
}

const [count, setCount] = useState(0);
setCount(1);
```

### Readonly tuples

```typescript
const point: readonly [number, number] = [10, 20];
// point[0] = 5; // Error: Cannot assign to '0' because it is a read-only property
```

## Type widening and narrowing

### Widening

When you declare a variable with `let`, TypeScript widens the type to be more general:

```typescript
const literal = "hello";  // type: "hello" (literal string type)
let mutable = "hello";    // type: string (widened)

mutable = "world";        // OK
// literal = "world";     // Error: Type '"world"' is not assignable to type '"hello"'
```

### Type narrowing

TypeScript narrows types inside conditional blocks:

```typescript
function printValue(value: string | number): void {
    if (typeof value === "string") {
        // value is string here
        console.log(value.toUpperCase());
    } else {
        // value is number here
        console.log(value.toFixed(2));
    }
}

function processUser(user: User | null): void {
    if (user === null) {
        console.log("No user");
        return;
    }
    // user is User here (not null)
    console.log(user.name);
}
```

## Practical example: a configuration parser

Here is a realistic example combining these types:

```typescript
type LogLevel = "debug" | "info" | "warn" | "error";

interface AppConfig {
    port: number;
    host: string;
    debug: boolean;
    logLevel: LogLevel;
    maxConnections: number | null;
    allowedOrigins: string[];
}

function parsePort(value: unknown): number {
    if (typeof value !== "number") {
        throw new Error(`Expected number for port, got ${typeof value}`);
    }
    if (value < 1 || value > 65535) {
        throw new Error(`Port must be between 1 and 65535, got ${value}`);
    }
    return value;
}

function buildConfig(raw: unknown): AppConfig {
    if (typeof raw !== "object" || raw === null) {
        throw new Error("Config must be an object");
    }

    const obj = raw as Record<string, unknown>;

    return {
        port: parsePort(obj.port ?? 3000),
        host: typeof obj.host === "string" ? obj.host : "localhost",
        debug: obj.debug === true,
        logLevel: (["debug", "info", "warn", "error"] as const).includes(obj.logLevel as LogLevel)
            ? (obj.logLevel as LogLevel)
            : "info",
        maxConnections: typeof obj.maxConnections === "number" ? obj.maxConnections : null,
        allowedOrigins: Array.isArray(obj.allowedOrigins)
            ? obj.allowedOrigins.filter((o): o is string => typeof o === "string")
            : [],
    };
}
```

## Summary

- **Primitive types**: `string`, `number`, `boolean` - annotate function parameters, let TypeScript infer the rest
- **`null` and `undefined`** are their own types with `strictNullChecks` - require explicit union types to allow them
- **`any`** disables type checking - avoid it; use `unknown` instead for truly dynamic values
- **`unknown`** forces you to narrow the type before using a value - safe for external data
- **`never`** marks unreachable code and enables exhaustive switch checking
- **`void`** is the return type for functions that return nothing
- **Arrays** (`T[]` or `Array<T>`) are typed collections; mark them `readonly` to prevent mutation
- **Tuples** are fixed-length, positionally typed arrays - great for returning multiple values

Next up: [Interfaces & Type Aliases](./03-interfaces-and-type-aliases.md) - defining object shapes, optional and
readonly properties, extending interfaces, intersection types, and the difference between `interface` and `type`.
