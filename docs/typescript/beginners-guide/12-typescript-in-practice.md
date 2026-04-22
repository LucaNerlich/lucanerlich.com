---
title: "TypeScript in Practice"
sidebar_label: "TypeScript in Practice"
description: TypeScript with Node.js, TypeScript with React including event types and hooks, common real-world patterns, and migrating a JavaScript project to TypeScript.
slug: /typescript/beginners-guide/typescript-in-practice
tags: [typescript, beginners]
keywords:
  - typescript nodejs
  - typescript react
  - React.FC typescript
  - event types typescript
  - migrate javascript to typescript
  - typescript patterns
sidebar_position: 12
---

# TypeScript in Practice

The best way to consolidate everything from this guide is to see TypeScript working in real codebases. This chapter
covers three practical scenarios: building a typed Node.js HTTP server, writing React components with full type safety,
and migrating an existing JavaScript project to TypeScript.

## TypeScript with Node.js

### Project setup

```bash
mkdir ts-api && cd ts-api
npm init -y
npm install express
npm install --save-dev typescript @types/node @types/express tsx
npx tsc --init
```

```json
// tsconfig.json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "CommonJS",
        "moduleResolution": "Node",
        "lib": ["ES2022"],
        "outDir": "dist",
        "rootDir": "src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "declaration": true
    },
    "include": ["src"],
    "exclude": ["node_modules", "dist"]
}
```

### A typed Express server

```typescript
// src/types.ts
export interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt: string;
}

export interface CreateUserBody {
    name: string;
    email: string;
    role?: "admin" | "user";
}

export interface ApiError {
    message: string;
    code?: string;
    statusCode: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
```

```typescript
// src/middleware/error-handler.ts
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import type { ApiError } from "../types.js";

export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number = 500,
        public readonly code?: string,
    ) {
        super(message);
        this.name = "AppError";
    }
}

export const errorHandler: ErrorRequestHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    if (err instanceof AppError) {
        const response: ApiError = {
            message: err.message,
            code: err.code,
            statusCode: err.statusCode,
        };
        res.status(err.statusCode).json(response);
        return;
    }

    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error", statusCode: 500 });
};
```

```typescript
// src/routes/users.ts
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import type { CreateUserBody, User, PaginatedResult } from "../types.js";
import { AppError } from "../middleware/error-handler.js";

const router = Router();

// In-memory store (use a real DB in production)
const users: User[] = [
    { id: 1, name: "Alice", email: "alice@example.com", role: "admin", createdAt: new Date().toISOString() },
    { id: 2, name: "Bob", email: "bob@example.com", role: "user", createdAt: new Date().toISOString() },
];

let nextId = 3;

// GET /users?page=1&pageSize=10
router.get("/", (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Math.min(Number(req.query.pageSize) || 10, 100);
    const start = (page - 1) * pageSize;

    const result: PaginatedResult<User> = {
        data: users.slice(start, start + pageSize),
        total: users.length,
        page,
        pageSize,
        totalPages: Math.ceil(users.length / pageSize),
    };

    res.json(result);
});

// GET /users/:id
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
        next(new AppError(`User ${id} not found`, 404, "USER_NOT_FOUND"));
        return;
    }

    res.json(user);
});

// POST /users
router.post("/", (req: Request<{}, User, CreateUserBody>, res: Response, next: NextFunction) => {
    const { name, email, role = "user" } = req.body;

    if (!name || !email) {
        next(new AppError("Name and email are required", 400, "VALIDATION_ERROR"));
        return;
    }

    if (users.some(u => u.email === email)) {
        next(new AppError("Email already registered", 409, "DUPLICATE_EMAIL"));
        return;
    }

    const newUser: User = {
        id: nextId++,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

export default router;
```

```typescript
// src/server.ts
import express from "express";
import usersRouter from "./routes/users.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/users", usersRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
```

### Typing environment variables

Accessing `process.env` without checks gives you `string | undefined`. Create a typed config module:

```typescript
// src/config.ts
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const config = {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
    databaseUrl: requireEnv("DATABASE_URL"),
    jwtSecret: requireEnv("JWT_SECRET"),
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
} as const;
```

