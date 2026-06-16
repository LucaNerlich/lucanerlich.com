# Changelog

All notable changes to this project will be documented in this file.

## [1.23.1] - 2026-06-16

### Fixed
- E-Mail guide: corrected the HTL-rendered template example to use the Sling request `Builders` API instead of the deprecated `RequestResponseFactory` and non-existent request/response wrappers
- E-Mail guide: added the missing `EmailException` import, aligned the template path with the `/apps` recommendation, repaired the Advanced Networking table, and normalized dashes and spelling

## [1.23.0] - 2026-06-16

### Added
- E-Mail guide: new step-by-step section on managing HTML e-mail templates with placeholders -- where to store templates (`ui.apps`, `ui.content`, or bundle resources), the `MailTemplate` header/placeholder format, deployment, rendering, and local testing

### Fixed
- Corrected the `MailTemplate` usage in the e-mail templating examples (the `Map`-based `getEmail` signature) and completed the reusable `EmailService.sendTemplated` implementation

## [1.22.0] - 2026-06-16

### Added
- New [Decoration Tag (cq:htmlTag)](/aem/components/decoration-tag) page: explains the AEM component decoration wrapper, the `_cq_htmlTag` node structure, controlling the tag name and CSS classes, overriding classes inherited from a supertype, and per-include decoration overrides

### Fixed
- Broken changelog links to the Simplified Index Management and Search & Indexing pages now use absolute routes

## [1.21.0] - 2026-06-15

### Added
- New [Simplified Index Management](/aem/content/simplified-index-management) page: covers diff-based custom index definitions, `diff.json` deltas, and how to let the platform merge and version indexes without copying full OOTB definitions
- Cross-reference and tip callout in [Search & Indexing](/aem/content/search-and-indexing) pointing to Simplified Index Management

### Changed
- Bumped React to 19.2.7 and `@types/react` to 19.2.17

## [1.20.1] - 2026-06-15

### Fixed
- Groovy Console: the activate/deactivate example now matches on the Boolean `hideInNav` property instead of the string `'true'`, so it actually selects hidden pages
- Groovy Console: the CSV export reads `jcr:title`/`cq:template` from each page's `jcr:content` node rather than selecting unsupported relative properties in JCR-SQL2, so the exported columns are no longer empty
- Groovy Console: the orphaned-component scan now resolves `sling:resourceType` via the Sling search paths, handling absolute resource types correctly

### Changed
- Groovy Console: the baseline SQL2 template now saves per batch (matching the "Batch your saves" guidance) to avoid `OutOfMemoryError` on large datasets
- Groovy Console: removed unused imports and dead code from examples, corrected the "find pages by template" description, and clarified that the DAM metadata update processes direct children only
- Groovy Console: bumped the recommended Orbinson dependency to 19.1.0

## [1.20.0] - 2026-06-05

### Added
- Eight new [AI](/ai) section pages for product and operations topics, with cross-links and glossary entries:
    - [Cost, Latency & Model Routing](/ai/cost-and-latency) -- token economics, model tiers, routing, and caching
    - [Structured Outputs](/ai/structured-outputs) -- JSON schemas, validation, and repair loops
    - [AI in Products](/ai/ai-in-products) -- UX patterns, streaming, when not to use AI, graceful degradation
    - [Privacy & Data Handling](/ai/privacy-and-data) -- PII, logging, residency, and minimization
    - [Project Memory & Rules](/ai/project-memory-and-rules) -- AGENTS.md, CLAUDE.md, and Cursor rules vs skills
    - [Human-in-the-Loop](/ai/human-in-the-loop) -- approval gates, maker-checker, and audit trails
    - [Which Pattern When?](/ai/which-pattern-when) -- capstone decision guide for RAG, agents, skills, and related patterns
    - [Debugging LLM Apps](/ai/debugging-llm-apps) -- production troubleshooting runbook
- New glossary terms: graceful degradation, human-in-the-loop, model routing, prompt caching, structured output, fallback chain, semantic cache

### Changed
- Expanded the [AI](/ai) category index description and cross-linked the new pages from existing AI topics

