---
title: "TypeScript"
sidebar_label: "TypeScript"
description: TypeScript adds static types to JavaScript -- learn type annotations, interfaces, generics, union types, and how to set up a TypeScript project.
slug: /javascript/beginners-guide/typescript
tags: [javascript, beginners, typescript, types]
keywords:
  - typescript
  - typescript tutorial
  - typescript types
  - typescript interfaces
  - typescript generics
sidebar_position: 13
---

# TypeScript

TypeScript is JavaScript with **static types**. It catches bugs at compile time instead of at runtime, provides better editor autocompletion, and makes large codebases easier to maintain. Every valid JavaScript file is also valid TypeScript -- you can adopt it gradually.

## Why TypeScript?

Consider this JavaScript function:

```js
function add(a, b) {
    return a + b;
}

add(2, 3);       // 5
add("2", 3);     // "23" -- probably a bug
```

JavaScript happily concatenates a string and a number. TypeScript catches this:

```ts
function add(a: number, b: number): number {
    return a + b;
}

add(2, 3);       // 5
add("2", 3);     // Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

The `: number` annotations tell TypeScript what types are expected. The error appears **in your editor** before you even run the code.

### What TypeScript gives you

| Benefit | Explanation |
|---------|-------------|
| **Catch bugs early** | Type errors are caught at compile time, not at runtime |
| **Better autocomplete** | Your editor knows the shape of every object |
| **Self-documenting code** | Types explain what a function expects and returns |
| **Safer refactoring** | Rename a property and see every place that breaks |
| **Gradual adoption** | Add types to one file at a time -- no big rewrite needed |

## Setting up TypeScript

### Installing

```bash
npm init -y
npm install --save-dev typescript
```

This adds the TypeScript compiler (`tsc`) to your project.

### Creating `tsconfig.json`

```bash
npx tsc --init
```

This creates a `tsconfig.json` with sensible defaults. Here is a minimal configuration:

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "outDir": "dist",
        "rootDir": "src",
        "esModuleInterop": true,
        "skipLibCheck": true
    },
    "include": ["src"]
}
```

| Option | What it does |
|--------|-------------|
| `target` | Which JavaScript version to compile to |
| `module` | Module system for the output |
| `strict` | Enable all strict type checks (always use this) |
| `outDir` | Where compiled `.js` files go |
| `rootDir` | Where your `.ts` source files live |

### Your first TypeScript file

Create `src/hello.ts`:

```ts
const greeting: string = "Hello, TypeScript!";
console.log(greeting);
```

Compile and run:

```bash
npx tsc
node dist/hello.js
```

Result:
```text
Hello, TypeScript!
```

`tsc` compiles `.ts` files into `.js` files in the `dist/` folder. You run the `.js` output with Node.

### Using `ts-node` for development

Compiling before every run is tedious. `ts-node` runs TypeScript directly:

```bash
npm install --save-dev ts-node
npx ts-node src/hello.ts
```

Result:
```text
Hello, TypeScript!
```

## Type annotations

Type annotations tell TypeScript what type a value should be. The syntax is `: Type` after the variable name, parameter, or return value.

### Primitive types

```ts
const name: string = "Ada";
const age: number = 36;
const active: boolean = true;
const nothing: null = null;
const missing: undefined = undefined;
```

### Type inference

TypeScript can often figure out the type automatically:

```ts
const name = "Ada";      // TypeScript infers: string
const age = 36;           // TypeScript infers: number
const active = true;      // TypeScript infers: boolean
```

You do not need to annotate everything. TypeScript is smart enough to infer types from assigned values. Add explicit annotations when:

- The type is not obvious from the value
- You want to document the intent
- You are declaring a variable without immediately assigning it

```ts
// Inference is enough
const count = 0;

// Annotation needed -- no initial value
let username: string;
username = "ada";
```

### Function types

Annotate parameters and return types:

