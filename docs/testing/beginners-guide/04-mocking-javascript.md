---
title: "Mocking in JavaScript & TypeScript"
sidebar_label: "Mocking (JS/TS)"
description: jest.fn(), jest.spyOn(), jest.mock() for modules, clearing and resetting mocks, mocking fetch and axios, and testing async code.
slug: /testing/beginners-guide/mocking-javascript
tags: [testing, beginners, jest, vitest, mocking, javascript, typescript]
keywords:
  - jest mock
  - jest.fn
  - jest.spyOn
  - mock fetch jest
  - mock axios jest
  - testing async javascript
sidebar_position: 4
---

# Mocking in JavaScript & TypeScript

Unit tests should be fast and deterministic. The moment a test hits a real network, database, or file system, it becomes slow, flaky, and dependent on external state. **Mocking** solves this by replacing the real dependency with a controlled stand-in that you define in the test.

Jest and Vitest both ship a comprehensive mocking system. The APIs are largely identical — examples in this chapter work in both frameworks with minor import differences noted where relevant.

## Why Mock?

Consider a `UserService` that fetches users from an API:

```typescript
// src/userService.ts
export async function getUser(id: number) {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) throw new Error(`User ${id} not found`);
    return response.json();
}
```

A test that calls `fetch` for real:
- Requires a network connection
- Depends on the API being up
- Is slow (hundreds of milliseconds)
- May return different data over time
- Cannot reliably test error paths (how do you make the server return a 404?)

A test with a mocked `fetch`:
- Runs offline
- Is deterministic
- Takes microseconds
- Can simulate any scenario you need

## jest.fn() — Creating a Mock Function

`jest.fn()` creates a mock function — a function that records every call made to it and lets you define what it returns.

```typescript
const mockFn = jest.fn();

mockFn('hello');
mockFn('world', 42);

// Inspect calls
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('hello');
expect(mockFn).toHaveBeenLastCalledWith('world', 42);
```

### Configuring Return Values

```typescript
const fn = jest.fn();

// Always return the same value
fn.mockReturnValue(42);
expect(fn()).toBe(42);
expect(fn()).toBe(42);

// Return different values per call
fn.mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(99);  // fallback
expect(fn()).toBe(1);
expect(fn()).toBe(2);
expect(fn()).toBe(99);
expect(fn()).toBe(99);

// Return a resolved promise
fn.mockResolvedValue({ id: 1, name: 'Alice' });
const result = await fn();
expect(result.name).toBe('Alice');

// Return a rejected promise
fn.mockRejectedValue(new Error('Network error'));
await expect(fn()).rejects.toThrow('Network error');
```

### Using a Mock in a Test

```typescript
// src/notificationService.ts
type Sender = (to: string, body: string) => Promise<void>;

export async function sendWelcomeEmail(sender: Sender, userEmail: string) {
    await sender(userEmail, 'Welcome to our platform!');
}
```

```typescript
// src/notificationService.test.ts
import { sendWelcomeEmail } from './notificationService';

it('calls the sender with the correct arguments', async () => {
    const mockSender = jest.fn().mockResolvedValue(undefined);

    await sendWelcomeEmail(mockSender, 'alice@example.com');

    expect(mockSender).toHaveBeenCalledOnce();
    expect(mockSender).toHaveBeenCalledWith(
        'alice@example.com',
        'Welcome to our platform!'
    );
});
```

## jest.spyOn() — Spying on Existing Methods

`jest.fn()` creates a brand new function. `jest.spyOn()` wraps an *existing* method on an object, letting you observe calls without fully replacing the implementation.

```typescript
import * as fs from 'fs';

it('reads the config file', () => {
    const spy = jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');

    readConfig('/path/to/config.json');

    expect(spy).toHaveBeenCalledWith('/path/to/config.json', 'utf-8');
    spy.mockRestore(); // restore the real fs.readFileSync
});
```

Without `.mockReturnValue()`, the spy calls the real implementation and just records the call. With it, you replace the behaviour.

Always call `spy.mockRestore()` after the test (or in `afterEach`) to prevent the spy from leaking into other tests.

```typescript
describe('Logger', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('logs an error when the API fails', () => {
        logger.error('Something went wrong');
        expect(consoleSpy).toHaveBeenCalledWith('Something went wrong');
    });
});
```

## jest.mock() — Mocking Entire Modules

`jest.mock()` replaces an entire module with a mocked version. Every export from the module becomes a `jest.fn()` (or a hoisted auto-mock). This is the most powerful mocking mechanism.

### Automatic Module Mock

```typescript
jest.mock('./emailService');  // all exports become jest.fn()

import { sendEmail } from './emailService';

it('sends an email on registration', async () => {
    await registerUser('alice@example.com');

    expect(sendEmail).toHaveBeenCalledWith(
        'alice@example.com',
        'Welcome!'
    );
});
```

### Manual Module Mock with Factory

```typescript
jest.mock('./database', () => ({
    findUser: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
}));

import { findUser, createUser } from './database';

beforeEach(() => {
    (findUser as jest.Mock).mockResolvedValue({ id: 1, name: 'Alice' });
});

it('returns the user when found', async () => {
    const user = await userService.getUser(1);
    expect(user.name).toBe('Alice');
});
```

### Mocking a Default Export

```typescript
jest.mock('./ApiClient', () => {
    return jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        post: jest.fn(),
    }));
});

import ApiClient from './ApiClient';

it('instantiates the API client', () => {
    new ApiClient('https://api.example.com');
    expect(ApiClient).toHaveBeenCalledWith('https://api.example.com');
});
```

## Mocking fetch

The global `fetch` is available in Node 18+ and all browsers. Mock it directly on `globalThis`:

