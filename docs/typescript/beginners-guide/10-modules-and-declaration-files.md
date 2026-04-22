---
title: "Modules & Declaration Files"
sidebar_label: "Modules & Declarations"
description: ES modules in TypeScript, import and export patterns, declaration files (.d.ts), DefinitelyTyped, and writing your own type declarations.
slug: /typescript/beginners-guide/modules-and-declaration-files
tags: [typescript, beginners]
keywords:
  - typescript modules
  - import export typescript
  - declaration files
  - d.ts files
  - DefinitelyTyped
  - "@types packages"
sidebar_position: 10
---

# Modules & Declaration Files

TypeScript uses the same module system as modern JavaScript - ES modules with `import` and `export`. On top of that,
TypeScript adds **declaration files** (`.d.ts`): type-only files that describe the shape of JavaScript code without
carrying any runtime logic. Understanding both is crucial for working with third-party libraries and for publishing
your own typed packages.

## ES modules in TypeScript

TypeScript compiles ES module syntax (`import`/`export`) to whatever module format you configure in `tsconfig.json`.
The source code you write is always ES module syntax.

### Named exports and imports

```typescript
// src/math.ts
export function add(a: number, b: number): number {
    return a + b;
}

export function subtract(a: number, b: number): number {
    return a - b;
}

export const PI = 3.14159265358979;

// Named export of a type
export type MathResult = {
    value: number;
    operation: string;
};
```

```typescript
// src/index.ts
import { add, subtract, PI } from "./math";
import type { MathResult } from "./math";

const result = add(10, 5);
const diff = subtract(10, 5);
```

### Default exports

```typescript
// src/logger.ts
export interface LogOptions {
    prefix?: string;
    timestamp?: boolean;
}

export default class Logger {
    constructor(private options: LogOptions = {}) {}

    log(message: string): void {
        const parts: string[] = [];
        if (this.options.timestamp) parts.push(new Date().toISOString());
        if (this.options.prefix) parts.push(`[${this.options.prefix}]`);
        parts.push(message);
        console.log(parts.join(" "));
    }
}
```

```typescript
// src/main.ts
import Logger, { type LogOptions } from "./logger";

const opts: LogOptions = { prefix: "APP", timestamp: true };
const logger = new Logger(opts);
logger.log("Server started");
```

> **Recommendation:** Prefer named exports over default exports. Named exports are easier to refactor (the import
> and export name must match), easier to tree-shake, and play better with editor tooling.

### Re-exporting

Re-exports let you create index files that expose a clean public API:

```typescript
// src/services/index.ts
export { UserService } from "./user-service";
export { AuthService } from "./auth-service";
export { EmailService } from "./email-service";
export type { User, AuthToken } from "./types";

// Re-export everything from a module
export * from "./utils";

// Re-export with a rename
export { InternalQueue as TaskQueue } from "./queue";
```

```typescript
// consumers can import from a single location
import { UserService, AuthService, type User } from "@/services";
```

### import type

The `import type` syntax imports only types, not values. The import is completely erased in the compiled output:

```typescript
import type { User } from "./types";          // Type-only import
import { createUser, type UserOptions } from "./user"; // Mixed: value + type

// Useful for avoiding circular dependencies and reducing bundle size
```

With `verbatimModuleSyntax: true` in tsconfig (recommended for new projects), TypeScript requires you to use
`import type` for type-only imports - it makes the intent explicit.

## Module resolution

TypeScript resolves modules using the `moduleResolution` strategy in `tsconfig.json`:

| Strategy          | When to use                                                  |
|-------------------|--------------------------------------------------------------|
| `node16` / `bundler` | Modern Node.js 16+ or bundlers (Vite, webpack) - recommended |
| `node`            | Legacy Node.js CommonJS projects                            |
| `classic`         | Old TypeScript projects - avoid for new work               |

With `moduleResolution: "bundler"`, TypeScript resolves imports the same way modern bundlers do - supporting path
aliases and package exports.

### Path aliases with baseUrl and paths

Stop writing `../../utils/format` with path aliases:

```json
// tsconfig.json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"],
            "@utils/*": ["src/utils/*"],
            "@types/*": ["src/types/*"]
        }
    }
}
```

