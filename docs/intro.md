---
sidebar_position: 1
slug: /
title: Home
description: "Technical documentation and guides for AEM, Java, JavaScript, and software design patterns."
---

# Luca Nerlich -- Tech Documentation

<div class="alert alert--success" style={{marginBottom: '2rem'}}>
<p style={{fontSize: '1.1rem', margin: 0}}>
Practical guides and reference documentation for <strong>Adobe Experience Manager</strong>, <strong>Java</strong>, <strong>JavaScript</strong>, and <strong>software design patterns</strong>. Every page focuses on real-world examples, common pitfalls, and patterns you can apply immediately.
</p>
</div>

---

## Documentation

### [AEM](./aem/architecture.mdx)

Comprehensive Adobe Experience Manager documentation covering the full stack -- from architecture and components to Dispatcher, security, and AEM as a Cloud Service.

- [Architecture](./aem/architecture.mdx) -- How Sling, JCR, and OSGi fit together in the AEM request processing pipeline
- [Component Dialogs](./aem/component-dialogs.mdx) -- Copy-paste reference for the most useful Granite UI dialog widgets
- [Custom Component Guide](./aem/custom-component.mdx) -- Step-by-step walkthrough: Sling Model, dialog, HTL template, and clientlib
- [HTL Templates](./aem/htl-templates.mdx) -- Sightly syntax, block elements, expression language, and XSS protection
- [Sling Models](./aem/backend/sling-models.mdx) -- Annotations, injectors, exporters, testing, and best practices
- [Client Libraries](./aem/client-libraries.mdx) -- Clientlib categories, dependencies, embedding, and the HTML Library Manager
- [Groovy Console](./aem/groovy-console.mdx) -- Interactive scripting for content operations, migrations, and debugging
- [Workflows](./aem/backend/workflows.mdx) -- Business process mapping, custom process steps, and launchers

### [Java](./java/java-streams.md)

Core Java language guides independent of any framework -- practical examples, pitfall tables, and patterns you can apply immediately.

- [Streams and Collectors](./java/java-streams.md) -- Stream pipelines, groupingBy, partitioningBy, and parallel streams
- [Modern Java Features](./java/modern-java-features.md) -- Records, sealed classes, pattern matching, and a Java 11-to-21 feature table
- [Concurrency](./java/concurrency.md) -- Threads, ExecutorService, CompletableFuture, and Virtual Threads
- [Generics](./java/generics.md) -- Bounded types, wildcards, the PECS principle, and type erasure
- [Testing](./java/testing.md) -- JUnit 5, Mockito mocking, AssertJ assertions, and parameterised tests
- [Error Handling](./java/error-handling.md) -- Checked vs unchecked exceptions, try-with-resources, and the Result pattern

### [JavaScript](./javascript/javascript-intl-api-formatting.md)

Practical JavaScript and TypeScript topics with code examples and browser compatibility notes.

- [Intl API Formatting](./javascript/javascript-intl-api-formatting.md) -- Locale-aware number, date, currency, and relative time formatting
- [Async/Await Patterns](./javascript/async-await-guide.md) -- Promises, error handling, concurrency control, and common pitfalls
- [Error Handling](./javascript/javascript-error-handling.md) -- Custom error classes, global handlers, and structured error reporting

### [Design Patterns](./design-patterns/overview.mdx)

GoF design patterns explained with Java and TypeScript examples: creational, structural, and behavioural patterns, plus a dedicated section on anti-patterns and common misuse.

### [Other](./other/tech/mermaid-diagrams.mdx)

Shell and terminal setup, Docusaurus tips, a comprehensive Mermaid diagram guide, useful link collections, and practical Strapi CMS guides.

- [Strapi: Custom Controllers and Services](./strapi/custom-controllers-services.md) -- Extending core CRUD, custom actions, and service delegation
- [Strapi: Relations and Population](./strapi/relations-and-population.md) -- Deep population, filtering, and performance optimization
- [Strapi: Authentication and Permissions](./strapi/authentication-and-permissions.md) -- JWT flow, RBAC, API tokens, and OAuth providers
- [Mermaid Diagram Guide](./other/tech/mermaid-diagrams.mdx) -- Flowcharts, sequence diagrams, class diagrams, and more

---

## Featured content

A selection of the most useful pages across all categories:

- [Component Dialog Examples](./aem/component-dialogs.mdx) -- Copy-paste Granite UI dialog widgets for AEM components
- [AEM Architecture](./aem/architecture.mdx) -- How Sling, JCR, and OSGi fit together
- [Streams and Collectors](./java/java-streams.md) -- Java Streams API from basics to advanced collectors
- [Concurrency and Virtual Threads](./java/concurrency.md) -- Modern Java concurrency with practical examples
- [Sling Model Annotations](./aem/components/annotations/sling-model-annotations.mdx) -- `@Self`, `@Inject`, `@ChildResource`, and more
- [AEM Workflows](./aem/backend/workflows.mdx) -- From business process mapping to custom workflow steps
- [Mermaid Diagram Guide](./other/tech/mermaid-diagrams.mdx) -- Flowcharts, sequence diagrams, class diagrams, and more
- [Multi-Tenancy ui.frontend](./aem/ui/multi-tenancy-support-ui-frontend.mdx) -- Multi-tenant frontend architecture for AEM
- [Templates and Policies](./aem/components/templates-policies.md) -- Editable templates, allowed components, Style System
- [ACLs and Permissions](./aem/infrastructure/acl-permissions.md) -- Repoinit, Netcentric ACL Tool, service users

---

## Projects

### Professional

- [First Class Performance](https://first-class-performance.com/) -- Design, development, and hosting. *Strapi CMS, Next.js, React, SCSS, Material UI*
- [Complete Motion CrossFit](https://complete-motion-crossfit.de/) -- Design, development, and hosting. *Next.js, React, SCSS*
- [Nerlich / Puls GbR](https://pnn-it.de/) -- GbR business website. *Next.js, React, SCSS*

### Hobby

- [Steam5](https://steam5.org) -- Steam review guessing game. *Spring Boot, Next.js, React, PostgreSQL*
- [RSS-Analyzer](https://rssanalyzer.org) -- Audio RSS feed parser with aggregated release stats. *Java, Next.js, React*
- [EZ-Budget](https://ez-budget.lucanerlich.com) -- Monthly and yearly budget tracker. *Next.js, React, Bootstrap CSS*
- [Mindestens 10 Zeichen](https://m10z.de) -- Community gaming and media blog. *Docusaurus 3*

> All projects are self-hosted on a [Hetzner](https://www.hetzner.com/cloud) VPS using [Coolify](https://coolify.io/) and Docker.
> Lightweight, GDPR-friendly analytics via self-hosted [Umami](https://umami.is/).

---

## Contact

Questions, corrections, or content requests? Open a [GitHub Issue](https://github.com/LucaNerlich/lucanerlich.com/issues) or reach out at [luca.nerlich@gmail.com](mailto:luca.nerlich@gmail.com).
