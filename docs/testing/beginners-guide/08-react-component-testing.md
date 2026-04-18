---
title: "React Component Testing"
sidebar_label: "React Component Testing"
description: React Testing Library setup, render/screen/fireEvent/userEvent, querying by role and text, testing forms, and testing components that fetch async data.
slug: /testing/beginners-guide/react-component-testing
tags: [testing, beginners, react, testing-library, jest, vitest]
keywords:
  - react testing library
  - render screen fireEvent
  - userEvent testing
  - testing react components
  - testing forms react
  - testing async react
sidebar_position: 8
---

# React Component Testing

Testing React components presents a unique challenge: components are not just functions that return a value — they render UI, respond to user events, manage state, and talk to APIs. The question is always what to test and at what level.

**React Testing Library (RTL)** answers this with a guiding philosophy: *test the way your users interact with the application, not the implementation details*. This means querying for elements the way a user finds them (by their visible text, their role, their label) and interacting with them through events, not by reaching into component internals.

## Setup

### With Jest

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest-environment-jsdom
```

Update `jest.config.ts`:

```typescript
const config: Config = {
    testEnvironment: 'jsdom',
    setupFilesAfterFramework: ['<rootDir>/src/setupTests.ts'],
};
```

Create `src/setupTests.ts`:

```typescript
import '@testing-library/jest-dom';
```

### With Vitest

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Update `vite.config.ts`:

```typescript
export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
    },
});
```

`src/setupTests.ts` is the same: `import '@testing-library/jest-dom';`

## The Core Concepts

### render()

`render()` mounts a React component into a virtual DOM. It returns a collection of query utilities, but most of the time you use the `screen` object instead because it scopes queries to the whole document.

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders the button label', () => {
    render(<Button label="Save changes" />);
    expect(screen.getByText('Save changes')).toBeInTheDocument();
});
```

### screen — Querying Elements

RTL provides three families of query:

| Family | `getBy` | `queryBy` | `findBy` |
|---|---|---|---|
| Throws if not found | Yes | No (returns null) | Yes (async) |
| Throws if multiple | Yes | Yes | Yes |
| Use when | Element must be present | Asserting absence | Element appears asynchronously |

Each family has a `*AllBy*` variant that returns an array.

#### Query Types

| Query | Finds element by | RTL priority |
|---|---|---|
| `ByRole` | ARIA role + accessible name | **First choice** |
| `ByLabelText` | `<label>` associated with input | Second for form fields |
| `ByPlaceholderText` | `placeholder` attribute | Avoid if possible |
| `ByText` | Visible text content | Good for non-interactive content |
| `ByDisplayValue` | Current value of input/select/textarea | For controlled inputs |
| `ByAltText` | `alt` attribute on images | Images |
| `ByTitle` | `title` attribute | Last resort |
| `ByTestId` | `data-testid` attribute | Last resort |

RTL strongly encourages `ByRole` because it simultaneously tests that your elements have correct semantic HTML and accessible names.

```typescript
// These all find the same "Submit" button:
screen.getByRole('button', { name: 'Submit' });   // preferred
screen.getByText('Submit');                        // ok
screen.getByTestId('submit-btn');                  // avoid
```

## Your First Component Test

```tsx
// src/components/Greeting.tsx
interface Props {
    name: string;
}

export function Greeting({ name }: Props) {
    return <h1>Hello, {name}!</h1>;
}
```

```tsx
// src/components/Greeting.test.tsx
import { render, screen } from '@testing-library/react';
import { Greeting } from './Greeting';

it('renders a greeting with the provided name', () => {
    render(<Greeting name="Alice" />);
    expect(screen.getByRole('heading', { name: 'Hello, Alice!' })).toBeInTheDocument();
});
```

## fireEvent vs userEvent

Both simulate user actions, but they differ significantly:

| Aspect | `fireEvent` | `userEvent` (v14+) |
|---|---|---|
| What it does | Fires a single DOM event | Simulates real user behaviour (multiple events, focus, keyboard) |
| Typing | `fireEvent.change(input, { target: { value: 'x' } })` | `await userEvent.type(input, 'hello world')` |
| Clicking | `fireEvent.click(button)` | `await userEvent.click(button)` |
| Use when | Simple, synchronous event tests | Any realistic user interaction |

