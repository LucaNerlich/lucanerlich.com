---
title: "Interfaces & Type Aliases"
sidebar_label: "Interfaces & Type Aliases"
description: Defining object shapes with interface and type, optional and readonly properties, extending interfaces, intersection types, and structural typing.
slug: /typescript/beginners-guide/interfaces-and-type-aliases
tags: [typescript, beginners]
keywords:
  - typescript interface
  - type alias
  - optional properties
  - readonly typescript
  - intersection types
  - structural typing
sidebar_position: 3
---

# Interfaces & Type Aliases

TypeScript gives you two ways to describe the shape of an object: `interface` and `type`. Both are widely used, both
are powerful, and they overlap significantly. Understanding when to use each -- and how they differ -- is essential for
writing idiomatic TypeScript.

## Interfaces

An `interface` defines the shape of an object. It describes what properties an object must have and what types those
properties hold:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

function displayUser(user: User): void {
    console.log(`${user.name} <${user.email}> — joined ${user.createdAt.toLocaleDateString()}`);
}

const alice: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    createdAt: new Date("2023-01-15"),
};

displayUser(alice);
```

TypeScript uses **structural typing** (more on this below), so any object with the right shape satisfies an interface
-- there is no need to explicitly declare `implements User`.

## Type aliases

A `type` alias gives a name to any type expression -- not just object shapes:

```typescript
// Object shape (same as an interface)
type User = {
    id: number;
    name: string;
    email: string;
};

// Union type
type Status = "pending" | "active" | "suspended";

// Primitive alias
type UserId = number;

// Tuple
type Coordinate = [number, number];

// Function type
type Formatter = (value: number) => string;
```

## interface vs type -- when to use which

This is one of the most-asked TypeScript questions. Here is the practical breakdown:

| Feature                             | `interface`           | `type`            |
|-------------------------------------|-----------------------|-------------------|
| Describe object shapes              | Yes                   | Yes               |
| Union types (`A \| B`)              | No                    | Yes               |
| Intersection types (`A & B`)        | Via `extends`         | Yes               |
| Primitive aliases                   | No                    | Yes               |
| Function types                      | Possible but verbose  | Concise           |
| Declaration merging                 | Yes                   | No                |
| Extends / implements in classes     | Yes                   | Yes (via `&`)     |
| Recursive types                     | Yes                   | Yes               |

**General recommendation:**

- Use `interface` for object shapes that represent domain entities (User, Product, ApiResponse) -- especially if other
  interfaces might extend them.
- Use `type` for unions, primitives, tuples, function types, and when you need to compose types with `|` or `&`.

In practice, both work for most object definitions. Be consistent within a codebase.

## Optional properties

Mark a property optional with `?`. An optional property can be the declared type or `undefined`:

```typescript
interface UserProfile {
    id: number;
    name: string;
    bio?: string;           // string | undefined
    website?: string;       // string | undefined
    avatarUrl?: string;     // string | undefined
}

function renderProfile(profile: UserProfile): string {
    const bio = profile.bio ?? "No bio provided";
    const website = profile.website ? `<a href="${profile.website}">Website</a>` : "";
    return `<h1>${profile.name}</h1><p>${bio}</p>${website}`;
}

// Valid -- optional properties can be omitted
const minimalProfile: UserProfile = { id: 1, name: "Alice" };

// Valid -- with some optional properties
const fullProfile: UserProfile = {
    id: 2,
    name: "Bob",
    bio: "Software engineer",
    website: "https://bob.dev",
};
```

## Readonly properties

Mark a property `readonly` to prevent reassignment after object creation:

```typescript
interface Config {
    readonly apiKey: string;
    readonly baseUrl: string;
    timeout: number; // mutable
}

const config: Config = {
    apiKey: "secret-123",
    baseUrl: "https://api.example.com",
    timeout: 5000,
};

config.timeout = 10000;      // OK
// config.apiKey = "other";  // Error: Cannot assign to 'apiKey' because it is a read-only property
```

`readonly` is a compile-time check only -- the compiled JavaScript has no concept of it. For truly immutable data at
runtime, use `Object.freeze()`.

### Readonly objects from the outside

Sometimes you want to expose an object as readonly to consumers while keeping it mutable internally:

```typescript
interface MutableConfig {
    apiKey: string;
    timeout: number;
}

type ReadonlyConfig = Readonly<MutableConfig>;

class ConfigManager {
    private config: MutableConfig = {
        apiKey: "secret",
        timeout: 5000,
    };

    getConfig(): ReadonlyConfig {
        return this.config; // Consumers cannot mutate it
    }

    setTimeout(ms: number): void {
        this.config.timeout = ms; // Internal mutation is fine
    }
}
```

## Extending interfaces

Interfaces can extend one or more other interfaces, inheriting all their properties:

```typescript
interface BaseEntity {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

interface User extends BaseEntity {
    name: string;
    email: string;
}

interface AdminUser extends User {
    permissions: string[];
    lastLogin: Date;
}

// AdminUser has: id, createdAt, updatedAt, name, email, permissions, lastLogin
const admin: AdminUser = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Admin Alice",
    email: "admin@example.com",
    permissions: ["read", "write", "delete"],
    lastLogin: new Date(),
};
```

### Extending multiple interfaces

```typescript
interface Serializable {
    serialize(): string;
}

interface Loggable {
    log(): void;
}

interface Event extends Serializable, Loggable {
    type: string;
    timestamp: Date;
    payload: unknown;
}
```

## Declaration merging

Interfaces support **declaration merging** -- if you declare the same interface name twice, TypeScript merges the
declarations:

```typescript
interface Window {
    myCustomProperty: string;
}

