---
title: "Microcopy and Error States"
sidebar_label: "Microcopy & error states"
description: How to write button labels, validation errors, empty states, loading states, success confirmations, and 404 pages so users always know what just happened and what to do next.
slug: /web-content/microcopy-and-error-states
tags: [ux, microcopy, content-design, error-states, empty-states]
keywords:
  - microcopy
  - error messages
  - empty state
  - loading state
  - 404 page
  - confirmation
  - aria-live
sidebar_position: 5
---

# Microcopy and error states

Microcopy is the **small text around controls and status changes** -- buttons, helper text, validation messages, empty placeholders, loading indicators, success toasts, and error pages. Done well it's almost invisible. Done badly it stops the user cold. This chapter is the canonical reference for those tiny strings. Back to the [section overview](./overview.md).

The rules are simple and they all fall out of one principle: tell the user **what just happened** and **what they can do next**. Never assume the user can see your screen, hear your sound, or trust the system.

## Buttons and primary actions

A button label is a **promise of an outcome**, written in the user's words. Use **verb + object** ("Save changes", "Send invitation"). Avoid generic "Submit", "OK", or destructive verbs without an object ("Delete" alone is ambiguous when several things could be deleted).

### Do

```html
<button type="submit">Send invitation</button>
<button type="button" class="button--danger">Delete account</button>
<button type="button" class="button--secondary">Cancel</button>
```

### Don't

```html
<button>Submit</button>
<button>OK</button>
<button>Yes</button>
<button>Confirm</button>
```

### Do (label matches the headline of the action)

```html
<h2>Cancel subscription</h2>
<p>Your team keeps access until the end of the current billing period.</p>
<button type="button" class="button--danger">Cancel subscription</button>
```

### Don't (mismatch between heading and button)

```html
<h2>Cancel subscription</h2>
<button type="button" class="button--danger">Confirm</button>
```

## Helper text and field hints

Use helper text to **prevent** errors before they happen. Place it near the field, link it with `aria-describedby`, and write it as plain instruction. If the rule is short, put it inline; if it's nuanced, link to docs.

### Do

```html
<label for="slug">URL slug</label>
<input id="slug" name="slug" type="text" aria-describedby="slug-hint">
<p id="slug-hint" class="hint">
    Lowercase letters, numbers, and hyphens. Used in the public URL.
</p>
```

### Don't

```html
<!-- Hint hidden in a tooltip far from the field -->
<label for="slug">URL slug <abbr title="?">?</abbr></label>
<input id="slug" name="slug" type="text">
```

## Validation errors

A good error message names **what went wrong**, **why**, and **how to fix it**. Render it inline next to the field, and announce it to assistive tech.

### Do (specific, actionable, attached to the field)

```html
<label for="email">Email</label>
<input
    id="email"
    name="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
>
<p id="email-error" class="error" role="alert">
    Enter an email address that includes "@" -- for example, you@company.com.
</p>
```

### Don't

```html
<!-- Vague, far from the field, not announced -->
<input id="email" name="email" type="email">
<p class="error">Invalid input.</p>
```

### Do (server-side errors point at the offending fields)

```html
<form aria-describedby="form-summary">
    <p id="form-summary" class="error" role="alert">
        We couldn't save your profile. The two fields below need attention.
    </p>

    <label for="display-name">Display name</label>
    <input id="display-name" aria-invalid="true" aria-describedby="display-name-error" value="">
    <p id="display-name-error" class="error">Display name can't be empty.</p>

    <label for="website">Website</label>
    <input id="website" aria-invalid="true" aria-describedby="website-error" value="not-a-url">
    <p id="website-error" class="error">Use a full URL starting with https://.</p>
</form>
```

## Empty states

An empty state is **the first thing a user sees in a feature**. It should explain what the feature is for, show what success looks like, and offer a clear next step.

### Do

```html
<section class="empty-state">
    <h2>No invoices yet</h2>
    <p>
        When you send your first invoice, it will appear here so you can track
        payment status and resend reminders.
    </p>
    <p>
        <a class="button button--primary" href="/invoices/new/">Create invoice</a>
        <a class="button button--ghost" href="/docs/invoices/">How invoicing works</a>
    </p>
</section>
```

### Don't

```html
<section class="empty-state">
    <h2>Nothing to see here</h2>
    <p>You have no items.</p>
</section>
```

### Do (filtered empty state explains the filter, not the feature)