```typescript
// Before: relative mess
import { formatDate } from "../../utils/date";
import type { User } from "../../../types/user";

// After: clean absolute-style imports
import { formatDate } from "@utils/date";
import type { User } from "@types/user";
```

> **Note:** `tsconfig.json` paths only affect TypeScript's type checking. Your bundler (Vite, webpack) or Node.js
> loader (`tsconfig-paths`) also needs to be configured to resolve the same aliases at runtime.

## Declaration files (.d.ts)

A `.d.ts` file is a **declaration file** - it contains only type information with no executable code. It describes
the public API of a JavaScript module so TypeScript can type-check code that uses it.

Declaration files look like TypeScript but with:
- `declare` keyword before everything
- No implementation bodies (only signatures)

```typescript
// types/database.d.ts
declare module "my-database" {
    export interface ConnectionOptions {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        ssl?: boolean;
    }

    export interface QueryResult<T = unknown> {
        rows: T[];
        rowCount: number;
        duration: number;
    }

    export class Database {
        constructor(options: ConnectionOptions);
        query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
        close(): Promise<void>;
        readonly isConnected: boolean;
    }

    export function createPool(options: ConnectionOptions, poolSize?: number): DatabasePool;

    export interface DatabasePool {
        acquire(): Promise<Database>;
        release(db: Database): void;
        closeAll(): Promise<void>;
    }
}
```

### Ambient declarations

Use `declare` without a module block to describe global variables or functions:

```typescript
// types/globals.d.ts

// Extend the global Window interface
declare global {
    interface Window {
        analytics: {
            track(event: string, properties?: Record<string, unknown>): void;
            identify(userId: string, traits?: Record<string, unknown>): void;
        };
        __APP_VERSION__: string;
    }
}

// Declare a global variable injected by a build tool
declare const __DEV__: boolean;
declare const __API_URL__: string;

// Declare a global function
declare function require(module: string): unknown;

export {}; // Make this file a module (required when using declare global)
```

### Declaring non-TypeScript assets

Bundlers often allow importing non-JS assets like CSS, images, and SVGs. TypeScript needs declarations for these:

```typescript
// types/assets.d.ts

// Import CSS modules
declare module "*.module.css" {
    const styles: Record<string, string>;
    export default styles;
}

// Import plain CSS (side-effects only)
declare module "*.css" {
    const content: undefined;
    export default content;
}

// Import SVG as React component (when using a transformer)
declare module "*.svg" {
    import type { FC, SVGProps } from "react";
    const ReactComponent: FC<SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}

// Import images
declare module "*.png" {
    const src: string;
    export default src;
}

declare module "*.jpg" {
    const src: string;
    export default src;
}

// Import JSON (usually built-in, but sometimes needed)
declare module "*.json" {
    const value: unknown;
    export default value;
}
```

## DefinitelyTyped (@types/)

Most popular JavaScript libraries do not ship with TypeScript types. The community maintains type definitions in the
**DefinitelyTyped** repository, published as `@types/` packages on npm.

### Installing type definitions

```bash
# Install types for Node.js built-in modules
npm install --save-dev @types/node

# Install types for common libraries
npm install --save-dev @types/express
npm install --save-dev @types/lodash
npm install --save-dev @types/uuid
npm install --save-dev @types/jest
```

After installing, types are automatically picked up by TypeScript - no configuration needed.

```typescript
import express, { Request, Response } from "express";

const app = express();

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" }); // res.json is correctly typed
});
```

### Checking if types are included

