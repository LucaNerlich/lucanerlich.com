---
title: "Forms and Interactions"
sidebar_label: "Forms & interactions"
description: Link text, navigation labels, form field labels, error messages, and mobile-first DOM order so users can act on the content you've structured.
slug: /web-content/forms-and-interactions
tags: [ux, forms, accessibility, content-design]
keywords:
  - link text
  - navigation
  - form labels
  - inline errors
  - aria-describedby
  - mobile-first
  - autocomplete
sidebar_position: 4
---

# Forms and interactions

Once a page tells users *what* you offer, they need to *act* on it -- click a link, fill a form, navigate elsewhere. Interaction copy and field affordances decide whether they succeed without thinking. Back to the [section overview](./overview.md).

## Links and navigation

**Link text** should make sense out of context (avoid "click here"). Match nav labels to page titles when reasonable.

### Do

```html
<p>
    Read the full
    <a href="/legal/privacy/">privacy policy</a>
    before you enable analytics cookies.
</p>

<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/docs/">Documentation</a></li>
        <li><a href="/docs/api/">API</a></li>
        <li aria-current="page">Authentication</li>
    </ol>
</nav>
```

### Don't

```html
<p>
    For more information about how we handle data,
    <a href="/legal/privacy/">click here</a>.
</p>
```

## Forms

Every control needs a **visible label**. Placeholder text is **not** a label. Associate errors with fields and write **specific** messages.

### Do

```html
<form>
    <div class="field">
        <label for="email">Work email</label>
        <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            aria-describedby="email-hint"
        >
        <p id="email-hint" class="hint">We send receipts and security alerts here.</p>
        <p id="email-error" class="error" hidden><!-- filled when invalid --></p>
    </div>
</form>
```

### Don't

```html
<!-- Placeholder as only label; error only at top of form -->
<form>
    <p class="form-error">There were errors with your submission.</p>
    <input placeholder="Email address *">
</form>
```

### Do (inline, actionable error)

```html
<label for="postal">Postal code</label>
<input
    id="postal"
    name="postal"
    type="text"
    inputmode="numeric"
    aria-invalid="true"
    aria-describedby="postal-error"
>
<p id="postal-error" class="error">
    Enter a valid German postcode (five digits).
</p>
```

## Mobile-first content order

Put the **main answer** early in the **DOM** so small screens and assistive tech hit it first -- not only below a huge decorative hero.

### Do

```html
<main>
    <h1>Opening hours</h1>
    <p>Monday–Friday 9:00–17:00 CET. Closed on public holidays in Berlin.</p>
    <figure class="hero-visual">
        <img src="/img/storefront.webp" alt="">
    </figure>
</main>
```

### Don't

```html
<!-- Critical facts only after large imagery -->
<main>
    <img class="hero-fullbleed" src="/img/campaign.webp" alt="">
    <h1>Opening hours</h1>
    <p>Monday–Friday 9:00–17:00...</p>
</main>
```

## Related

- [Microcopy and error states](./microcopy-and-error-states.md) -- the exact text for buttons, inline errors, and success confirmations.
- [Structure and hierarchy](./structure-and-hierarchy.md) -- where the form lives within the page.
- [Information architecture](./information-architecture.md) -- the navigation patterns that surround interactions.