## [1.19.0] - 2026-06-05

### Added
- New [Agent Skills](/ai/skills) page in the [AI](/ai) section -- multi-tool guide to the `SKILL.md` standard (Cursor, Claude Code, Claude.ai, Codex, Gemini CLI, Copilot CLI), including how skills differ from rules and project memory, how to use and author them, common patterns, and a worked commit-message example
- Added **Agent skill** to the [AI Glossary](/ai/glossary) and cross-linked the page from [AI-Assisted Development](/ai/ai-assisted-development), [Context & Prompt Engineering](/ai/context-engineering), and [Knowledge Management with LLMs](/ai/knowledge-management)

## [1.18.1] - 2026-06-05

### Changed
- Splitter: the expense cascade when removing a person now has a single definition shared by the reducer and the removal confirmation, and the bill-split math is centralized behind one `fairShares` function (behaviour unchanged)
- Moved the client redirects out of `docusaurus.config.ts` into a dedicated `redirects.ts` module with a build-time guard that fails on a duplicate source path

## [1.18.0] - 2026-06-05

### Added
- New [Build a Local LLM App](/ai/local-llm-app) guide - run a model locally with Ollama or LM Studio and connect a simple app you write yourself, with copy-paste examples for a zero-dependency Node.js CLI, a single-file browser app, and the OpenAI SDK, plus streaming, CORS guidance, and troubleshooting

### Changed
- Cross-linked the new local-app guide from [Cloud vs Local Models](/ai/cloud-vs-local) and the [local coding-assistant guide](/other/local-llm-for-coding), and fixed the coding-assistant page title

## [1.17.0] - 2026-06-05

### Added
- Expanded the [AI](/ai) section with six new topic pages, cross-linked into the existing pages and glossary:
    - [Embeddings Deep Dive](/ai/embeddings) - model landscape, dimensions and Matryoshka, vector quantization, domain adaptation, hybrid retrieval, and production pitfalls
    - [Context & Prompt Engineering](/ai/context-engineering) - the context window as a budget, context rot, and long-horizon techniques (compaction, note-taking, sub-agents, just-in-time)
    - [Evaluation & LLMOps](/ai/evaluation-and-llmops) - testing non-deterministic systems with datasets/scorers/LLM-as-judge, harness engineering, and operating them in production
    - [AI Safety & Guardrails](/ai/safety) - guardrails and their limits, prompt injection and jailbreaking, red-teaming, and defense in depth
    - [Knowledge Management with LLMs](/ai/knowledge-management) - RAG vs just-in-time vs the LLM-wiki pattern vs llms.txt
    - [AI-Assisted Software Development](/ai/ai-assisted-development) - SPDD, architect-as-orchestrator, and AI-friendly architecture patterns
- Added 19 new [AI Glossary](/ai/glossary) terms (context rot, just-in-time context, sub-agents, red-teaming, prompt injection, LLM-as-judge, groundedness, harness engineering, LLM-wiki, llms.txt, SPDD, vector quantization, and more), cross-linked to the topic pages

## [1.16.0] - 2026-06-05

### Added
- New [AI](/ai) section introducing the core topics, with an inter-linked glossary:
    - [Large Language Models](/ai/llm) - how an LLM produces text, the three training stages, strengths and limits, hallucination, and the model landscape
    - [AI Agents](/ai/agents) - tool use/function calling, the multi-agent patterns, and the MCP and A2A connectivity protocols
    - [RAG](/ai/rag) - retrieval-augmented generation with embeddings and vector databases, RAG vs fine-tuning, and production levers
    - [Tooling and Frameworks](/ai/tooling) - orchestration frameworks, vector DBs, evaluation/observability, and LLMOps
    - [Cloud vs Local Models](/ai/cloud-vs-local) - enterprise platforms (Bedrock, SageMaker, Azure Foundry, Vertex AI) vs local open-weights models (Ollama, LM Studio, llama.cpp, vLLM)
    - [AI Glossary](/ai/glossary) - plain-English definitions of the core AI terms, cross-linked to the topic pages

