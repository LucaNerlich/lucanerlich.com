---
title: "Generics"
sidebar_label: "Generics"
description: Generic functions, interfaces, and classes in TypeScript, plus constraints with extends, default type parameters, and keyof and typeof operators.
slug: /typescript/beginners-guide/generics
tags: [typescript, beginners]
keywords:
  - typescript generics
  - generic function
  - generic interface
  - type constraints
  - keyof typeof
  - default type parameters
sidebar_position: 6
---

# Generics

Generics are the feature that makes TypeScript's type system truly powerful. They allow you to write functions,
interfaces, and classes that work with any type while still preserving type safety -- no `any` required. Think of
generics as type-level parameters: instead of hardcoding `string` or `number`, you use a placeholder that gets filled
in by the caller.

## The problem generics solve

Without generics, you have two bad choices when writing reusable code:

```typescript
// Option 1: Use any -- loses all type safety
function first(array: any[]): any {
    return array[0];
}

const value = first([1, 2, 3]);
value.toUpperCase(); // No error! But crashes at runtime (number has no toUpperCase)

// Option 2: Write a separate function for every type -- massive duplication
function firstString(array: string[]): string { return array[0]; }
function firstNumber(array: number[]): number { return array[0]; }
function firstUser(array: User[]): User { return array[0]; }
```

Generics solve this:

```typescript
function first<T>(array: T[]): T | undefined {
    return array[0];
}

const num = first([1, 2, 3]);        // T is inferred as number; result is number | undefined
const str = first(["a", "b", "c"]);  // T is inferred as string; result is string | undefined

// num.toUpperCase(); // Error: Property 'toUpperCase' does not exist on type 'number'
// str.toFixed(2);    // Error: Property 'toFixed' does not exist on type 'string'
```

TypeScript infers `T` from the argument. The type safety is preserved without any duplication.

## Generic functions

The type parameter is declared in angle brackets before the parameter list:

```typescript
// Identity: returns whatever it receives, preserving the type
function identity<T>(value: T): T {
    return value;
}

// Wrap a value in an array
function wrapInArray<T>(value: T): T[] {
    return [value];
}

// Pluck a property from an array of objects
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
    return items.map(item => item[key]);
}

const users = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
];

const names = pluck(users, "name"); // string[]
const ages = pluck(users, "age");   // number[]
// pluck(users, "email");           // Error: 'email' not a key of the user type
```

### Multiple type parameters

```typescript
function zip<A, B>(a: A[], b: B[]): [A, B][] {
    const length = Math.min(a.length, b.length);
    return Array.from({ length }, (_, i) => [a[i], b[i]]);
}

const pairs = zip([1, 2, 3], ["a", "b", "c"]);
// Type: [number, string][] -- not [any, any][]

function mapObject<K extends string, V, R>(
    obj: Record<K, V>,
    fn: (key: K, value: V) => R,
): Record<K, R> {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, fn(k as K, v as V)])
    ) as Record<K, R>;
}

const prices = { apple: 1.5, banana: 0.75, cherry: 3.0 };
const doubled = mapObject(prices, (_, price) => price * 2);
// doubled: { apple: number; banana: number; cherry: number }
```

## Generic interfaces

Interfaces can have type parameters too:

```typescript
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

// Concrete usage
type UserResponse = ApiResponse<User>;
type UsersResponse = PaginatedResponse<User>;

// A generic repository interface
interface Repository<T, ID = number> {
    findById(id: ID): Promise<T | null>;
    findAll(options?: QueryOptions): Promise<T[]>;
    save(entity: Omit<T, "id"> | T): Promise<T>;
    update(id: ID, patch: Partial<T>): Promise<T | null>;
    delete(id: ID): Promise<boolean>;
}

interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    order?: "asc" | "desc";
}
```

### Generic type aliases

```typescript
// A Result type (similar to Rust's Result)
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) return { success: false, error: "Division by zero" };
    return { success: true, data: a / b };
}

const result = divide(10, 3);
if (result.success) {
    console.log(result.data.toFixed(4)); // TypeScript knows data is number
} else {
    console.error(result.error);         // TypeScript knows error is string
}

// A nullable wrapper
type Maybe<T> = T | null | undefined;

// An event handler type
type EventHandler<E = Event> = (event: E) => void;
```

## Generic classes

Classes can also have type parameters:

```typescript
class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    get size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    toArray(): T[] {
        return [...this.items];
    }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
numStack.push(3);
console.log(numStack.pop()); // 3 (type: number | undefined)

const strStack = new Stack<string>();
strStack.push("hello");
// strStack.push(42); // Error: number is not assignable to string
```

### A generic cache class

```typescript
class Cache<V> {
    private store = new Map<string, { value: V; expiresAt: number }>();

    set(key: string, value: V, ttlMs: number = 60_000): void {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }

    get(key: string): V | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    invalidate(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}

const userCache = new Cache<User>();
userCache.set("user:1", { id: 1, name: "Alice", email: "alice@example.com" }, 5_000);
const user = userCache.get("user:1"); // User | null
```

## Constraints with extends

Generic type parameters can be constrained to only allow certain types:

