import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {sidebarOrder} from './sidebar-order';

// ---------------------------------------------------------------------------
// Sidebar ordering helper – sorts items based on the sidebarOrder constants.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Docusaurus sidebar types are complex internal generics
type SidebarItem = any;
type CategoriesMetadata = Record<string, {label?: string; [k: string]: unknown}>;

/**
 * Recursively sorts sidebar items according to the ordered arrays in
 * `sidebarOrder`. Items not listed in the constants are appended at the end
 * in their default (alphabetical / sidebar_position) order.
 */
function sortSidebarItems(
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

// ---------------------------------------------------------------------------
// Docusaurus configuration
// ---------------------------------------------------------------------------


const config: Config = {
    title: 'Luca Nerlich - Tech Documentation',
    tagline: 'Practical guides for AEM, Java, JavaScript, Strapi, and software design patterns.',
    url: 'https://lucanerlich.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenAnchors: 'throw',
    markdown: {
        format: 'detect',
        mermaid: true,
        remarkRehypeOptions: {
            footnoteLabel: 'Quellen / Fußnoten',
        },
        hooks: {
            onBrokenMarkdownLinks: 'throw',
            onBrokenMarkdownImages: 'throw'
        }
    },
    staticDirectories: ['static'],
    favicon: 'images/favicon.ico',
    organizationName: 'LucaNerlich',
    projectName: 'blog-3.0',
    trailingSlash: true,
    themes: ['@docusaurus/theme-mermaid'],

    headTags: [
        // Default Open Graph metadata for social sharing
        {
            tagName: 'meta',
            attributes: {
                property: 'og:image',
                content: 'https://lucanerlich.com/images/avatar-ai.jpg',
            },
        },
        {
            tagName: 'meta',
            attributes: {
                property: 'og:type',
                content: 'website',
            },
        },
        {
            tagName: 'meta',
            attributes: {
                name: 'twitter:card',
                content: 'summary',
            },
        },
        {
            tagName: 'meta',
            attributes: {
                name: 'twitter:image',
                content: 'https://lucanerlich.com/images/avatar-ai.jpg',
            },
        },
    ],

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.js',
                    editUrl: 'https://github.com/LucaNerlich/lucanerlich.com/tree/main',
                    showLastUpdateAuthor: false,
                    showLastUpdateTime: false,
                    remarkPlugins: [],
                    routeBasePath: '/',
                    async sidebarItemsGenerator({defaultSidebarItemsGenerator, categoriesMetadata, ...args}) {
                        const items = await defaultSidebarItemsGenerator({categoriesMetadata, ...args});
                        return sortSidebarItems(items, args.item.dirName, categoriesMetadata);
                    },
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
                sitemap: {
                    lastmod: 'date',
                },
            } satisfies Preset.Options,
        ],
    ],

    future: {
        experimental_faster: true,
        v4: true,
    },

    // Umami analytics
    clientModules: [
        './umami.js',
    ],

    plugins: [
        ['@docusaurus/plugin-client-redirects',
            {
                redirects: [
                    // Legacy /docs/ prefix redirects
                    {from: '/docs/aem/component-dialogs/', to: '/aem/component-dialogs/'},
                    {from: '/docs/aem/groovy-console/', to: '/aem/groovy-console/'},
                    {from: '/docs/aem/extending-responsive-grid/', to: '/aem/ui/extending-responsive-grid/'},
                    {from: '/docs/category/aem/', to: '/aem/'},
                    {from: '/docs/aem/ui/overlays/', to: '/aem/ui/overlays/'},

                    // Sidebar reorganization: components group
                    {from: '/aem/core-components/', to: '/aem/components/core-components/'},
                    {from: '/aem/dialog-validation/', to: '/aem/components/dialog-validation/'},
                    {from: '/aem/annotations/child-resource/', to: '/aem/components/annotations/child-resource/'},
                    {from: '/aem/annotations/externalized-value-map-value/', to: '/aem/components/annotations/externalized-value-map-value/'},

                    // Sidebar reorganization: backend group
                    {from: '/aem/sling-models/', to: '/aem/backend/sling-models/'},
                    {from: '/aem/servlets/', to: '/aem/backend/servlets/'},
                    {from: '/aem/filter/', to: '/aem/backend/filter/'},
                    {from: '/aem/event-listener/', to: '/aem/backend/event-listener/'},
                    {from: '/aem/osgi-configuration/', to: '/aem/backend/osgi-configuration/'},
                    {from: '/aem/java-best-practices/', to: '/aem/backend/java-best-practices/'},
                    {from: '/aem/workflows/', to: '/aem/backend/workflows/'},

                    // Sidebar reorganization: content group
                    {from: '/aem/jcr/', to: '/aem/content/jcr/'},
                    {from: '/aem/node-operations/', to: '/aem/content/node-operations/'},
                    {from: '/aem/content-fragments/', to: '/aem/content/content-fragments/'},
                    {from: '/aem/graphql/', to: '/aem/content/graphql/'},
                    {from: '/aem/replication-activation/', to: '/aem/content/replication-activation/'},
                    {from: '/aem/multi-site-manager-msm/', to: '/aem/content/multi-site-manager-msm/'},

                    // Sidebar reorganization: infrastructure group
                    {from: '/aem/aem-dev-setup/', to: '/aem/infrastructure/aem-dev-setup/'},
                    {from: '/aem/cloud-service/', to: '/aem/infrastructure/cloud-service/'},
                    {from: '/aem/deployment/', to: '/aem/infrastructure/deployment/'},
                    {from: '/aem/dispatcher-configuration/', to: '/aem/infrastructure/dispatcher-configuration/'},
                    {from: '/aem/performance/', to: '/aem/infrastructure/performance/'},
                    {from: '/aem/security/', to: '/aem/infrastructure/security/'},
                    {from: '/aem/testing/', to: '/aem/infrastructure/testing/'},
                    {from: '/aem/email/', to: '/aem/infrastructure/email/'},
                    {from: '/aem/helix/', to: '/aem/edge-delivery-services/'},
                    {from: '/aem/aio-app-builder/', to: '/aem/infrastructure/aio-app-builder/'},

                    // Sidebar reorganization: ui group
                    {from: '/aem/extending-responsive-grid/', to: '/aem/ui/extending-responsive-grid/'},

                    // Merged pages: dynamic-pathbrowser + assets-siderail -> custom-dialog-widgets
                    {from: '/aem/ui/dynamic-pathbrowser-rootpath/', to: '/aem/ui/custom-dialog-widgets/'},
                    {from: '/aem/ui/assets-siderail/', to: '/aem/ui/custom-dialog-widgets/'},
                ],
            },
        ],
        ['@docusaurus/plugin-pwa',
            {
                debug: false,
                offlineModeActivationStrategies: [
                    'appInstalled',
                    'standalone',
                    'queryString',
                ],
                pwaHead: [
                    {
                        tagName: 'link',
                        rel: 'manifest',
                        href: '/manifest.json',
                    },
                    {
                        tagName: 'meta',
                        name: 'theme-color',
                        content: '#FA0C00',
                    },
                ],
            },
        ],
    ],

    themeConfig: {
        docs: {
            sidebar: {
                hideable: true,
            },
        },
        colorMode: {
            defaultMode: 'dark',
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        algolia: {
            appId: '9BZ1Z8DOXB',
            apiKey: '89c2de4e4cc51dabec31db32e7ee4e4f',
            indexName: 'lucanerlich',
            contextualSearch: true,
        },
        navbar: {
            hideOnScroll: true,
            title: 'Luca Nerlich',
            logo: {
                alt: 'My Site Logo',
                src: 'images/logo.svg',
            },
            items: [
                {
                    to: '/aem',
                    label: 'AEM',
                    position: 'left',
                    className: 'font-red',
                },
                {
                    to: '/strapi',
                    label: 'Strapi',
                    position: 'left',
                    className: 'font-strapi',
                },
                {
                    to: '/javascript',
                    label: 'JavaScript',
                    position: 'left',
                },
                {
                    to: '/java',
                    label: 'Java',
                    position: 'left',
                },
                {
                    to: '/design-patterns',
                    label: 'Design Patterns',
                    position: 'left',
                },
                {
                    href: 'https://github.com/LucaNerlich/lucanerlich.com',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Legal',
                    items: [
                        {
                            label: 'Imprint',
                            to: '/imprint',
                        },
                    ],
                },
                {
                    title: 'Socials',
                    items: [
                        {
                            label: 'Xing',
                            href: 'https://www.xing.com/profile/Luca_Nerlich',
                        },
                        {
                            label: 'LinkedIn',
                            href: 'https://www.linkedin.com/in/lucanerlich/',
                        },
                    ],
                },
                {
                    title: 'Tech',
                    items: [
                        {
                            label: 'GitHub',
                            href: 'https://github.com/LucaNerlich/lucanerlich.com',
                        },
                        {
                            label: 'Gitlab',
                            href: 'https://gitlab.com/lucanerlich',
                        },
                    ],
                },
            ],
            copyright: `Copyright \u00a9 ${new Date().getFullYear()} Luca Nerlich - Built with Docusaurus v3.`,
        },
        prism: {
            additionalLanguages: ['groovy', 'java', 'rust', 'python', 'bash', 'yaml', 'csv'],
        },
        mermaid: {
            theme: {light: 'default', dark: 'dark'},
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
