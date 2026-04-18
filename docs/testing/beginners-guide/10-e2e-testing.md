---
title: "End-to-End Testing with Playwright"
sidebar_label: "E2E Testing (Playwright)"
description: Playwright setup, writing your first test, page navigation, clicks, form fills, selectors, headless execution, traces and screenshots on failure, and CI integration.
slug: /testing/beginners-guide/e2e-testing
tags: [testing, beginners, e2e, playwright, end-to-end]
keywords:
  - playwright setup
  - playwright test
  - e2e testing playwright
  - playwright ci
  - playwright selectors
  - playwright traces
sidebar_position: 10
---

# End-to-End Testing with Playwright

End-to-end (E2E) tests drive your application through a real (or headless) browser, exercising the full stack from the user interface down to the database. They are the highest-fidelity tests you can write — a passing E2E test means the feature works the way a real user would experience it.

[Playwright](https://playwright.dev/) is Microsoft's open-source browser automation library. It supports Chromium, Firefox, and WebKit (Safari's engine), runs headlessly in CI, and produces detailed traces and screenshots when tests fail.

## Installation

```bash
npm init playwright@latest
```

This runs an interactive setup that:
1. Creates a `playwright.config.ts`
2. Installs Playwright browser binaries
3. Creates an example test
4. Optionally sets up a GitHub Actions workflow

For manual installation:

```bash
npm install --save-dev @playwright/test
npx playwright install  # download browser binaries
```

## Configuration

`playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,         // fail if test.only is committed
    retries: process.env.CI ? 2 : 0,      // retry flaky tests in CI
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',           // capture trace on retry
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
```

Key settings:
- `baseURL` — all `page.goto('/')` calls are relative to this
- `trace: 'on-first-retry'` — generates a Playwright Trace (a rich recording) when a test is retried
- `webServer` — Playwright starts your dev server automatically before the tests and stops it after

## Your First Test

E2E tests live in the `e2e/` directory (configurable):

```typescript
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test('home page displays the main heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

Run all tests:

```bash
npx playwright test
```

Run a specific file:

```bash
npx playwright test e2e/home.spec.ts
```

Run with a headed browser (see what happens):

```bash
npx playwright test --headed
```

Open the interactive UI mode:

```bash
npx playwright test --ui
```

## Core Actions

### Navigation

```typescript
await page.goto('/');                            // relative to baseURL
await page.goto('https://example.com/login');    // absolute URL
await page.goBack();
await page.reload();
```

### Finding Elements

Playwright's locators are lazy — they are not evaluated until you interact with them. This means Playwright automatically waits for the element to appear.

```typescript
// By role (preferred — same philosophy as RTL)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Sign in' })

// By label
page.getByLabel('Password')

// By text
page.getByText('Welcome back')

// By placeholder
page.getByPlaceholder('Search...')

// By test ID (data-testid attribute)
page.getByTestId('user-avatar')

// CSS selector (fallback)
page.locator('.sidebar nav a')

// Chaining
page.getByRole('navigation').getByRole('link', { name: 'Home' })
```

### Clicking

```typescript
await page.getByRole('button', { name: 'Log in' }).click();
await page.getByText('Accept cookies').click();
await page.locator('.dropdown').click();
```

### Filling Forms

```typescript
await page.getByLabel('Email').fill('alice@example.com');
await page.getByLabel('Password').fill('secret123');
await page.getByRole('button', { name: 'Log in' }).click();
```

`fill()` clears the field and types the new value. Use `type()` for character-by-character typing (rarely needed).

### Selecting Options

```typescript
await page.getByRole('combobox', { name: 'Country' }).selectOption('Germany');
await page.getByRole('combobox').selectOption({ label: 'United Kingdom' });
```

### Checking Checkboxes

```typescript
await page.getByRole('checkbox', { name: 'Remember me' }).check();
await page.getByRole('checkbox', { name: 'Opt out' }).uncheck();
```

### Keyboard Input

```typescript
await page.keyboard.press('Enter');
await page.keyboard.press('Tab');
await page.getByRole('textbox').press('Control+A');
```

## Assertions

Playwright has built-in auto-waiting assertions. Every `expect()` call retries until the condition is met or the timeout expires (default 5 seconds):

```typescript
// Visibility
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await expect(page.getByRole('dialog')).not.toBeVisible();

// Text content
await expect(page.getByRole('status')).toHaveText('Saved successfully');
await expect(page.getByRole('alert')).toContainText('error');

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/users\/\d+/);

// Title
await expect(page).toHaveTitle('My App');

// Input value
await expect(page.getByLabel('Email')).toHaveValue('alice@example.com');

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);

