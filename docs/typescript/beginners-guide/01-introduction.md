---
title: "Introduction & Environment Setup"
sidebar_label: "Introduction"
description: What TypeScript is, why it exists, how to install it via npm, tsconfig basics, compiling with tsc, and your first typed program.
slug: /typescript/beginners-guide/introduction
tags: [typescript, beginners]
keywords:
  - typescript introduction
  - what is typescript
  - install typescript
  - tsconfig basics
  - tsc compiler
  - typescript beginner
sidebar_position: 1
---

# Introduction & Environment Setup

TypeScript is a **statically typed superset of JavaScript** built by Microsoft and first released in 2012. It compiles
to plain JavaScript, runs anywhere JavaScript runs, and adds a powerful type system on top of everything JavaScript
already provides.

This guide takes you from zero TypeScript knowledge to writing typed Node.js servers and React applications - step by
step, with realistic examples throughout.

## How this guide is structured

| Part                            | Chapters | What you will learn                                              |
|---------------------------------|----------|------------------------------------------------------------------|
| **1 - Foundations**            | 1-4     | Install TypeScript, basic types, interfaces, functions           |
| **2 - Object-Oriented TS**     | 5-6     | Classes, generics                                                |
| **3 - Type System Deep Dive**  | 7-9     | Enums, utility types, advanced types                             |
| **4 - Ecosystem & Tooling**    | 10-11   | Modules, declaration files, tsconfig, ESLint                     |
| **5 - Real-World TypeScript**  | 12       | Node.js, React, project migration                                |

## What is TypeScript?

JavaScript was designed in 1995 to add small interactive behaviours to web pages. It was never meant to build
100,000-line applications. Over time, the language grew - but its dynamic, loosely typed nature makes large codebases
difficult to maintain. A typo in a property name causes a runtime crash rather than a compile-time error. Refactoring
becomes dangerous when you cannot know at a glance what type a variable holds.

TypeScript solves this by adding **optional static types** to JavaScript:

```typescript
// JavaScript -- no type safety
function add(a, b) {
    return a + b;
}

add(2, 3);        // 5  (as expected)
add("2", 3);      // "23"  (string concatenation -- a bug you won't notice until runtime)

// TypeScript -- type-safe
function add(a: number, b: number): number {
    return a + b;
}

add(2, 3);        // OK: 5
add("2", 3);      // Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

TypeScript's compiler (`tsc`) catches that bug before the code ever runs. In a large codebase, this is the difference
between a two-second fix and a two-hour debugging session.

## Why use TypeScript?

| Benefit                        | What it means in practice                                              |
|--------------------------------|------------------------------------------------------------------------|
| **Catches bugs at compile time** | Type mismatches, undefined property accesses, and wrong function arguments are errors, not surprises |
| **Better editor support**      | Your editor knows the shape of every object and can autocomplete, warn, and refactor with confidence |
| **Self-documenting code**      | Type annotations make it clear what a function expects and returns - no need to read the implementation |
| **Safer refactoring**          | Rename a field and the compiler shows you every place that breaks instantly |
| **Gradual adoption**           | TypeScript is a superset of JavaScript - you can add types file by file, at your own pace |

TypeScript is the default choice for large JavaScript projects. Angular is written entirely in TypeScript. React's type
definitions are maintained by thousands of contributors on DefinitelyTyped. Node.js, Deno, and Bun all have first-class
TypeScript support.

## How TypeScript compares to JavaScript

TypeScript does **not** replace JavaScript - it compiles to it. The browser and Node.js only understand JavaScript.
TypeScript is a development-time tool that disappears at runtime.

```text
Your TypeScript code (.ts)
        │
        ▼
   tsc (compiler)
        │
        ▼
Plain JavaScript (.js)   ──▶   Node.js / Browser
```

The compiled output is clean JavaScript with no TypeScript-specific syntax:

```typescript
// Input: src/greet.ts
interface User {
    name: string;
    age: number;
}

