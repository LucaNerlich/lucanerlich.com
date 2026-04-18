---
title: "Practice Project: TypeScript Utility Library"
sidebar_label: "Practice Project"
description: End-to-end exercise — build and test a small TypeScript utility library with Vitest (unit and integration tests), full coverage report, and GitHub Actions CI.
slug: /testing/beginners-guide/practice-project
tags: [testing, beginners, typescript, vitest, github-actions, ci, coverage]
keywords:
  - typescript testing project
  - vitest project example
  - github actions testing
  - full coverage project
  - testing practice exercise
sidebar_position: 12
---

# Practice Project: TypeScript Utility Library

This chapter brings together everything covered in the guide. You will build a small but realistic TypeScript utility library — `@myorg/formatters` — from scratch, test it with Vitest, generate a coverage report, and set up GitHub Actions to run the tests on every push.

The library provides three utilities:
- `formatCurrency` — formats a number as a currency string
- `formatRelativeTime` — formats a date as a human-readable relative string ("3 hours ago")
- `formatList` — joins an array of strings into a natural-language list ("Alice, Bob, and Carol")

These are simple enough to understand in minutes but complex enough to have meaningful edge cases worth testing.

## Project Setup

```bash
mkdir formatters && cd formatters
npm init -y
```

Install dependencies:

```bash
npm install --save-dev typescript vitest @vitest/coverage-v8 @types/node
```

### tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "declaration": true,
        "declarationDir": "dist/types",
        "outDir": "dist",
        "rootDir": "src",
        "esModuleInterop": true,
        "skipLibCheck": true
    },
    "include": ["src"],
    "exclude": ["node_modules", "dist"]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/index.ts'],
            thresholds: {
                lines: 90,
                branches: 85,
                functions: 90,
                statements: 90,
            },
        },
    },
});
```

### package.json scripts

```json
{
    "name": "@myorg/formatters",
    "version": "0.1.0",
    "type": "module",
    "exports": {
        ".": {
            "types": "./dist/types/index.d.ts",
            "import": "./dist/index.js"
        }
    },
    "scripts": {
        "build": "tsc",
        "test": "vitest run",
        "test:watch": "vitest",
        "test:coverage": "vitest run --coverage"
    },
    "devDependencies": {
        "@types/node": "^22.0.0",
        "@vitest/coverage-v8": "^2.0.0",
        "typescript": "^5.5.0",
        "vitest": "^2.0.0"
    }
}
```

## The Source Code

### src/formatCurrency.ts

```typescript
export interface CurrencyOptions {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

/**
 * Formats a number as a currency string.
 *
 * @example
 * formatCurrency(1234.5)                        // "€1,234.50"
 * formatCurrency(1234.5, { currency: 'USD' })   // "$1,234.50"
 * formatCurrency(0)                              // "€0.00"
 */
export function formatCurrency(
    amount: number,
    options: CurrencyOptions = {}
): string {
    const {
        currency = 'EUR',
        locale = 'en-US',
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
    } = options;

    if (!Number.isFinite(amount)) {
        throw new TypeError(`Invalid amount: ${amount}`);
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
}
```

### src/formatRelativeTime.ts

```typescript
type Unit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

const THRESHOLDS: Array<{ unit: Unit; seconds: number }> = [
    { unit: 'year',   seconds: 365 * 24 * 3600 },
    { unit: 'month',  seconds: 30  * 24 * 3600 },
    { unit: 'week',   seconds: 7   * 24 * 3600 },
    { unit: 'day',    seconds:       24 * 3600 },
    { unit: 'hour',   seconds:            3600 },
    { unit: 'minute', seconds:              60 },
    { unit: 'second', seconds:               1 },
];

/**
 * Formats a date relative to now (or a given base date).
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 5000))          // "5 seconds ago"
 * formatRelativeTime(new Date(Date.now() - 3600000))       // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() + 86400000))      // "in 1 day"
 */
export function formatRelativeTime(
    date: Date,
    baseDate: Date = new Date(),
    locale = 'en-US'
): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new TypeError('date must be a valid Date object');
    }

    const diffSeconds = Math.round((date.getTime() - baseDate.getTime()) / 1000);

    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    for (const { unit, seconds } of THRESHOLDS) {
        if (Math.abs(diffSeconds) >= seconds) {
            const value = Math.round(diffSeconds / seconds);
            return formatter.format(value, unit);
        }
    }

    return formatter.format(0, 'second');
}
```

### src/formatList.ts

```typescript
export type ListStyle = 'conjunction' | 'disjunction' | 'unit';

export interface ListOptions {
    style?: ListStyle;
    locale?: string;
    emptyText?: string;
}

/**
 * Formats an array of strings into a natural-language list.
 *
 * @example
 * formatList(['Alice'])                              // "Alice"
 * formatList(['Alice', 'Bob'])                       // "Alice and Bob"
 * formatList(['Alice', 'Bob', 'Carol'])              // "Alice, Bob, and Carol"
 * formatList(['Alice', 'Bob'], { style: 'disjunction' }) // "Alice or Bob"
 * formatList([])                                     // ""
 */