// Attribute
await expect(page.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');

// Checked state
await expect(page.getByRole('checkbox', { name: 'Agree' })).toBeChecked();

// Disabled state
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
```

## A Full E2E Test: User Registration Flow

```typescript
// e2e/registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {

    test('completes registration with valid data', async ({ page }) => {
        await page.goto('/register');

        await page.getByLabel('Full name').fill('Alice Smith');
        await page.getByLabel('Email').fill('alice@example.com');
        await page.getByLabel('Password').fill('StrongPass1!');
        await page.getByLabel('Confirm password').fill('StrongPass1!');
        await page.getByRole('checkbox', { name: 'I agree to the Terms of Service' }).check();

        await page.getByRole('button', { name: 'Create account' }).click();

        // After successful registration, expect redirect to welcome page
        await expect(page).toHaveURL('/welcome');
        await expect(page.getByRole('heading', { name: 'Welcome, Alice!' })).toBeVisible();
    });

    test('shows validation errors for an empty form', async ({ page }) => {
        await page.goto('/register');
        await page.getByRole('button', { name: 'Create account' }).click();

        await expect(page.getByText('Full name is required')).toBeVisible();
        await expect(page.getByText('Email is required')).toBeVisible();
        await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('shows an error when passwords do not match', async ({ page }) => {
        await page.goto('/register');

        await page.getByLabel('Full name').fill('Bob Jones');
        await page.getByLabel('Email').fill('bob@example.com');
        await page.getByLabel('Password').fill('StrongPass1!');
        await page.getByLabel('Confirm password').fill('DifferentPass!');

        await page.getByRole('button', { name: 'Create account' }).click();

        await expect(page.getByText('Passwords do not match')).toBeVisible();
        await expect(page).toHaveURL('/register'); // did not navigate away
    });
});
```

## Page Object Model (POM)

As your test suite grows, duplicating locators across tests becomes a maintenance problem. The **Page Object Model** encapsulates a page's interactions into a reusable class:

```typescript
// e2e/pages/RegistrationPage.ts
import { Page, expect } from '@playwright/test';

export class RegistrationPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/register');
    }

    async fillName(name: string) {
        await this.page.getByLabel('Full name').fill(name);
    }

    async fillEmail(email: string) {
        await this.page.getByLabel('Email').fill(email);
    }

    async fillPassword(password: string) {
        await this.page.getByLabel('Password').fill(password);
        await this.page.getByLabel('Confirm password').fill(password);
    }

    async acceptTerms() {
        await this.page.getByRole('checkbox', { name: /Terms/ }).check();
    }

    async submit() {
        await this.page.getByRole('button', { name: 'Create account' }).click();
    }

    async register(name: string, email: string, password: string) {
        await this.fillName(name);
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.acceptTerms();
        await this.submit();
    }
}
```

```typescript
// e2e/registration.spec.ts (refactored)
import { test, expect } from '@playwright/test';
import { RegistrationPage } from './pages/RegistrationPage';

test('completes registration with valid data', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.register('Alice Smith', 'alice@example.com', 'StrongPass1!');

    await expect(page).toHaveURL('/welcome');
});
```

## Traces and Screenshots on Failure

When a test fails in CI, Playwright captures diagnostic artifacts:

- **Screenshot** — a PNG of the browser at the point of failure
- **Video** — a video recording of the entire test
- **Trace** — a rich recording that includes DOM snapshots, network activity, console logs, and a timeline

View a trace locally:

```bash
npx playwright show-trace trace.zip
```

The trace viewer (a web app) lets you step through the test action by action, see the DOM at each step, and inspect network requests. It makes debugging CI failures dramatically easier.

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: true

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

The `--with-deps` flag installs the OS dependencies (fonts, codecs) required by browser binaries. The HTML report artifact lets you browse test results after a CI run.

## Best Practices

**Write tests that look like user journeys**, not implementation checks. A test that opens the registration form, fills it in, and expects to land on a dashboard is meaningful. A test that checks the exact CSS class on a button is not.

**Use `data-testid` sparingly**. Prefer role-based selectors. If a role selector is unavailable (e.g., a custom component with no semantic role), `data-testid` is a reasonable escape hatch.

**Keep E2E tests slow in isolation, fast in total**. Each test should be independent (no shared state between tests). Use `beforeEach` to reset state via API calls rather than re-navigating through the UI.

**Seed your database via API, not the UI**. If your checkout test needs a logged-in user with items in the cart, create the user and items via API calls in `beforeEach`, then navigate directly to the cart page. Only test the UI path for the specific flow under test.

```typescript
test.beforeEach(async ({ request }) => {
    // Use Playwright's APIRequestContext to seed data
    await request.post('/api/test/seed', {
        data: { users: [{ email: 'test@example.com', password: 'pass' }] },
    });
});
```

**Avoid arbitrary `waitForTimeout` calls**. Playwright's auto-waiting handles most timing issues. Explicit waits are a sign that a locator or assertion can be improved.
