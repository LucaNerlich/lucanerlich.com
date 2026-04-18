---
title: "Enums & Literal Types"
sidebar_label: "Enums & Literals"
description: Numeric enums, string enums, const enums, literal types, discriminated unions, and exhaustive checks in TypeScript.
slug: /typescript/beginners-guide/enums-and-literals
tags: [typescript, beginners]
keywords:
  - typescript enums
  - string enum
  - const enum
  - literal types
  - discriminated union
  - exhaustive check typescript
sidebar_position: 7
---

# Enums & Literal Types

TypeScript provides several ways to express "a value that can only be one of a fixed set of options." The two main
approaches -- enums and literal union types -- overlap in capability but have different trade-offs. Understanding both,
and knowing when to use each, is an important step toward idiomatic TypeScript.

## Numeric enums

The simplest enum assigns incrementing numeric values to named members:

```typescript
enum Direction {
    North,  // 0
    East,   // 1
    South,  // 2
    West,   // 3
}

const heading = Direction.North;
console.log(heading);               // 0
console.log(Direction[0]);          // "North" (reverse lookup)
console.log(Direction.North === 0); // true
```

You can assign explicit values:

```typescript
enum HttpStatus {
    OK = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
}

function handleResponse(status: HttpStatus): string {
    switch (status) {
        case HttpStatus.OK:
        case HttpStatus.Created:
            return "Success";
        case HttpStatus.BadRequest:
            return "Client error";
        case HttpStatus.Unauthorized:
        case HttpStatus.Forbidden:
            return "Auth error";
        case HttpStatus.NotFound:
            return "Not found";
        default:
            return "Unknown";
    }
}
```

### The problem with numeric enums

Numeric enums have a subtle issue: TypeScript allows any number to be assigned to an enum type, which undermines safety:

```typescript
enum Direction {
    North,
    South,
    East,
    West,
}

const invalid: Direction = 99; // TypeScript allows this -- no error!
```

This is a known quirk. For most use cases, **string enums** or **const string unions** are safer choices.

## String enums

String enums assign string values to members. They are more readable in logs and debuggers, and they are type-safe:

```typescript
enum LogLevel {
    Debug = "DEBUG",
    Info = "INFO",
    Warn = "WARN",
    Error = "ERROR",
}

function log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

log(LogLevel.Info, "Server started");
// [2026-04-18T10:00:00.000Z] [INFO] Server started

// String enums do NOT allow arbitrary strings:
// log("INFO", "Server started"); // Error: Argument of type '"INFO"' is not assignable to type 'LogLevel'
```

String enums have **no reverse lookup** (unlike numeric enums), which is fine because you rarely need it.

### Iterating over enum values

```typescript
enum Status {
    Active = "ACTIVE",
    Inactive = "INACTIVE",
    Suspended = "SUSPENDED",
}

// Get all values
const allStatuses = Object.values(Status); // ["ACTIVE", "INACTIVE", "SUSPENDED"]

// Check membership
function isValidStatus(value: string): value is Status {
    return Object.values(Status).includes(value as Status);
}
```

## const enums

`const enum` is an optimization -- the compiler replaces enum references with their literal values during compilation,
eliminating the enum object entirely:

```typescript
const enum Direction {
    North = "NORTH",
    South = "SOUTH",
    East = "EAST",
    West = "WEST",
}

const heading = Direction.North;
// Compiled to: const heading = "NORTH";
// The Direction object does not exist at runtime
```

**When to use `const enum`:**
- When you want zero runtime overhead
- When you do not need to iterate over enum values at runtime

**When to avoid `const enum`:**
- In library code (causes issues when consumed by other projects)
- When you need `Object.values(Direction)` at runtime

## Literal types

TypeScript can narrow a type to a specific literal value:

```typescript
// String literals
type Direction = "north" | "south" | "east" | "west";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Alignment = "left" | "center" | "right";

// Number literals
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type StatusCode = 200 | 201 | 204 | 400 | 401 | 404 | 500;

// Boolean literal (rarely useful, but possible)
type AlwaysTrue = true;
```

Literal types are most commonly used in union types -- they express "exactly one of these values."

### Literal types vs enums

| Feature                        | `enum`                     | Literal union (`type`)          |
|--------------------------------|----------------------------|---------------------------------|
| Runtime object                 | Yes (numeric/string enum)  | No -- compile time only          |
| Reverse lookup                 | Yes (numeric only)         | No                               |
| Structural compatibility       | No                         | Yes (`"GET"` satisfies `string`) |
| Iteration at runtime           | Yes (`Object.values`)      | No                               |
| Verbosity                      | Higher                     | Lower                            |
| Refactoring safety             | Good                       | Good                             |
| External data (JSON, API)      | Extra conversion needed    | Naturally compatible             |

**Recommendation:** In modern TypeScript codebases, `type` aliases with string literal unions are preferred over enums
for most use cases. Enums shine when you need the runtime object (for iteration) or when the numeric value matters.

```typescript
// Prefer this for most cases:
type Status = "pending" | "active" | "cancelled";

// Use enum when you need the runtime object:
enum Permission {
    Read = "READ",
    Write = "WRITE",
    Delete = "DELETE",
    Admin = "ADMIN",
}

const allPermissions = Object.values(Permission); // Needed at runtime
```

## as const

`as const` freezes an object or array's type to its most specific (literal) form:

