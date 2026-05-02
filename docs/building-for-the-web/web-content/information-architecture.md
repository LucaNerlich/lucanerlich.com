---
title: "Information Architecture"
sidebar_label: "Information architecture"
description: Site-level wayfinding -- primary, utility, and footer navigation, breadcrumbs, taxonomies, search UX, and URL slug design that survive content growth.
slug: /web-content/information-architecture
tags: [ux, ia, navigation, taxonomy, search, urls]
keywords:
  - information architecture
  - site navigation
  - breadcrumbs
  - taxonomy
  - faceted search
  - url design
  - utility navigation
  - footer navigation
sidebar_position: 8
---

# Information architecture

Page-level structure (covered in [Structure and hierarchy](./structure-and-hierarchy.md)) keeps a single page scannable. Information architecture is the **structure across pages**: how a user finds anything at all, how categories group what you publish, and how the URLs you mint today still make sense in two years. Back to the [section overview](./overview.md).

A site with great content and a confused IA feels like a library with no signage. Most users will leave before they find what would have helped them.

## Three kinds of navigation

Most websites need three navigation surfaces, each with a different job. Mixing them turns the header into noise.

| Surface | Purpose | Typical contents |
|---|---|---|
| **Primary** | Top tasks and main sections of the site. | Product, Pricing, Docs, Blog, Contact. |
| **Utility** | Account-, locale-, and tool-level controls. | Sign in, language switcher, search, notifications. |
| **Footer** | Comprehensive map for users who scroll to the bottom. | Sitemap, legal, social, status, accessibility statement. |

### Do (each surface has a clear job)

```html
<header>
    <a class="brand" href="/">Acme</a>

    <nav aria-label="Primary">
        <ul>
            <li><a href="/product/">Product</a></li>
            <li><a href="/pricing/">Pricing</a></li>
            <li><a href="/docs/">Docs</a></li>
            <li><a href="/blog/">Blog</a></li>
        </ul>
    </nav>

    <nav aria-label="Utility">
        <ul>
            <li><a href="/search/">Search</a></li>
            <li><a href="/login/">Sign in</a></li>
            <li><a class="button button--primary" href="/signup/">Start free</a></li>
        </ul>
    </nav>
</header>

<footer>
    <nav aria-label="Footer">
        <h2>Company</h2>
        <ul>
            <li><a href="/about/">About</a></li>
            <li><a href="/careers/">Careers</a></li>
            <li><a href="/legal/privacy/">Privacy</a></li>
        </ul>
    </nav>
</footer>
```

### Don't (one giant nav with everything in it)

```html
<nav>
    <a href="/">Home</a>
    <a href="/product/">Product</a>
    <a href="/login/">Sign in</a>
    <a href="/blog/">Blog</a>
    <a href="/legal/privacy/">Privacy</a>
    <a href="/status/">Status</a>
    <a href="/de/">DE</a>
    <a href="/careers/">Careers</a>
</nav>
```

## Active state and current page

Tell the user **where they are**. Use `aria-current="page"` for assistive tech, plus a visible style so sighted users can spot it.

### Do

```html
<nav aria-label="Primary">
    <ul>
        <li><a href="/product/">Product</a></li>
        <li><a href="/pricing/" aria-current="page">Pricing</a></li>
        <li><a href="/docs/">Docs</a></li>
    </ul>
</nav>
```

```css
[aria-current='page'] {
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 0.2em;
}
```

### Don't

```html
<!-- Active page styled only by colour, with no aria-current -->
<a href="/pricing/" style="color: red">Pricing</a>
```

## Breadcrumbs

Breadcrumbs help on **deep, hierarchical** sites (docs, e-commerce, knowledge bases). They're noise on shallow marketing sites. The current page is **not a link**.

### Do

```html
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/docs/">Documentation</a></li>
        <li><a href="/docs/api/">API</a></li>
        <li><a href="/docs/api/auth/">Authentication</a></li>
        <li aria-current="page">OAuth scopes</li>
    </ol>
</nav>
```

### Don't (last crumb is a link to itself)

```html
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/docs/">Documentation</a></li>
        <li><a href="/docs/api/auth/oauth-scopes/">OAuth scopes</a></li>
    </ol>
</nav>
```

## Taxonomies and labels

A taxonomy is the **vocabulary** users encounter when they browse: categories, tags, statuses, types. Pick **one word per concept** and use it everywhere. Avoid synonyms drift ("Articles" in nav, "Posts" in the URL, "Blog entries" in the heading).

### Do (consistent label across nav, URL, page heading, and breadcrumb)

```text
Nav label:   Articles
URL slug:    /articles/
Heading:     Articles
Breadcrumb:  Articles
```

### Don't (synonym drift)

```text
Nav label:   Blog
URL slug:    /posts/
Heading:     Articles
Breadcrumb:  News
```

### Faceted filtering for large collections

When a category contains more than ~30 items, pure hierarchy stops scaling. Add **facets** (orthogonal filters such as topic, level, year) so users can intersect dimensions.