### Changed
- Surfaced the AI section across the site: a navbar entry (green accent), a footer link, a homepage section, and first placement in the sidebar after the intro

## [1.15.1] - 2026-06-05

### Changed
- Splitter app: refactored internals for testability with no change to behaviour - state transitions, the settlement summary, URL persistence, and person-name lookup each now live behind a single dedicated module
- Moved the sidebar ordering algorithm next to its order constants in `sidebar-order.ts` so the Docusaurus config just calls one entry point

## [1.15.0] - 2026-06-05

### Added
- AEM: new [AEMaaCS vs AEM 6.5](/aem/infrastructure/aemaacs-vs-aem-65) reference page comparing deployment, repository mutability, replication vs content distribution, asset processing, indexing, Dispatcher, and security
- AEM: new [Glossary](/aem/glossary) of core AEM, Sling, OSGi, and Oak terms, cross-linked to the deep-dive pages
- AEM: new [Recipes](/aem/recipes) - task-oriented how-to checklists (build a component, deliver headless content, make a query fast, publish, secure, debug, translate)

### Fixed
- Corrected ~60 broken Adobe Experience League documentation links across the AEM docs (Experience League taxonomy changes and dropped `.html` suffixes); all external Adobe links now resolve
- Corrected technical errors in code examples: Groovy `Authorizable.getID()`, JCR `Property` iteration in the broken-link finder, the orphaned-asset reference search, the Content Fragment `cq:model` Oak (Lucene) index, and a dialog checkbox value type

### Changed
- Tuned Vale prose linting with an AEM vocabulary so technical terms (OSGi, repoinit, ACLs, clientlib, etc.) are no longer flagged as misspellings; synced Vale style packages are now git-ignored

## [1.14.0] - 2026-06-05

### Added
- AEM beginners guide: new [Servlets & Request Handling](/aem/beginners-guide/servlets-and-requests) chapter - resource-type vs path-bound servlets, `SlingSafeMethodsServlet` vs `SlingAllMethodsServlet`, validated POST handling, JSON endpoints, and when to prefer a Sling Model Exporter
- AEM beginners guide: new [Search & Indexing](/aem/beginners-guide/search-and-indexing) chapter, plus a [Search & Indexing](/aem/content/search-and-indexing) reference page - QueryBuilder vs JCR-SQL2, why unindexed traversals are dangerous, Oak property and Lucene index definitions, AEMaaCS/6.5 deployment, reindexing, and the Explain Query tool
- [Component Dialogs](/aem/component-dialogs): a dialog cookbook (teaser dialog, composite card-list multifield, link-type switch) and a full datasource servlet example for dynamic selects
- [Groovy Console](/aem/groovy-console): a maintenance recipes library - broken internal-link finder, orphaned-asset finder, permission report, version purge, and replication-queue report
- [Content Fragments](/aem/content/content-fragments): an end-to-end headless walkthrough (persisted GraphQL query to frontend `fetch` with CORS/referrer/caching notes) and a "models as code" section for versioning `/conf` models

### Changed
- Renumbered the AEM beginners guide to 22 chapters to slot in the new Servlets (08) and Search & Indexing (14) chapters; page URLs are unchanged because chapter slugs are explicit

## [1.13.3] - 2026-06-05

### Fixed
- Docker: install `curl` in the runtime image so the Coolify container healthcheck passes (Alpine ships no `curl`, and busybox `wget` could not reach the IPv4-bound static server)

## [1.13.2] - 2026-06-05

### Fixed
- Corrected beginners-guide category index page slugs to use descriptive names instead of generic identifiers

### Changed
- Expanded AEM beginners guide and reference content
- Switched static site serving from Caddy to Node + `serve`
- Updated pnpm lockfile

## [1.13.1] - 2026-06-04

### Changed
- AEM Omnisearch Selection Bar Actions: added callout documenting the source of the DM/Scene7 feature flag identifiers and links to the Granite UI `feature` rendercondition API reference (AEM 6.5 + Cloud Service)

## [1.13.0] - 2026-06-03

