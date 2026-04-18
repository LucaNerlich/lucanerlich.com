---
title: "Advanced Types"
sidebar_label: "Advanced Types"
description: Conditional types, mapped types, template literal types, the infer keyword, and recursive types with real-world use cases.
slug: /typescript/beginners-guide/advanced-types
tags: [typescript, beginners]
keywords:
  - typescript conditional types
  - mapped types
  - template literal types
  - infer keyword
  - recursive types
  - advanced typescript
sidebar_position: 9
---

# Advanced Types

With basic types, interfaces, generics, and utility types under your belt, you are ready for the parts of TypeScript's
type system that feel almost like a programming language unto themselves. Conditional types, mapped types, template
literal types, and the `infer` keyword let you write type-level logic that would be impossible to express with simpler
tools.

## Conditional types

Conditional types choose between two types based on a condition, using the syntax `T extends U ? X : Y`:

```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true (string literals extend string)
```

The power of conditional types comes from combining them with generics:

```typescript
// Flatten arrays -- if T is an array, return the element type; otherwise return T
type Flatten<T> = T extends (infer U)[] ? U : T;

type Str = Flatten<string[]>;    // string
type Num = Flatten<number>;      // number
type Obj = Flatten<{ a: 1 }[]>; // { a: 1 }

// Unwrap a Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type Result = Awaited<Promise<Promise<string>>>; // string
```

### Distributive conditional types

When a conditional type is applied to a union, it distributes over each member:

```typescript
type NonArray<T> = T extends unknown[] ? never : T;

type Filtered = NonArray<string | number[] | boolean | string[]>;
// Distributed as:
//   NonArray<string>    = string    (not an array)
//   NonArray<number[]>  = never     (is an array)
//   NonArray<boolean>   = boolean   (not an array)
//   NonArray<string[]>  = never     (is an array)
// Result: string | boolean

// This is how Exclude is implemented:
type MyExclude<T, U> = T extends U ? never : T;

type Result = MyExclude<"a" | "b" | "c", "b">; // "a" | "c"
```

### Practical conditional types

```typescript
// Get the type of a promise's resolved value, or the type itself if not a Promise
type Resolved<T> = T extends PromiseLike<infer U> ? U : T;

// Extract function arguments based on position
type FirstArg<T extends (...args: never[]) => unknown> =
    T extends (first: infer F, ...rest: never[]) => unknown ? F : never;

function greet(name: string, age: number): string {
    return `Hello ${name}`;
}
type NameType = FirstArg<typeof greet>; // string

// Make methods optional in an interface
type Implementable<T> = {
    [K in keyof T]: T[K] extends (...args: never[]) => unknown
        ? T[K] | undefined
        : T[K];
};
```

## The infer keyword

`infer` declares a type variable inside a conditional type. It lets you extract parts of a type:

```typescript
// Extract the return type of a function (how ReturnType<T> works internally)
type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never;

// Extract element type from an array
type ElementType<T> = T extends (infer E)[] ? E : never;

// Extract the value type from a Promise
type PromiseValue<T> = T extends Promise<infer V> ? V : T;

// Extract the last element of a tuple
type LastElement<T extends unknown[]> =
    T extends [...infer _, infer Last] ? Last : never;

type L = LastElement<[string, number, boolean]>; // boolean

// Extract the first element of a tuple
type Head<T extends unknown[]> =
    T extends [infer H, ...infer _] ? H : never;

type H = Head<[string, number, boolean]>; // string

// Tail of a tuple
type Tail<T extends unknown[]> =
    T extends [infer _, ...infer Rest] ? Rest : never;

type Rest = Tail<[string, number, boolean]>; // [number, boolean]
```

### Inferring parameter types from a callback

```typescript
// Given an event emitter, extract the event callback's argument types
type EventArgs<T extends (arg: never) => void> =
    T extends (arg: infer A) => void ? A : never;

type ClickArgs = EventArgs<(event: MouseEvent) => void>; // MouseEvent

// Infer the type from nested generics
type UnwrapPromiseArray<T> =
    T extends Array<Promise<infer U>> ? U[] : never;

type StringArray = UnwrapPromiseArray<Promise<string>[]>; // string[]
```