export function formatList(
    items: string[],
    options: ListOptions = {}
): string {
    const { style = 'conjunction', locale = 'en-US', emptyText = '' } = options;

    if (items.length === 0) return emptyText;

    const formatter = new Intl.ListFormat(locale, {
        style: 'long',
        type: style,
    });

    return formatter.format(items);
}
```

### src/index.ts

```typescript
export { formatCurrency } from './formatCurrency';
export { formatRelativeTime } from './formatRelativeTime';
export { formatList } from './formatList';
export type { CurrencyOptions } from './formatCurrency';
export type { ListStyle, ListOptions } from './formatList';
```

## The Tests

### src/formatCurrency.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
    describe('default options (EUR, en-US)', () => {
        it('formats a positive integer', () => {
            expect(formatCurrency(100)).toBe('€100.00');
        });

        it('formats a positive decimal', () => {
            expect(formatCurrency(1234.5)).toBe('€1,234.50');
        });

        it('formats zero', () => {
            expect(formatCurrency(0)).toBe('€0.00');
        });

        it('formats a negative amount', () => {
            expect(formatCurrency(-50)).toBe('-€50.00');
        });

        it('formats a large number with thousands separator', () => {
            expect(formatCurrency(1_000_000)).toBe('€1,000,000.00');
        });
    });

    describe('custom currency', () => {
        it('formats as USD', () => {
            expect(formatCurrency(99.99, { currency: 'USD' })).toBe('$99.99');
        });

        it('formats as GBP', () => {
            expect(formatCurrency(49.99, { currency: 'GBP' })).toBe('£49.99');
        });

        it('formats as JPY with zero decimals', () => {
            expect(
                formatCurrency(1500, {
                    currency: 'JPY',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                })
            ).toBe('¥1,500');
        });
    });

    describe('custom locale', () => {
        it('formats with German locale', () => {
            const result = formatCurrency(1234.56, { locale: 'de-DE', currency: 'EUR' });
            // German locale uses period as thousands separator and comma as decimal
            expect(result).toMatch(/1\.234,56/);
        });
    });

    describe('error handling', () => {
        it('throws TypeError for Infinity', () => {
            expect(() => formatCurrency(Infinity)).toThrow(TypeError);
            expect(() => formatCurrency(Infinity)).toThrow('Invalid amount');
        });

        it('throws TypeError for -Infinity', () => {
            expect(() => formatCurrency(-Infinity)).toThrow(TypeError);
        });

        it('throws TypeError for NaN', () => {
            expect(() => formatCurrency(NaN)).toThrow(TypeError);
        });
    });
});
```

### src/formatRelativeTime.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from './formatRelativeTime';

const BASE = new Date('2025-01-15T12:00:00Z');

function secondsAgo(n: number): Date {
    return new Date(BASE.getTime() - n * 1000);
}

function secondsFromNow(n: number): Date {
    return new Date(BASE.getTime() + n * 1000);
}