## TypeScript with React

### Setup with Vite

```bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
```

Vite's React-TS template configures everything out of the box.

### Typing component props

The most fundamental React + TypeScript pattern: define props as an interface:

```typescript
// src/components/UserCard.tsx
interface UserCardProps {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
    role: "admin" | "user";
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
}

export function UserCard({ id, name, email, avatarUrl, role, onDelete, onEdit }: UserCardProps) {
    return (
        <div className="user-card">
            {avatarUrl && <img src={avatarUrl} alt={`${name}'s avatar`} />}
            <h3>{name}</h3>
            <p>{email}</p>
            <span className={`badge badge-${role}`}>{role}</span>
            {onEdit && (
                <button onClick={() => onEdit(id)}>Edit</button>
            )}
            {onDelete && (
                <button onClick={() => onDelete(id)}>Delete</button>
            )}
        </div>
    );
}
```

> **Note:** Avoid `React.FC` / `React.FunctionComponent` for new code. The direct function signature shown above is
> cleaner and avoids the implicit `children` prop that `React.FC` used to add (this was removed in React 18 types).

### Typing children

When a component accepts children, use `React.ReactNode`:

```typescript
import type { ReactNode } from "react";

interface CardProps {
    title: string;
    children: ReactNode;
    className?: string;
    footer?: ReactNode;
}

export function Card({ title, children, className = "", footer }: CardProps) {
    return (
        <div className={`card ${className}`}>
            <div className="card-header">
                <h2>{title}</h2>
            </div>
            <div className="card-body">{children}</div>
            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
}
```

### Typing event handlers

```typescript
import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";

export function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
    const [query, setQuery] = useState("");

    // ChangeEvent<HTMLInputElement> for input changes
    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setQuery(event.target.value);
    };

    // FormEvent<HTMLFormElement> for form submission
    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    // KeyboardEvent for keyboard interactions
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Escape") {
            setQuery("");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="search"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
            />
            <button type="submit">Search</button>
        </form>
    );
}
```

Common event types:

| Event                        | Element types                                          |
|------------------------------|--------------------------------------------------------|
| `ChangeEvent<HTMLInputElement>` | `<input>`, `<textarea>`                           |
| `ChangeEvent<HTMLSelectElement>` | `<select>`                                       |
| `FormEvent<HTMLFormElement>` | `<form>`                                               |
| `MouseEvent<HTMLButtonElement>` | `<button>`, `<div>`, `<a>`                        |
| `KeyboardEvent<HTMLInputElement>` | Any focusable element                            |
| `FocusEvent<HTMLInputElement>` | Any focusable element                               |
| `DragEvent<HTMLDivElement>`  | Drag-and-drop targets                                  |

### Typing hooks

**useState** infers from the initial value, but sometimes you need to be explicit:

```typescript
import { useState } from "react";

interface User {
    id: number;
    name: string;
}

// Inferred: useState<number>
const [count, setCount] = useState(0);

// Explicit type needed when initial value is null/undefined
const [user, setUser] = useState<User | null>(null);

// Array state
const [items, setItems] = useState<string[]>([]);

// Object state
const [form, setForm] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
});
```

**useRef** for DOM elements:

```typescript
import { useRef, useEffect } from "react";

function AutoFocusInput() {
    // Typing useRef for DOM elements: HTMLInputElement | null
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus(); // optional chaining -- ref may not be attached yet
    }, []);

    return <input ref={inputRef} type="text" />;
}
```

**useReducer** with discriminated unions:

```typescript
import { useReducer } from "react";

interface State {
    count: number;
    step: number;
}

type Action =
    | { type: "increment" }
    | { type: "decrement" }
    | { type: "reset" }
    | { type: "setStep"; payload: number };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "increment":
            return { ...state, count: state.count + state.step };
        case "decrement":
            return { ...state, count: state.count - state.step };
        case "reset":
            return { count: 0, step: state.step };
        case "setStep":
            return { ...state, step: action.payload };
    }
}

