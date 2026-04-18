---
title: "Snapshot & Visual Testing"
sidebar_label: "Snapshot & Visual Testing"
description: Jest snapshot testing pros and cons, updating snapshots, when to use them, and an introduction to Storybook for visual component testing.
slug: /testing/beginners-guide/snapshot-and-visual-testing
tags: [testing, beginners, snapshots, storybook, visual-testing, jest]
keywords:
  - jest snapshots
  - snapshot testing
  - toMatchSnapshot
  - storybook testing
  - visual regression testing
  - component snapshots
sidebar_position: 9
---

# Snapshot & Visual Testing

Snapshot testing captures the rendered output of a component (or any serialisable value) and saves it to a file. Subsequent test runs compare the current output against the saved snapshot — if they differ, the test fails. This sounds like a safety net but can become a maintenance burden if used carelessly.

This chapter covers Jest's built-in snapshot mechanism, its trade-offs, and how Storybook can complement or replace snapshots for visual component testing.

## Jest Snapshot Testing

### How It Works

On the first run, `toMatchSnapshot()` writes the snapshot to a `.snap` file next to the test. On every subsequent run, it compares the current value to the saved file.

```typescript
// src/components/Badge.test.tsx
import { render } from '@testing-library/react';
import { Badge } from './Badge';

it('renders a success badge', () => {
    const { container } = render(<Badge status="success">Active</Badge>);
    expect(container).toMatchSnapshot();
});
```

First run creates `__snapshots__/Badge.test.tsx.snap`:

```
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`renders a success badge 1`] = `
<div>
  <span
    class="badge badge--success"
  >
    Active
  </span>
</div>
`;
```

If you change the component — even adding a CSS class — the test fails until you update the snapshot.

### Updating Snapshots

```bash
# Update all snapshots
npx jest --updateSnapshot
npx jest -u

# Update snapshots for a specific file
npx jest Badge.test.tsx --updateSnapshot
```

Updating snapshots should be a **deliberate decision**, not a reflex. Always read the diff before updating to confirm the change is intentional.

### Inline Snapshots

Instead of writing to a `.snap` file, `toMatchInlineSnapshot()` writes the snapshot directly into the test source file. This keeps the expected output close to the assertion:

```typescript
it('renders a warning badge', () => {
    const { container } = render(<Badge status="warning">Expiring soon</Badge>);
    expect(container).toMatchInlineSnapshot(`
        <div>
          <span
            class="badge badge--warning"
          >
            Expiring soon
          </span>
        </div>
    `);
});
```

Inline snapshots are self-updating: `jest -u` rewrites the string in the source file. They are better than external snapshots because reviewers can see the expected HTML in the pull request diff.

### Snapshot Testing for Non-HTML Values

Snapshots are not limited to React output. They work on any serialisable JavaScript value:

```typescript
// Snapshot an API response shape
it('API response has the expected shape', () => {
    const response = buildApiResponse({ status: 'ok', count: 3 });
    expect(response).toMatchInlineSnapshot(`
        {
          "count": 3,
          "status": "ok",
          "timestamp": Any<String>,
        }
    `);
});
```

For dynamic values (timestamps, generated IDs), use asymmetric matchers:

```typescript
expect(response).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(String),
});
```

This lets you snapshot the stable parts of the response while ignoring volatile fields.

## The Pros and Cons of Snapshots

### When snapshots help

| Situation | Why snapshots work |
|---|---|
| Asserting a serialiser / template output | You want to catch any change to the formatted string |
| Stable, rarely-changing components (icons, atoms) | Changes are infrequent and always meaningful |
| Complex data transformation output | Easier to read than writing out every field |
| Catching accidental regressions in a UI library | Any diff needs human review |

### When snapshots hurt

| Situation | Why snapshots fail |
|---|---|
| Large component trees | The snapshot is hundreds of lines; reviewers approve `jest -u` without reading |
| Frequently updated components | Constant snapshot updates create noise |
| Snapshots that "test" third-party library output | You end up snapshotting React internals |
| Tests that should be asserting behaviour | A snapshot cannot tell you *why* a change matters |