1. Many modern libraries ship their own types (check `package.json` for a `types` or `exports` field)
2. Check [npmjs.com](https://npmjs.com) - if a package has a `DT` badge, `@types/package-name` exists
3. Use the [TypeSearch](https://www.typescriptlang.org/dt/search) tool to find type packages

```json
// Example: lodash ships types separately
// package.json of lodash:
{ "main": "lodash.js" } // no "types" field

// Install the separate types package:
// npm install --save-dev @types/lodash
```

## Writing your own declaration files

### Typing a third-party library with no types

Sometimes a library has no `@types/` package. Write the declarations yourself:

```typescript
// types/acme-auth.d.ts
declare module "acme-auth" {
    export interface AuthConfig {
        clientId: string;
        clientSecret: string;
        redirectUri: string;
        scope?: string[];
    }

    export interface AuthToken {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: "Bearer";
    }

    export interface UserInfo {
        sub: string;
        email: string;
        name: string;
        picture?: string;
    }

    export class AuthClient {
        constructor(config: AuthConfig);
        getAuthorizationUrl(state?: string): string;
        exchangeCode(code: string): Promise<AuthToken>;
        refreshToken(token: string): Promise<AuthToken>;
        getUserInfo(accessToken: string): Promise<UserInfo>;
        revokeToken(token: string): Promise<void>;
    }

    export function createClient(config: AuthConfig): AuthClient;
}
```

### Incremental declarations

Start minimal and add types as you use more of the API:

```typescript
// types/unknown-lib.d.ts
// Start with a catch-all to stop TypeScript errors, then refine:
declare module "unknown-lib" {
    const lib: {
        init(options: { apiKey: string }): void;
        track(event: string, data?: Record<string, unknown>): void;
        // add more as you discover the API
    };
    export default lib;
}
```

### Including declaration files in your project

TypeScript automatically picks up `.d.ts` files from:
1. The `typeRoots` directories in tsconfig (default: `node_modules/@types/`)
2. Files listed in `types` in tsconfig
3. Files included by `include` in tsconfig

```json
// tsconfig.json
{
    "compilerOptions": {
        "typeRoots": ["./node_modules/@types", "./types"]
    },
    "include": ["src/**/*", "types/**/*"]
}
```

## Publishing a typed library

If you are building a library for others to use, generate declaration files from your source:

```json
// tsconfig.json
{
    "compilerOptions": {
        "declaration": true,       // Generate .d.ts files
        "declarationMap": true,    // Generate sourcemaps for .d.ts files
        "emitDeclarationOnly": false
    }
}
```

```json
// package.json
{
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "exports": {
        ".": {
            "import": "./dist/index.mjs",
            "require": "./dist/index.js",
            "types": "./dist/index.d.ts"
        }
    },
    "files": ["dist"]
}
```

When consumers install your package, TypeScript automatically finds the types from the `types` field.

## Practical example: typing a legacy JavaScript module

Say you have an existing JavaScript utility file you want to type without rewriting it:

```javascript
// src/legacy/string-utils.js (JavaScript -- do not touch)
exports.truncate = function(str, maxLength, suffix) {
    suffix = suffix || '...';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
};

exports.slugify = function(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

exports.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
```

```typescript
// src/legacy/string-utils.d.ts
/**
 * Truncates a string to a maximum length, adding a suffix if truncated.
 */
export function truncate(str: string, maxLength: number, suffix?: string): string;

/**
 * Converts a string to a URL-friendly slug.
 * @example slugify("Hello World") === "hello-world"
 */
export function slugify(str: string): string;

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string;
```

Now TypeScript treats the JavaScript file as fully typed:

```typescript
import { truncate, slugify } from "./legacy/string-utils";

const title = truncate("TypeScript: A Comprehensive Guide", 25); // string
const slug = slugify(title); // string
// truncate(42, 10); // Error: number not assignable to string
```

## Summary

- TypeScript uses ES module syntax (`import`/`export`) and compiles it to the format you configure
- Prefer **named exports** over default exports for better refactoring support
- Use **`import type`** for type-only imports to signal that no runtime value is imported
- **Path aliases** (`@/*`) clean up relative import paths; configure in `tsconfig.json` and your bundler
- **Declaration files** (`.d.ts`) describe the types of JavaScript code without carrying runtime logic
- **`declare module`** types untyped npm packages; **`declare global`** augments global types
- **DefinitelyTyped** (`@types/` packages) provides community-maintained types for thousands of libraries
- Generate `.d.ts` files automatically with `declaration: true` in tsconfig when publishing a library

Next up: [tsconfig & Tooling](./11-tsconfig-and-tooling.md) - compiler options in depth, project references, ts-node,
useful flags, and integrating TypeScript with ESLint.
