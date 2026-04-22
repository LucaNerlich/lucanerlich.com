---
title: "tsconfig & Tooling"
sidebar_label: "tsconfig & Tooling"
description: Key tsconfig.json options explained, strict mode, target and lib, path aliases, project references, ts-node, tsx, and ESLint integration.
slug: /typescript/beginners-guide/tsconfig-and-tooling
tags: [typescript, beginners]
keywords:
  - tsconfig.json
  - typescript strict mode
  - typescript target
  - project references
  - ts-node tsx
  - typescript eslint
sidebar_position: 11
---

# tsconfig & Tooling

The `tsconfig.json` file is the control centre of a TypeScript project. It tells the compiler what files to process,
how strict to be, what JavaScript version to emit, and dozens of other options. Getting it right is the difference
between a smooth developer experience and a frustrating one.

## tsconfig.json structure

A `tsconfig.json` has three main sections:

```json
{
    "compilerOptions": { },   // How to compile
    "include": [],            // Which files to include
    "exclude": [],            // Which files to exclude
    "extends": ""             // Inherit from another tsconfig
}
```

Generate a commented reference file with all options:

```bash
npx tsc --init
```

## The most important compiler options

### strict

```json
{ "strict": true }
```

`strict: true` is a shorthand that enables a bundle of checks. **Always enable this in new projects.**

It turns on:

| Flag                       | What it catches                                                   |
|----------------------------|-------------------------------------------------------------------|
| `strictNullChecks`         | `null` and `undefined` are not assignable to other types          |
| `strictFunctionTypes`      | Function parameter types are checked contravariantly              |
| `strictBindCallApply`      | `bind`, `call`, and `apply` are type-checked properly             |
| `strictPropertyInitialization` | Class properties must be initialized in the constructor       |
| `noImplicitAny`            | Variables without a type annotation cannot be implicitly `any`    |
| `noImplicitThis`           | `this` must have an explicit type                                 |
| `alwaysStrict`             | Emits `"use strict"` in every file                                |
| `useUnknownInCatchVariables` | Catch clause variables are `unknown` instead of `any` (TS 4.4+) |

You can enable individual strict flags separately if you need to adopt them gradually:

```json
{
    "compilerOptions": {
        "strict": false,
        "strictNullChecks": true,
        "noImplicitAny": true
    }
}
```

### target

```json
{ "target": "ES2022" }
```

`target` controls which JavaScript version `tsc` emits. TypeScript down-compiles modern syntax for older environments:

| Target        | Use when                                                              |
|---------------|-----------------------------------------------------------------------|
| `ES5`         | Supporting very old browsers (IE11) - rare in 2026                  |
| `ES2017`      | Broad browser support, includes `async`/`await` natively             |
| `ES2020`      | Modern browsers and Node.js 14+, includes optional chaining, nullish coalescing |
| `ES2022`      | Node.js 18+, modern browsers - recommended default                  |
| `ESNext`      | Always the latest features - good for bundler projects               |

If your bundler (Vite, esbuild, webpack) handles downcompilation, set `target: "ESNext"` and let the bundler control
the output.

### module and moduleResolution

```json
{
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
}
```

These options control the module system:

| Scenario                            | `module`       | `moduleResolution`  |
|-------------------------------------|----------------|---------------------|
| Node.js with ESM (`"type": "module"`) | `NodeNext`    | `NodeNext`          |
| Node.js with CJS                    | `CommonJS`     | `Node`              |
| Bundler (Vite, webpack, Rollup)     | `ESNext`       | `Bundler`           |
| Deno                                | `ESNext`       | `Bundler`           |

With `moduleResolution: "NodeNext"`, TypeScript requires explicit file extensions in imports:

```typescript
// Required with NodeNext
import { helper } from "./helper.js"; // .js extension (TypeScript resolves to .ts)
```

With `moduleResolution: "Bundler"`, extensions are optional (the bundler resolves them).

### outDir and rootDir

```json
{
    "rootDir": "./src",
    "outDir": "./dist"
}
```

`rootDir` tells TypeScript where your source files are. `outDir` is where compiled `.js` files (and `.d.ts` files)
are written. The directory structure under `rootDir` is mirrored in `outDir`:

```text
src/
  index.ts
  utils/
    format.ts

dist/
  index.js
  utils/
    format.js
```

### lib