### The Snapshot Anti-Pattern

The most common snapshot mistake is snapshotting an entire page component:

```typescript
// BAD: a 2000-line snapshot no one reads
it('renders the dashboard', () => {
    const { container } = render(<Dashboard />);
    expect(container).toMatchSnapshot(); // ← this is a liability
});
```

Every time any child component changes, this snapshot breaks. Developers run `jest -u` without reviewing. The snapshot drifts from reality.

**Better approach**: test behaviour explicitly in RTL, and snapshot only small, stable leaf components:

```typescript
// GOOD: small, stable atom
it('renders a pill badge', () => {
    const { container } = render(<PillBadge color="green">Active</PillBadge>);
    expect(container.firstChild).toMatchInlineSnapshot(`
        <span class="pill pill--green">Active</span>
    `);
});
```

## Storybook for Visual Testing

[Storybook](https://storybook.js.org/) is a tool for developing and documenting UI components in isolation. Each "story" is a component rendered with a specific set of props. Stories serve as:

- A living component catalogue
- A manual QA surface
- A foundation for automated visual regression tests

### Setting Up Storybook

```bash
npx storybook@latest init
```

This detects your framework (React, Vue, Svelte) and configures Storybook automatically.

### Writing Stories

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
    component: Button,
    title: 'Components/Button',
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'danger'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Click me',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Cancel',
    },
};

export const Danger: Story = {
    args: {
        variant: 'danger',
        children: 'Delete account',
    },
};

export const Disabled: Story = {
    args: {
        variant: 'primary',
        children: 'Unavailable',
        disabled: true,
    },
};
```

Run the Storybook dev server:

```bash
npm run storybook
```

### Storybook Interaction Tests

The `@storybook/addon-interactions` addon lets you write play functions that simulate user interactions inside a story:

```tsx
import { userEvent, within } from '@storybook/test';

export const FilledForm: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.type(
            canvas.getByLabelText('Email'),
            'alice@example.com'
        );
        await userEvent.type(
            canvas.getByLabelText('Password'),
            'secret123'
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Log in' }));

        await expect(
            canvas.getByText('Login successful')
        ).toBeInTheDocument();
    },
};
```

These play functions run in the browser and can be executed as part of a CI pipeline with `storybook test`.

### Storybook Test Runner

The Storybook test runner (backed by Playwright) runs all stories headlessly and executes their play functions:

```bash
npm install --save-dev @storybook/test-runner
```

```json
{
    "scripts": {
        "test:storybook": "test-storybook"
    }
}
```

This gives you automated interaction testing of every story without writing a separate test file.

### Visual Regression Testing with Chromatic

[Chromatic](https://www.chromatic.com/) is a cloud service built by the Storybook team. It renders every story across browsers, takes screenshots, and flags pixel-level differences for human review.

```bash
npm install --save-dev chromatic
```

```bash
npx chromatic --project-token=<your-token>
```

In CI:

```yaml
# .github/workflows/chromatic.yml
- name: Publish to Chromatic
  uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

The workflow:
1. Chromatic runs on every PR
2. If a story's screenshot changes, Chromatic asks for review
3. A human approves intended changes; unintended ones are flagged as bugs

This workflow is the industry standard for catching visual regressions in component libraries.

## Choosing the Right Tool

| Need | Tool |
|---|---|
| Asserting component renders without crashing | RTL `render` + `toBeInTheDocument` |
| Testing component behaviour (clicks, forms) | RTL + `userEvent` |
| Preventing unintended HTML structure changes in small atoms | Inline snapshot |
| Visual documentation and manual QA | Storybook stories |
| Automated interaction testing from stories | Storybook test runner |
| Visual regression across browsers | Chromatic (or Percy / Applitools) |

The practical default for most applications: **use RTL for all behaviour tests, Storybook stories for documentation and manual review, and inline snapshots sparingly for stable leaf components**. Add visual regression tools when you are maintaining a shared component library or a design system.
