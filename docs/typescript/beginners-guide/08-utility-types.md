---
title: "Utility Types"
sidebar_label: "Utility Types"
description: Practical examples of TypeScript's built-in utility types — Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, NonNullable, ReturnType, and Parameters.
slug: /typescript/beginners-guide/utility-types
tags: [typescript, beginners]
keywords:
  - typescript utility types
  - Partial Required Readonly
  - Pick Omit Record
  - ReturnType Parameters
  - Exclude Extract NonNullable
  - mapped types
sidebar_position: 8
---

# Utility Types

TypeScript ships with a library of built-in generic types called **utility types**. They transform existing types into
new ones - making properties optional, picking a subset of fields, making an object readonly, extracting function
return types, and more. Mastering utility types dramatically reduces boilerplate and keeps your types DRY.

## Partial\<T\>

Makes all properties of `T` optional. The most common use is for update/patch operations:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    role: "admin" | "user";
}

// Partial<User> = { id?: number; name?: string; email?: string; age?: number; role?: ... }

async function updateUser(id: number, patch: Partial<User>): Promise<User> {
    const existing = await db.users.findById(id);
    const updated = { ...existing, ...patch, id }; // preserve id
    return db.users.save(updated);
}

await updateUser(1, { name: "Alice Smith" });         // only update name
await updateUser(2, { email: "new@example.com", age: 31 }); // update two fields
```

### Partial for form state

```typescript
type FormErrors<T> = Partial<Record<keyof T, string>>;

interface RegistrationForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const errors: FormErrors<RegistrationForm> = {
    email: "Invalid email format",
    password: "Password must be at least 8 characters",
};
```

## Required\<T\>

The opposite of `Partial` - makes all properties of `T` required (removes all `?` markers):

```typescript
interface Config {
    host?: string;
    port?: number;
    debug?: boolean;
}

// After loading and applying defaults, the config is fully populated:
function resolveConfig(partial: Config): Required<Config> {
    return {
        host: partial.host ?? "localhost",
        port: partial.port ?? 3000,
        debug: partial.debug ?? false,
    };
}

const config = resolveConfig({ port: 8080 });
// config.host is string (not string | undefined)
// config.port is number
// config.debug is boolean
```

## Readonly\<T\>

Makes all properties of `T` readonly - they cannot be reassigned after creation:

```typescript
interface AppState {
    user: User | null;
    theme: "light" | "dark";
    notifications: string[];
}

function createInitialState(): Readonly<AppState> {
    return {
        user: null,
        theme: "light",
        notifications: [],
    };
}

const state = createInitialState();
// state.theme = "dark"; // Error: Cannot assign to 'theme' because it is a read-only property
// state.user = alice;   // Error

// Useful for configuration objects and frozen state:
const API_CONFIG: Readonly<{ baseUrl: string; version: string; timeout: number }> = {
    baseUrl: "https://api.example.com",
    version: "v1",
    timeout: 5000,
};
```

> **Note:** `Readonly<T>` is shallow - nested objects are still mutable. For deep immutability, use `as const` or
> a library like `immer`.

## Pick\<T, K\>

Creates a new type with only the specified keys from `T`:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    role: "admin" | "user";
}

// Safe user representation for API responses (no password)
type PublicUser = Pick<User, "id" | "name" | "email" | "role">;

// Minimal representation for lists
type UserSummary = Pick<User, "id" | "name">;

function getPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

// Pick for form fields
type UserRegistration = Pick<User, "name" | "email" | "password">;
```

## Omit\<T, K\>

The inverse of `Pick` - creates a new type with all keys of `T` **except** the specified ones:

```typescript
// Omit is often cleaner than Pick when excluding a small number of properties

type PublicUser = Omit<User, "password">;          // Everything except password
type NewUser = Omit<User, "id" | "createdAt">;    // For creation (before DB assigns id)
type UpdateUser = Partial<Omit<User, "id">>;       // Patch (id is immutable, rest optional)

async function createUser(data: NewUser): Promise<User> {
    const id = generateId();
    const createdAt = new Date();
    return db.users.insert({ ...data, id, createdAt });
}
```

### Pick vs Omit: when to use which

