---
sidebar_position: 1
slug: /
title: Home
description: "Technical documentation and guides for AEM, Java, JavaScript, Strapi, and software design patterns."
---

# Luca Nerlich -- Tech Documentation

Reference documentation and practical guides for Adobe Experience Manager, Java, JavaScript, Strapi, and
software design patterns. Every page is built around real-world code examples and common pitfalls.

---

## Start Here -- Beginners' Guides

Multi-chapter guided introductions, from zero to working knowledge:

- [**AEM Beginners' Guide**](./aem/beginners-guide/01-introduction.md) -- 14 chapters covering JCR, Sling, OSGi, components, HTL, Sling Models, templates, clientlibs, and deployment
- [**Java Beginners' Guide**](./java/beginners-guide/01-introduction.md) -- 17 chapters from variables and control flow through streams, testing, and build tools
- [**JavaScript Beginners' Guide**](./javascript/beginners-guide/01-introduction.md) -- 15 chapters covering fundamentals, the DOM, events, TypeScript, error handling, and deployment
- [**Strapi Beginners' Guide**](./strapi/beginners-guide/01-introduction.md) -- 12 chapters on content modeling, REST API, authentication, lifecycle hooks, and deployment

---

## AEM

Comprehensive Adobe Experience Manager documentation covering the full stack.

- [Architecture](./aem/architecture.mdx) -- How Sling, JCR, and OSGi fit together in the request processing pipeline
- [Custom Component Guide](./aem/custom-component.mdx) -- End-to-end walkthrough: Sling Model, dialog, HTL template, and clientlib
- [Component Dialogs](./aem/component-dialogs.mdx) -- Copy-paste reference for Granite UI dialog widgets
- [Sling Models](./aem/backend/sling-models.mdx) -- Annotations, injectors, exporters, and best practices

## Java

Core Java language guides -- practical examples, pitfall tables, and patterns.

- [Streams and Collectors](./java/java-streams.md) -- Stream pipelines, groupingBy, partitioningBy, and parallel streams
- [Concurrency](./java/concurrency.md) -- Threads, ExecutorService, CompletableFuture, and Virtual Threads
- [Modern Java Features](./java/modern-java-features.md) -- Records, sealed classes, pattern matching (Java 11--21)
- [Generics](./java/generics.md) -- Bounded types, wildcards, PECS, and type erasure

## JavaScript

Practical JavaScript and TypeScript topics with code examples and browser compatibility notes.

- [Async/Await Patterns](./javascript/async-await-guide.md) -- Promises, error handling, concurrency control, and pitfalls
- [Intl API Formatting](./javascript/javascript-intl-api-formatting.md) -- Locale-aware number, date, and currency formatting
- [Error Handling](./javascript/javascript-error-handling.md) -- Custom error classes, global handlers, and structured reporting

## Strapi

Guides for building and extending a Strapi headless CMS.

- [Custom Controllers and Services](./strapi/custom-controllers-services.md) -- Extending core CRUD, custom actions, and service delegation
- [Relations and Population](./strapi/relations-and-population.md) -- Deep population, filtering, and performance optimization
- [Authentication and Permissions](./strapi/authentication-and-permissions.md) -- JWT flow, RBAC, API tokens, and OAuth providers

## Design Patterns

GoF patterns explained with Java and TypeScript examples -- creational, structural, and behavioural --
plus a section on [anti-patterns](./design-patterns/anti-patterns.mdx) and common misuse.

- [Pattern Overview](./design-patterns/overview.mdx) -- When and why to use each pattern
- [Glossary](./design-patterns/glossary.mdx) -- Quick reference for design pattern terminology

## More Topics

- [Content Modeling](./content-modeling.md) -- CMS-agnostic guide to content types, relations, and performance pitfalls
- [Git](./git.md) -- Branching strategies, merge vs rebase, interactive rebase, and commit conventions
- [Web Performance](./web-performance.md) -- Core Web Vitals, Lighthouse, image optimization, caching, and CDN patterns
- [Semantic HTML](./semantic-html.mdx) -- Element reference, accessibility, and common anti-patterns
- [Mermaid Diagrams](./other/mermaid-diagrams.mdx) -- Flowcharts, sequence diagrams, class diagrams, and more

---

## Projects

- [Steam5](https://steam5.org) -- Steam review guessing game. *Spring Boot, Next.js, PostgreSQL*
- [RSS-Analyzer](https://rssanalyzer.org) -- Audio RSS feed parser with aggregated release stats. *Java, Next.js*
- [EZ-Budget](https://ez-budget.lucanerlich.com) -- Monthly and yearly budget tracker. *Next.js, Bootstrap CSS*
- [Mindestens 10 Zeichen](https://m10z.de) -- Community gaming and media blog. *Docusaurus 3*
- [First Class Performance](https://first-class-performance.com/) -- Design, development, and hosting. *Strapi, Next.js, Material UI*
- [Complete Motion CrossFit](https://complete-motion-crossfit.de/) -- Design, development, and hosting. *Next.js, SCSS*
- [Nerlich / Puls GbR](https://pnn-it.de/) -- Business website. *Next.js, SCSS*

> All projects are self-hosted on a [Hetzner](https://www.hetzner.com/cloud) VPS using
> [Coolify](https://coolify.io/) and Docker.
> Lightweight, GDPR-friendly analytics via self-hosted [Umami](https://umami.is/).

---

## Contact

Questions, corrections, or content requests? Open
a [GitHub Issue](https://github.com/LucaNerlich/lucanerlich.com/issues) or reach out
at [luca.nerlich@gmail.com](mailto:luca.nerlich@gmail.com).
