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
        'java',
        'php',
        'rust',
        'design-patterns',
        'other',
        'projects',
    ],

    // ------------------------------------------------------------------
    // AI – core topic intros first, then the glossary
    // ------------------------------------------------------------------
    'ai': [
        'llm',
        'agents',
        'rag',
        'embeddings',
        'context-engineering',
        'tooling',
        'evaluation-and-llmops',
        'safety',
        'knowledge-management',
        'ai-assisted-development',
        'skills',
        'cost-and-latency',
        'structured-outputs',
        'ai-in-products',
        'privacy-and-data',
        'project-memory-and-rules',
        'human-in-the-loop',
        'which-pattern-when',
        'debugging-llm-apps',
        'cloud-vs-local',
        'local-llm-app',
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
        'groovy-console',
        'components',
        'backend',
        'content',
        'ui',
        'infrastructure',
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

    'aem/beginners-guide': [
        '01-introduction',
        '02-jcr-and-sling',
        '03-osgi-fundamentals',
        '04-your-first-component',
        '05-htl-templates',
        '06-component-dialogs',
        '07-sling-models',
        '08-servlets-and-requests',
        '09-templates-and-policies',
        '10-client-libraries',
        '11-building-pages',
        '12-assets-and-dam',
        '13-content-fragments-and-graphql',
        '14-search-and-indexing',
        '15-multi-site-manager-and-i18n',
        '16-publishing-and-replication',
        '17-workflows',
        '18-dispatcher-and-caching',
        '19-security-and-permissions',
        '20-testing-and-debugging',
        '21-deployment-and-cloud-manager',
        '22-practice-projects',
    ],

    'aem/components': [
        'overview',
        'core-components',
        'dialog-validation',
        'templates-policies',
        'decoration-tag',
        'annotations',
    ],

    // ------------------------------------------------------------------
    // Strapi – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'strapi': [
        'beginners-guide',
    ],

    'strapi/beginners-guide': [
        '01-introduction',
        '02-content-modeling',
        '03-relations',
        '04-managing-content',
        '05-rest-api',
        '06-authentication-and-permissions',
        '07-custom-controllers-and-services',
        '08-routes-policies-middleware',
        '09-lifecycle-hooks-and-webhooks',
        '10-media-and-file-uploads',
        '11-typescript-integration',
        '12-configuration-and-deployment',
    ],

    // ------------------------------------------------------------------
    // CSS – beginners guide first
    // ------------------------------------------------------------------
    'css': [
        'beginners-guide',
    ],

    'css/beginners-guide': [
        '01-introduction',
        '02-selectors',
        '03-the-box-model',
        '04-colors-and-typography',
        '05-units-and-sizing',
        '06-display-and-positioning',
        '07-flexbox',
        '08-css-grid',
        '09-responsive-design',
        '10-backgrounds-borders-shadows',
        '11-transitions-and-animations',
        '12-pseudo-classes-and-pseudo-elements',
        '13-css-custom-properties',
        '14-specificity-and-the-cascade',
        '15-modern-css-features',
        '16-architecture-and-best-practices',
        '17-debugging-and-common-pitfalls',
        '18-practice-projects',
    ],

    // ------------------------------------------------------------------
    // JavaScript – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'javascript': [
        'beginners-guide',
    ],

    'javascript/beginners-guide': [
        '01-introduction',
        '02-variables-and-types',
        '03-control-flow',
        '04-functions',
        '05-arrays',
        '06-objects',
        '07-html-css-essentials',
        '08-the-dom',
        '09-events',
        '10-working-with-data',
        '11-project-build-a-website',
        '12-deploy-vps-nginx',
        '13-typescript',
        '14-error-handling',
        '15-regular-expressions',
    ],

    // ------------------------------------------------------------------
    // PHP – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'php': [
        'beginners-guide',
    ],

    'php/beginners-guide': [
        '01-introduction',
        '02-variables-and-types',
        '03-operators-and-expressions',
        '04-control-flow',
        '05-functions',
        '06-strings-and-arrays',
        '07-forms-and-http',
        '08-oop-basics',
        '09-oop-advanced',
        '10-error-handling',
        '11-working-with-files',
        '12-working-with-databases',
        '13-sessions-and-cookies',
        '14-composer-and-packages',
        '15-modern-php',
        '16-building-a-web-application',
        '17-practice-projects',
    ],

    // ------------------------------------------------------------------
    // Java – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'java': [
        'beginners-guide',
    ],

    'java/beginners-guide': [
        '01-introduction',
        '02-variables-and-types',
        '03-control-flow',
        '04-methods',
        '05-classes-and-objects',
        '06-inheritance-and-interfaces',
        '07-collections',
        '08-error-handling',
        '09-file-io',
        '10-project-cli-task-manager',
        '11-rest-api',
        '12-deploy-vps-nginx',
        '13-maven',
        '14-gradle',
        '15-streams-and-lambdas',
        '16-optionals',
        '17-testing',
    ],

    // ------------------------------------------------------------------
    // Rust – beginners guide first, then individual topics
    // ------------------------------------------------------------------
    'rust': [
        'beginners-guide',
    ],

    'rust/beginners-guide': [
        '01-introduction',
        '02-variables-and-types',
        '03-control-flow',
        '04-functions',
        '05-ownership-and-borrowing',
        '06-structs-and-enums',
        '07-pattern-matching',
        '08-collections',
        '09-error-handling',
        '10-modules-and-crates',
        '11-traits-and-generics',
        '12-lifetimes',
        '13-iterators-and-closures',
        '14-project-cli-task-manager',
        '15-testing',
        '16-concurrency',
        '17-rest-api',
        '18-deploy-vps-nginx',
        '19-practice-projects',
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
    ],
};

// ------------------------------------------------------------------
// Sidebar ordering algorithm
// ------------------------------------------------------------------
// Lives next to the data it consumes so the ordering rules and the order
// constants form one module. The Docusaurus config calls `sortSidebarItems`
// as a thin adapter.

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Docusaurus sidebar types are complex internal generics
type SidebarItem = any;
type CategoriesMetadata = Record<string, {label?: string; [k: string]: unknown}>;

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
    // Build a label → directory-name mapping for categories in this directory
    const labelToDirname: Record<string, string> = {};
    for (const [catPath, catMeta] of Object.entries(categoriesMetadata)) {
        const lastSlash = catPath.lastIndexOf('/');
        const parent = lastSlash === -1 ? '.' : catPath.substring(0, lastSlash);
        if (parent === currentDir && catMeta.label) {
            labelToDirname[catMeta.label] = lastSlash === -1 ? catPath : catPath.substring(lastSlash + 1);
        }
    }

    // Recurse into category children first
    const processed = items.map((item: SidebarItem) => {
        if (item.type === 'category' && item.items) {
            const dirname = labelToDirname[item.label!];
            if (dirname) {
                const childDir = currentDir === '.' ? dirname : `${currentDir}/${dirname}`;
                return {...item, items: sortSidebarItems(item.items, childDir, categoriesMetadata)};
            }
        }
        return item;
    });

    // If no explicit order is defined for this directory, keep default order
    const order = sidebarOrder[currentDir];
    if (!order) return processed;

    // Resolve each item to a key so we can match against the order array
    const getKey = (item: SidebarItem): string | null => {
        if (item.type === 'doc' && item.id) {
            const parts = item.id.split('/');
            return parts[parts.length - 1];
        }
        if (item.type === 'category') {
            return labelToDirname[item.label!] ?? null;
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

    return [...ordered, ...remaining];
}
