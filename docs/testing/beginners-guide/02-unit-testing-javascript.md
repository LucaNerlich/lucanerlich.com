---
title: "Unit Testing in JavaScript & TypeScript"
sidebar_label: "Unit Testing (JS/TS)"
description: Setting up Jest and Vitest, writing describe/it/test blocks, using expect matchers, lifecycle hooks, and running your test suite.
slug: /testing/beginners-guide/unit-testing-javascript
tags: [testing, beginners, jest, vitest, javascript, typescript]
keywords:
  - jest setup
  - vitest setup
  - unit testing javascript
  - describe it test
  - expect matchers
  - beforeEach afterEach
sidebar_position: 2
---

# Unit Testing in JavaScript & TypeScript

A unit test in JavaScript is a function that calls your code with a known input and asserts that the output matches what you expect. The test framework (Jest or Vitest) runs your tests, reports failures, and provides the assertion helpers you need. This chapter covers both frameworks because you will encounter both in the wild — their APIs are nearly identical by design.

## Choosing Between Jest and Vitest

| Feature | Jest | Vitest |
|---|---|---|
| Ecosystem maturity | Very mature, 10+ years | Newer, fast-growing |
| Config required | Some for TypeScript/ESM | Near-zero for Vite projects |
| Speed | Fast | Faster (especially with HMR in watch mode) |
| API compatibility | Reference implementation | Intentionally Jest-compatible |
| Best for | Any Node project, CRA, Next.js | Vite-based projects, modern TS |

If you are starting a new project today with Vite or a framework that uses Vite (SvelteKit, Nuxt 3, Astro), use **Vitest**. For everything else, **Jest** is safe and well-documented.

## Setting Up Jest

### Installation

```bash
npm install --save-dev jest @types/jest
```

For TypeScript projects, add the Babel or ts-jest transformer:

```bash
# Option A: Babel (simpler, does not type-check)
npm install --save-dev babel-jest @babel/core @babel/preset-env @babel/preset-typescript

# Option B: ts-jest (slower but does type-check in tests)
npm install --save-dev ts-jest
```

### jest.config.ts

```typescript
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
    coverageDirectory: 'coverage',
};

export default config;
```

### package.json scripts

```json
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage"
    }
}
```

## Setting Up Vitest

### Installation

```bash
npm install --save-dev vitest
```

Vitest reads your `vite.config.ts` automatically and picks up TypeScript, path aliases, and plugins without extra configuration.

### vite.config.ts (with test config inline)

```typescript
import { defineConfig } from 'vite';
import { defineConfig as defineTestConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,         // enables describe/it/expect globally
        environment: 'node',   // or 'jsdom' for browser-like tests
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
        },
    },
});
```

### package.json scripts

```json
{
    "scripts": {
        "test": "vitest run",
        "test:watch": "vitest",
        "test:coverage": "vitest run --coverage"
    }
}
```

## File Naming Conventions

Both frameworks discover test files using glob patterns. The standard conventions are:

| Convention | Example | When to use |
|---|---|---|
| `.test.ts` alongside source | `math.test.ts` next to `math.ts` | Recommended for most projects |
| `.spec.ts` alongside source | `math.spec.ts` next to `math.ts` | Common in Angular projects |
| `__tests__` directory | `__tests__/math.ts` | When you prefer test isolation |

The co-location approach (test file next to the source file) is generally preferred because it makes it obvious which file a test belongs to and prevents the `__tests__` folder from becoming a dumping ground.

```text
src/
  cart/
    cart.ts
    cart.test.ts
  pricing/
    pricing.ts
    pricing.test.ts
```

## Your First Test

Here is the function we will test:

```typescript
// src/math.ts
export function add(a: number, b: number): number {
    return a + b;
}

export function divide(a: number, b: number): number {
    if (b === 0) {
        throw new Error('Division by zero');
    }
    return a / b;
}
```

And the tests:

```typescript
// src/math.test.ts
import { add, divide } from './math';

describe('add', () => {
    it('returns the sum of two positive numbers', () => {
        expect(add(2, 3)).toBe(5);
    });

    it('handles negative numbers', () => {
        expect(add(-1, -2)).toBe(-3);
    });

    it('returns the first number when adding zero', () => {
        expect(add(7, 0)).toBe(7);
    });
});

describe('divide', () => {
    it('divides two numbers correctly', () => {
        expect(divide(10, 2)).toBe(5);
    });

    it('throws when dividing by zero', () => {
        expect(() => divide(10, 0)).toThrow('Division by zero');
    });
});
```

## The describe / it / test Structure

`describe` creates a named group of related tests. `it` (or `test`, they are identical) defines a single test case. Nesting `describe` blocks lets you build a hierarchy that reads like documentation:

```typescript
describe('ShoppingCart', () => {
    describe('addItem', () => {
        it('increases the item count', () => { /* ... */ });
        it('updates the total price', () => { /* ... */ });
        it('throws when quantity is negative', () => { /* ... */ });
    });

    describe('removeItem', () => {
        it('decreases the item count', () => { /* ... */ });
        it('does nothing when item is not in cart', () => { /* ... */ });
    });
});
```

When this runs, the failure message will read something like:
`ShoppingCart > addItem > throws when quantity is negative`

That level of specificity makes failures easy to locate.

## Expect Matchers

`expect()` wraps the value under test. The chained method is the **matcher**. Jest and Vitest ship the same built-in matchers:

### Primitive equality

```typescript
expect(result).toBe(42);              // strict equality (===)
expect(result).toEqual({ a: 1 });     // deep equality (objects/arrays)
expect(result).not.toBe(0);           // negate any matcher with .not
```