describe('formatRelativeTime', () => {
    describe('past times', () => {
        it('formats seconds ago', () => {
            expect(formatRelativeTime(secondsAgo(30), BASE)).toBe('30 seconds ago');
        });

        it('formats minutes ago', () => {
            expect(formatRelativeTime(secondsAgo(120), BASE)).toBe('2 minutes ago');
        });

        it('formats hours ago', () => {
            expect(formatRelativeTime(secondsAgo(7200), BASE)).toBe('2 hours ago');
        });

        it('formats days ago', () => {
            expect(formatRelativeTime(secondsAgo(2 * 86400), BASE)).toBe('2 days ago');
        });

        it('formats weeks ago', () => {
            expect(formatRelativeTime(secondsAgo(14 * 86400), BASE)).toBe('2 weeks ago');
        });

        it('formats months ago', () => {
            expect(formatRelativeTime(secondsAgo(60 * 86400), BASE)).toBe('2 months ago');
        });

        it('formats years ago', () => {
            expect(formatRelativeTime(secondsAgo(730 * 86400), BASE)).toBe('2 years ago');
        });
    });

    describe('future times', () => {
        it('formats seconds from now', () => {
            expect(formatRelativeTime(secondsFromNow(30), BASE)).toBe('in 30 seconds');
        });

        it('formats hours from now', () => {
            expect(formatRelativeTime(secondsFromNow(7200), BASE)).toBe('in 2 hours');
        });

        it('formats years from now', () => {
            expect(formatRelativeTime(secondsFromNow(730 * 86400), BASE)).toBe('in 2 years');
        });
    });

    describe('edge cases', () => {
        it('handles exactly now', () => {
            expect(formatRelativeTime(BASE, BASE)).toBe('now');
        });

        it('throws for an invalid date', () => {
            expect(() => formatRelativeTime(new Date('invalid'), BASE))
                .toThrow(TypeError);
        });

        it('throws for a non-Date argument', () => {
            expect(() => formatRelativeTime('2025-01-01' as unknown as Date, BASE))
                .toThrow(TypeError);
        });
    });
});
```

### src/formatList.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { formatList } from './formatList';

describe('formatList', () => {
    describe('conjunction (default — "and")', () => {
        it('returns empty string for an empty array', () => {
            expect(formatList([])).toBe('');
        });

        it('returns the single item for a one-element array', () => {
            expect(formatList(['Alice'])).toBe('Alice');
        });

        it('joins two items with "and"', () => {
            expect(formatList(['Alice', 'Bob'])).toBe('Alice and Bob');
        });

        it('joins three items with Oxford comma and "and"', () => {
            expect(formatList(['Alice', 'Bob', 'Carol'])).toBe('Alice, Bob, and Carol');
        });

        it('joins four items correctly', () => {
            expect(formatList(['Alice', 'Bob', 'Carol', 'Dave']))
                .toBe('Alice, Bob, Carol, and Dave');
        });
    });

    describe('disjunction (or)', () => {
        it('joins two items with "or"', () => {
            expect(formatList(['cats', 'dogs'], { style: 'disjunction' }))
                .toBe('cats or dogs');
        });

        it('joins three items with "or"', () => {
            expect(formatList(['small', 'medium', 'large'], { style: 'disjunction' }))
                .toBe('small, medium, or large');
        });
    });

    describe('unit style', () => {
        it('joins items with commas only', () => {
            expect(formatList(['3 kg', '2 L', '500 ml'], { style: 'unit' }))
                .toBe('3 kg, 2 L, 500 ml');
        });
    });

    describe('custom emptyText', () => {
        it('returns emptyText when array is empty', () => {
            expect(formatList([], { emptyText: 'No items' })).toBe('No items');
        });
    });

    describe('custom locale', () => {
        it('formats in German', () => {
            const result = formatList(['Alice', 'Bob', 'Carol'], { locale: 'de-DE' });
            expect(result).toMatch(/Alice/);
            expect(result).toMatch(/Bob/);
            expect(result).toMatch(/Carol/);
        });
    });
});
```

## Running the Tests

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Expected coverage output:

```
 % Coverage report from v8
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   97.36 |    92.30 |  100.00 |   97.36 |
 formatCurrency.ts  |  100.00 |   100.00 |  100.00 |  100.00 |
 formatList.ts      |  100.00 |   100.00 |  100.00 |  100.00 |
 formatRelativeTime |   94.44 |    83.33 |  100.00 |   94.44 |
--------------------|---------|----------|---------|---------|
```

All thresholds pass. Open `coverage/index.html` in a browser to see which branches are not covered and write additional tests to close the gaps.

## GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    name: Test & Coverage
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: matrix.node-version == 22
        with:
          name: coverage-report
          path: coverage/
          retention-days: 14

      - name: Upload to Codecov
        if: matrix.node-version == 22
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: coverage/lcov.info
          fail_ci_if_error: true

  build:
    name: Build TypeScript
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci

      - name: Build
        run: npm run build

      - name: Upload dist
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

This workflow:
1. Runs on every push to `main` and every pull request
2. Tests against Node.js 20 and 22 in parallel
3. Uploads the HTML coverage report as an artifact
4. Pushes coverage data to Codecov (optional — remove if not used)
5. Runs a build step after tests pass to verify the TypeScript compiles cleanly

## What You Have Built

By completing this project you have:

- Structured a TypeScript package with `exports`, `declaration` files, and strict TypeScript settings
- Written **unit tests** for three utility functions covering happy paths, edge cases, and error conditions
- Configured **Vitest** with coverage thresholds that fail the build when coverage drops
- Generated an **HTML coverage report** that shows exactly which lines and branches are tested
- Set up a **GitHub Actions CI pipeline** that runs tests on multiple Node.js versions, uploads reports, and blocks merges on failure

The patterns here — test file alongside source, coverage thresholds in config, CI matrix builds, artifact uploads — are directly applicable to any TypeScript project: a React component library, a Node.js API, a CLI tool, or a shared internal package.

## Suggested Extensions

Once you are comfortable with this project, try extending it:

1. **Add integration tests** — write tests that use your formatters together (e.g., format a list of prices, each formatted with `formatCurrency`).
2. **Add a `parseAmount` function** — it takes a formatted currency string and returns a number. Write it TDD-style.
3. **Add Storybook stories** — if you convert this to a React component library, document each formatter with stories.
4. **Publish to npm** — add a `release` workflow using `changesets` or `semantic-release` that publishes the package when a PR is merged to main.
5. **Add E2E tests** — build a tiny demo web app that uses the formatters and write a Playwright test that verifies the output in the browser.

You now have the complete foundation: unit testing, mocking, integration testing, TDD, component testing, snapshot testing, E2E testing, coverage, and CI. The next step is practice — pick a real project and apply these concepts one test at a time.
