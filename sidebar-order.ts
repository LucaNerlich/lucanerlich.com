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
        'aem',
        'strapi',
        'content-modeling',
        'web-content',
        'git',
        'web-performance',
        'semantic-html',
        'build-a-blog',
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
    // AEM – hero docs pinned at top, then subcategories
    // ------------------------------------------------------------------
    'aem': [
        'beginners-guide',
        'architecture',
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

    'aem/beginners-guide': [
        '01-introduction',
        '02-jcr-and-sling',
        '03-osgi-fundamentals',
        '04-your-first-component',
        '05-htl-templates',
        '06-component-dialogs',
        '07-sling-models',
        '08-templates-and-policies',
        '09-client-libraries',
        '10-building-pages',
        '11-content-fragments-and-graphql',
        '12-multi-site-manager-and-i18n',
        '13-dispatcher-and-caching',
        '14-deployment-and-cloud-manager',
        '15-practice-projects',
    ],

    'aem/components': [
        'overview',
        'core-components',
        'dialog-validation',
        'templates-policies',
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