```json
{ "lib": ["ES2022", "DOM"] }
```

`lib` controls which built-in type definitions are available. TypeScript uses these to know what APIs exist:

| lib value    | Includes                                                           |
|--------------|--------------------------------------------------------------------|
| `ES2022`     | All ES2022 built-ins (Array, Map, Promise, etc.)                   |
| `DOM`        | Browser APIs (window, document, fetch, etc.)                       |
| `DOM.Iterable` | Iterable DOM collections                                         |
| `WebWorker`  | Web Worker APIs                                                    |

For Node.js projects without browser code, omit `DOM`:

```json
{ "lib": ["ES2022"] }
```

For browser projects:

```json
{ "lib": ["ES2022", "DOM", "DOM.Iterable"] }
```

### baseUrl and paths

```json
{
    "baseUrl": ".",
    "paths": {
        "@/*": ["src/*"],
        "@components/*": ["src/components/*"],
        "@utils/*": ["src/utils/*"],
        "@types/*": ["src/types/*"]
    }
}
```

Path aliases reduce relative import hell. The `baseUrl` is the base directory for resolving non-relative module names.

### Other useful strict options

```json
{
    "compilerOptions": {
        "noUnusedLocals": true,          // Error on unused local variables
        "noUnusedParameters": true,      // Error on unused function parameters
        "noImplicitReturns": true,       // All code paths in a function must return
        "noFallthroughCasesInSwitch": true, // No accidental switch fallthrough
        "exactOptionalPropertyTypes": true, // Distinguish missing vs undefined properties
        "noPropertyAccessFromIndexSignature": true // Force bracket notation for index signatures
    }
}
```

### skipLibCheck and esModuleInterop

```json
{
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
}
```

| Option                           | What it does                                                                |
|----------------------------------|-----------------------------------------------------------------------------|
| `skipLibCheck`                   | Skip type-checking `.d.ts` files - much faster builds, avoids conflicts     |
| `esModuleInterop`                | Enables `import React from 'react'` (default import) instead of `import * as React` |
| `forceConsistentCasingInFileNames` | Prevents case-sensitivity bugs on case-insensitive file systems (macOS, Windows) |

## A recommended tsconfig for Node.js

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "lib": ["ES2022"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## A recommended tsconfig for Vite / bundler projects

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "jsx": "react-jsx",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowImportingTsExtensions": true,
        "noEmit": true,
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        }
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
}
```

When using a bundler, set `noEmit: true` - the bundler compiles the code, and TypeScript is used only for type
checking.

## extends - sharing tsconfig

Large monorepos often have a base tsconfig that projects extend:

```json
// tsconfig.base.json
{
    "compilerOptions": {
        "strict": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true
    }
}
```

```json
// packages/api/tsconfig.json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "outDir": "dist",
        "rootDir": "src"
    }
}
```

The community also maintains published tsconfig presets:

```bash
npm install --save-dev @tsconfig/node22
npm install --save-dev @tsconfig/strictest
```

```json
{ "extends": "@tsconfig/node22/tsconfig.json" }
```

## Project references

For large codebases with multiple packages (monorepos), project references let you split a TypeScript project into
smaller parts that build incrementally:

```json
// tsconfig.json (root)
{
    "files": [],
    "references": [
        { "path": "./packages/core" },
        { "path": "./packages/api" },
        { "path": "./packages/web" }
    ]
}
```

```json
// packages/core/tsconfig.json
{
    "compilerOptions": {
        "composite": true,    // Required for project references
        "declaration": true,  // Required: produces .d.ts for dependents
        "outDir": "dist",
        "rootDir": "src"
    }
}
```

```json
// packages/api/tsconfig.json
{
    "compilerOptions": {
        "composite": true,
        "outDir": "dist",
        "rootDir": "src"
    },
    "references": [
        { "path": "../core" }  // api depends on core
    ]
}
```

Build with `--build` flag (incremental compilation):

```bash
npx tsc --build            # Build all referenced projects
npx tsc --build --watch    # Watch mode for all projects
npx tsc --build --clean    # Remove all build output
```

## ts-node and tsx

For development, you often want to run TypeScript files directly without a separate compile step.

### ts-node

```bash
npm install --save-dev ts-node
```

```bash
npx ts-node src/index.ts           # Run directly
npx ts-node --esm src/index.ts    # ESM mode
```

Configure ts-node in `tsconfig.json` or a separate `tsconfig.node.json`:

```json
// tsconfig.json
{
    "ts-node": {
        "esm": true,
        "experimentalSpecifierResolution": "node"
    }
}
```

### tsx (faster alternative)

`tsx` uses esbuild to transpile TypeScript at near-native speed - much faster than `ts-node`:

```bash
npm install --save-dev tsx
```

```bash
npx tsx src/index.ts               # Run directly
npx tsx watch src/index.ts         # Watch mode (like nodemon + ts-node)
```

> **Note:** `tsx` transpiles (strips types) but does not type-check. Run `tsc --noEmit` separately in CI to
> verify types while using `tsx` for fast local execution.

### package.json scripts

```json
{
    "scripts": {
        "build": "tsc",
        "typecheck": "tsc --noEmit",
        "dev": "tsx watch src/index.ts",
        "start": "node dist/index.js",
        "clean": "rm -rf dist"
    }
}
```

## TypeScript with ESLint

ESLint with TypeScript-aware rules catches problems that the compiler does not:

```bash
npm install --save-dev \
    eslint \
    @eslint/js \
    typescript-eslint
