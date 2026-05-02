---
title: "Structure and Hierarchy"
sidebar_label: "Structure & hierarchy"
description: Headings, landmarks, lists, page hierarchy, progressive disclosure, emphasis, calls to action, and whitespace -- how to make a page scannable and focused.
slug: /web-content/structure-and-hierarchy
tags: [ux, content-design, accessibility, visual-hierarchy]
keywords:
  - heading levels
  - landmarks
  - page hierarchy
  - progressive disclosure
  - calls to action
  - visual hierarchy
  - whitespace
sidebar_position: 3
---

# Structure and hierarchy

Structure is what lets a reader skim a page in five seconds and decide whether to keep reading. Headings are signposts, lists group parallel ideas, and visual emphasis points to the one thing that matters most on screen. Back to the [section overview](./overview.md).

## Headings, landmarks, and sections

Use **one `<h1>`** per page. Increase heading level **by one** per nesting depth (`h1` → `h2` → `h3`). Headings are **signposts**, not slogans.

### Do

```html
<main>
    <h1>Pricing</h1>
    <p>Simple plans for teams and individuals.</p>

    <h2>Compare plans</h2>
    <!-- comparison content -->

    <h2>FAQ</h2>
    <h3>Can I change plans later?</h3>
    <p>Yes. Upgrades take effect immediately; downgrades apply next cycle.</p>
</main>
```

### Don't

```html
<!-- Multiple h1s and skipped levels confuse outline and assistive tech -->
<body>
    <h1>Pricing</h1>
    <h4>Compare plans</h4>
    <h2>FAQ</h2>
    <h1>Contact</h1>
</body>
```

### Do (heading text describes content)

```html
<h2>Shipping to the EU</h2>
```

### Don't (vague or purely promotional headings)

```html
<h2>Learn more</h2>
<h2>Discover the future</h2>
```

## Lists versus paragraphs

Use **unordered lists** for parallel options or facts; **ordered lists** for sequences; **paragraphs** when sentences flow as a narrative.

### Do

```html
<p>Your export includes:</p>
<ul>
    <li>invoice PDFs for the date range you selected</li>
    <li>a CSV of line items</li>
    <li>a manifest JSON file for auditors</li>
</ul>
```

### Don't (lazy bullets for one sentence)

```html
<ul>
    <li>We offer exports because many customers need them for accounting.</li>
</ul>
```

### Do (steps)

```html
<ol>
    <li>Open Settings → Billing.</li>
    <li>Click <strong>Download invoices</strong>.</li>
    <li>Choose a date range and confirm.</li>
</ol>
```

## One primary job per page

Pick **one outcome** (sign up, compare, contact, read). Reflect that in the **hero**: headline, one or two lines of support, then the **primary action**.

### Do

```html
<section class="hero" aria-labelledby="hero-title">
    <h1 id="hero-title">Ship invoices faster</h1>
    <p>Create and send compliant invoices in minutes. No card required to try.</p>
    <p>
        <a class="button button--primary" href="/signup/">Start free trial</a>
        <a class="button button--ghost" href="/pricing/">View pricing</a>
    </p>
</section>
```

### Don't

```html
<!-- Same visual weight on three competing actions -->
<section>
    <h1>Welcome</h1>
    <a class="button" href="/signup/">Sign up</a>
    <a class="button" href="/demo/">Book demo</a>
    <a class="button" href="/whitepaper/">Download PDF</a>
</section>
```

## Progressive disclosure

Put **answers first**; move exceptions, legal text, and rare cases behind **accordions**, **details**, or secondary pages.

### Do

```html
<section aria-labelledby="returns-heading">
    <h2 id="returns-heading">Returns</h2>
    <p>
        You can return unused items within 30 days for a full refund. Start a
        return from your order history.
    </p>
    <details>
        <summary>Exceptions for opened software and gift cards</summary>
        <p>Opened license keys and gift cards are non-refundable except where
        required by law.</p>
    </details>
</section>
```

### Don't

```html
<!-- Burying the policy users need inside a long wall of text -->
<p>
    Acme Corp was founded in 1998. Our return policy, which may be updated
    from time to time at our sole discretion, except where prohibited,
    indicates that unless otherwise stated on the product page or in your
    jurisdiction, items may be returned within thirty (30) calendar days...
</p>
```

## Chunking long articles

Prefer **sections with descriptive `h2` headings** over kilometre-long paragraphs. Aim for **2--4 short paragraphs** per section before another heading or list.

### Do

```html
<h2>Configure webhooks</h2>
<p>
    Webhooks notify your server when events happen -- for example when a
    payment succeeds.
</p>
<p>
    Create an endpoint URL that accepts <code>POST</code> requests and verify
    the signature header on each request.
</p>
<h3>Retry behaviour</h3>
<p>Failed deliveries retry with exponential backoff for up to three days.</p>
```

### Don't

```html
<p>
    Webhooks notify your server when events happen and you should create an
    endpoint URL that accepts POST requests and verify the signature header
    and if delivery fails we retry with exponential backoff for up to three
    days and you can also filter events in the dashboard and...
</p>
```

## Emphasis in prose

**Bold** highlights a word or phrase in context. **Italics** suit titles or gentle emphasis. Avoid shouting with **all caps** in body copy.

### Do

```html
<p>
    Click <strong>Save draft</strong> to keep your changes without publishing.
</p>
```

### Don't

```html
<p>
    Click <strong>Save draft to keep your changes without publishing because
    otherwise you might lose work on this page which would be very bad</strong>.
</p>
```

### Don't (status by color alone)

```html
<!-- Screen readers and many colour-blind users miss "green means OK" -->
<p><span style="color: #0a0">Published</span></p>
```

### Do (color plus text or icon with accessible name)

```html
<p>
    <span class="badge badge--success">
        <span class="badge__icon" aria-hidden="true">&#10003;</span>
        Published
    </span>
</p>
```

## Calls to action (CTAs)

**One primary button** per region when you can. Match **label to outcome** ("Delete account" not "Yes"). Secondary actions are visually quieter.

### Do

```html
<div class="cta-row">
    <button type="button" class="button button--primary">
        Send invitation
    </button>
    <button type="button" class="button button--secondary">
        Cancel
    </button>
</div>
```

```css
.button--primary {
    background: var(--color-action);
    color: var(--color-on-action);
    font-weight: 600;
}

.button--secondary {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
}
```

### Don't

```html
<div class="cta-row">
    <button type="button" class="button button--primary">OK</button>
    <button type="button" class="button button--primary">Submit</button>
    <button type="button" class="button button--primary">Continue</button>
</div>
```

## Noise and whitespace

Every **sticky bar**, modal, and sidebar competes with your content. Whitespace **groups** related items and **separates** unrelated blocks.

### Do

```css
.section {
    padding-block: 3rem;
}

.section + .section {
    border-top: 1px solid var(--color-border-subtle);
}

.stack-tight > * + * {
    margin-top: 0.75rem;
}

.stack-loose > * + * {
    margin-top: 1.5rem;
}
```

### Don't

```css
/* Packing everything into one box -- headings, ads, and unrelated promos */
.cluster {
    padding: 0.25rem;
    border: 1px solid #ccc;
}

.cluster * {
    margin: 0;
}
```

## Related

- [Forms and interactions](./forms-and-interactions.md) -- where users actually act on what you've structured.
- [Information architecture](./information-architecture.md) -- structure across pages, not just within one.
- [Semantic HTML](../semantic-html.mdx) -- the elements behind landmarks and headings.
