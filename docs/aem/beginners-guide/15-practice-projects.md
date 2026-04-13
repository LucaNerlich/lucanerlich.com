---
title: "Practice Projects"
sidebar_label: "Practice Projects"
description: Six hands-on projects -- from a simple component to a production Dispatcher config -- to reinforce everything covered in the guide.
slug: /aem/beginners-guide/practice-projects
tags: [aem, beginners]
keywords:
    - aem practice projects
    - aem learning exercises
    - aem hands-on
    - aem tutorial projects
    - aem beginner projects
sidebar_position: 15
---

# Practice Projects

Reading about AEM is one thing -- building with it is another. The projects below are designed to reinforce the skills
from this guide. They are ordered by difficulty and each one maps back to the chapters where the relevant concepts were
introduced.

None of these projects provide full solutions. They give you the goal, the skills you will practice, and enough hints
to get started. Figuring out the details is where the real learning happens.

| Difficulty       | Project                        | Time estimate | Key chapters |
|------------------|--------------------------------|---------------|--------------|
| **Beginner**     | FAQ Accordion Component        | 2--4 hours    | 4, 5, 6, 7   |
| **Beginner**     | Author Bio Card                | 2--4 hours    | 4, 5, 6, 7   |
| **Intermediate** | Blog Section with Listing Page | 4--8 hours    | 8, 9, 10     |
| **Intermediate** | Headless Event Calendar        | 4--8 hours    | 11           |
| **Advanced**     | Multi-Language Mini-Site       | 6--10 hours   | 12           |
| **Advanced**     | Production Dispatcher Config   | 4--6 hours    | 13           |

---

## Beginner projects

These projects focus on the component triad (HTL + dialog + Sling Model) covered in chapters 4--7. You should be
comfortable creating components, writing dialogs, and deploying to a local SDK instance before starting.

### Project 1 -- FAQ Accordion Component

Build a component that displays a list of frequently asked questions. Each item has a question and an answer. Authors
can add, remove, and reorder items in the dialog.

#### What you will build

- A component with a **multifield** dialog where each item has a question (textfield) and an answer (textarea or RTE)
- A **Sling Model** that reads the multifield items using `@ChildResource`
- An **HTL template** that renders each item as a collapsible accordion panel using `data-sly-repeat`
- **CSS** (via a component clientlib) for the accordion open/close behavior -- pure CSS with a checkbox or details/summary, or a small JS toggle

#### Skills practiced

- Multifield dialog with `composite="{Boolean}true"` (chapter 6)
- `@ChildResource` and nested Sling Models (chapter 7)
- `data-sly-repeat` and `data-sly-test` (chapter 5)
- Component clientlibs (chapter 9)
- BEM class naming with `cmp-` prefix (chapter 5)

#### Hints

- Start with the dialog. Use `granite/ui/components/coral/foundation/form/multifield` with a composite container
  holding `question` (textfield) and `answer` (textarea) fields.
- For the Sling Model, create a nested `FaqItem` model class with `@ValueMapValue` fields for `question` and `answer`.
  The parent model uses `@ChildResource private List<FaqItem> items;`.
- In HTL, the `<details>` and `<summary>` HTML elements give you native accordion behavior without JavaScript.
- Remember to set `defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL` and provide sensible defaults.

---

### Project 2 -- Author Bio Card

Build a card component that displays an author's information: name, role/title, avatar image, short biography, and a
list of social media links.

#### What you will build

- A dialog with a **textfield** (name), **textfield** (role), **file upload** (avatar), **textarea** (bio), and a
  **multifield** for social links (each with a label and URL)
- A **Sling Model** that exposes all fields, including the social links as a typed list
- An **HTL template** that renders the card with conditional sections (hide bio if empty, hide social links if none
  configured)

#### Skills practiced

- Image handling via `fileReference` (chapter 6)
- Pathfield for URLs (chapter 6)
- Conditional rendering with `data-sly-test` (chapter 5)
- Multifield + `@ChildResource` (chapters 6, 7)
- `@Default` values for safe initial rendering (chapter 7)

#### Hints