```typescript
// T must have a length property
function longest<T extends { length: number }>(a: T, b: T): T {
    return a.length >= b.length ? a : b;
}

longest("hello", "hi");           // string
longest([1, 2, 3], [1, 2]);       // number[]
// longest(10, 20);                // Error: number doesn't have 'length'

// T must be an object (not primitive)
function merge<T extends object, U extends object>(target: T, source: U): T & U {
    return { ...target, ...source };
}

const merged = merge({ name: "Alice" }, { age: 30 });
// merged: { name: string } & { age: number }

// T must extend a specific interface
interface HasId {
    id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
    return items.find(item => item.id === id);
}

const found = findById(users, 1); // User | undefined (not any)
```

## The keyof operator

`keyof` produces a union of all property keys of a type:

```typescript
interface Config {
    host: string;
    port: number;
    debug: boolean;
}

type ConfigKey = keyof Config; // "host" | "port" | "debug"

// Safe property access
function getConfigValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const config: Config = { host: "localhost", port: 3000, debug: true };

const host = getConfigValue(config, "host");   // string
const port = getConfigValue(config, "port");   // number
// getConfigValue(config, "timeout");           // Error: not a key of Config

// Typed object copy with only certain keys
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return Object.fromEntries(keys.map(k => [k, obj[k]])) as Pick<T, K>;
}

const subset = pick(config, ["host", "port"]); // { host: string; port: number }
```

## The typeof operator

`typeof` in a type position refers to TypeScript's type of a value, not JavaScript's runtime `typeof`:

```typescript
const defaultConfig = {
    host: "localhost",
    port: 3000,
    debug: false,
    retries: 3,
};

// Derive the type from the value (instead of duplicating it)
type AppConfig = typeof defaultConfig;
// { host: string; port: number; debug: boolean; retries: number }

function withDefaults(overrides: Partial<typeof defaultConfig>): typeof defaultConfig {
    return { ...defaultConfig, ...overrides };
}

const config = withDefaults({ port: 8080 });
```

### Combining keyof and typeof

```typescript
const ROUTES = {
    home: "/",
    users: "/users",
    settings: "/settings",
    profile: "/profile",
} as const;

type RouteName = keyof typeof ROUTES;          // "home" | "users" | "settings" | "profile"
type RoutePath = (typeof ROUTES)[RouteName];   // "/" | "/users" | "/settings" | "/profile"

function navigate(route: RouteName): void {
    const path = ROUTES[route]; // TypeScript knows this is a valid path
    window.location.href = path;
}

navigate("home");     // OK
// navigate("admin"); // Error
```

## Default type parameters

Type parameters can have defaults, used when the type is not specified or cannot be inferred:

```typescript
// E defaults to Error if not specified
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

// Without specifying E, it defaults to Error
const result: Result<User> = { success: true, data: alice };

// Specifying a custom error type
const strictResult: Result<User, { code: number; message: string }> =
    { success: false, error: { code: 404, message: "Not found" } };

// Event emitter with default event map
class EventEmitter<Events extends Record<string, unknown[]> = Record<string, unknown[]>> {
    private listeners = new Map<string, ((...args: unknown[]) => void)[]>();

    on<K extends keyof Events & string>(
        event: K,
        listener: (...args: Events[K]) => void,
    ): void {
        const existing = this.listeners.get(event) ?? [];
        this.listeners.set(event, [...existing, listener as (...args: unknown[]) => void]);
    }

    emit<K extends keyof Events & string>(event: K, ...args: Events[K]): void {
        this.listeners.get(event)?.forEach(fn => fn(...args));
    }
}

interface AppEvents {
    userLoggedIn: [user: User];
    pageViewed: [path: string, duration: number];
    error: [message: string, code?: number];
}

const emitter = new EventEmitter<AppEvents>();
emitter.on("userLoggedIn", (user) => console.log(`Welcome, ${user.name}`));
emitter.on("pageViewed", (path, duration) => console.log(`${path}: ${duration}ms`));
emitter.emit("userLoggedIn", alice);
```

## Practical example: a typed fetch wrapper

```typescript
interface FetchOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

async function typedFetch<T>(
    url: string,
    options: FetchOptions = {},
): Promise<Result<T, { status: number; message: string }>> {
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            signal: options.signal,
        });

        if (!response.ok) {
            return {
                success: false,
                error: { status: response.status, message: response.statusText },
            };
        }

        const data = (await response.json()) as T;
        return { success: true, data };
    } catch (err) {
        return {
            success: false,
            error: { status: 0, message: err instanceof Error ? err.message : "Unknown error" },
        };
    }
}

// Usage -- fully typed without any assertions at the call site
const result = await typedFetch<User>("/api/users/1");
if (result.success) {
    console.log(result.data.name); // TypeScript knows this is User
} else {
    console.error(result.error.status); // number
}
```

## Summary

- Generics are type parameters (`<T>`) that allow writing reusable, type-safe code for any type
- TypeScript infers type parameters from function arguments -- you rarely need to specify them explicitly
- **Generic interfaces** describe reusable shapes like `Repository<T>`, `ApiResponse<T>`, `Result<T, E>`
- **Generic classes** like `Stack<T>` or `Cache<V>` carry state typed to a specific type parameter
- **Constraints** (`T extends SomeType`) restrict what types a generic can accept
- **`keyof`** produces the union of an object's property keys -- enables safe property lookup
- **`typeof`** in a type position extracts the TypeScript type of a value -- derives types from data
- **Default type parameters** (`T = Error`) provide fallbacks when a type argument is not given

Next up: [Enums & Literal Types](./07-enums-and-literals.md) -- numeric enums, string enums, const enums, literal
types, discriminated unions, and exhaustive checks.