| Use `Pick` when...                                | Use `Omit` when...                                   |
|---------------------------------------------------|------------------------------------------------------|
| You want a few specific properties                | You want almost all properties, minus a few          |
| The selected set is stable and small              | The excluded set is small and the rest should follow |
| Creating a view-model with named properties       | Stripping sensitive fields (password, secret)        |

## Record\<K, V\>

Creates an object type where keys are of type `K` and values are of type `V`:

```typescript
// Typed dictionary
type CountryCode = "US" | "DE" | "JP" | "GB";

const countryNames: Record<CountryCode, string> = {
    US: "United States",
    DE: "Germany",
    JP: "Japan",
    GB: "United Kingdom",
};

// Error if a key is missing or wrong:
// const broken: Record<CountryCode, string> = { US: "United States" }; // Missing DE, JP, GB

// Route handlers
type RouteHandler = (req: Request) => Promise<Response>;
const handlers: Record<string, RouteHandler> = {
    "/users": handleUsers,
    "/posts": handlePosts,
};

// Grouping items by a key
function groupBy<T, K extends string>(
    items: T[],
    keyFn: (item: T) => K,
): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    for (const item of items) {
        const key = keyFn(item);
        result[key] = result[key] ?? [];
        result[key].push(item);
    }
    return result;
}

const users = [
    { name: "Alice", role: "admin" as const },
    { name: "Bob", role: "user" as const },
    { name: "Carol", role: "admin" as const },
];

const byRole = groupBy(users, u => u.role);
// { admin: [Alice, Carol], user: [Bob] }
```

## Exclude\<T, U\>

Removes from a union `T` all members that are assignable to `U`:

```typescript
type AllEvents = "click" | "focus" | "blur" | "keydown" | "keyup" | "scroll";
type KeyboardEvents = "keydown" | "keyup";

type MouseEvents = Exclude<AllEvents, KeyboardEvents>;
// "click" | "focus" | "blur" | "scroll"

// Remove null and undefined from a union
type NonNullString = Exclude<string | null | undefined, null | undefined>;
// string

// Exclude specific values
type VisibleRole = Exclude<"admin" | "user" | "guest" | "system", "system">;
// "admin" | "user" | "guest"
```

## Extract\<T, U\>

The opposite of `Exclude` - keeps only the members of `T` that are assignable to `U`:

```typescript
type AllRoles = "admin" | "user" | "guest" | "service" | "bot";
type HumanRoles = Extract<AllRoles, "admin" | "user" | "guest">;
// "admin" | "user" | "guest"

type StringOrNumber = string | number | boolean | object;
type Primitive = Extract<StringOrNumber, string | number>;
// string | number

// Extract shared keys from two interfaces
type SharedKeys = Extract<keyof User, keyof Product>;
```

## NonNullable\<T\>

Removes `null` and `undefined` from a type:

```typescript
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// Useful with optional properties
interface Config {
    apiKey?: string;
    baseUrl?: string;
}

// Once validated, make properties required:
type ValidatedConfig = {
    [K in keyof Required<Config>]: NonNullable<Required<Config>[K]>;
};

// Type guard that also narrows
function requireValue<T>(value: T | null | undefined, name: string): NonNullable<T> {
    if (value == null) throw new Error(`${name} is required`);
    return value as NonNullable<T>;
}

const apiKey = requireValue(process.env.API_KEY, "API_KEY"); // string (not string | undefined)
```

## ReturnType\<T\>

Extracts the return type of a function type:

```typescript
function createUser(name: string, email: string) {
    return {
        id: Math.random(),
        name,
        email,
        createdAt: new Date(),
    };
}

// Derive the type from the function instead of duplicating it
type User = ReturnType<typeof createUser>;
// { id: number; name: string; email: string; createdAt: Date }

// Very useful for functions that return complex objects or classes
async function fetchUser(id: number): Promise<{ id: number; name: string }> {
    return { id, name: "Alice" };
}

type FetchResult = Awaited<ReturnType<typeof fetchUser>>;
// { id: number; name: string } -- Awaited unwraps the Promise

// Extract the return type of a method
class AuthService {
    async login(email: string, password: string): Promise<{ token: string; expiresAt: Date }> {
        return { token: "abc123", expiresAt: new Date() };
    }
}

type LoginResult = Awaited<ReturnType<AuthService["login"]>>;
// { token: string; expiresAt: Date }
```