```html
<aside aria-label="Filters">
    <fieldset>
        <legend>Topic</legend>
        <label><input type="checkbox" name="topic" value="performance"> Performance</label>
        <label><input type="checkbox" name="topic" value="accessibility"> Accessibility</label>
        <label><input type="checkbox" name="topic" value="security"> Security</label>
    </fieldset>

    <fieldset>
        <legend>Level</legend>
        <label><input type="radio" name="level" value="any" checked> Any</label>
        <label><input type="radio" name="level" value="beginner"> Beginner</label>
        <label><input type="radio" name="level" value="advanced"> Advanced</label>
    </fieldset>
</aside>
```

> Schema-level concerns -- which fields belong on a category, what relations connect a tag to its posts -- live in [Content Modeling](../content-modeling.md). IA is the user-facing layer on top of that schema.

## Search UX

Search is a **fallback for navigation**, not a replacement for it. It earns its place when content volume outgrows what a sidebar can list.

### Do (visible input, helpful empty result)

```html
<form role="search" action="/search/" method="get">
    <label for="q">Search the site</label>
    <input id="q" name="q" type="search" placeholder="e.g. invoices, webhooks">
    <button type="submit">Search</button>
</form>

<!-- Results page -->
<h1>Search results for "wbhook"</h1>
<p>No exact matches. Did you mean <a href="/search/?q=webhook">webhook</a>?</p>
<p>You can also browse <a href="/docs/api/">API documentation</a>.</p>
```

### Don't (search input that hides typed text and offers no recovery)

```html
<form action="/search/" method="get">
    <input name="q" placeholder="Search">
</form>
<!-- Results -->
<p>No results.</p>
```

### Recent and suggested queries

For frequent users, show **recent queries** and a small set of **popular ones** below the input. It cuts effort dramatically and seeds discovery for new users.

## URL and slug design

URLs are forever. People bookmark them, link to them from elsewhere, and search engines weight them. Mint them with care. Treat the URL as part of the content, not a footnote.

### Do

```text
/docs/api/authentication/
/blog/2026-04-payments-launch/
/pricing/teams/
```

### Don't

```text
/docs?id=83471
/p/?cat=2&sub=3&item=89
/blog/post-final-FINAL-v3/
```

### Slug rules

- **Lowercase**, hyphenated, no spaces or underscores.
- **Match the human label** for the page when possible: `/articles/structuring-content/`.
- **Stable**: never recycle a URL for unrelated content. When you do need to move a page, set up a 301 redirect.
- **Avoid** capturing implementation in the URL (`.php`, `.aspx`, query-string IDs, or session tokens).

### Localised URLs

If you serve multiple languages, include the locale at the **start of the path** and translate the slug too.

```text
/en/docs/api/authentication/
/de/docs/api/authentifizierung/
/fr/docs/api/authentification/
```

## Hub pages and content sequencing

Don't dump readers onto an alphabetical list. Write a short **hub page** for each major category that frames *what's here, who it's for, and where to start*.

### Do

```html
<main>
    <h1>API documentation</h1>
    <p>
        Build integrations with Acme. New here? Start with
        <a href="/docs/api/quickstart/">Quickstart</a>, then read
        <a href="/docs/api/authentication/">Authentication</a> before you ship.
    </p>

    <h2>Foundations</h2>
    <ul>
        <li><a href="/docs/api/quickstart/">Quickstart</a></li>
        <li><a href="/docs/api/authentication/">Authentication</a></li>
        <li><a href="/docs/api/errors/">Error codes</a></li>
    </ul>

    <h2>Reference</h2>
    <ul>
        <li><a href="/docs/api/customers/">Customers</a></li>
        <li><a href="/docs/api/invoices/">Invoices</a></li>
    </ul>
</main>
```

### Don't (alphabetical dump with no orientation)

```html
<h1>API</h1>
<ul>
    <li><a href="/docs/api/auth/">Auth</a></li>
    <li><a href="/docs/api/customers/">Customers</a></li>
    <li><a href="/docs/api/errors/">Errors</a></li>
    <li><a href="/docs/api/invoices/">Invoices</a></li>
    <li><a href="/docs/api/quickstart/">Quickstart</a></li>
</ul>
```

## A quick IA audit

When in doubt, ask these of any site you're shipping:

| Question | Why |
|---|---|
| Can a user state the site's purpose from the homepage in one sentence? | If not, the IA can't help -- the message is unclear. |
| Are there exactly **one** primary, **one** utility, and **one** footer nav? | More than that signals duplicate routes for the same goal. |
| Does the active page have `aria-current="page"`? | Disorientation kills sessions. |
| Do labels match URL slugs *and* page headings? | Synonym drift forces users to guess. |
| Does each major category have a hub page? | Bare lists offload work to the user. |
| Are URLs human-readable, lowercase, hyphenated, and stable? | They're long-lived, more than any individual paragraph. |
| Does search degrade gracefully (typos, no results)? | Search rescues nav failures; it shouldn't add new ones. |

## Related

- [Content Modeling](../content-modeling.md) -- the schema beneath the taxonomy.
- [Semantic HTML](../semantic-html.mdx) -- `<nav>`, `<header>`, `<footer>`, and landmark semantics.
- [Structure and hierarchy](./structure-and-hierarchy.md) -- IA's page-level counterpart.
- [Forms and interactions](./forms-and-interactions.md) -- search inputs and link-text patterns.
