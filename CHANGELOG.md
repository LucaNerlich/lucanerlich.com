# Changelog

All notable changes to this project will be documented in this file.

## [1.9.2] - 2026-04-22

### Fixed
- Component Dialogs — restored three in-page anchor links (`#empty-dialog--starting-point`, `#layout--read-only`, `#msm--live-copy-considerations`) whose double-dash segments were inadvertently collapsed by the v1.9.1 typography sweep, breaking the Docusaurus build

## [1.9.1] - 2026-04-22

### Changed
- Docs-wide typography cleanup — replaced the `--` em-dash substitute with a single `-` across 217 docs files, while preserving frontmatter delimiters, fenced code blocks (including mermaid arrows and CLI flags), inline code spans, table separators, and HTML comment delimiters

## [1.9.0] - 2026-04-21

### Added
- Build a Simple Blog Page — new "Before you start — what the pieces are" section orienting absolute beginners (what a website actually is, what HTML / CSS / JS each do, per-OS instructions for creating a folder and blank files in Finder / File Explorer / Linux file managers, why a word processor will not work, and what the `file://` URL prefix means), plus a new **Step 6 — Get this live on the internet** with two full deployment walkthroughs: **Option A** AWS S3 static hosting (free-tier account, bucket creation with public-access block unchecked, file upload, static-website-hosting toggle, public-read bucket-policy JSON snippet, bucket-website endpoint) with caveats on HTTPS via CloudFront / billing / Netlify-Pages alternatives; **Option B** VPS + nginx (ssh in, `apt install nginx`, `scp` the files up, move to `/var/www/blog`, minimal `server {}` block at `/etc/nginx/sites-available/blog`, symlink into `sites-enabled`, `nginx -t` and `systemctl reload nginx`) linking to the deeper VPS + nginx chapter for hardening and HTTPS; closes with an "S3 vs VPS vs Netlify" decision table

### Changed
- Build a Simple Blog Page — plain-English glosses added on first use for **semantic HTML**, the **DOM**, **CSS custom properties**, **localStorage**, **media query**, and `<script type="module">`; VS Code recommendation now explains *why* (syntax highlighting, not a word processor); Summary gained a deployment bullet

## [1.8.0] - 2026-04-20

### Added
- Build a Simple Blog Page — new Step 4 "Responsive header and footer" covering a mobile nav toggle with `aria-expanded` / `aria-controls` + `.visually-hidden` utility, a `@media (max-width: 40rem)` query, the adjacent-sibling combinator pattern (`[aria-expanded="true"] + nav`) for CSS-driven disclosure, and a multi-column footer that stacks via the same `repeat(auto-fit, minmax())` trick — plus a decision table contrasting `auto-fit` / `minmax()` against `@media` queries

### Changed
- Build a Simple Blog Page — cross-reference links threaded through every step: Step 2 links to the CSS beginners' chapters on box model / colors & typography / Flexbox, plus CSS Grid / Responsive Design / CSS Custom Properties for the "two things worth understanding" notes; Step 3 links to DOM and Events chapters; the relative-dates row links to the Intl API Formatting guide; Step 5 (fetch) links to Working with Data and the Async/Await guide; Vite section links to the VPS deploy chapter; Next steps expanded with targeted chapter links plus Web Performance. Summary and "What you will build" updated to mention the responsive header and multi-column footer; previous "Step 4 -- load posts from a JSON file" renumbered to Step 5 (optional)

## [1.7.0] - 2026-04-20

### Added
- Build a Simple Blog Page guide — a standalone, super-beginner start-to-finish tutorial for building a working blog page with only HTML, CSS, and vanilla JavaScript (semantic markup, CSS Grid layout with `auto-fit`/`minmax`, CSS custom properties driving a `data-theme` dark-mode toggle, `Intl.RelativeTimeFormat` for human-readable dates, `localStorage` persistence, click-to-filter tags), plus an optional Step 4 that moves posts into `posts.json` via `fetch` with a `type="module"` / top-level-`await` variant, and a bonus section on when and how to adopt Vite (dev server, HMR, production build, "when is Vite worth it?" decision table) — sits at `/build-a-blog`, linked from the sidebar after Semantic HTML and from the home page under More Topics

## [1.6.0] - 2026-04-20

### Added
- Changelog page at `/changelog`, rendered directly from the root `CHANGELOG.md` so the release history is browsable on the site

### Changed
- Footer restructured from four thin columns (Content / Legal / Socials / Tech) into four balanced columns: **Docs** (AEM, Strapi, JavaScript, Java, Design Patterns), **Guides** (Docker, Linux, Git, Testing), **More** (Projects, Other, Changelog, Imprint), and **Connect** (LinkedIn, Xing, GitHub, Gitlab) — surfaces top content hubs, mirrors the navbar, and merges profile + repo links
- Copyright line hyphen upgraded to an em-dash