Use `userEvent` for almost everything. It is more realistic and catches more bugs.

```typescript
import userEvent from '@testing-library/user-event';

// At the top of each test, set up userEvent
const user = userEvent.setup();

it('types into an input', async () => {
    render(<SearchInput />);
    const input = screen.getByRole('textbox', { name: /search/i });
    await user.type(input, 'testing library');
    expect(input).toHaveValue('testing library');
});
```

## Testing a Form

```tsx
// src/components/LoginForm.tsx
import { useState } from 'react';

interface Props {
    onSubmit: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Both fields are required');
            return;
        }
        onSubmit(email, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            {error && <p role="alert">{error}</p>}
            <button type="submit">Log in</button>
        </form>
    );
}
```

```tsx
// src/components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    beforeEach(() => {
        mockSubmit.mockClear();
        render(<LoginForm onSubmit={mockSubmit} />);
    });

    it('calls onSubmit with email and password when form is valid', async () => {
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'secret123');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(mockSubmit).toHaveBeenCalledOnce();
        expect(mockSubmit).toHaveBeenCalledWith('alice@example.com', 'secret123');
    });

    it('shows an error when fields are empty', async () => {
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Both fields are required');
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('shows an error when only email is provided', async () => {
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
});
```

## Testing Async Data Fetching

Components that fetch data on mount are common. Test them by mocking the data layer and using `findBy*` queries (which wait for the element to appear).

```tsx
// src/components/UserProfile.tsx
import { useEffect, useState } from 'react';

interface User { id: number; name: string; email: string; }

export function UserProfile({ userId }: { userId: number }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
            })
            .then(setUser)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p role="alert">Error: {error}</p>;
    if (!user) return null;

    return (
        <section>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
        </section>
    );
}
```

```tsx
// src/components/UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

function mockFetch(data: unknown, ok = true) {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        json: () => Promise.resolve(data),
    } as unknown as Response);
}

afterEach(() => jest.restoreAllMocks());

it('shows the user name and email after loading', async () => {
    mockFetch({ id: 1, name: 'Alice', email: 'alice@example.com' });

    render(<UserProfile userId={1} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // findBy waits for the element to appear (up to 1s by default)
    expect(await screen.findByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
});

it('shows an error message when the request fails', async () => {
    mockFetch({ error: 'not found' }, false);

    render(<UserProfile userId={99} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('User not found');
});
```

## Testing Context and Providers

When a component consumes a React context, wrap it in the provider for testing:

```tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext';
import { ThemedButton } from './ThemedButton';

function renderWithTheme(ui: React.ReactElement, theme = 'light') {
    return render(
        <ThemeProvider value={theme}>{ui}</ThemeProvider>
    );
}

it('applies dark class when theme is dark', () => {
    renderWithTheme(<ThemedButton>Click me</ThemedButton>, 'dark');
    expect(screen.getByRole('button')).toHaveClass('btn--dark');
});
```

Create a custom `renderWithProviders` helper that wraps in all your app's providers (router, theme, auth, store). Put it in a shared test utility file.

## Useful Jest-DOM Matchers

`@testing-library/jest-dom` extends Jest's `expect` with DOM-specific matchers:

```typescript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toBeEnabled();
expect(element).toHaveTextContent('hello');
expect(element).toHaveValue('alice@example.com');
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('href', '/about');
expect(element).toHaveFocus();
expect(element).toBeChecked();
```

## What Not to Test

RTL's philosophy helps avoid bad tests, but it is worth being explicit:

- **Do not test implementation details**: component state values, method calls on the component instance, internal event handler references
- **Do not test the library itself**: do not test that React renders your JSX — test that the rendered output is what a user would see
- **Do not snapshot everything**: see chapter 9 for when snapshots are appropriate
- **Do not duplicate coverage**: if `LoginForm` is already tested thoroughly, the page that renders it does not need to re-test the form logic

Focus your component tests on behaviour: what happens when a user does something, and what does the component display in each state (loading, success, empty, error).
