/**
 * Sidebar ordering constants.
 *
 * Each key is a directory path relative to docs/ (use '.' for the root).
 * Values are ordered arrays of identifiers:
 *   - For doc pages:   the filename without extension (e.g. 'architecture')
 *   - For categories:  the directory name (e.g. 'components')
 *
 * Items listed here appear first, in the specified order.
 * Unlisted items are appended afterwards in Docusaurus's default order.
 *
 * To reorder: simply move entries up or down within an array.
 */
export const sidebarOrder: Record<string, string[]> = {
    // ------------------------------------------------------------------
    // Top-level sections
    // ------------------------------------------------------------------
    '.': [
        'intro',
        'ai',
        'aem',
        'strapi',
        'building-for-the-web',
        'git',
        'css',
        'javascript',
        'typescript',
        'java',
        'php',
        'rust',
        'docker',
        'linux',
        'testing',
        'design-patterns',
        'other',
        'projects',
    ],

    // ------------------------------------------------------------------
    // AI – core topic intros first, then the glossary
    // ------------------------------------------------------------------
    'ai': [
        'llm',
        'prompt-engineering',
        'reasoning-models',
        'agents',
        'rag',
        'embeddings',
        'context-engineering',
        'tooling',
        'mdn-mcp-server',
        'mcp-and-a2a-in-production',
        'evaluation-and-llmops',
        'eval-datasets-and-synthetic-data',
        'safety',
        'agent-security',
        'knowledge-management',
        'ai-assisted-development',
        'skills',
        'model-selection',
        'cost-and-latency',
        'structured-outputs',
        'fine-tuning',
        'multimodal-and-voice',
        'ai-in-products',
        'ai-search-and-llms-txt',
        'privacy-and-data',
        'ai-regulation',
        'project-memory-and-rules',
        'human-in-the-loop',
        'which-pattern-when',
        'debugging-llm-apps',
        'cloud-vs-local',
        'llm-serving',
        'local-llm-app',
        'local-llm-for-coding',
        'agent-harnesses',
        'glossary',
    ],

    // ------------------------------------------------------------------
    // Building for the Web – content design, modeling, semantics, performance
    // ------------------------------------------------------------------
    'building-for-the-web': [
        'web-content',
        'content-modeling',
        'semantic-html',
        'web-performance',
        'build-a-blog',
        'markdown',
        'docusaurus',
        'mermaid-diagrams',
    ],

    'building-for-the-web/web-content': [
        'overview',
        'readability-and-typography',
        'structure-and-hierarchy',
        'forms-and-interactions',
        'microcopy-and-error-states',
        'color-and-contrast',
        'images-and-media',
        'information-architecture',
    ],

    // ------------------------------------------------------------------
    // AEM – hero docs pinned at top, then subcategories
    // ------------------------------------------------------------------
    'aem': [
        'beginners-guide',
        'architecture',
        'glossary',
        'recipes',
        'edge-delivery',
        'custom-component',
        'component-dialogs',
        'htl-templates',
        'client-libraries',
        'aemvite',
        'standalone-acs-commons',
        'groovy-console',
        'components',
        'backend',
        'content',
        'ui',
        'infrastructure',
    ],

    'aem/standalone-acs-commons': [
        'overview',
        'acs-email',
        'acs-environment-indicator',
        'acs-genericlists',
        'acs-include',
        'acs-workflow',
    ],

    'aem/edge-delivery': [
        'overview',
        'architecture',
        'authoring',
        'blocks',
        'customizing',
        'universal-editor',
        'development',
        'sidekick',
        'admin-api',
        'experimentation',
        'performance',
        'forms',
        'commerce',
        'best-practices',
    ],

    'aem/components': [
        'overview',
        'core-components',
        'core-components-delegation',
        'dialog-validation',
        'templates-policies',
        'decoration-tag',
        'annotations',
    ],

    'aem/ui': [
        'touch-ui',
        'coral-ui',
        'overlays',
        'render-conditions',
        'custom-dialog-widgets',
        'content-advisor-integration',
        'omnisearch-selection-bar-actions',
        'multi-tenancy-support-ui-frontend',
        'extending-responsive-grid',
        'spa-editor',
    ],

    // ------------------------------------------------------------------
    // Strapi – beginners guide first, then a curated topic flow:
    // content modeling -> API development -> media/headless ->
    // extensibility -> operations
    // ------------------------------------------------------------------
    'strapi': [
        'beginners-guide',
        'content-modeling-patterns',
        'relations-and-population',
        'data-import-export-migration',
        'editorial-workflow-features',
        'authentication-and-permissions',
        'api-security-hardening',
        'custom-controllers-services',
        'custom-routes-and-endpoints',
        'middleware-and-policies',
        'lifecycle-hooks',
        'webhooks-and-integrations',
        'file-uploads-and-media',
        'graphql-customization',
        'i18n-multi-locale',
        'admin-panel-customization',
        'plugin-development',
        'typescript-integration',
        'scheduled-publishing',
        'performance-and-caching',
        'scaling-multiple-instances',
        'testing-strapi-applications',
        'configuration-and-deployment',
    ],

    // ------------------------------------------------------------------
    // CSS – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'css': [
        'beginners-guide',
        'container-queries',
    ],

    // ------------------------------------------------------------------
    // JavaScript – beginners guide first, then a curated topic flow:
    // async & performance -> error handling & security -> data & formatting
    // ------------------------------------------------------------------
    'javascript': [
        'beginners-guide',
        'async-await-guide',
        'javascript-performance-basics',
        'javascript-error-handling',
        'json-parsing-guide',
        'local-session-storage',
        'javascript-intl-api-formatting',
        'javascript-dates-and-time',
        'user-input-sanitization',
    ],

    // ------------------------------------------------------------------
    // PHP – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'php': [
        'beginners-guide',
    ],

    // ------------------------------------------------------------------
    // Java – beginners guide first, then a curated topic flow:
    // core language -> concurrency -> data & I/O -> robustness ->
    // design & tooling
    // ------------------------------------------------------------------
    'java': [
        'beginners-guide',
        'java-streams',
        'collections',
        'optionals',
        'functional-interfaces',
        'generics',
        'concurrency',
        'http-clients',
        'json-processing',
        'error-handling',
        'logging',
        'testing',
        'dependency-injection',
        'maven',
        'modern-java-features',
    ],

    // ------------------------------------------------------------------
    // Rust – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'rust': [
        'beginners-guide',
    ],

    // ------------------------------------------------------------------
    // Design Patterns – overview and reference first, then pattern groups
    // ------------------------------------------------------------------
    'design-patterns': [
        'overview',
        'anti-patterns',
        'glossary',
        'creational',
        'structural',
        'behavioral',
    ],

    // ------------------------------------------------------------------
    // Other
    // ------------------------------------------------------------------
    'other': [
        'link-collections',
        'sql-guide',
        'my-shell-setup',
        'mise',
        'the-ideal-working-environment',
    ],

    // ------------------------------------------------------------------
    // Projects – newest first
    // ------------------------------------------------------------------
    'projects': [
        'omastonk',
        'coolify-qs',
        'obsidian-daily-qs',
        'wireview-pro2-qs',
        'discordanalyzer',
        'go-access-page-visits',
        'rss-feed-gen',
        'download-gog-library',
    ],
};