## [1.5.0] - 2026-04-20

### Added
- AEM Dispatcher Configuration guide — AEMaaCS vs AEM 6.5 comparison, two-layer Virtual Host Matching (Apache vhost + Dispatcher `virtualhosts.any` with farm ordering and `localhost` pitfall), Cache Warming (sitemap-driven, post-deploy, targeted), Debugging Toolkit (`DISP_LOG_LEVEL` levels, "why didn't this cache?" 7-step decision tree, inspection commands), Security Headers placement (CDN / Apache / Sling filter decision table), Health Check Endpoints (Dispatcher-only vs end-to-end, Kubernetes liveness/readiness split)
- AEM Testing guide — expanded from stub into a full reference: test pyramid, tooling choices table, AEM Mocks vs Sling Mocks distinction, `AemContext` API reference, `ResourceResolverType` matrix (RESOURCERESOLVER_MOCK / JCR_MOCK / JCR_OAK / JCR_JACKRABBIT trade-offs), content loading patterns (JSON, Filevault XML, binary), eight concrete test patterns (Sling Model, request-adaptable model, OSGi service, service-user resolver, servlet, JCR-SQL2 query, Context-Aware Config, WireMock external HTTP), UI.tests module with WebdriverIO, Dispatcher validation CI gate, JaCoCo setup, smoke checklist, and common pitfalls

### Changed
- `/llms.txt` — added the five new beginner guides (TypeScript, Docker, Git, Testing, Linux), added links to Dialog Validation, JCR Queries and API, Context-Aware Configuration, Testing, and Security basics, fixed the broken `/aem/infrastructure/dispatcher/` URL to point at `/aem/infrastructure/dispatcher-configuration/`, removed the stale `/git/` entry now that the Git beginners guide is in the top section

## [1.4.0] - 2026-04-20

### Added
- AEM Dialog Validation guide — `validate()` trigger table with `.checkValidity()` imperative example, "Two ways to declare a validator" subsection (`validation` attribute vs `granite:data/foundation-validation` child node), per-item multifield validation with partner-field revalidation, async/server-side validation with debounced fetch and cached results, expanded built-in validators split into field-level attributes and registered `foundation.*` validators, "Styling the invalid state" CSS section, and a 5-step debugging checklist
- AEM Touch UI Component Dialogs — Adobe's native `cq-dialog-dropdown-showhide` / `cq-dialog-checkbox-showhide` pattern, FieldSet grouping widget with persistence explanation (Well vs FieldSet vs Multifield comparison), full `cq:editConfig` reference (drop targets, inline editors, refresh listeners, disabling default toolbar actions), link-tuple pattern (label + URL + target) with a security-aware `rel` Sling Model

### Changed
- AEM Dialog Validation guide — template validator now null-safe (`var value = (raw == null ? "" : String(raw)).trim()`), selectors updated to `~=` space-separated-word match so fields with multiple validators still trigger
- AEM Touch UI Component Dialogs — `cq-msm-lockable` section expanded from a passing mention to a full explanation (mechanics, pitfalls, composite-multifield example), Tags field extended with `rootPath` scoping and a `TagManager`-based Sling Model reader
- AEM Touch UI Component Dialogs — Validation section trimmed to a declarative quick-reference that links to the dedicated Dialog Validation page, removing duplicated content

## [1.3.2] - 2026-04-20

### Fixed
- AEM JCR guide — SQL2 example no longer teaches query injection via user-controlled locale concatenation; now shows an allowlist pattern for caller-supplied values
- AEM JCR guide — Session API example rewritten to use `getServiceResourceResolver` with a sub-service; removed hardcoded `admin:admin` credentials, fixed wrong port (`4503` → `4502` for author), dropped unused `TransientRepository` import, moved credentials warning out of the code fence into a `:::danger` admonition
- AEM JCR guide — Groovy queries migrated from the deprecated `'sql'` language to `'JCR-SQL2'`; xpath cleanup example rewritten as JCR-SQL2; added dev-only console warning
- AEM JCR guide — fixed stray footnote marker (`>`) and an orphan comment line that rendered outside its code fence; dropped obsolete `jackrabbit-standalone-2.4.0.jar` version reference
- AEM Context-Aware Configuration guide — HTL `<script>` interpolation now uses explicit `@ context="scriptString"` to defend against XSS if HTL's auto-context misfires; `HeaderModel` null-checks the config returned from `.as(...)`
- AEM Security basics — service-user mapping section now distinguishes AEMaaCS (repoinit + `ui.config`) from 6.5 (OSGi Console / Users admin UI) delivery

### Changed
- AEM Architecture — moved `WCMUsePojo` out of the Sling Models comparison table into a dedicated "legacy" aside to avoid implying it is still a current choice
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