- For the avatar, use `granite/ui/components/coral/foundation/form/fileupload` with `fileReferenceParameter="./fileReference"`.
  In the Sling Model, inject the `fileReference` property with `@ValueMapValue`.
- Social links work like the multifield in chapter 6 -- each item has `platform` (select: LinkedIn, GitHub, Twitter)
  and `url` (textfield).
- Use `data-sly-test` to conditionally render the bio section and the social links list. An empty multifield means the
  `@ChildResource` list is null or empty.
- Consider using the proxy pattern: extend a Core Component (like the generic `container`) or build from scratch.

---

## Intermediate projects

These projects involve page-level structures, templates, and headless content. You should be comfortable with the
authoring UI, editable templates, and content modeling before starting.

### Project 3 -- Blog Section with Listing Page

Build a blog section for your site with an article template and a listing page that dynamically shows the latest
articles.

#### What you will build

- An **Article Page** editable template with a structured layout: hero area, body content container, sidebar, and
  related articles section
- **Component policies** on the template that restrict which components are allowed in each container
- A handful of authored **article pages** with titles, featured images, tags, and body content
- A **listing page** that displays article cards -- either using the **List** Core Component or a custom Sling Model
  with QueryBuilder

#### Skills practiced

- Editable templates and template types (chapter 8)
- Component policies and allowed components (chapter 8)
- Page properties in Sling Models (chapter 10)
- QueryBuilder for finding child pages (chapter 2)
- The Style System for card variants (chapter 8)
- Client libraries for the blog layout (chapter 9)

#### Hints

- Create a template type in your project's `/conf` config, then create an editable template from it in the UI.
- For the listing page, the simplest approach is the **List** Core Component configured to show child pages of
  `/content/mysite/en/blog`, sorted by last modified date.
- For a custom approach, build a `BlogListModel` Sling Model that uses `QueryBuilder` to find `cq:Page` nodes under
  the blog path. Return a list of simple objects with title, excerpt (from `jcr:description`), path, and image.
- Try the Style System: add a policy to the Teaser component with "Compact" and "Featured" style options that map to
  CSS classes.

---

### Project 4 -- Headless Event Calendar

Build a headless content structure for events and consume it from a standalone frontend page using GraphQL.

#### What you will build

- A **Content Fragment Model** for events with fields: title, date, location, description, category (enumeration), and
  an optional image reference
- At least five **Content Fragments** representing upcoming events
- **GraphQL queries** -- list all events, filter by category, sort by date
- A **persisted query** for the production-ready version
- A simple **standalone HTML/JS page** (outside AEM) that fetches events from the GraphQL endpoint and renders them

#### Skills practiced

- Content Fragment Models and field types (chapter 11)
- GraphQL queries, filtering, and sorting (chapter 11)
- Persisted queries (chapter 11)
- Headless content delivery architecture (chapter 11)

#### Hints

- Create the model in **Tools** > **General** > **Content Fragment Models** under your site config.
- For the enumeration field, define categories like `conference`, `workshop`, `meetup`, `webinar`.
- Start with ad-hoc queries in the GraphiQL IDE to prototype, then save as persisted queries.
- The standalone frontend can be as simple as a single HTML file with a `fetch()` call:

```javascript
// Local SDK only -- never hardcode credentials in production code.
// On Publish, persisted queries are public GETs and need no auth header.
const response = await fetch(
    'http://localhost:4502/graphql/execute.json/mysite/events-list',
    {
        headers: {
            'Authorization': 'Basic ' + btoa('admin:admin') // dev-only!
        }
    }
);
const { data } = await response.json();
```

> **Security:** The basic-auth header above is acceptable for a **local SDK** exercise only. In production, persisted
> queries on Publish are public GET requests that do not require authentication. Never ship hardcoded credentials in
> client-side code.

- Remember that on Publish, persisted queries use GET and are cacheable. On Author for local dev, you will need basic
  auth headers. Content Fragments must be **published** before they are visible on the Publish instance.

---

## Advanced projects

These projects touch operational and multi-site concerns. They require a running Author and Publish instance and
familiarity with the full guide.

### Project 5 -- Multi-Language Mini-Site

