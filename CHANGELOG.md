# Changelog

All notable changes to this project will be documented in this file.

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
- Expanded Dispatcher stat file mechanics with flush agent explanation and query string caching behavior
- Added `.cfg.json` format requirement and AEMaaCS-only note for environment variable placeholders
- Added `@ObjectClassDefinition` config interface example in Deployment chapter
- Added warning about not closing request-scoped resolvers in Architecture reference

## [1.1.0] - 2026-04-13

### Added
- Added `/llms.txt` route following the [llmstxt.org](https://llmstxt.org/) proposal, providing LLM-friendly site information with curated links to all documentation sections