```

### ESLint flat config (eslint.config.js)

```javascript
// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Enforce consistent type imports
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports" },
            ],
            // Warn on floating promises (missing await)
            "@typescript-eslint/no-floating-promises": "error",
            // Disallow explicit any
            "@typescript-eslint/no-explicit-any": "warn",
            // Require explicit return types on public functions
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                { allowExpressions: true },
            ],
            // Require nullish coalescing instead of ||
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            // Prefer optional chaining
            "@typescript-eslint/prefer-optional-chain": "error",
        },
    },
    {
        // Relax rules for test files
        files: ["**/*.test.ts", "**/*.spec.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
);
```

### Useful ESLint TypeScript rules

| Rule                                       | What it catches                                    |
|--------------------------------------------|----------------------------------------------------|
| `@typescript-eslint/no-explicit-any`       | Bans `any` - forces better types                  |
| `@typescript-eslint/no-floating-promises`  | Promises not awaited or handled                    |
| `@typescript-eslint/no-misused-promises`   | Promises used where void is expected               |
| `@typescript-eslint/await-thenable`        | Awaiting non-promise values                        |
| `@typescript-eslint/prefer-nullish-coalescing` | `||` vs `??` for defaults                    |
| `@typescript-eslint/prefer-optional-chain` | `a && a.b` vs `a?.b`                               |
| `@typescript-eslint/consistent-type-imports` | Enforces `import type` for type-only imports     |
| `@typescript-eslint/no-unnecessary-type-assertion` | Catches redundant `as` assertions         |

## Useful tsc CLI flags

| Flag                    | Purpose                                                       |
|-------------------------|---------------------------------------------------------------|
| `--noEmit`              | Type-check only, do not write any files                       |
| `--watch` / `-w`        | Recompile on file changes                                     |
| `--build` / `-b`        | Use project references build mode                             |
| `--strict`              | Enable all strict checks (overrides tsconfig)                 |
| `--listFiles`           | Print all files included in the compilation                   |
| `--diagnostics`         | Show compilation statistics (useful for debugging slow builds)|
| `--generateTrace`       | Generate a trace file for performance analysis                |
| `--skipLibCheck`        | Skip type checking of declaration files                       |
| `--pretty`              | Format output with colour and formatting (default: true)      |

## Summary

- `strict: true` is the most important tsconfig option - enable it in every new project
- `target` controls the JavaScript version emitted; `module`/`moduleResolution` control the module system
- `lib` controls which built-in type definitions are available
- `baseUrl` and `paths` enable clean path aliases - configure both tsconfig and your bundler
- `extends` lets you share a base tsconfig across a monorepo or use community presets like `@tsconfig/node22`
- **Project references** with `composite: true` enable incremental, distributed compilation for large codebases
- **ts-node** runs TypeScript directly; **tsx** is faster but skips type checking
- **ESLint with `typescript-eslint`** catches runtime problems that the type checker cannot: floating promises, misused nullability, redundant casts

Next up: [TypeScript in Practice](./12-typescript-in-practice.md) - TypeScript with Node.js, TypeScript with React,
common real-world patterns, and migrating an existing JavaScript project to TypeScript.