function greet(user: User): string {
    return `Hello, ${user.name}! You are ${user.age} years old.`;
}
```

```javascript
// Output: dist/greet.js
function greet(user) {
    return `Hello, ${user.name}! You are ${user.age} years old.`;
}
```

All types are erased. At runtime, you get exactly what you would have written in JavaScript.

## Prerequisites

Before we start:

- **Node.js** - TypeScript is distributed as an npm package and runs on Node.js. Download from [nodejs.org](https://nodejs.org) (LTS version recommended)
- **A terminal** - any terminal works
- **A code editor** - VS Code has the best TypeScript support out of the box

Verify Node.js is installed:

```bash
node --version   # v20.x.x or newer
npm --version    # 10.x.x or newer
```

## Install TypeScript

The recommended way to use TypeScript in a project is to install it locally (not globally) so each project can use its
own version.

### Create a new project

```bash
mkdir my-ts-project
cd my-ts-project
npm init -y
```

### Install TypeScript as a dev dependency

```bash
npm install --save-dev typescript
```

This installs:
- `tsc` - the TypeScript compiler
- The TypeScript language server (used by editors)

Verify the installation:

```bash
npx tsc --version   # Version 5.x.x
```

> **Tip:** Always use `npx tsc` (not a globally installed `tsc`) to ensure you are using the project's TypeScript
> version. Different projects may require different TypeScript versions.

## Initialize tsconfig.json

Every TypeScript project needs a `tsconfig.json` file that tells `tsc` how to compile your code. Generate one with:

```bash
npx tsc --init
```

This creates a `tsconfig.json` with sensible defaults and every option documented in comments. Here is a clean minimal
version to get started:

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "commonjs",
        "lib": ["ES2022"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

The key options explained:

| Option                           | What it does                                                                           |
|----------------------------------|----------------------------------------------------------------------------------------|
| `target`                         | The JavaScript version to compile to. `ES2022` is safe for modern Node.js and browsers |
| `module`                         | Module system. `commonjs` for Node.js, `ESNext` for modern bundlers                   |
| `outDir`                         | Where compiled `.js` files are written                                                 |
| `rootDir`                        | Where your `.ts` source files live                                                     |
| `strict`                         | Enables all strict type-checking rules. **Always enable this**                        |
| `esModuleInterop`                | Allows `import fs from 'fs'` instead of `import * as fs from 'fs'`                    |
| `skipLibCheck`                   | Skip type checking of `.d.ts` files in `node_modules` (faster builds)                 |

> **Always enable `strict: true`.** It turns on a bundle of checks (`strictNullChecks`, `noImplicitAny`, and others)
> that catch the most common bugs. Starting without it and enabling it later is painful.

## Your first TypeScript program

Create the source directory and your first file:

```bash
mkdir src
```

Create `src/index.ts`:

```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
}

function formatProduct(product: Product): string {
    const availability = product.inStock ? "In stock" : "Out of stock";
    return `[${product.id}] ${product.name} — $${product.price.toFixed(2)} (${availability})`;
}

function applyDiscount(product: Product, percent: number): Product {
    return {
        ...product,
        price: product.price * (1 - percent / 100),
    };
}

const laptop: Product = {
    id: 1,
    name: "ThinkPad X1",
    price: 1299.99,
    inStock: true,
};

const discounted = applyDiscount(laptop, 15);

