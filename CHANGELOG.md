# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-04-20

### Added
- Enabled Umami session replay by default via `recorder.js` with `data-sample-rate="0.25"`, `data-mask-level="moderate"`, and `data-max-duration="300000"` attributes

### Changed
- Migrated Umami script host to `umami.lucanerlich.com`

## [1.2.1] - 2026-04-18

### Fixed
- Removed `sitemap.lastmod: 'date'` which caused Docker production builds to fail because the build container has no git worktree

## [1.2.0] - 2026-04-18

### Added
- TypeScript beginner guide (12 chapters) — basic types through advanced mapped types, utility types, and real-world usage with React and Node.js
- Docker beginner guide (12 chapters) — first container through multi-stage builds, Docker Compose, secrets, registries, and production hardening
- Git beginner guide (12 chapters) — first commit through rebasing, collaborative workflows (GitHub Flow, GitFlow, trunk-based), and hooks
- Testing beginner guide (12 chapters) — Jest/Vitest and JUnit 5, mocking with Mockito, TDD, React Testing Library, Playwright e2e, and coverage
- Linux beginner guide (12 chapters) — filesystem navigation through bash scripting, networking, package management, and VPS hardening
- Navbar restructured into Language and Guides dropdowns to accommodate the expanded content

### Fixed
- Quoted `@`-prefixed YAML keywords in testing and TypeScript frontmatter that caused build failures

## [1.1.2] - 2026-04-18

### Added
- GitHub Actions CI workflow — builds on every PR and push to `main`, catching broken links before deployment
- Projects and Other sections added to the top navbar for direct discoverability
- Preconnect hints for Algolia DocSearch domains to reduce search latency
- Frontmatter (title, description, tags, keywords, sidebar position) added to all four project pages
- Description added to the Projects category generated-index page
- Content column added to the footer with links to Projects and Other

### Changed
- Twitter card type upgraded to `summary_large_image` for full-width social share previews
- OG image (`avatar-ai.jpg`) compressed from 404 KB to 120 KB at 1200×1200
- Navbar logo alt text corrected from the Docusaurus placeholder to "Luca Nerlich logo"
- Purple accent colour in light mode adjusted to `#2d2aa8` to pass WCAG AA contrast
- `future.experimental_faster` config key renamed to `future.faster` for Docusaurus 3.10.0
- `/projects/` and `/other/` category slugs made explicit so navbar links resolve correctly
- Node.js version in `.nvmrc` corrected from `v16.15.0` to `v22`
- `engines.npm` in `package.json` corrected to `engines.pnpm`
- Image alt text on GoAccess and Discord Analyzer pages made descriptive

### Removed
- Unused `blog/authors.yml` and empty `blog/` directory
- Dead `.font-green` CSS rule
- Dead `"className": "archive"` attribute from the Other category config

## [1.1.1] - 2026-04-13

### Fixed
- Fixed missing closing quotes in QueryBuilder predicates code example
- Fixed Groovy closure arrow syntax and incorrect `slingRequest` binding in JCR guide
- Updated Groovy Console GitHub link to current `orbinson/aem-groovy-console` repository
- Fixed outdated file upload component path in practice projects
- Added security warning for hardcoded credentials in client-side JavaScript example
- Clarified RTE sanitization vs HTL escaping layers in HTL Templates chapter
- Marked `currentDesign` as deprecated in AEMaaCS
- Corrected Dispatcher filter matching to explain last-match-wins semantics
- Added authentication headers to GraphQL curl examples

### Added
- Introduced `sling:resourceSuperType` and proxy component inheritance in JCR & Sling chapter
- Added `@Reference` cardinality and target filter examples in OSGi Fundamentals
- Added `@Default` type-specific annotation variants table in Sling Models chapter
- Added multifield `composite` vs non-composite explanation in Component Dialogs
- Added file upload Sling Model reading example in Component Dialogs
- Documented `customheaderlibs.html` lookup mechanism and breakpoint customization in Templates chapter
- Added GraphQL field name case sensitivity note and field name mapping explanation
- Expanded Dispatcher stat file mechanics with flush action explanation and query string caching behavior
- Added `.cfg.json` format requirement and AEMaaCS-only note for environment variable placeholders
- Added `@ObjectClassDefinition` config interface example in Deployment chapter
- Added warning about not closing request-scoped resolvers in Architecture reference

## [1.1.0] - 2026-04-13

### Added
- Added `/llms.txt` route following the [llmstxt.org](https://llmstxt.org/) proposal, providing LLM-friendly site information with curated links to all documentation sections