```typescript
// src/api.ts
export async function fetchPost(id: number) {
    const res = await fetch(`/api/posts/${id}`);
    if (!res.ok) throw new Error('Post not found');
    return res.json() as Promise<{ id: number; title: string }>;
}
```

```typescript
// src/api.test.ts
import { fetchPost } from './api';

function mockFetch(body: unknown, status = 200) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: jest.fn().mockResolvedValue(body),
    } as unknown as Response);
}

afterEach(() => {
    jest.restoreAllMocks();
});

it('returns post data on success', async () => {
    mockFetch({ id: 1, title: 'Hello World' });

    const post = await fetchPost(1);

    expect(post.title).toBe('Hello World');
    expect(global.fetch).toHaveBeenCalledWith('/api/posts/1');
});

it('throws when the response is not ok', async () => {
    mockFetch({ error: 'not found' }, 404);

    await expect(fetchPost(1)).rejects.toThrow('Post not found');
});
```

### Using msw (Mock Service Worker) for HTTP mocking

For more complex scenarios, `msw` intercepts requests at the network level:

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
    http.get('/api/posts/:id', ({ params }) => {
        return HttpResponse.json({ id: params.id, title: 'Test Post' });
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('fetches a post', async () => {
    const post = await fetchPost(1);
    expect(post.title).toBe('Test Post');
});

it('handles server errors', async () => {
    server.use(
        http.get('/api/posts/:id', () => new HttpResponse(null, { status: 500 })),
    );

    await expect(fetchPost(1)).rejects.toThrow();
});
```

## Mocking axios

```typescript
import axios from 'axios';
jest.mock('axios');

const mockedAxios = jest.mocked(axios);

it('fetches data via axios', async () => {
    mockedAxios.get.mockResolvedValue({
        data: { id: 1, name: 'Alice' },
        status: 200,
    });

    const user = await userService.getUser(1);

    expect(user.name).toBe('Alice');
    expect(mockedAxios.get).toHaveBeenCalledWith('/users/1');
});
```

## Clearing and Resetting Mocks

Mock state accumulates across tests if you are not careful. The three reset operations:

| Method | What it does |
|---|---|
| `mockFn.mockClear()` | Resets `.mock.calls` and `.mock.results` but keeps the implementation |
| `mockFn.mockReset()` | Clears call history AND removes the return value / implementation |
| `mockFn.mockRestore()` | Everything `mockReset()` does, plus restores the original implementation (only for spies) |

Configure automatic clearing in `jest.config.ts`:

```typescript
const config: Config = {
    clearMocks: true,     // mockClear() before each test
    resetMocks: false,    // mockReset() before each test
    restoreMocks: true,   // mockRestore() before each test
};
```

For most projects, `clearMocks: true` and `restoreMocks: true` is the right default. This prevents call counts from accumulating while keeping your mock implementations.

## Testing Async Code Patterns

### async/await (preferred)

```typescript
it('resolves with user data', async () => {
    (findUser as jest.Mock).mockResolvedValue({ id: 1, name: 'Alice' });

    const user = await userService.getUser(1);

    expect(user.name).toBe('Alice');
});

it('rejects when user is not found', async () => {
    (findUser as jest.Mock).mockRejectedValue(new Error('Not found'));

    await expect(userService.getUser(99)).rejects.toThrow('Not found');
});
```

### Fake timers

When testing code that uses `setTimeout`, `setInterval`, or `Date.now()`, fake timers let you advance time manually:

```typescript
describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('only calls the function once after the delay', () => {
        const fn = jest.fn();
        const debounced = debounce(fn, 300);

        debounced();
        debounced();
        debounced();

        expect(fn).not.toHaveBeenCalled();  // not yet

        jest.advanceTimersByTime(300);

        expect(fn).toHaveBeenCalledOnce();
    });
});
```

## A Complete Realistic Example

Here is a `UserService` class tested with full mocking of its HTTP dependency:

```typescript
// src/userService.ts
export interface User {
    id: number;
    name: string;
    email: string;
}

export class UserService {
    constructor(private baseUrl: string) {}

    async findById(id: number): Promise<User> {
        const res = await fetch(`${this.baseUrl}/users/${id}`);
        if (!res.ok) {
            throw new Error(`User ${id} not found`);
        }
        return res.json();
    }

    async create(data: Omit<User, 'id'>): Promise<User> {
        const res = await fetch(`${this.baseUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error('Failed to create user');
        }
        return res.json();
    }
}
```

```typescript
// src/userService.test.ts
import { UserService } from './userService';

const BASE_URL = 'https://api.example.com';

function makeFetchMock(body: unknown, status = 200) {
    return jest.fn().mockResolvedValue({
        ok: status < 400,
        status,
        json: jest.fn().mockResolvedValue(body),
    });
}

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        service = new UserService(BASE_URL);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns the user when found', async () => {
            global.fetch = makeFetchMock({ id: 1, name: 'Alice', email: 'alice@example.com' });

            const user = await service.findById(1);

            expect(user.name).toBe('Alice');
            expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/users/1`);
        });

        it('throws when the user is not found', async () => {
            global.fetch = makeFetchMock({ error: 'not found' }, 404);

            await expect(service.findById(99)).rejects.toThrow('User 99 not found');
        });
    });

    describe('create', () => {
        it('POSTs to the correct endpoint with JSON body', async () => {
            const created = { id: 2, name: 'Bob', email: 'bob@example.com' };
            global.fetch = makeFetchMock(created, 201);

            const user = await service.create({ name: 'Bob', email: 'bob@example.com' });

            expect(user.id).toBe(2);
            expect(global.fetch).toHaveBeenCalledWith(
                `${BASE_URL}/users`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' }),
                }),
            );
        });
    });
});
```

Chapter 5 covers the same mocking concepts for Java using Mockito.