### Added
- AEM guide: [Omnisearch Selection Bar Actions](/aem/ui/omnisearch-selection-bar-actions) - explains why Granite UI render conditions cannot be used for per-asset checks in the omnisearch selection bar, and how to implement a two-layer solution (DM feature flag render condition + custom JSON check servlet + client-side `foundation-selections-change` activator)

### Changed
- Updated `@types/react` to `19.2.15`
- Added `pullfrog.yml` workflow

### Fixed
- `shell-setup`: restrict `cd` alias to interactive shells only

## [1.12.1] - 2026-05-18

### Fixed
- Splitter: expense description is now optional - the form submits without one
- Splitter: tab focus is now trapped within the expense form so rapid keyboard entry (description → amount → paid by → Add → repeat) no longer escapes to the footer
- Splitter: adding an expense with an empty description no longer silently no-ops (the reducer guard was still requiring a non-empty description)
- Splitter: people chips are now rendered inline with the name input in a tag-input style instead of awkwardly below it

### Changed
- Splitter: removed multi-currency support; EUR is the only currency (simplifies the UI)
- Splitter: all formatting and sorting now uses the `Intl` API - `Intl.NumberFormat` (cached), `Intl.Collator` for deterministic ID sorting, `Intl.PluralRules` for "expense/expenses" copy

## [1.12.0] - 2026-05-18

### Added
- New `/apps/` section with a self-contained **Splitter** app (`/apps/splitter/`) - add people, log shared expenses, and get the minimum settlement transactions. All state is encoded in the URL hash so sessions are shareable by copying the link. Landing page at `/apps/` lists all available apps.

## [1.11.3] - 2026-05-17

### Fixed
- `dialog-validation.mdx`: Corrected 14 CSS attribute selectors from exact `=` to word `~=` match - exact match silently fails when a field carries multiple space-separated validators
- `component-dialogs.mdx`: Fixed `rootPath` attribute casing on Coral 3 pathfield examples (`rootpath` → `rootPath`)
- `externalized-value-map-value.mdx`: Fixed annotation default value (`StringUtils.EMPTY` → `""`); rewrote injector `getValue()` to use standard Java type-checking and proper adaptable resolution instead of undefined `ReflectionUtil`/`InjectorUtil` helpers that would cause compile errors
- `core-components.mdx`: Corrected Core Components install path (`/libs/wcm/core` → `/apps/core/wcm/components/`); updated example version from `2.15.2` (2021) to `2.27.0`; added tip linking to the GitHub releases page

## [1.11.2] - 2026-05-17

### Fixed
- Corrected `docker_run.sh` command in the Dispatcher deployment guide - removed spurious extra path arguments; correct form is `./bin/docker_run.sh dispatcher/src host.docker.internal:4503 8080`
- Fixed inconsistent `src` path in Dispatcher SDK validation commands table (`src` → `dispatcher/src`)
- Updated 31 Adobe Experience League URLs from the deprecated `/docs/` path to the canonical `/en/docs/` format across 14 AEM guide files

### Changed
- Added 114 official documentation links (Apache Sling, OSGi specification, Apache Felix, Jackrabbit Oak, Adobe Experience League, aem.live, wcm.io, web.dev, OWASP) to 21 previously link-free files across the AEM guide - including backend, beginners-guide, content, components, edge-delivery, infrastructure, and UI sections

## [1.11.1] - 2026-05-03

### Fixed
- Removed redundant "Edge Delivery Services - " prefix from all 14 chapter page titles in the new `docs/aem/edge-delivery/` section

## [1.11.0] - 2026-05-03