function Counter() {
    const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={() => dispatch({ type: "increment" })}>+{state.step}</button>
            <button onClick={() => dispatch({ type: "decrement" })}>-{state.step}</button>
            <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
            <input
                type="number"
                value={state.step}
                onChange={e => dispatch({ type: "setStep", payload: Number(e.target.value) })}
            />
        </div>
    );
}
```

**Custom hooks:**

```typescript
import { useState, useCallback } from "react";

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

function useFetch<T>(url: string): FetchState<T> & { refetch: () => void } {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const fetch_ = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: T = await response.json();
            setState({ data, loading: false, error: null });
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : "Unknown error",
            }));
        }
    }, [url]);

    return { ...state, refetch: fetch_ };
}

// Usage -- T is inferred as User
interface User { id: number; name: string; }

function UserProfile({ userId }: { userId: number }) {
    const { data: user, loading, error, refetch } = useFetch<User>(`/api/users/${userId}`);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error} <button onClick={refetch}>Retry</button></p>;
    if (!user) return null;

    return <div><h1>{user.name}</h1></div>;
}
```

### Typing context

```typescript
import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextValue {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

// createContext needs a default value or undefined + a guard
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// Usage
function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme}>
            Switch to {theme === "light" ? "dark" : "light"} mode
        </button>
    );
}
```

## Migrating a JavaScript project to TypeScript

Migrating incrementally is the recommended approach - you do not have to convert everything at once.

### Step 1: Add TypeScript to the project

```bash
npm install --save-dev typescript @types/node
npx tsc --init
```

### Step 2: Configure a lenient tsconfig to start

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "CommonJS",
        "allowJs": true,            // Allow JavaScript files alongside TypeScript
        "checkJs": false,           // Don't type-check JS files yet
        "outDir": "dist",
        "rootDir": "src",
        "strict": false,            // Start lenient, tighten later
        "esModuleInterop": true,
        "skipLibCheck": true
    },
    "include": ["src"]
}
```

`allowJs: true` means you can have a mix of `.ts` and `.js` files. Rename and convert files one at a time.

### Step 3: Rename files and fix errors

Rename `.js` files to `.ts` one at a time, fixing errors as they appear:

```bash
mv src/utils/format.js src/utils/format.ts
npx tsc --noEmit  # See what broke
```

Common errors when converting:

| Error                                       | Fix                                                      |
|---------------------------------------------|----------------------------------------------------------|
| `Parameter 'x' implicitly has an 'any' type` | Add type annotations to function parameters             |
| `Property 'x' does not exist on type '{}'`  | Define an interface or use a type assertion               |
| `Cannot find module 'x'`                    | Install `@types/x` or write a declaration file           |
| `Object is possibly 'null'`                 | Add null checks or use optional chaining                  |

### Step 4: Add types progressively

Start with the most used files and work outward. Use `// @ts-ignore` or `// @ts-expect-error` as temporary escapes,
then remove them:

```typescript
// Temporary escape hatch while migrating
// @ts-expect-error -- TODO: properly type this after the migration
const result = legacyFunction(data);
```

### Step 5: Enable strict mode gradually

Enable strict flags one at a time rather than all at once:

```json
{
    "compilerOptions": {
        "strict": false,
        "strictNullChecks": true,   // Week 1
        "noImplicitAny": true,      // Week 2
        "strictFunctionTypes": true  // Week 3
        // ... add more each sprint
    }
}
```

### Step 6: Enable checkJs for remaining .js files

Once your TypeScript files are clean, you can enable basic checking for the remaining `.js` files:

```json
{
    "compilerOptions": {
        "checkJs": true,
        "strict": true   // Full strict mode
    }
}
```

### Migration checklist

```text
[ ] Install typescript and @types/node
[ ] Create tsconfig.json with allowJs: true, strict: false
[ ] Add "build": "tsc" and "typecheck": "tsc --noEmit" scripts
[ ] Convert utility files first (lowest coupling)
[ ] Convert service/business logic files
[ ] Convert route handlers and controllers
[ ] Convert entry point (server.ts, main.ts, index.ts)
[ ] Install @types/ packages for all dependencies
[ ] Write .d.ts files for dependencies without types
[ ] Enable strict: true and fix remaining errors
[ ] Add TypeScript to CI/CD: run npm run typecheck in pipeline
[ ] Remove all @ts-ignore comments
```