## Mapped types

Mapped types iterate over the keys of a type and transform each property:

```typescript
// The syntax: { [K in keyof T]: NewType }

// Make all properties optional (how Partial<T> works)
type MyPartial<T> = { [K in keyof T]?: T[K] };

// Make all properties required (how Required<T> works)
type MyRequired<T> = { [K in keyof T]-?: T[K] };

// Make all properties readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// Remove readonly from all properties
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

### Remapping with as

TypeScript 4.1 added key remapping in mapped types using `as`:

```typescript
// Prefix all keys with "get"
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
    name: string;
    email: string;
    age: number;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getEmail: () => string;
//   getAge: () => number;
// }

// Filter properties by type using remapping
type PickByType<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};

interface Mixed {
    id: number;
    name: string;
    active: boolean;
    score: number;
}

type StringProps = PickByType<Mixed, string>;  // { name: string }
type NumberProps = PickByType<Mixed, number>;  // { id: number; score: number }
```

### Mapped types with conditional types

Combining mapped types and conditional types unlocks deep transformations:

```typescript
// Wrap all properties in a Promise (for async versions)
type Async<T> = {
    [K in keyof T]: Promise<T[K]>;
};

// Make nullable properties optional
type NullableToOptional<T> = {
    [K in keyof T as null extends T[K] ? never : K]: T[K];
} & {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

// Deep partial (recursively make all properties optional)
type DeepPartial<T> = T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

interface Config {
    server: {
        host: string;
        port: number;
        tls: {
            enabled: boolean;
            cert: string;
        };
    };
    database: {
        url: string;
        pool: number;
    };
}

type PartialConfig = DeepPartial<Config>;
// Every nested property is optional
const override: PartialConfig = {
    server: { port: 8080 },
    // database is omitted, tls is omitted, etc.
};
```

## Template literal types

Template literal types (TypeScript 4.1+) apply string template syntax at the type level:

```typescript
type EventName = "click" | "focus" | "blur" | "change" | "submit";

// Generate "onClick", "onFocus", etc.
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur" | "onChange" | "onSubmit"

// CSS property pattern
type CssProp = "margin" | "padding" | "border";
type CssDirection = "top" | "right" | "bottom" | "left";
type CssValue = `${CssProp}-${CssDirection}`;
// "margin-top" | "margin-right" | ... | "border-left" (12 combinations)

// Event listener types
type DomEventMap = {
    [K in `on${Capitalize<string & keyof GlobalEventHandlersEventMap>}`]:
        K extends `on${infer E}`
            ? Lowercase<E> extends keyof GlobalEventHandlersEventMap
                ? GlobalEventHandlersEventMap[Lowercase<E>]
                : Event
            : never;
};
```

### Template literals for route paths

```typescript
type ApiVersion = "v1" | "v2";
type Resource = "users" | "posts" | "comments";

type ApiRoute = `/api/${ApiVersion}/${Resource}`;
// "/api/v1/users" | "/api/v1/posts" | ... | "/api/v2/comments"

function fetchResource(route: ApiRoute): Promise<unknown> {
    return fetch(route).then(r => r.json());
}

fetchResource("/api/v1/users");   // OK
// fetchResource("/api/v3/users"); // Error: not a valid ApiRoute

// Extract path parameters
type ExtractParams<Path extends string> =
    Path extends `${infer _Start}:${infer Param}/${infer Rest}`
        ? Param | ExtractParams<`/${Rest}`>
        : Path extends `${infer _Start}:${infer Param}`
            ? Param
            : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"
```

## Recursive types

TypeScript supports types that reference themselves, which is essential for tree-like or nested structures:

```typescript
// JSON type
type Json =
    | string
    | number
    | boolean
    | null
    | Json[]
    | { [key: string]: Json };

const data: Json = {
    name: "Alice",
    age: 30,
    hobbies: ["reading", "coding"],
    address: {
        city: "Berlin",
        coordinates: [52.52, 13.405],
    },
};

// Nested comment structure
interface Comment {
    id: number;
    author: string;
    content: string;
    createdAt: Date;
    replies: Comment[];
}

// File system tree
type FileSystemNode =
    | { type: "file"; name: string; size: number }
    | { type: "directory"; name: string; children: FileSystemNode[] };

// Deep readonly
type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object
        ? T[K] extends (...args: never[]) => unknown
            ? T[K]                   // functions stay as-is
            : DeepReadonly<T[K]>     // recurse into objects
        : T[K];                      // primitives stay as-is
};
```

### Recursive conditional types (TypeScript 4.1+)

```typescript
// Flatten deeply nested arrays
type DeepFlatten<T> = T extends (infer U)[]
    ? DeepFlatten<U>
    : T;