### Added
- New AEM **Edge Delivery Services** section under `docs/aem/edge-delivery/` - 14 chapters replacing the previous single-page treatment: Overview, Architecture, Authoring models, Blocks (the component model), Customizing, Universal Editor, Development workflow, Sidekick & Sidekick Library, Admin API (helix5), Experimentation, Performance, Forms, Commerce Storefront, and Best practices
- Blocks deep-dive - decoration lifecycle (eager / lazy / delayed phases driven by `aem.js`), reading rows and cells from the table-derived DOM, the `readBlockConfig` helper, block variations, key-value options, auto-blocks, accessing section / page metadata, common patterns and anti-patterns
- Customizing chapter - `scripts/scripts.js` orchestration, `aem.js` decoration override hooks (`decorateMain`, `decorateButtons`, `decorateIcons`, `decorateSections`, `decorateBlocks`, `buildAutoBlocks`), `delayed.js` patterns, `head.html` resource hints, theme tokens in `styles/styles.css`, font self-hosting, `paths.yaml` rewrites, `helix-config.yaml` response headers (CSP, HSTS, Permissions-Policy), bring-your-own-CDN setup, and the `/plugins/` directory
- **Admin API (helix5) reference** - full `admin.hlx.page` documentation with API-key auth, endpoint catalogue (`/status`, `/preview`, `/live`, `/code`, `/index`, `/cache`, `/log`, `/profile`, `/sitemap`, `/snapshot`, `/job`, `/config`), webhooks, common workflows (sitemap-driven bulk republish, scheduled GitHub Actions cron, source-vs-live drift audit, surrogate-key purges), error and rate-limit guidance, and a security checklist
- Universal Editor chapter - the three JSON config files (`component-definition.json`, `component-models.json`, `component-filters.json`), `data-aue-*` instrumentation attributes, and the decoration pattern that preserves them by re-parenting nodes instead of cloning
- Sidekick chapter - core extension actions plus the **Sidekick Library** (block library and tag library plugins), `tools/sidekick/config.json` plugin manifest, and a worked example of building a custom Sidekick plugin
- EDS for Forms chapter - document-based and AEM Forms authoring paths, the `form` block and its helper modules, submission targets (AEM Forms, REST, SharePoint, email, webhooks), client-side validation with ARIA wiring, spam mitigation, accessibility invariants, and patterns for multi-step forms, asset uploads, and draft persistence
- EDS Commerce Storefront chapter - render-time vs run-time data flows, the storefront block library (PLP, PDP, cart, checkout, account, search, recommendations), Adobe Commerce GraphQL integration, surrogate-key caching strategy, customer auth, SEO, performance pitfalls, and adapter strategies for commercetools / Shopify / custom backends
- Experimentation chapter - experiments and audiences sheets, edge-side resolution (no client-side flicker), multivariate setup, sticky cookie assignment, analytics wiring in `delayed.js`, and concluding-an-experiment patterns

### Changed
- Sidebar - `edge-delivery` inserted between `architecture` and the legacy AEM topic groups in `sidebar-order.ts`; new `aem/edge-delivery` ordering key arranges chapters in reading order (overview → architecture → authoring → blocks → customizing → universal-editor → development → sidekick → admin-api → experimentation → performance → forms → commerce → best-practices)
- Five sibling docs repointed from the old `helix.mdx` location to `../edge-delivery/overview.mdx`: SPA Editor, GraphQL, AIO App Builder, Dispatcher Configuration, AEM as a Cloud Service
- Overview page preserves the `/aem/edge-delivery-services/` slug so the existing `/aem/helix/` redirect (and any external bookmarks) keep resolving

### Removed
- `docs/aem/infrastructure/helix.mdx` - fully migrated into the new `docs/aem/edge-delivery/` section

## [1.10.0] - 2026-05-02