// ------------------------------------------------------------------
// Sidebar groups
// ------------------------------------------------------------------
// Visual-only groupings of top-level docs inside a category. Unlike
// real categories these have no directory, no URL, and no index page -
// they only structure the sidebar. Moving a doc into or out of a group
// never changes its URL, so no redirects are needed.
//
// Each entry: {label: <group label>, items: [doc ids in display order]}.
// The group is rendered at the position of its first member.
export const sidebarGroups: Record<string, {label: string; items: string[]}[]> = {
    'java': [
        {label: 'Core Language', items: ['java-streams', 'collections', 'optionals', 'functional-interfaces', 'generics']},
        {label: 'Concurrency', items: ['concurrency']},
        {label: 'Data & I/O', items: ['http-clients', 'json-processing']},
        {label: 'Robustness', items: ['error-handling', 'logging', 'testing']},
        {label: 'Design & Tooling', items: ['dependency-injection', 'maven', 'modern-java-features']},
    ],

    'javascript': [
        {label: 'Async & Performance', items: ['async-await-guide', 'javascript-performance-basics']},
        {label: 'Error Handling & Security', items: ['javascript-error-handling', 'user-input-sanitization']},
        {label: 'Data & Formatting', items: ['json-parsing-guide', 'local-session-storage', 'javascript-intl-api-formatting']},
    ],

    'strapi': [
        {label: 'Content & Data', items: ['content-modeling-patterns', 'relations-and-population', 'data-import-export-migration', 'editorial-workflow-features']},
        {label: 'API Development', items: ['authentication-and-permissions', 'api-security-hardening', 'custom-controllers-services', 'custom-routes-and-endpoints', 'middleware-and-policies', 'lifecycle-hooks', 'webhooks-and-integrations']},
        {label: 'Media & Headless', items: ['file-uploads-and-media', 'graphql-customization', 'i18n-multi-locale']},
        {label: 'Extensibility', items: ['admin-panel-customization', 'plugin-development', 'typescript-integration']},
        {label: 'Operations', items: ['scheduled-publishing', 'performance-and-caching', 'scaling-multiple-instances', 'testing-strapi-applications', 'configuration-and-deployment']},
    ],
};