## Parameters\<T\>

Extracts the parameter types of a function as a tuple:

```typescript
function createOrder(
    userId: number,
    products: { id: number; quantity: number }[],
    couponCode?: string,
): void {
    // ...
}

type OrderParams = Parameters<typeof createOrder>;
// [userId: number, products: { id: number; quantity: number }[], couponCode?: string]

// Useful for wrapping or decorating functions
function withLogging<T extends (...args: never[]) => unknown>(fn: T): T {
    return ((...args: Parameters<T>) => {
        console.log(`Calling ${fn.name} with`, args);
        const result = fn(...args);
        console.log(`${fn.name} returned`, result);
        return result;
    }) as T;
}

const loggedCreateOrder = withLogging(createOrder);
loggedCreateOrder(1, [{ id: 42, quantity: 2 }], "SAVE10");
```

## ConstructorParameters\<T\>

Like `Parameters` but for class constructors:

```typescript
class EventBus {
    constructor(
        private readonly name: string,
        private readonly maxListeners: number = 10,
    ) {}
}

type EventBusArgs = ConstructorParameters<typeof EventBus>;
// [name: string, maxListeners?: number]

function createEventBus(...args: ConstructorParameters<typeof EventBus>): EventBus {
    return new EventBus(...args);
}
```

## InstanceType\<T\>

Extracts the instance type of a constructor:

```typescript
class Database {
    query(sql: string): unknown[] { return []; }
    close(): void {}
}

type DbInstance = InstanceType<typeof Database>;
// Database

// Useful in factory patterns
function createWithDefaults<T extends new (...args: unknown[]) => unknown>(
    Cls: T,
    ...args: ConstructorParameters<T>
): InstanceType<T> {
    return new Cls(...args) as InstanceType<T>;
}
```

## Combining utility types

Utility types compose naturally - this is where they become truly powerful:

```typescript
interface BlogPost {
    id: number;
    title: string;
    content: string;
    authorId: number;
    tags: string[];
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// For creating a new post (no id, no timestamps yet)
type NewPost = Omit<BlogPost, "id" | "createdAt" | "updatedAt">;

// For updating an existing post (id is required, rest optional)
type UpdatePost = Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt">>;

// For a list view (lightweight)
type PostSummary = Pick<BlogPost, "id" | "title" | "authorId" | "tags" | "publishedAt">;

// For the public API (no internal fields)
type PublicPost = Readonly<Omit<BlogPost, "authorId">>;

// Form state
type PostFormState = {
    values: Partial<NewPost>;
    errors: Partial<Record<keyof NewPost, string>>;
    isSubmitting: boolean;
};

function createEmptyForm(): PostFormState {
    return {
        values: {},
        errors: {},
        isSubmitting: false,
    };
}
```

## Summary of all utility types

| Utility type        | What it does                                               |
|---------------------|------------------------------------------------------------|
| `Partial<T>`        | All properties become optional                             |
| `Required<T>`       | All optional properties become required                    |
| `Readonly<T>`       | All properties become readonly                             |
| `Pick<T, K>`        | Only keep the properties listed in `K`                     |
| `Omit<T, K>`        | Remove the properties listed in `K`                        |
| `Record<K, V>`      | Object with keys `K` and values `V`                        |
| `Exclude<T, U>`     | Remove union members assignable to `U`                     |
| `Extract<T, U>`     | Keep only union members assignable to `U`                  |
| `NonNullable<T>`    | Remove `null` and `undefined` from the type                |
| `ReturnType<T>`     | Extract the return type of a function                      |
| `Parameters<T>`     | Extract parameter types as a tuple                         |
| `ConstructorParameters<T>` | Extract constructor parameter types              |
| `InstanceType<T>`   | Extract the instance type of a constructor                 |
| `Awaited<T>`        | Recursively unwrap `Promise<T>` (TypeScript 4.5+)          |

Next up: [Advanced Types](./09-advanced-types.md) - conditional types, mapped types, template literal types, the
`infer` keyword, and recursive types.