// Later in another file:
interface Window {
    anotherProperty: number;
}

// TypeScript merges them: Window has both myCustomProperty and anotherProperty
```

This is useful for augmenting existing type definitions, especially in library code or when extending browser globals.
`type` aliases do **not** support merging -- redeclaring a type alias is an error.

## Intersection types

Intersection types combine multiple types into one using `&`. The result must satisfy all combined types:

```typescript
interface HasName {
    name: string;
}

interface HasAge {
    age: number;
}

type Person = HasName & HasAge;

const person: Person = {
    name: "Alice",
    age: 30,
};
```

Intersection is often used to mix in functionality:

```typescript
interface Timestamped {
    createdAt: Date;
    updatedAt: Date;
}

interface SoftDeletable {
    deletedAt: Date | null;
}

type AuditedUser = User & Timestamped & SoftDeletable;
```

### Intersection vs extension

Interfaces use `extends` to inherit; type aliases use `&` to intersect. The results are similar but not identical:

```typescript
// With interface
interface Employee extends User {
    department: string;
}

// With type (equivalent result)
type Employee = User & { department: string };
```

The key difference: when properties conflict, `extends` may produce an error (if types are incompatible), while `&`
may produce `never` for the conflicting property.

## Structural typing

TypeScript uses **structural typing** (also called "duck typing"): compatibility is determined by the shape of a type,
not its name or declaration.

```typescript
interface Point2D {
    x: number;
    y: number;
}

interface Coordinate {
    x: number;
    y: number;
}

function distance(a: Point2D, b: Point2D): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const coord: Coordinate = { x: 3, y: 4 };
distance({ x: 0, y: 0 }, coord); // OK! coord satisfies Point2D structurally
```

This is different from nominal typing (Java, C#) where `Coordinate` and `Point2D` would be incompatible types even
with identical shapes. TypeScript is happy as long as the required properties are present.

### Excess property checks

There is one exception: when you pass an **object literal directly** to a typed variable, TypeScript performs excess
property checking and rejects unknown properties:

```typescript
interface Options {
    timeout: number;
    retries: number;
}

function fetchData(url: string, options: Options): void { /* ... */ }

// Error: Object literal may only specify known properties,
//   and 'debug' does not exist in type 'Options'
fetchData("/api", { timeout: 5000, retries: 3, debug: true });

// But this works (the object is first assigned to a variable):
const opts = { timeout: 5000, retries: 3, debug: true };
fetchData("/api", opts); // OK (structural compatibility, no excess property check)
```

## Index signatures

When you do not know the property names ahead of time, use an index signature:

```typescript
interface StringMap {
    [key: string]: string;
}

const headers: StringMap = {
    "Content-Type": "application/json",
    "Authorization": "Bearer abc123",
    "X-Request-ID": "req-456",
};

// You can add any string key:
headers["Accept"] = "application/json";
```

Index signatures are useful for dictionaries, but make the interface less precise. Prefer explicit properties when you
know them:

```typescript
interface HttpHeaders {
    "Content-Type"?: string;
    "Authorization"?: string;
    "Accept"?: string;
    [key: string]: string | undefined; // still allows arbitrary headers
}
```

## Callable interfaces and function types

Interfaces can describe functions:

```typescript
interface Validator {
    (value: string): boolean;
}

const isEmail: Validator = (value) => /^[^@]+@[^@]+\.[^@]+$/.test(value);
const isUrl: Validator = (value) => value.startsWith("https://");

// type alias is cleaner for this use case:
type ValidatorFn = (value: string) => boolean;
```

## Putting it together: a domain model

Here is a realistic domain model for an e-commerce application:

```typescript
interface Money {
    amount: number;
    currency: "USD" | "EUR" | "GBP";
}

interface BaseEntity {
    readonly id: string;
    readonly createdAt: Date;
    updatedAt: Date;
}

interface Product extends BaseEntity {
    name: string;
    description: string;
    price: Money;
    sku: string;
    stock: number;
    categories: string[];
    imageUrl?: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface Cart {
    readonly id: string;
    items: CartItem[];
    readonly userId: string;
}

type CartSummary = {
    itemCount: number;
    total: Money;
    items: Array<{ name: string; quantity: number; subtotal: Money }>;
};

function calculateTotal(cart: Cart): CartSummary {
    const items = cart.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        subtotal: {
            amount: item.product.price.amount * item.quantity,
            currency: item.product.price.currency,
        },
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal.amount, 0);
    const currency = cart.items[0]?.product.price.currency ?? "USD";

    return {
        itemCount: cart.items.reduce((n, item) => n + item.quantity, 0),
        total: { amount: total, currency },
        items,
    };
}
```

## Summary

- **Interfaces** define object shapes and support `extends`, declaration merging, and `implements`
- **Type aliases** are more flexible -- they can name unions, intersections, tuples, and primitives
- Use `interface` for domain objects; use `type` for unions, functions, and compositions
- **Optional properties** (`?`) allow a property to be omitted or `undefined`
- **Readonly properties** prevent reassignment after object creation
- **Intersection types** (`&`) combine multiple types into one
- TypeScript uses **structural typing** -- compatibility is based on shape, not name
- **Excess property checks** apply only to object literals passed directly to typed variables
- **Index signatures** allow arbitrary string keys when property names are not known in advance

Next up: [Functions](./04-functions.md) -- typed parameters, return types, optional and default parameters, rest
parameters, function overloads, and arrow functions.