```ts
function multiply(a: number, b: number): number {
    return a * b;
}

// Arrow function
const divide = (a: number, b: number): number => {
    return a / b;
};
```

### Optional parameters

Use `?` to mark a parameter as optional:

```ts
function greet(name: string, greeting?: string): string {
    return `${greeting ?? "Hello"}, ${name}!`;
}

greet("Ada");               // "Hello, Ada!"
greet("Ada", "Welcome");    // "Welcome, Ada!"
```

### Default parameters

```ts
function greet(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
}
```

### `void` and `never`

```ts
// void: function returns nothing
function log(message: string): void {
    console.log(message);
}

// never: function never returns (always throws or loops forever)
function throwError(message: string): never {
    throw new Error(message);
}
```

## Arrays and tuples

### Arrays

```ts
const numbers: number[] = [1, 2, 3];
const names: string[] = ["Ada", "Grace", "Alan"];

// Alternative syntax
const scores: Array<number> = [90, 85, 92];
```

### Tuples

Tuples are fixed-length arrays where each position has a specific type:

```ts
const user: [string, number] = ["Ada", 36];

const name = user[0]; // string
const age = user[1];  // number

// Error: Type 'boolean' is not assignable to type 'string'
// user[0] = true;
```

Tuples are useful for returning multiple values from a function:

```ts
function getUser(): [string, number] {
    return ["Ada", 36];
}

const [name, age] = getUser();
```

## Objects and interfaces

### Object types (inline)

```ts
function printUser(user: { name: string; age: number }): void {
    console.log(`${user.name} is ${user.age} years old`);
}

printUser({ name: "Ada", age: 36 });
```

Inline types work for simple cases, but they get unwieldy fast. Use interfaces instead.

### Interfaces

An **interface** describes the shape of an object:

```ts
interface User {
    name: string;
    age: number;
    email: string;
}

function printUser(user: User): void {
    console.log(`${user.name} (${user.email}), age ${user.age}`);
}

const ada: User = {
    name: "Ada Lovelace",
    age: 36,
    email: "ada@example.com",
};

printUser(ada);
```

Result:
```text
Ada Lovelace (ada@example.com), age 36
```

### Optional properties

```ts
interface User {
    name: string;
    age: number;
    email?: string; // optional
}

const user: User = { name: "Grace", age: 85 }; // email is optional
```

### Readonly properties

```ts
interface Config {
    readonly apiUrl: string;
    readonly timeout: number;
}

const config: Config = { apiUrl: "https://api.example.com", timeout: 5000 };

// Error: Cannot assign to 'apiUrl' because it is a read-only property
// config.apiUrl = "https://other.com";
```

### Extending interfaces

```ts
interface User {
    name: string;
    email: string;
}

interface Admin extends User {
    role: string;
    permissions: string[];
}

const admin: Admin = {
    name: "Ada",
    email: "ada@example.com",
    role: "superadmin",
    permissions: ["read", "write", "delete"],
};
```

## Type aliases

`type` defines a name for any type -- not just objects:

```ts
type ID = string | number;
type StringArray = string[];
type Callback = (data: string) => void;

type User = {
    id: ID;
    name: string;
};
```

### `type` vs `interface`

| Feature | `interface` | `type` |
|---------|------------|--------|
| Object shapes | Yes | Yes |
| Extending | `extends` keyword | Intersection (`&`) |
| Union types | No | Yes |
| Primitives, tuples | No | Yes |
| Declaration merging | Yes | No |

**Rule of thumb:** Use `interface` for object shapes. Use `type` for everything else (unions, tuples, primitives, complex composed types).

## Union types

A union type allows a value to be one of several types:

```ts
type ID = string | number;

function printId(id: ID): void {
    console.log(`ID: ${id}`);
}

printId(101);       // ID: 101
printId("abc-42");  // ID: abc-42
```

### Narrowing

TypeScript narrows the type inside conditional branches:

