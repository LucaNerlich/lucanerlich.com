---
title: "Readability and Typography"
sidebar_label: "Readability & typography"
description: Plain language, defining jargon, microcopy basics, line measure, body type sizing, and responsive type that respects user defaults.
slug: /web-content/readability-and-typography
tags: [ux, readability, typography, content-design]
keywords:
  - readability
  - plain language
  - typography
  - line length
  - body font size
  - responsive type
  - measure
sidebar_position: 2
---

# Readability and typography

Comfortable reading is the floor for everything else on a page. If the line is too long, the type too small, or the words too dense, no amount of clever design saves the experience. Back to the [section overview](./overview.md).

## Language and tone

Plain language is not "dumbing down" -- it reduces **cognitive load** so people can act on what you say. Front-load the meaning: first sentence answers the question; supporting detail follows.

### Do

```text
Team plans include shared billing and priority support. You can add or remove
seats any time; we prorate the difference on your next invoice.
```

### Don't

```text
Leveraging our synergistic enterprise-grade paradigm, stakeholders who opt into
the cohort-oriented monetization stream will experience uplift across the
value realization funnel -- consult your success partner for enablement.
```

### Do (define terms once)

```text
We use single sign-on (SSO) so your team logs in with your company identity
provider (for example Okta or Microsoft Entra ID). After SSO is enabled,
password login stays available as a fallback unless you disable it.
```

### Don't (unexplained jargon)

```text
Enable IdP-initiated SAML SP flows on the tenant for JIT SCIM provisioning.
```

## Microcopy basics

Microcopy is the **small text** next to controls. It should say what happens next, not celebrate your brand. For a deeper reference -- buttons, validation, empty states, loading, success and error pages -- see [Microcopy and error states](./microcopy-and-error-states.md).

### Do

```text
Button: Save changes
Error: Enter an email address so we can send the receipt.
Empty state: No invoices yet. When you create one, it will appear here.
```

### Don't

```text
Button: Let's go!
Error: Invalid input
Empty state: Nothing to see here
```

## Typography and measure (CSS)

**Measure** is how long a line of text runs. For Latin scripts, roughly **45--75 characters** per line is a common comfortable range. **Line height** near **1.4--1.6** for body text improves readability on screens. **Root font size** at least **16px** (or `1rem`) for body copy respects user defaults and zoom.

### Do

```css
:root {
    font-size: 100%; /* respect user browser defaults; 1rem ~= 16px */
}

.prose {
    max-width: 65ch; /* "ch" ~= width of "0" -- line length tied to font */
    line-height: 1.55;
    font-size: 1rem;
}
```

### Don't

```css
/* Tiny base text and full viewport width make lines hard to track */
body {
    font-size: 12px;
    width: 100vw;
}

article p {
    line-height: 1.05;
}
```

### Do (responsive type without shrinking body below readable size)

```css
@media (min-width: 768px) {
    .prose {
        font-size: 1.0625rem;
    }
}
```

### Don't

```css
/* Shrinking primary reading text on mobile */
@media (max-width: 600px) {
    body {
        font-size: 11px;
    }
}
```

## Related

- [Structure and hierarchy](./structure-and-hierarchy.md) -- where to put headings and how dense paragraphs should be.
- [Color and contrast](./color-and-contrast.md) -- making the type you sized actually readable.
- [CSS: Colors and Typography](../../css/beginners-guide/04-colors-and-typography.md) -- the underlying CSS reference.