Create a small two-language site and configure AEM's translation and internationalization features.

#### What you will build

- A site with an **English** master and a **German** language copy (or any language pair you know)
- At least three pages per language (Home, About, Contact)
- **i18n dictionaries** for UI strings (button labels, navigation items, footer text)
- HTL templates that use `${'Read More' @ i18n}` for translatable strings
- The **Language Navigation** Core Component configured in the header
- A component that renders differently based on the current page language

#### Skills practiced

- Language copies and site structure (chapter 12)
- i18n dictionaries in the repository (chapter 12)
- HTL `@ i18n` expression option (chapter 5)
- `I18n` class in Java (chapter 12)
- Language Navigation component (chapter 10)
- Page properties and `currentPage.language` (chapter 10)

#### Hints

- Structure your site as `/content/mysite/en/` and `/content/mysite/de/`.
- Create the language copy via **Sites** > **Create** > **Language Copy** and choose "Create structure only" to start.
- For i18n dictionaries, create nodes under `/apps/mysite/i18n/en/` and `/apps/mysite/i18n/de/` with
  `sling:MessageEntry` nodes (see chapter 12).
- In HTL, `${'Read More' @ i18n}` automatically resolves based on the page's language. Test by viewing the same page
  under `/en/` and `/de/`.
- For the language-aware component, inject `currentPage` in your Sling Model and branch logic based on
  `currentPage.getLanguage()`.

---

### Project 6 -- Production-Ready Dispatcher Config

Starting from the archetype defaults, harden your Dispatcher configuration for a realistic production scenario.

#### What you will build

- **Security filters** that block access to sensitive paths (`/crx`, `/system/console`, `/bin`), dangerous selectors
  (`infinity`, `tidy`, `query`), and content-grabbing extensions
- **Cache rules** for HTML pages, static assets (CSS, JS, images, fonts), and GraphQL persisted query responses
- **Vanity URL rewrites** that map friendly URLs (e.g., `/products`) to content paths
- A `statfileslevel` configuration tuned for your site structure
- A **validated configuration** that passes the Dispatcher SDK validator

#### Skills practiced

- Dispatcher filters (chapter 13)
- Cache rules and stat file invalidation (chapter 13)
- URL rewrites (chapter 13)
- Dispatcher SDK validation (chapter 13)
- Security hardening (chapter 13)

#### Hints

- Work in the `dispatcher/src/` directory of your project.
- Start with a deny-all baseline in `filters.any`, then add explicit allows for `/content/*`,
  `/etc.clientlibs/*`, and `/graphql/execute.json/*`.
- Block selectors like `infinity`, `tidy`, `feed`, `query`, and `sysview` to prevent content exposure.
- For cache rules, allow `*.html`, `/etc.clientlibs/*`, and common static file extensions. Add an explicit allow for
  persisted GraphQL paths if you did Project 4.
- Set `statfileslevel` to `2` for a site like `/content/mysite/en/` -- this means publishing an article under
  `/en/blog/` does not invalidate the cache for `/en/about/`.
- Validate with `./bin/validator full dispatcher/src` from the Dispatcher SDK directory. Fix every warning -- the Cloud
  Manager pipeline rejects invalid configs.
- Test locally with `./bin/docker_run.sh dispatcher/src host.docker.internal:4503` and verify that admin paths return
  403, pages are cached (check `X-Dispatcher` response header), and vanity URLs resolve.

---

## What to do next

After completing these projects:

- **Read the reference docs** -- each chapter in this guide links to deeper reference material in the
  [AEM documentation section](/aem/architecture)
- **Explore AEM Core Components** -- browse the [component library](https://www.aemcomponents.dev) and try extending
  components beyond simple proxies
- **Write tests** -- add unit tests for your Sling Models using `io.wcm.testing.mock` and the `AemContext` framework
- **Try AEM Forms or AEM Assets** -- the platform has more capabilities beyond Sites
- **Join the community** -- the [AEM Community Forum](https://experienceleaguecommunities.adobe.com/t5/adobe-experience-manager/ct-p/adobe-experience-manager-community) and Adobe Developer Discord are good places to ask questions