### Truthiness

```typescript
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
```

### Numbers

```typescript
expect(price).toBeGreaterThan(0);
expect(price).toBeGreaterThanOrEqual(0);
expect(price).toBeLessThan(1000);
expect(0.1 + 0.2).toBeCloseTo(0.3, 5);  // floating point
```

### Strings

```typescript
expect(message).toContain('error');
expect(message).toMatch(/^Error:/);
expect(message).toHaveLength(20);
```

### Arrays and objects

```typescript
expect(list).toHaveLength(3);
expect(list).toContain('apple');
expect(list).toEqual(expect.arrayContaining(['apple', 'banana']));
expect(obj).toHaveProperty('user.name', 'Alice');
expect(obj).toMatchObject({ status: 'ok' });  // partial match
```

### Errors

```typescript
expect(() => riskyFn()).toThrow();
expect(() => riskyFn()).toThrow(TypeError);
expect(() => riskyFn()).toThrow('expected message');
expect(() => riskyFn()).toThrow(/pattern/);
```

## Lifecycle Hooks

When multiple tests in a `describe` block share setup or teardown logic, use lifecycle hooks instead of repeating code:

```typescript
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { Database } from './database';

describe('UserRepository', () => {
    let db: Database;

    beforeAll(async () => {
        // Runs once before all tests in this describe block
        db = await Database.connect('sqlite::memory:');
        await db.migrate();
    });

    afterAll(async () => {
        // Runs once after all tests in this describe block
        await db.close();
    });

    beforeEach(async () => {
        // Runs before each individual test
        await db.seed({ users: [{ id: 1, name: 'Alice' }] });
    });

    afterEach(async () => {
        // Runs after each individual test — clean up mutations
        await db.truncate('users');
    });

    it('finds a user by id', async () => {
        const user = await db.users.findById(1);
        expect(user?.name).toBe('Alice');
    });

    it('returns null for a missing user', async () => {
        const user = await db.users.findById(999);
        expect(user).toBeNull();
    });
});
```

Hooks also nest. A `beforeEach` in an outer `describe` runs before the `beforeEach` in an inner `describe`. This lets you layer setup:

```typescript
describe('CartService', () => {
    let cart: CartService;

    beforeEach(() => {
        cart = new CartService();  // fresh cart for every test
    });

    describe('with an existing item', () => {
        beforeEach(() => {
            cart.add({ id: 'abc', price: 10, qty: 1 });  // pre-loaded
        });

        it('increments quantity when adding the same item again', () => {
            cart.add({ id: 'abc', price: 10, qty: 1 });
            expect(cart.getItem('abc')?.qty).toBe(2);
        });
    });
});
```

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode: re-run on file change
npm run test:watch

# Run a single file
npx jest src/cart/cart.test.ts
npx vitest run src/cart/cart.test.ts

# Run tests matching a pattern (by test name)
npx jest -t "adds two numbers"
npx vitest run -t "adds two numbers"

# Run with coverage
npm run test:coverage
```

## Skipping and Focusing Tests

During development you sometimes need to skip a test temporarily or focus on one:

```typescript
// Skip this test (it shows as pending)
it.skip('not ready yet', () => { /* ... */ });

// Only run this test (dangerous — do not commit)
it.only('focus here', () => { /* ... */ });

// Conditional skip
it.skipIf(process.env.CI === 'true')('skipped in CI', () => { /* ... */ });
```

`it.only` (or `test.only`) will cause all other tests in the file to be skipped. Never commit a `.only` — most teams have a lint rule (`no-only-tests`) to catch it.

## Testing Async Code

Modern JavaScript is heavily async. Both frameworks handle promises and async/await natively.

### With async/await

```typescript
async function fetchUser(id: number): Promise<{ name: string }> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
}

it('fetches a user', async () => {
    // We'll mock fetch in chapter 4 — for now, this shows the pattern
    const user = await fetchUser(1);
    expect(user.name).toBeDefined();
});
```

### Asserting rejected promises

```typescript
it('throws on 404', async () => {
    await expect(fetchUser(999)).rejects.toThrow('Not found');
});
```

### Using done callback (legacy — avoid in new code)

```typescript
it('legacy callback test', (done) => {
    setTimeout(() => {
        expect(true).toBe(true);
        done();
    }, 100);
});
```

The `async/await` style is cleaner and less error-prone. Use it for all new tests.

## A Realistic Example: String Utilities

```typescript
// src/stringUtils.ts
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number, ellipsis = '…'): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}
```

```typescript
// src/stringUtils.test.ts
import { slugify, truncate } from './stringUtils';

describe('slugify', () => {
    it('lowercases the input', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    it('replaces spaces with hyphens', () => {
        expect(slugify('my blog post')).toBe('my-blog-post');
    });

    it('removes special characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('collapses multiple spaces and hyphens', () => {
        expect(slugify('foo  --  bar')).toBe('foo-bar');
    });

    it('strips leading and trailing hyphens', () => {
        expect(slugify('  hello  ')).toBe('hello');
    });
});

describe('truncate', () => {
    it('returns the original string when short enough', () => {
        expect(truncate('hello', 10)).toBe('hello');
    });

    it('truncates and appends ellipsis', () => {
        expect(truncate('hello world', 8)).toBe('hello w…');
    });

    it('uses a custom ellipsis', () => {
        expect(truncate('hello world', 8, '...')).toBe('hello...');
    });

    it('handles exact length', () => {
        expect(truncate('hello', 5)).toBe('hello');
    });
});
```

Run with `npm test` and you should see all tests pass. Next chapter covers the same concepts in Java with JUnit 5.
