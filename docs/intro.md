---
sidebar_position: 1
slug: /
title: Home
description: "Technical documentation and guides for AEM, Java, JavaScript, Strapi, and software design patterns."
---

# Luca Nerlich - Tech Documentation

Code-first reference guides for Adobe Experience Manager, Java, JavaScript, Strapi, AI, and web development.
Built around real-world examples and the pitfalls that actually trip you up.

---

## Most Popular

- [Touch UI Component Dialogs](./aem/component-dialogs.mdx) - 2,800+ lines of copy-paste-ready Granite UI dialog XML. Empty templates, complex fields, show/hide logic, multifields, RTE config, and validation.
- [Groovy Console Scripts](./aem/groovy-console.mdx) - 30+ ready-to-run script templates for bulk activation, content migration, workflow ops, and AEM maintenance.
- [Custom Component Guide](./aem/custom-component.mdx) - End-to-end walkthrough: Sling Model, dialog, HTL, clientlibs, and OSGi service - everything in one page.
- [AEM Architecture](./aem/architecture.mdx) - How Sling, JCR, and OSGi fit together, with a minimal component example.
- [AEM Recipes](./aem/recipes.mdx) - Task-oriented checklists for dynamic dropdowns, headless delivery, slow queries, bulk-editing, and debugging.

---

## Start Here - Beginners' Guides

Multi-chapter guided introductions, from zero to working knowledge:

