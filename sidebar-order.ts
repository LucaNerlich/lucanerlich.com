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
        'javascript',
        'java',
        'design-patterns',
        'other',
        'projects',
    ],

    // ------------------------------------------------------------------
    // AEM – hero docs pinned at top, then subcategories
    // ------------------------------------------------------------------
    'aem': [
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

    'aem/components': [
        'overview',
        'core-components',
        'dialog-validation',
        'templates-policies',
        'annotations',
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
        'tech',
        'link-collections',
    ],
};