```ts
function printId(id: string | number): void {
    if (typeof id === "string") {
        // TypeScript knows id is a string here
        console.log(id.toUpperCase());
    } else {
        // TypeScript knows id is a number here
        console.log(id.toFixed(2));
    }
}

printId("hello");  // HELLO
printId(42);       // 42.00
```

### Literal types

```ts
type Direction = "up" | "down" | "left" | "right";

function move(direction: Direction): void {
    console.log(`Moving ${direction}`);
}

move("up");       // Moving up
// move("diagonal"); // Error: Argument of type '"diagonal"' is not assignable
```

### Discriminated unions

A powerful pattern for modelling different cases:

```ts
interface Circle {
    kind: "circle";
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
    }
}

console.log(area({ kind: "circle", radius: 5 }));           // 78.539...
console.log(area({ kind: "rectangle", width: 4, height: 6 })); // 24
```

The `kind` property (called a **discriminant**) lets TypeScript know which variant you are working with inside each branch.

## Generics

Generics let you write code that works with **any type** while preserving type safety:

```ts
function first<T>(items: T[]): T | undefined {
    return items[0];
}

first([1, 2, 3]);          // number | undefined
first(["a", "b", "c"]);    // string | undefined
```

`T` is a **type parameter** -- a placeholder that gets filled in when the function is called.

### Generic interfaces

```ts
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

interface User {
    name: string;
    email: string;
}

const response: ApiResponse<User> = {
    data: { name: "Ada", email: "ada@example.com" },
    status: 200,
    message: "OK",
};
```

### Generic constraints

Use `extends` to restrict what types are allowed:

```ts
interface HasId {
    id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
    return items.find(item => item.id === id);
}

const users = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
];

findById(users, 1); // { id: 1, name: "Ada" }
```

`T extends HasId` means "T must have at least an `id: number` property."

### Multiple type parameters

```ts
function pair<A, B>(first: A, second: B): [A, B] {
    return [first, second];
}

pair("hello", 42);  // [string, number]
pair(true, "yes");   // [boolean, string]
```

## Utility types

TypeScript includes built-in utility types for common transformations:

### `Partial<T>` -- all properties become optional

```ts
interface User {
    name: string;
    email: string;
    age: number;
}

function updateUser(user: User, updates: Partial<User>): User {
    return { ...user, ...updates };
}

const ada: User = { name: "Ada", email: "ada@example.com", age: 36 };
const updated = updateUser(ada, { age: 37 });
```

### `Required<T>` -- all properties become required

```ts
interface Config {
    host?: string;
    port?: number;
}

const fullConfig: Required<Config> = {
    host: "localhost",
    port: 3000,
};
```

### `Pick<T, Keys>` -- select specific properties

```ts
type UserPreview = Pick<User, "name" | "email">;

const preview: UserPreview = {
    name: "Ada",
    email: "ada@example.com",
};
```

### `Omit<T, Keys>` -- exclude specific properties

```ts
type UserWithoutEmail = Omit<User, "email">;

const user: UserWithoutEmail = {
    name: "Ada",
    age: 36,
};
```

### `Record<Keys, Value>` -- create an object type from keys and values

```ts
type Role = "admin" | "editor" | "viewer";

const permissions: Record<Role, string[]> = {
    admin: ["read", "write", "delete"],
    editor: ["read", "write"],
    viewer: ["read"],
};
```

### Summary of utility types

| Utility | What it does |
|---------|-------------|
| `Partial<T>` | Makes all properties optional |
| `Required<T>` | Makes all properties required |
| `Readonly<T>` | Makes all properties readonly |
| `Pick<T, K>` | Keeps only the specified properties |
| `Omit<T, K>` | Removes the specified properties |
| `Record<K, V>` | Creates a type with keys K and values V |
| `ReturnType<F>` | Extracts the return type of a function |
| `Parameters<F>` | Extracts the parameter types of a function |