- [**AEM Beginners' Guide**](./aem/beginners-guide/01-introduction.md) - 22 chapters covering JCR, Sling, OSGi, components, HTL, Sling Models, templates, clientlibs, and deployment
- [**Java Beginners' Guide**](./java/beginners-guide/01-introduction.md) - 17 chapters from variables and control flow through streams, testing, and build tools
- [**JavaScript Beginners' Guide**](./javascript/beginners-guide/01-introduction.md) - 15 chapters covering fundamentals, the DOM, events, TypeScript, error handling, and deployment
- [**Strapi Beginners' Guide**](./strapi/beginners-guide/01-introduction.md) - 12 chapters on content modeling, REST API, authentication, lifecycle hooks, and deployment

---

## By Topic

### AEM - Adobe Experience Manager

67+ pages across architecture, components, backend, content, infrastructure, and Edge Delivery Services.

- [Architecture](./aem/architecture.mdx) - Request pipeline: Sling, JCR, OSGi
- [Custom Component Guide](./aem/custom-component.mdx) - Full-stack component walkthrough
- [Component Dialogs](./aem/component-dialogs.mdx) - Granite UI dialog XML copy-paste reference
- [HTL Templates](./aem/htl-templates.mdx) - Sightly template language reference
- [Sling Models](./aem/backend/sling-models.mdx) - Annotations, injectors, exporters, best practices
- [Groovy Console](./aem/groovy-console.mdx) - Script templates and API reference
- [Client Libraries](./aem/client-libraries.mdx) - CSS/JS bundling, aggregation, caching
- [AEM Recipes](./aem/recipes.mdx) - How-tos that stitch the deep-dives into workflows
- [Edge Delivery Services](./aem/edge-delivery/overview.mdx) - Blocks, authoring, Universal Editor, Admin API

### AI

Practical introductions to the building blocks of modern AI, from LLMs through agents and RAG to production operations.

- [Large Language Models](./ai/llm.md) - How an LLM works, how it is trained, what it is and is not good at
- [AI Agents](./ai/agents.md) - Tool use, multi-agent patterns, MCP and A2A protocols
- [RAG](./ai/rag.md) - Grounding LLMs with embeddings, vector databases, and hybrid retrieval
- [Build a Local LLM App](./ai/local-llm-app.md) - Run Ollama or LM Studio and connect a simple app
- [Glossary](./ai/glossary.md) - Quick definitions for all AI terms on the site

### Java

20+ pages covering core language features, the standard library, and modern Java (11-21).

- [Streams and Collectors](./java/java-streams.md) - Pipelines, groupingBy, partitioningBy, parallel streams
- [Concurrency](./java/concurrency.md) - Threads, ExecutorService, CompletableFuture, Virtual Threads
- [Modern Java Features](./java/modern-java-features.md) - Records, sealed classes, pattern matching
- [Testing](./java/testing.md) - JUnit 5, Mockito, AssertJ
- [Maven](./java/maven.md) - POM structure, dependencies, multi-module projects
- [Generics](./java/generics.md) - Bounded types, wildcards, PECS, type erasure

### JavaScript

15+ pages of practical JS and TypeScript with code examples and browser compatibility notes.

- [Async/Await Patterns](./javascript/async-await-guide.md) - Promises, error handling, concurrency control, pitfalls
- [Intl API Formatting](./javascript/javascript-intl-api-formatting.md) - Locale-aware number, date, currency formatting
- [Error Handling](./javascript/javascript-error-handling.md) - Custom error classes, global handlers, structured reporting
- [Performance Basics](./javascript/javascript-performance-basics.md) - Big O, memoization, debouncing, profiling

### Strapi

Guides for building and extending a Strapi headless CMS.

- [Custom Controllers and Services](./strapi/custom-controllers-services.md) - Extending core CRUD, custom actions, service delegation
- [Relations and Population](./strapi/relations-and-population.md) - Deep population, filtering, performance optimization
- [Authentication and Permissions](./strapi/authentication-and-permissions.md) - JWT flow, RBAC, API tokens, OAuth

### Design Patterns

23 GoF patterns with Java and TypeScript examples - creational, structural, and behavioural.

- [Overview](./design-patterns/overview.mdx) - When and why to use each pattern
- [Anti-Patterns](./design-patterns/anti-patterns.mdx) - Common misuse and what to do instead
- [Glossary](./design-patterns/glossary.mdx) - Quick reference for pattern terminology

### More Topics

- [Content Modeling](./building-for-the-web/content-modeling.md) - CMS-agnostic guide to types, relations, and performance
- [Web Performance](./building-for-the-web/web-performance.md) - Core Web Vitals, Lighthouse, caching, CDN
- [Semantic HTML](./building-for-the-web/semantic-html.mdx) - Element reference, accessibility, anti-patterns
- [Build a Simple Blog](./building-for-the-web/build-a-blog.md) - HTML, CSS, vanilla JS from scratch
- [Git Beginners' Guide](./git/beginners-guide/01-introduction.md) - Branching, merging, rebasing, workflows
- [Mermaid Diagrams](./other/mermaid-diagrams.mdx) - Flowcharts, sequence, class, and more

---

## Projects

- [Steam5](https://steam5.org) - Steam review guessing game. *Spring Boot, Next.js, PostgreSQL*
- [RSS-Analyzer](https://rssanalyzer.org) - Audio RSS feed parser with aggregated release stats. *Java, Next.js*
- [EZ-Budget](https://ez-budget.lucanerlich.com) - Monthly and yearly budget tracker. *Next.js, Bootstrap CSS*
- [Mindestens 10 Zeichen](https://m10z.de) - Community gaming and media blog. *Docusaurus 3*
- [First Class Performance](https://first-class-performance.com/) - Design, development, and hosting. *Strapi, Next.js, Material UI*
- [Complete Motion CrossFit](https://complete-motion-crossfit.de/) - Design, development, and hosting. *Next.js, SCSS*
- [Nerlich / Puls GbR](https://pnn-it.de/) - Business website. *Next.js, SCSS*

> All projects are self-hosted on a [Hetzner](https://www.hetzner.com/cloud) VPS using [Coolify](https://coolify.io/) and Docker. Lightweight, GDPR-friendly analytics via self-hosted [Umami](https://umami.is/).

---

## Contact

Questions, corrections, or content requests? Open a [GitHub Issue](https://github.com/LucaNerlich/lucanerlich.com/issues) or reach out at [luca.nerlich@gmail.com](mailto:luca.nerlich@gmail.com).