```typescript
// Without as const: type is string[]
const colors = ["red", "green", "blue"];

// With as const: type is readonly ["red", "green", "blue"]
const colors = ["red", "green", "blue"] as const;

type Color = typeof colors[number]; // "red" | "green" | "blue"

// Useful for deriving types from data:
const ROUTES = {
    home: "/",
    users: "/users",
    settings: "/settings",
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES]; // "/" | "/users" | "/settings"
type RouteName = keyof typeof ROUTES;             // "home" | "users" | "settings"
```

`as const` is the idiomatic TypeScript alternative to `const enum` for string unions -- no runtime overhead, no enum
object, full type safety.

## Discriminated unions

A discriminated union is a union of object types where each member has a **common literal property** (the
"discriminant") that distinguishes them:

```typescript
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2; // TypeScript knows radius exists
        case "rectangle":
            return shape.width * shape.height;  // TypeScript knows width, height exist
        case "triangle":
            return (shape.base * shape.height) / 2;
        default:
            // unreachable if all cases are handled
            const exhaustive: never = shape;
            throw new Error(`Unhandled shape: ${JSON.stringify(exhaustive)}`);
    }
}

const shapes: Shape[] = [
    { kind: "circle", radius: 5 },
    { kind: "rectangle", width: 4, height: 6 },
    { kind: "triangle", base: 3, height: 8 },
];

shapes.forEach(s => console.log(`Area: ${area(s).toFixed(2)}`));
```

The discriminant (`kind` in this example) can be any literal type -- string literals are most common.

### Discriminated unions for application state

This pattern is excellent for modeling application state:

```typescript
type RequestState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; message: string; code?: number };

interface User {
    id: number;
    name: string;
}

function renderUserState(state: RequestState<User>): string {
    switch (state.status) {
        case "idle":
            return "<p>Click to load user</p>";
        case "loading":
            return "<p>Loading...</p>";
        case "success":
            return `<p>Hello, ${state.data.name}!</p>`;   // state.data is User
        case "error":
            return `<p class="error">Error: ${state.message}</p>`;
    }
}
```

## Exhaustive checks

TypeScript can verify you have handled every case in a discriminated union. The pattern uses `never`:

```typescript
type Action =
    | { type: "INCREMENT" }
    | { type: "DECREMENT" }
    | { type: "RESET" }
    | { type: "SET"; value: number };

function reducer(state: number, action: Action): number {
    switch (action.type) {
        case "INCREMENT":
            return state + 1;
        case "DECREMENT":
            return state - 1;
        case "RESET":
            return 0;
        case "SET":
            return action.value;
        default:
            // If you add a new action type and forget to handle it,
            // TypeScript errors here:
            const exhaustiveCheck: never = action;
            throw new Error(`Unhandled action: ${JSON.stringify(exhaustiveCheck)}`);
    }
}
```

If you add `| { type: "MULTIPLY"; factor: number }` to `Action` without adding a case for it, the compiler will
immediately error on `const exhaustiveCheck: never = action`, because `action` can no longer be `never` -- it can be
`{ type: "MULTIPLY"; factor: number }`.

### A helper function for exhaustive checks

```typescript
function assertNever(value: never, message?: string): never {
    throw new Error(message ?? `Unhandled case: ${JSON.stringify(value)}`);
}

function processEvent(event: AppEvent): void {
    switch (event.type) {
        case "click":
            handleClick(event.x, event.y);
            break;
        case "keydown":
            handleKey(event.key);
            break;
        default:
            assertNever(event, `Unknown event type`);
    }
}
```

## Template literal types with unions

Literal types combine with template literal types to create powerful string unions:

```typescript
type Color = "red" | "green" | "blue";
type Size = "sm" | "md" | "lg";

type ButtonVariant = `${Color}-${Size}`;
// "red-sm" | "red-md" | "red-lg" | "green-sm" | "green-md" | "green-lg" | "blue-sm" | "blue-md" | "blue-lg"

type EventName = "click" | "focus" | "blur" | "change";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur" | "onChange"
```

## Practical example: a typed state machine

```typescript
type TrafficLight = "red" | "yellow" | "green";

type Transition = {
    from: TrafficLight;
    to: TrafficLight;
};

const transitions: Transition[] = [
    { from: "red", to: "green" },
    { from: "green", to: "yellow" },
    { from: "yellow", to: "red" },
];

function nextLight(current: TrafficLight): TrafficLight {
    const transition = transitions.find(t => t.from === current);
    if (!transition) {
        throw new Error(`No transition from ${current}`);
    }
    return transition.to;
}

let light: TrafficLight = "red";
for (let i = 0; i < 6; i++) {
    console.log(light);
    light = nextLight(light);
}
// red -> green -> yellow -> red -> green -> yellow -> red
```

## Summary

- **Numeric enums** auto-assign numbers but allow any number to be assigned -- use with caution
- **String enums** are safer and more readable; string values appear in logs and debuggers
- **`const enum`** is a compile-time-only optimization that inlines values -- avoid in library code
- **Literal types** (`"north" | "south"`, `1 | 2 | 3`) are the modern, lightweight alternative to enums
- **`as const`** freezes values to their literal types, enabling type derivation from data
- **Discriminated unions** use a shared literal property to narrow types in switch statements
- **Exhaustive checks** with `never` ensure you handle every variant of a union -- adding a new variant breaks the build if you forget to update the switch

Next up: [Utility Types](./08-utility-types.md) -- `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`,
`Exclude`, `Extract`, `NonNullable`, `ReturnType`, and `Parameters`.