// ------------------------------------------------------------------
// Sidebar ordering algorithm
// ------------------------------------------------------------------
// Lives next to the data it consumes so the ordering rules and the order
// constants form one module. The Docusaurus config calls `sortSidebarItems`
// as a thin adapter.

// eslint-disable-next-line @typescript-eslint/no-explicit-any - Docusaurus sidebar types are complex internal generics
type SidebarItem = any;
type CategoriesMetadata = Record<string, {label?: string; [k: string]: unknown}>;

/**
 * Whether a category subtree contains a doc whose id lives under `catPath`.
 * Same-labelled sibling categories are told apart by where their docs live.
 */
function subtreeBelongsTo(items: SidebarItem[], catPath: string): boolean {
    const belongs = (id: unknown): boolean =>
        typeof id === 'string' && (id === catPath || id.startsWith(`${catPath}/`));

    return items.some((item: SidebarItem) => {
        if (item.type === 'doc') {
            return belongs(item.id);
        }
        if (item.type === 'category') {
            return belongs(item.link?.id) || (item.items ? subtreeBelongsTo(item.items, catPath) : false);
        }
        return false;
    });
}

/**
 * Recursively sorts sidebar items according to the ordered arrays in
 * `sidebarOrder`. Items not listed in the constants are appended at the end
 * in their default (alphabetical / sidebar_position) order.
 */