```html
<section class="empty-state">
    <h2>No invoices match "draft"</h2>
    <p>You have 12 sent invoices and 3 paid invoices. Try a different status.</p>
    <button type="button">Clear filters</button>
</section>
```

## Loading states

Loading copy reassures the user that **work is happening** and gives a sense of duration when possible. For anything over ~300ms, render an indicator. For long jobs, show progress.

### Do (short waits)

```html
<button type="submit" aria-busy="true" disabled>
    <span class="spinner" aria-hidden="true"></span>
    Sending...
</button>
```

### Do (long jobs with progress)

```html
<div role="status" aria-live="polite">
    <p>Importing 312 of 1,400 contacts. This usually takes about a minute.</p>
    <progress max="1400" value="312">22%</progress>
</div>
```

### Don't

```html
<!-- No indicator; user does not know whether it is working -->
<button type="submit">Send</button>
```

```html
<!-- Spinner with no label and no aria-live -->
<div class="spinner"></div>
```

### Skeletons over spinners for content placeholders

When you can predict the shape of the eventual content (a list of cards, a table row), render a **skeleton** that mirrors that shape. It tells the user *what* is loading, not just *that* something is.

```html
<ul class="skeleton-list" aria-busy="true" aria-label="Loading invoices">
    <li class="skeleton-row"></li>
    <li class="skeleton-row"></li>
    <li class="skeleton-row"></li>
</ul>
```

## Success and confirmation

Confirm a completed action **near where the action happened**, in the user's words. Avoid celebratory exclamations that delay the user's next decision.

### Do

```html
<div role="status" aria-live="polite" class="toast toast--success">
    Invitation sent to alex@company.com.
    <button type="button">Send another</button>
</div>
```

### Don't

```html
<div class="toast toast--success">
    Hooray! Operation completed successfully!
</div>
```

### Destructive confirmations spell out the consequence

```html
<dialog open aria-labelledby="confirm-title" aria-describedby="confirm-body">
    <h2 id="confirm-title">Delete project "Q4 launch"?</h2>
    <p id="confirm-body">
        This permanently deletes 24 tasks and 6 attachments. You can't undo it.
    </p>
    <button type="button" class="button--danger">Delete project</button>
    <button type="button" class="button--secondary">Keep project</button>
</dialog>
```

## 404 and other error pages

A "page not found" is still a page on your site. Tell the user **where they ended up**, **why it might have happened**, and **what to do**.

### Do

```html
<main>
    <h1>We can't find that page</h1>
    <p>
        The link might be old, or the page may have moved. Try one of these:
    </p>
    <ul>
        <li><a href="/">Go to the homepage</a></li>
        <li><a href="/docs/">Browse the documentation</a></li>
        <li><a href="/search/">Search the site</a></li>
    </ul>
</main>
```

### Don't

```html
<main>
    <h1>404</h1>
    <p>Error.</p>
</main>
```

### 5xx pages: don't blame the user

```html
<main>
    <h1>Something went wrong on our side</h1>
    <p>
        Try again in a minute. If it keeps happening, email
        <a href="mailto:support@example.com">support@example.com</a>
        and include the request ID below so we can investigate.
    </p>
    <p><code>Request ID: 7a2c-f31b-9dd0</code></p>
</main>
```

## Voice and consistency

Keep verbs consistent across the site -- pick "Delete" *or* "Remove" *or* "Trash" and use it everywhere for the same action. Same for status words ("Draft", "Pending", "Published") and time formats. A short style sheet kept in your repo is enough.

### Do

```text
Delete  (not Remove, Trash, Discard)
Save    (not Apply, Submit, Confirm)
Edit    (not Modify, Change)
```

### Don't

```text
Two buttons in the same flow:
  "Save changes" and "Submit"
Two destructive variants:
  "Delete invoice" on one screen, "Trash invoice" on the next
```

## Quick reference

| Surface | Do | Don't |
|---|---|---|
| Button | "Send invitation" | "Submit" |
| Inline error | "Enter five digits for a German postcode." | "Invalid input." |
| Empty state | Names the feature, shows next step. | "Nothing to see here." |
| Loading | "Importing 312 of 1,400 contacts..." | Bare spinner. |
| Success | "Invitation sent to alex@company.com." | "" |
| 404 | Explains and offers next steps. | "404." |

## Related

- [Forms and interactions](./forms-and-interactions.md) -- where most of these strings actually live.
- [Readability and typography](./readability-and-typography.md) -- voice, plain language, line measure.
- [Color and contrast](./color-and-contrast.md) -- making error and success colour cues accessible.