## Common TypeScript patterns

### The Builder pattern

```typescript
class QueryBuilder {
    private conditions: string[] = [];
    private orderByClause: string | null = null;
    private limitValue: number | null = null;
    private table: string;

    constructor(table: string) {
        this.table = table;
    }

    where(condition: string): this {
        this.conditions.push(condition);
        return this;
    }

    orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
        this.orderByClause = `ORDER BY ${column} ${direction}`;
        return this;
    }

    limit(n: number): this {
        this.limitValue = n;
        return this;
    }

    build(): string {
        const where = this.conditions.length > 0
            ? `WHERE ${this.conditions.join(" AND ")}`
            : "";
        const order = this.orderByClause ?? "";
        const limit = this.limitValue !== null ? `LIMIT ${this.limitValue}` : "";
        return `SELECT * FROM ${this.table} ${where} ${order} ${limit}`.trim().replace(/\s+/g, " ");
    }
}

const query = new QueryBuilder("users")
    .where("active = true")
    .where("age > 18")
    .orderBy("name")
    .limit(20)
    .build();
// "SELECT * FROM users WHERE active = true AND age > 18 ORDER BY name ASC LIMIT 20"
```

### Type-safe event bus

```typescript
type Listener<T> = (event: T) => void;

class TypedEventBus<Events extends Record<string, unknown>> {
    private listeners = new Map<
        keyof Events,
        Set<Listener<Events[keyof Events]>>
    >();

    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener as Listener<Events[keyof Events]>);

        // Return unsubscribe function
        return () => this.off(event, listener);
    }

    off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        this.listeners.get(event)?.delete(listener as Listener<Events[keyof Events]>);
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        this.listeners.get(event)?.forEach(listener => listener(payload));
    }
}

interface DomainEvents {
    "user.created": { userId: number; name: string };
    "order.placed": { orderId: number; amount: number };
    "session.expired": { sessionId: string };
}

const bus = new TypedEventBus<DomainEvents>();

const unsub = bus.on("user.created", ({ userId, name }) => {
    console.log(`New user: ${name} (${userId})`);
});

bus.emit("user.created", { userId: 1, name: "Alice" }); // OK
// bus.emit("user.created", { userId: "wrong" });        // Error

unsub(); // Unsubscribe
```

## Summary

This final chapter demonstrated:

- A **typed Express server** with route handlers, error middleware, and a typed config module
- **React component props** defined as interfaces, with `children: ReactNode`
- **Event handler types** (`ChangeEvent`, `FormEvent`, `MouseEvent`) from `react`
- **Typing hooks**: `useState<T>`, `useRef<HTMLElement>`, `useReducer` with discriminated unions, typed custom hooks
- **Context typing** with `createContext<T | undefined>` and a guard hook
- **Migrating from JavaScript**: incremental approach with `allowJs`, gradual strict mode, and a migration checklist
- Common patterns: Builder, typed event bus, and safe property access

---

Congratulations - you have worked through the full TypeScript beginners guide. You now have a solid foundation in:

1. The TypeScript type system: primitives, interfaces, type aliases, generics, enums, and utility types
2. Classes, inheritance, abstract classes, and interface implementation
3. Advanced type system features: conditional types, mapped types, template literal types
4. Modules, declaration files, and working with third-party libraries
5. tsconfig configuration, project references, and ESLint integration
6. Real-world TypeScript in Node.js and React projects
7. Migrating an existing JavaScript codebase

The best way to continue improving is to write TypeScript every day. Read the error messages - they are excellent
teachers. When you hit a type problem you cannot solve, the [TypeScript Playground](https://www.typescriptlang.org/play)
is an invaluable tool for experimenting without setting up a project.

**Useful resources:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - the official documentation
- [TypeScript Playground](https://www.typescriptlang.org/play) - experiment in your browser
- [Total TypeScript](https://www.totaltypescript.com) - free and paid courses by Matt Pocock
- [Type Challenges](https://github.com/type-challenges/type-challenges) - practice type-level programming
- [ts-reset](https://github.com/total-typescript/ts-reset) - improves TypeScript's built-in types