console.log(formatProduct(laptop));
console.log(formatProduct(discounted));
```

Compile it:

```bash
npx tsc
```

Run the compiled output:

```bash
node dist/index.js
```

```text
[1] ThinkPad X1 — $1299.99 (In stock)
[1] ThinkPad X1 — $1104.99 (In stock)
```

### What just happened

1. `tsc` read `tsconfig.json`, found `src/index.ts`, type-checked it, and emitted `dist/index.js`
2. The `interface Product` and all type annotations were erased - pure JavaScript remained
3. No runtime errors because the compiler caught any type problems first

## Compile in watch mode

Running `npx tsc` after every change is tedious. Use watch mode instead:

```bash
npx tsc --watch
```

Now `tsc` recompiles automatically whenever you save a file. You will see errors appear and disappear in real time.

## Add ts-node for direct execution

`ts-node` lets you run TypeScript files directly without a separate compile step - useful for scripts and development:

```bash
npm install --save-dev ts-node
```

Now you can run TypeScript directly:

```bash
npx ts-node src/index.ts
```

For modern Node.js you may also want `tsx`, which is faster:

```bash
npm install --save-dev tsx
npx tsx src/index.ts
```

## Useful package.json scripts

Add these to your `package.json` to standardise your workflow:

```json
{
    "scripts": {
        "build": "tsc",
        "build:watch": "tsc --watch",
        "start": "node dist/index.js",
        "dev": "tsx watch src/index.ts",
        "typecheck": "tsc --noEmit"
    }
}
```

| Script         | What it does                                               |
|----------------|------------------------------------------------------------|
| `npm run build`       | Compile TypeScript to JavaScript                    |
| `npm run build:watch` | Recompile on every file change                      |
| `npm start`           | Run the compiled output                             |
| `npm run dev`         | Run TypeScript directly with live reload            |
| `npm run typecheck`   | Check types without emitting any files              |

> **Tip:** `npm run typecheck` is useful in CI pipelines - it verifies types without overwriting your build output.

## Set up VS Code

VS Code has TypeScript support built in - it ships with its own TypeScript language server. You get:

- **Red underlines** on type errors as you type, before compilation
- **Autocomplete** for every property and method on every typed object
- **Hover for types** - hover any variable to see its inferred type
- **Go to definition** - `Ctrl+Click` / `Cmd+Click` to jump to any type or function
- **Rename symbol** - rename a function and every call site updates automatically

No extensions required for basic TypeScript. For a better experience, install:

- **ESLint** - linting with TypeScript-aware rules
- **Prettier** - automatic code formatting
- **Error Lens** - shows error messages inline next to the code

### Useful VS Code settings for TypeScript

Add to `.vscode/settings.json`:

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "typescript.preferences.importModuleSpecifier": "relative",
    "typescript.suggest.autoImports": true
}
```

## Project structure overview

A typical TypeScript project looks like this:

```text
my-ts-project/
├── src/                    # All TypeScript source files
│   ├── index.ts            # Entry point
│   ├── types.ts            # Shared type definitions
│   └── utils/
│       └── formatters.ts
├── dist/                   # Compiled JavaScript (generated, gitignored)
├── node_modules/           # Dependencies (gitignored)
├── tsconfig.json           # TypeScript compiler configuration
├── package.json            # npm project manifest
└── .gitignore              # Should include dist/ and node_modules/
```

Add a `.gitignore`:

```text
node_modules/
dist/
*.js.map
```

## Understanding TypeScript errors

TypeScript's error messages are descriptive. Let's deliberately create one:

```typescript
interface User {
    name: string;
    email: string;
}

function sendEmail(user: User): void {
    console.log(`Sending email to ${user.email}`);
}

const person = {
    name: "Alice",
    // email is missing
};

sendEmail(person);
// Error: Argument of type '{ name: string; }' is not assignable to parameter
//   of type 'User'. Property 'email' is missing in type '{ name: string; }'
//   but required in type 'User'.
```

The error tells you exactly what is wrong: `email` is required by `User` but missing in the object you passed. This
would have been a silent `undefined` in plain JavaScript.

### Common beginner errors

| Error message (excerpt)                                      | What it means                                 | Typical fix                               |
|--------------------------------------------------------------|-----------------------------------------------|-------------------------------------------|
| `Property 'x' does not exist on type 'Y'`                   | You accessed a property that is not in the type | Add the property to the interface         |
| `Argument of type 'string' is not assignable to type 'number'` | Wrong type passed to a function             | Fix the argument or the parameter type    |
| `Object is possibly 'undefined'`                             | `strictNullChecks` caught a potential crash   | Add a null check before using the value   |
| `Parameter 'x' implicitly has an 'any' type`                | `noImplicitAny` requires explicit annotations | Add a type annotation                     |
| `Cannot find module 'x'`                                    | Missing package or missing `@types/` package  | `npm install @types/x`                    |

## Summary

You now have:

- TypeScript installed locally with `npm install --save-dev typescript`
- A `tsconfig.json` with `strict: true` and sensible defaults
- A first typed program compiled with `npx tsc` and run with `node dist/index.js`
- Watch mode (`npx tsc --watch`) for continuous compilation
- VS Code set up to show errors in real time

The TypeScript compiler is your pair programmer. It catches mistakes before they reach your users. Trust it - and read
its error messages carefully.

Next up: [Basic Types](./02-basic-types.md) - `string`, `number`, `boolean`, `null`, `undefined`, `any`, `unknown`,
`never`, type inference, type annotations, arrays, and tuples.