type Result = DeepFlatten<number[][][]>; // number

// Paths to all leaf properties of an object
type Paths<T, D extends string = ""> = {
    [K in keyof T & string]: T[K] extends object
        ? Paths<T[K], `${D}${K}.`>
        : `${D}${K}`;
}[keyof T & string];

interface Config {
    server: { host: string; port: number };
    database: { url: string };
}

type ConfigPaths = Paths<Config>;
// "server.host" | "server.port" | "database.url"
```

## Real-world example: a typed event system

Putting conditional types, mapped types, and template literals together:

```typescript
// Define events and their payload types
interface AppEventMap {
    "user:login": { userId: number; timestamp: Date };
    "user:logout": { userId: number };
    "cart:add": { productId: number; quantity: number };
    "cart:remove": { productId: number };
    "order:placed": { orderId: number; total: number };
    "error": { message: string; code?: string };
}

type EventName = keyof AppEventMap;
type EventPayload<E extends EventName> = AppEventMap[E];
type EventListener<E extends EventName> = (payload: EventPayload<E>) => void;

class TypedEventEmitter {
    private listeners = new Map<string, EventListener<EventName>[]>();

    on<E extends EventName>(event: E, listener: EventListener<E>): void {
        const existing = (this.listeners.get(event) ?? []) as EventListener<E>[];
        this.listeners.set(event, [...existing, listener] as EventListener<EventName>[]);
    }

    off<E extends EventName>(event: E, listener: EventListener<E>): void {
        const existing = this.listeners.get(event) ?? [];
        this.listeners.set(
            event,
            existing.filter(l => l !== listener) as EventListener<EventName>[],
        );
    }

    emit<E extends EventName>(event: E, payload: EventPayload<E>): void {
        const handlers = this.listeners.get(event) ?? [];
        handlers.forEach(handler => (handler as EventListener<E>)(payload));
    }

    once<E extends EventName>(event: E, listener: EventListener<E>): void {
        const wrapper: EventListener<E> = (payload) => {
            listener(payload);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

const emitter = new TypedEventEmitter();

emitter.on("user:login", ({ userId, timestamp }) => {
    // userId: number, timestamp: Date -- fully typed
    console.log(`User ${userId} logged in at ${timestamp}`);
});

emitter.emit("user:login", { userId: 1, timestamp: new Date() }); // OK
// emitter.emit("user:login", { userId: "wrong" }); // Error: string not assignable to number
```

## Summary

- **Conditional types** (`T extends U ? X : Y`) choose between types based on a condition, and distribute over unions
- **`infer`** extracts type variables from within a conditional type -- used to build `ReturnType`, `Parameters`, etc.
- **Mapped types** iterate over object keys and transform each property -- the basis of all utility types
- **Key remapping** (`as`) in mapped types filters or renames keys -- enables `PickByType` and similar helpers
- **Template literal types** combine string unions with template syntax to generate new string union types
- **Recursive types** reference themselves to describe trees, nested objects, and deeply structured data
- Combining these features lets you write type-level logic that enforces complex invariants at compile time

Next up: [Modules & Declaration Files](./10-modules-and-declaration-files.md) -- ES modules in TypeScript,
import/export, `.d.ts` declaration files, DefinitelyTyped, and writing your own declarations.