## Enums

Enums define a set of named constants:

```ts
enum Direction {
    Up,
    Down,
    Left,
    Right,
}

function move(direction: Direction): void {
    console.log(`Moving ${Direction[direction]}`);
}

move(Direction.Up);    // Moving Up
move(Direction.Right); // Moving Right
```

### String enums

```ts
enum Status {
    Active = "ACTIVE",
    Inactive = "INACTIVE",
    Pending = "PENDING",
}

function printStatus(status: Status): void {
    console.log(status);
}

printStatus(Status.Active); // ACTIVE
```

### `const enum` -- inlined at compile time

```ts
const enum Color {
    Red = "RED",
    Green = "GREEN",
    Blue = "BLUE",
}

const c = Color.Red; // compiled to: const c = "RED"
```

**Tip:** Many TypeScript developers prefer union types (`type Direction = "up" | "down" | "left" | "right"`) over enums. They are simpler, produce no runtime code, and work better with type narrowing.

## Type assertions

Sometimes you know more about a type than TypeScript does:

```ts
const input = document.getElementById("username") as HTMLInputElement;
input.value = "Ada";
```

Without the assertion, TypeScript only knows `getElementById` returns `HTMLElement | null`. With `as HTMLInputElement`, you tell TypeScript it is specifically an input element.

**Use assertions sparingly.** They override the type checker -- if you are wrong, you will get runtime errors.

### Non-null assertion

The `!` operator tells TypeScript a value is not null or undefined:

```ts
const element = document.getElementById("app")!;
```

This is equivalent to `as HTMLElement` but shorter. Again, use it only when you are certain the value exists.

## Working with modules

TypeScript uses the same `import`/`export` syntax as modern JavaScript:

```ts
// math.ts
export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}
```

```ts
// main.ts
import { add, multiply } from "./math.js";

console.log(add(2, 3));       // 5
console.log(multiply(4, 5));   // 20
```

**Note:** Use `.js` extensions in import paths even when importing `.ts` files. TypeScript resolves these to the compiled `.js` output.

### Exporting types

```ts
// types.ts
export interface User {
    name: string;
    email: string;
}

export type ID = string | number;
```

```ts
// user-service.ts
import type { User, ID } from "./types.js";

function getUser(id: ID): User {
    return { name: "Ada", email: "ada@example.com" };
}
```

`import type` tells TypeScript (and bundlers) that this import is types only and can be erased from the output.

## Working with third-party libraries

Many npm packages include TypeScript types. For those that do not, install the type definitions separately:

```bash
# The package itself
npm install express

# Type definitions (from DefinitelyTyped)
npm install --save-dev @types/express
```

The `@types` scope on npm hosts community-maintained type definitions. Most popular packages have them.

### Checking if types exist

```bash
# Search for type definitions
npm search @types/lodash
```