### Added
- New "Building for the Web" sidebar category - groups Content Modeling, Semantic HTML, Web Performance, Build a Simple Blog Page, and the Web Content section under one parent, replacing five separate top-level entries
- Web Content section split into eight focused chapters (Overview, Readability & Typography, Structure & Hierarchy, Forms & Interactions, Microcopy & Error States, Color & Contrast, Images & Media, Information Architecture) instead of a single 746-line monolith
- New "Microcopy and Error States" chapter - buttons and primary actions, helper text and field hints, validation errors with inline `aria-describedby` patterns, empty states (including filtered variants), loading states with skeletons and progress bars, success confirmations, destructive confirmation dialogs, 404 and 5xx error pages, voice consistency, and a quick-reference table
- New "Information Architecture" chapter - primary / utility / footer navigation patterns, `aria-current="page"` active state, breadcrumbs, taxonomies and label-drift, faceted filtering, search UX (typo recovery, recent and suggested queries), URL slug design rules, localised URLs, hub pages versus alphabetical dumps, and an IA audit checklist
- Web Content guide expanded across the existing sections with extensive Do / Don't code examples covering language and tone, microcopy, typography and measure (CSS), heading hierarchy, lists versus paragraphs, primary CTAs, progressive disclosure, link text, form labels and inline errors, mobile-first DOM order, color tokens, dark-mode token redefinition, link underlines, alt text, and video captions (#52)
- Cursor Cloud specific instructions in `AGENTS.md` (#50)
- Initial Web Content section for readability, UX, focus, and visual design (#49)

### Changed
- 22 client-side redirects added in `docusaurus.config.ts` to catch URLs constructed from the new file paths (e.g. `/building-for-the-web/content-modeling/` → `/content-modeling/`) and likely shortened guesses (e.g. `/web-content/microcopy/` → `/web-content/microcopy-and-error-states/`); all original canonical URLs remain stable via explicit `slug:` frontmatter
- Removed the standalone GitHub link from the site

## [1.9.2] - 2026-04-22

### Fixed
- Component Dialogs - restored three in-page anchor links (`#empty-dialog--starting-point`, `#layout--read-only`, `#msm--live-copy-considerations`) whose double-dash segments were inadvertently collapsed by the v1.9.1 typography sweep, breaking the Docusaurus build

## [1.9.1] - 2026-04-22

### Changed
- Docs-wide typography cleanup - replaced the `--` em-dash substitute with a single `-` across 217 docs files, while preserving frontmatter delimiters, fenced code blocks (including mermaid arrows and CLI flags), inline code spans, table separators, and HTML comment delimiters

## [1.9.0] - 2026-04-21

### Added
- Build a Simple Blog Page - new "Before you start - what the pieces are" section orienting absolute beginners (what a website actually is, what HTML / CSS / JS each do, per-OS instructions for creating a folder and blank files in Finder / File Explorer / Linux file managers, why a word processor will not work, and what the `file://` URL prefix means), plus a new **Step 6 - Get this live on the internet** with two full deployment walkthroughs: **Option A** AWS S3 static hosting (free-tier account, bucket creation with public-access block unchecked, file upload, static-website-hosting toggle, public-read bucket-policy JSON snippet, bucket-website endpoint) with caveats on HTTPS via CloudFront / billing / Netlify-Pages alternatives; **Option B** VPS + nginx (ssh in, `apt install nginx`, `scp` the files up, move to `/var/www/blog`, minimal `server {}` block at `/etc/nginx/sites-available/blog`, symlink into `sites-enabled`, `nginx -t` and `systemctl reload nginx`) linking to the deeper VPS + nginx chapter for hardening and HTTPS; closes with an "S3 vs VPS vs Netlify" decision table

### Changed
- Build a Simple Blog Page - plain-English glosses added on first use for **semantic HTML**, the **DOM**, **CSS custom properties**, **localStorage**, **media query**, and `<script type="module">`; VS Code recommendation now explains *why* (syntax highlighting, not a word processor); Summary gained a deployment bullet

## [1.8.0] - 2026-04-20

### Added
- Build a Simple Blog Page - new Step 4 "Responsive header and footer" covering a mobile nav toggle with `aria-expanded` / `aria-controls` + `.visually-hidden` utility, a `@media (max-width: 40rem)` query, the adjacent-sibling combinator pattern (`[aria-expanded="true"] + nav`) for CSS-driven disclosure, and a multi-column footer that stacks via the same `repeat(auto-fit, minmax())` trick - plus a decision table contrasting `auto-fit` / `minmax()` against `@media` queries

### Changed
- Build a Simple Blog Page - cross-reference links threaded through every step: Step 2 links to the CSS beginners' chapters on box model / colors & typography / Flexbox, plus CSS Grid / Responsive Design / CSS Custom Properties for the "two things worth understanding" notes; Step 3 links to DOM and Events chapters; the relative-dates row links to the Intl API Formatting guide; Step 5 (fetch) links to Working with Data and the Async/Await guide; Vite section links to the VPS deploy chapter; Next steps expanded with targeted chapter links plus Web Performance. Summary and "What you will build" updated to mention the responsive header and multi-column footer; previous "Step 4 -- load posts from a JSON file" renumbered to Step 5 (optional)

## [1.7.0] - 2026-04-20

### Added
- Build a Simple Blog Page guide - a standalone, super-beginner start-to-finish tutorial for building a working blog page with only HTML, CSS, and vanilla JavaScript (semantic markup, CSS Grid layout with `auto-fit`/`minmax`, CSS custom properties driving a `data-theme` dark-mode toggle, `Intl.RelativeTimeFormat` for human-readable dates, `localStorage` persistence, click-to-filter tags), plus an optional Step 4 that moves posts into `posts.json` via `fetch` with a `type="module"` / top-level-`await` variant, and a bonus section on when and how to adopt Vite (dev server, HMR, production build, "when is Vite worth it?" decision table) - sits at `/build-a-blog`, linked from the sidebar after Semantic HTML and from the home page under More Topics

## [1.6.0] - 2026-04-20

### Added
- Changelog page at `/changelog`, rendered directly from the root `CHANGELOG.md` so the release history is browsable on the site

### Changed
- Footer restructured from four thin columns (Content / Legal / Socials / Tech) into four balanced columns: **Docs** (AEM, Strapi, JavaScript, Java, Design Patterns), **Guides** (Docker, Linux, Git, Testing), **More** (Projects, Other, Changelog, Imprint), and **Connect** (LinkedIn, Xing, GitHub, Gitlab) - surfaces top content hubs, mirrors the navbar, and merges profile + repo links
- Copyright line hyphen upgraded to an em-dash

## [1.5.0] - 2026-04-20

### Added
- AEM Dispatcher Configuration guide - AEMaaCS vs AEM 6.5 comparison, two-layer Virtual Host Matching (Apache vhost + Dispatcher `virtualhosts.any` with farm ordering and `localhost` pitfall), Cache Warming (sitemap-driven, post-deploy, targeted), Debugging Toolkit (`DISP_LOG_LEVEL` levels, "why didn't this cache?" 7-step decision tree, inspection commands), Security Headers placement (CDN / Apache / Sling filter decision table), Health Check Endpoints (Dispatcher-only vs end-to-end, Kubernetes liveness/readiness split)
- AEM Testing guide - expanded from stub into a full reference: test pyramid, tooling choices table, AEM Mocks vs Sling Mocks distinction, `AemContext` API reference, `ResourceResolverType` matrix (RESOURCERESOLVER_MOCK / JCR_MOCK / JCR_OAK / JCR_JACKRABBIT trade-offs), content loading patterns (JSON, Filevault XML, binary), eight concrete test patterns (Sling Model, request-adaptable model, OSGi service, service-user resolver, servlet, JCR-SQL2 query, Context-Aware Config, WireMock external HTTP), UI.tests module with WebdriverIO, Dispatcher validation CI gate, JaCoCo setup, smoke checklist, and common pitfalls

### Changed
- `/llms.txt` - added the five new beginner guides (TypeScript, Docker, Git, Testing, Linux), added links to Dialog Validation, JCR Queries and API, Context-Aware Configuration, Testing, and Security basics, fixed the broken `/aem/infrastructure/dispatcher/` URL to point at `/aem/infrastructure/dispatcher-configuration/`, removed the stale `/git/` entry now that the Git beginners guide is in the top section

## [1.4.0] - 2026-04-20

### Added
- AEM Dialog Validation guide - `validate()` trigger table with `.checkValidity()` imperative example, "Two ways to declare a validator" subsection (`validation` attribute vs `granite:data/foundation-validation` child node), per-item multifield validation with partner-field revalidation, async/server-side validation with debounced fetch and cached results, expanded built-in validators split into field-level attributes and registered `foundation.*` validators, "Styling the invalid state" CSS section, and a 5-step debugging checklist
- AEM Touch UI Component Dialogs - Adobe's native `cq-dialog-dropdown-showhide` / `cq-dialog-checkbox-showhide` pattern, FieldSet grouping widget with persistence explanation (Well vs FieldSet vs Multifield comparison), full `cq:editConfig` reference (drop targets, inline editors, refresh listeners, disabling default toolbar actions), link-tuple pattern (label + URL + target) with a security-aware `rel` Sling Model

### Changed
- AEM Dialog Validation guide - template validator now null-safe (`var value = (raw == null ? "" : String(raw)).trim()`), selectors updated to `~=` space-separated-word match so fields with multiple validators still trigger
- AEM Touch UI Component Dialogs - `cq-msm-lockable` section expanded from a passing mention to a full explanation (mechanics, pitfalls, composite-multifield example), Tags field extended with `rootPath` scoping and a `TagManager`-based Sling Model reader
- AEM Touch UI Component Dialogs - Validation section trimmed to a declarative quick-reference that links to the dedicated Dialog Validation page, removing duplicated content

## [1.3.2] - 2026-04-20

### Fixed
- AEM JCR guide - SQL2 example no longer teaches query injection via user-controlled locale concatenation; now shows an allowlist pattern for caller-supplied values
- AEM JCR guide - Session API example rewritten to use `getServiceResourceResolver` with a sub-service; removed hardcoded `admin:admin` credentials, fixed wrong port (`4503` → `4502` for author), dropped unused `TransientRepository` import, moved credentials warning out of the code fence into a `:::danger` admonition
- AEM JCR guide - Groovy queries migrated from the deprecated `'sql'` language to `'JCR-SQL2'`; xpath cleanup example rewritten as JCR-SQL2; added dev-only console warning
- AEM JCR guide - fixed stray footnote marker (`>`) and an orphan comment line that rendered outside its code fence; dropped obsolete `jackrabbit-standalone-2.4.0.jar` version reference
- AEM Context-Aware Configuration guide - HTL `<script>` interpolation now uses explicit `@ context="scriptString"` to defend against XSS if HTL's auto-context misfires; `HeaderModel` null-checks the config returned from `.as(...)`
- AEM Security basics - service-user mapping section now distinguishes AEMaaCS (repoinit + `ui.config`) from 6.5 (OSGi Console / Users admin UI) delivery

### Changed
- AEM Architecture - moved `WCMUsePojo` out of the Sling Models comparison table into a dedicated "legacy" aside to avoid implying it is still a current choice
- AEM curl examples across Architecture, Groovy Console, Content Fragments, GraphQL, and Servlets guides now carry a consistent "Local SDK / dev only" note above every `admin:admin` block

## [1.3.1] - 2026-04-20

### Fixed
- Removed duplicate "Git" entry in the sidebar caused by a standalone `docs/git.md` colliding with the `docs/git/` beginners-guide category (both claimed slug `/git`); standalone reference removed and intro link updated to point at the beginners guide

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
- TypeScript beginner guide (12 chapters) - basic types through advanced mapped types, utility types, and real-world usage with React and Node.js
- Docker beginner guide (12 chapters) - first container through multi-stage builds, Docker Compose, secrets, registries, and production hardening
- Git beginner guide (12 chapters) - first commit through rebasing, collaborative workflows (GitHub Flow, GitFlow, trunk-based), and hooks
- Testing beginner guide (12 chapters) - Jest/Vitest and JUnit 5, mocking with Mockito, TDD, React Testing Library, Playwright e2e, and coverage
- Linux beginner guide (12 chapters) - filesystem navigation through bash scripting, networking, package management, and VPS hardening
- Navbar restructured into Language and Guides dropdowns to accommodate the expanded content

### Fixed
- Quoted `@`-prefixed YAML keywords in testing and TypeScript frontmatter that caused build failures

## [1.1.2] - 2026-04-18

### Added
- GitHub Actions CI workflow - builds on every PR and push to `main`, catching broken links before deployment
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
