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

### Web Fundamentals

- [**JavaScript Beginners' Guide**](./javascript/beginners-guide/01-introduction.md) - 15 chapters covering fundamentals, the DOM, events, error handling, and deployment
- [**TypeScript Beginners' Guide**](./typescript/beginners-guide/01-introduction.md) - 12 chapters from basic types to advanced generics and real-world project setup
- [**CSS Beginners' Guide**](./css/beginners-guide/01-introduction.md) - 18 chapters from selectors to Flexbox, Grid, responsive design, and modern CSS

### Languages

- [**Java Beginners' Guide**](./java/beginners-guide/01-introduction.md) - 17 chapters from variables and control flow through streams, testing, and build tools
- [**PHP Beginners' Guide**](./php/beginners-guide/01-introduction.md) - 17 chapters from your first script to OOP and a complete web application
- [**Rust Beginners' Guide**](./rust/beginners-guide/01-introduction.md) - 19 chapters covering ownership, traits, and a CLI + REST API project

### Platforms & CMS

- [**AEM Beginners' Guide**](./aem/beginners-guide/01-introduction.md) - 22 chapters covering JCR, Sling, OSGi, components, HTL, Sling Models, templates, clientlibs, and deployment
- [**Strapi Beginners' Guide**](./strapi/beginners-guide/01-introduction.md) - 17 chapters on content modeling, the REST API, authentication, lifecycle hooks, and deployment

### Tooling & Ops

- [**Git Beginners' Guide**](./git/beginners-guide/01-introduction.md) - 12 chapters on branching, merging, rebasing, and team workflows
- [**Docker Beginners' Guide**](./docker/beginners-guide/01-introduction.md) - 12 chapters from your first container to multi-service Compose deployments
- [**Linux Beginners' Guide**](./linux/beginners-guide/01-introduction.md) - 12 chapters from filesystem navigation to server administration
- [**Testing Beginners' Guide**](./testing/beginners-guide/01-introduction.md) - 12 chapters from your first unit test to CI integration and TDD

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
- [Standalone ACS Commons](./aem/standalone-acs-commons/overview.mdx) - Drop-in replacements for individual ACS Commons features
- [Edge Delivery Services](./aem/edge-delivery/overview.mdx) - Blocks, authoring, Universal Editor, Admin API

### AI

Practical introductions to the building blocks of modern AI, from LLMs through agents and RAG to production operations.

- [Large Language Models](./ai/llm.md) - How an LLM works, how it is trained, what it is and is not good at
- [AI Agents](./ai/agents.md) - Tool use, multi-agent patterns, MCP and A2A protocols
- [RAG](./ai/rag.md) - Grounding LLMs with embeddings, vector databases, and hybrid retrieval
- [Build a Local LLM App](./ai/local-llm-app.md) - Run Ollama or LM Studio and connect a simple app
- [Local & Offline Copilot Alternative](./ai/local-llm-for-coding.md) - Ollama + Continue.dev in your editor
- [Glossary](./ai/glossary.md) - Quick definitions for all AI terms on the site

### Building for the Web

Practical guides for building good websites end-to-end.

- [Content Modeling](./building-for-the-web/content-modeling.md) - CMS-agnostic guide to types, relations, and performance
- [Semantic HTML](./building-for-the-web/semantic-html.mdx) - Element reference, accessibility, anti-patterns
- [Web Performance](./building-for-the-web/web-performance.md) - Core Web Vitals, Lighthouse, caching, CDN
- [Web Content](./building-for-the-web/web-content/overview.md) - 8-part series on readability, structure, forms, microcopy, color, images, and information architecture
- [Build a Simple Blog](./building-for-the-web/build-a-blog.md) - HTML, CSS, vanilla JS from scratch
- [Docusaurus](./building-for-the-web/docusaurus.md) - Notes on building docs sites with Docusaurus
- [Mermaid Diagrams](./building-for-the-web/mermaid-diagrams.mdx) - Flowcharts, sequence, class, and more

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

- [Async/Await Patterns](./javascript/async-await-guide.mdx) - Promises, error handling, concurrency control, pitfalls
- [Intl API Formatting](./javascript/javascript-intl-api-formatting.mdx) - Locale-aware number, date, currency formatting
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

- [CSS Container Queries](./css/container-queries.mdx) - Component-level responsive design with interactive demos
- [SQL Guide](./other/sql-guide.md) - Complete guide to querying and designing SQL databases
- [My Shell Setup](./other/my-shell-setup.md) - Terminal workflow, aliases, and tooling
- [Ideal Working Environment](./other/the-ideal-working-environment.md) - Notes on the five DevOps ideals from The Unicorn Project

---

## Projects

- [**Browse all project docs**](/projects) - Quickstarts and write-ups for Omarchy widgets, Coolify, RSS tooling, and more
- **Live projects**: [Steam5](https://steam5.org), [RSS-Analyzer](https://rssanalyzer.org), [EZ-Budget](https://ez-budget.lucanerlich.com), [Mindestens 10 Zeichen](https://m10z.de), [First Class Performance](https://first-class-performance.com/), [Complete Motion CrossFit](https://complete-motion-crossfit.de/), [Nerlich / Puls GbR](https://pnn-it.de/), and [Omarchy Plugins](https://omarchyplugins.com/?author=LucaNerlich)

> All projects are self-hosted on a [Hetzner](https://www.hetzner.com/cloud) VPS using [Coolify](https://coolify.io/) and Docker. Lightweight, GDPR-friendly analytics via self-hosted [Umami](https://umami.is/).