export function sortSidebarItems(
    items: SidebarItem[],
    currentDir: string,
    categoriesMetadata: CategoriesMetadata,
): SidebarItem[] {
    // Build a label → full category paths mapping for categories in this directory.
    // A label may repeat under one parent; the item's subtree is then used to tell
    // the candidates apart (see `categoryPathForItem`).
    const labelToPaths: Record<string, string[]> = {};
    for (const [catPath, catMeta] of Object.entries(categoriesMetadata)) {
        const lastSlash = catPath.lastIndexOf('/');
        const parent = lastSlash === -1 ? '.' : catPath.substring(0, lastSlash);
        if (parent === currentDir && catMeta.label) {
            labelToPaths[catMeta.label] = [...(labelToPaths[catMeta.label] ?? []), catPath];
        }
    }

    // Resolve a category item to its full directory path. A unique label maps
    // straight to its path; with duplicate labels, the docs in the item's
    // subtree identify which sibling directory it belongs to.
    const categoryPathForItem = (item: SidebarItem): string | null => {
        const candidates = labelToPaths[item.label!] ?? [];
        if (candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0];
        return candidates.find((catPath) => subtreeBelongsTo(item.items ?? [], catPath)) ?? null;
    };

    // Recurse into category children first
    const processed = items.map((item: SidebarItem) => {
        if (item.type === 'category' && item.items) {
            const catPath = categoryPathForItem(item);
            if (catPath) {
                return {...item, items: sortSidebarItems(item.items, catPath, categoriesMetadata)};
            }
        }
        return item;
    });

    // If no explicit order is defined for this directory, keep default order
    const order = sidebarOrder[currentDir];
    if (!order) return applySidebarGroups(processed, currentDir);

    // Resolve each item to a key so we can match against the order array
    const getKey = (item: SidebarItem): string | null => {
        if (item.type === 'doc' && item.id) {
            const parts = item.id.split('/');
            return parts[parts.length - 1];
        }
        if (item.type === 'category') {
            const catPath = categoryPathForItem(item);
            if (!catPath) return null;
            return catPath.substring(catPath.lastIndexOf('/') + 1);
        }
        return null;
    };

    // Partition: ordered items first, then the rest
    const ordered: SidebarItem[] = [];
    const remaining = [...processed];

    for (const key of order) {
        const idx = remaining.findIndex((item: SidebarItem) => getKey(item) === key);
        if (idx !== -1) {
            ordered.push(remaining.splice(idx, 1)[0]);
        }
    }

    return applySidebarGroups([...ordered, ...remaining], currentDir);
}

/**
 * Wraps doc items into visual-only category groups (see `sidebarGroups`).
 * A group is rendered at the position of its first member in the sorted
 * list; its other members are removed from their original positions.
 * Items that are not part of any group keep their position. This changes
 * sidebar presentation only - doc URLs are untouched.
 */
function applySidebarGroups(items: SidebarItem[], currentDir: string): SidebarItem[] {
    const groups = sidebarGroups[currentDir];
    if (!groups || groups.length === 0) return items;

    // Map doc key (last path segment) -> item, for resolving group members
    const docKeyToItem: Record<string, SidebarItem> = {};
    for (const item of items) {
        if (item.type === 'doc' && item.id) {
            const parts = item.id.split('/');
            docKeyToItem[parts[parts.length - 1]] = item;
        }
    }

    const consumed = new Set<string>();
    const emittedLabels = new Set<string>();
    const result: SidebarItem[] = [];

    for (const item of items) {
        let key: string | null = null;
        if (item.type === 'doc' && item.id) {
            const parts = item.id.split('/');
            key = parts[parts.length - 1];
        }
        if (key === null || consumed.has(key)) {
            result.push(item);
            continue;
        }

        const group = groups.find((g) => g.items.includes(key!));
        if (!group) {
            result.push(item);
            continue;
        }

        // First member of this group: emit the whole group here
        const groupItems = group.items
            .map((memberKey) => docKeyToItem[memberKey])
            .filter((member): member is SidebarItem => Boolean(member));
        result.push({
            type: 'category',
            label: group.label,
            collapsible: true,
            collapsed: false,
            items: groupItems,
        });
        group.items.forEach((memberKey) => consumed.add(memberKey));
        emittedLabels.add(group.label);
    }

    // Safety net: emit any configured group that never appeared in the
    // sorted list (e.g. every member is missing from the sidebar).
    for (const group of groups) {
        if (emittedLabels.has(group.label)) continue;
        const groupItems = group.items
            .map((memberKey) => docKeyToItem[memberKey])
            .filter((member): member is SidebarItem => Boolean(member));
        if (groupItems.length > 0) {
            result.push({
                type: 'category',
                label: group.label,
                collapsible: true,
                collapsed: false,
                items: groupItems,
            });
        }
    }

    return result;
}