Or visit [https://www.typescriptlang.org/dt/search](https://www.typescriptlang.org/dt/search) to search DefinitelyTyped.

## Strict mode options

The `"strict": true` flag in `tsconfig.json` enables several checks at once:

| Flag | What it catches |
|------|----------------|
| `strictNullChecks` | `null` and `undefined` are not assignable to other types |
| `noImplicitAny` | Variables and parameters must have explicit types (no implicit `any`) |
| `strictFunctionTypes` | Stricter checks on function parameter types |
| `strictPropertyInitialization` | Class properties must be initialized in the constructor |
| `noImplicitThis` | `this` must have an explicit type in functions |

**Always use `strict: true`.** It catches the most bugs and is the recommended setting for all TypeScript projects.

## Common patterns

### Typing event handlers (browser)

```ts
const button = document.getElementById("submit") as HTMLButtonElement;

button.addEventListener("click", (event: MouseEvent) => {
    console.log("Button clicked at:", event.clientX, event.clientY);
});

const input = document.getElementById("search") as HTMLInputElement;

input.addEventListener("input", (event: Event) => {
    const target = event.target as HTMLInputElement;
    console.log("Searching for:", target.value);
});
```

### Typing `fetch` responses

```ts
interface Post {
    id: number;
    title: string;
    body: string;
}

async function fetchPosts(): Promise<Post[]> {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const posts: Post[] = await response.json();
    return posts;
}

fetchPosts().then(posts => {
    posts.forEach(post => console.log(post.title));
});
```

### Typing an object map

```ts
const cache: Record<string, number> = {};

cache["a"] = 1;
cache["b"] = 2;

// Or using an index signature
interface Cache {
    [key: string]: number;
}
```

### Typing a class

```ts
interface Printable {
    toString(): string;
}

class User implements Printable {
    constructor(
        public readonly name: string,
        public readonly email: string,
        private age: number,
    ) {}

    getAge(): number {
        return this.age;
    }

    toString(): string {
        return `${this.name} (${this.email})`;
    }
}

const user = new User("Ada", "ada@example.com", 36);
console.log(user.toString()); // Ada (ada@example.com)
console.log(user.name);       // Ada
// console.log(user.age);     // Error: Property 'age' is private
```

TypeScript's `public`, `private`, `protected`, and `readonly` modifiers in the constructor automatically create and assign class properties -- no separate field declarations needed.

## Migrating JavaScript to TypeScript

You do not need to convert your entire project at once. TypeScript supports gradual migration:

### Step 1: Add TypeScript to the project

```bash
npm install --save-dev typescript
npx tsc --init
```

### Step 2: Allow JavaScript files

In `tsconfig.json`:

```json
{
    "compilerOptions": {
        "allowJs": true,
        "checkJs": false,
        "strict": true,
        "outDir": "dist",
        "rootDir": "src"
    },
    "include": ["src"]
}
```

`allowJs: true` lets `.js` and `.ts` files coexist in the same project.

### Step 3: Rename files one at a time

Rename `.js` files to `.ts` and fix any type errors that appear. Start with the simplest files (utility functions, constants) and work toward the more complex ones.

### Step 4: Enable `checkJs` (optional)

Setting `checkJs: true` makes TypeScript check your `.js` files too -- it will infer types and report errors even in plain JavaScript.

### Step 5: Turn on strict mode

Once all files are `.ts`, enable `"strict": true` for maximum type safety.

## Running TypeScript in the browser

TypeScript must be compiled to JavaScript before the browser can run it. Common approaches:

| Tool | How it works |
|------|-------------|
| `tsc` | TypeScript compiler -- compiles `.ts` to `.js` |
| **Vite** | Dev server and bundler with built-in TypeScript support |
| **esbuild** | Extremely fast bundler that strips types |
| **webpack + ts-loader** | Traditional bundler with TypeScript loader |

For new projects, **Vite** is the simplest choice:

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install
npm run dev
```

This gives you a TypeScript project with hot reloading, ready to develop in the browser.

## Summary

- TypeScript is JavaScript with **static types** -- every `.js` file is valid `.ts`.
- **Type annotations** (`: string`, `: number`) tell TypeScript what types to expect.
- **Type inference** means you do not need to annotate everything -- TypeScript is smart.
- **Interfaces** describe object shapes; **type aliases** name any type.
- **Union types** (`string | number`) model values that can be one of several types.
- **Generics** (`<T>`) let you write reusable, type-safe code.
- **Utility types** (`Partial`, `Pick`, `Omit`, `Record`) transform existing types.
- **`strict: true`** in `tsconfig.json` catches the most bugs -- always use it.
- Migrate gradually: add TypeScript to an existing project one file at a time.

TypeScript is used by most modern JavaScript frameworks (Angular, Next.js, SvelteKit) and is the de facto standard for professional JavaScript development. The investment in learning it pays off immediately through fewer bugs and better tooling.
