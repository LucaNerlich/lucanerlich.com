import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {sortSidebarItems} from './sidebar-order';
import {redirects} from './redirects';
import peleDiagrams from './plugins/pele-diagrams.mjs';

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
        // Diagrams become static SVG at build time through
        // ./plugins/pele-diagrams.mjs, so Docusaurus's own Mermaid transform --
        // which defers every diagram to a browser-side renderer -- stays off.
        mermaid: false,
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

    headTags: [
        // Web app manifest
        {
            tagName: 'link',
            attributes: {
                rel: 'manifest',
                href: '/manifest.json',
            },
        },
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
                content: 'summary_large_image',
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
                    routeBasePath: '/',
                    remarkPlugins: [peleDiagrams],
                    async sidebarItemsGenerator({defaultSidebarItemsGenerator, categoriesMetadata, ...args}) {
                        const items = await defaultSidebarItemsGenerator({categoriesMetadata, ...args});
                        return sortSidebarItems(items, args.item.dirName, categoriesMetadata);
                    },
                },
                // Blog content stays in `blog/`; re-enable by restoring a `blog: { ... }` block.
                blog: false,
                pages: {
                    remarkPlugins: [peleDiagrams],
                },
                theme: {
                    customCss: ['./src/css/custom.css'],
                },
                sitemap: {},
            } satisfies Preset.Options,
        ],
    ],

    future: {
        faster: true,
        v4: true,
    },

    // Umami analytics
    clientModules: [
        './umami.js',
    ],

    plugins: [
        ['@docusaurus/plugin-client-redirects',
            {
                redirects,
            },
        ],
        './plugins/check-llms-urls.js',
    ],

    themeConfig: {
        docs: {
            sidebar: {
                hideable: true,
                autoCollapseCategories: true,
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
                alt: 'Luca Nerlich logo',
                src: 'images/logo.svg',
            },
            items: [
                {
                    to: '/ai',
                    label: 'AI',
                    position: 'left',
                    className: 'font-green',
                },
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
                    className: 'font-purple',
                },
                {
                    type: 'dropdown',
                    label: 'Languages',
                    position: 'left',
                    items: [
                        {to: '/javascript', label: 'JavaScript'},
                        {to: '/typescript', label: 'TypeScript'},
                        {to: '/java', label: 'Java'},
                        {to: '/css', label: 'CSS'},
                        {to: '/php', label: 'PHP'},
                        {to: '/rust', label: 'Rust'},
                    ],
                },
                {
                    type: 'dropdown',
                    label: 'Guides',
                    position: 'left',
                    items: [
                        {to: '/building-for-the-web', label: 'Building for the Web'},
                        {to: '/docker', label: 'Docker'},
                        {to: '/linux', label: 'Linux'},
                        {to: '/git', label: 'Git'},
                        {to: '/testing', label: 'Testing'},
                        {to: '/design-patterns', label: 'Design Patterns'},
                    ],
                },
                {
                    to: '/projects',
                    label: 'Projects',
                    position: 'left',
                },
                {
                    to: '/other',
                    label: 'Other',
                    position: 'left',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {label: 'AI', to: '/ai'},
                        {label: 'AEM', to: '/aem'},
                        {label: 'Strapi', to: '/strapi'},
                        {label: 'Building for the Web', to: '/building-for-the-web'},
                        {label: 'JavaScript', to: '/javascript'},
                        {label: 'TypeScript', to: '/typescript'},
                        {label: 'Java', to: '/java'},
                        {label: 'CSS', to: '/css'},
                        {label: 'PHP', to: '/php'},
                        {label: 'Rust', to: '/rust'},
                        {label: 'Design Patterns', to: '/design-patterns'},
                    ],
                },
                {
                    title: 'Guides',
                    items: [
                        {label: 'Docker', to: '/docker'},
                        {label: 'Linux', to: '/linux'},
                        {label: 'Git', to: '/git'},
                        {label: 'Testing', to: '/testing'},
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {label: 'Projects', to: '/projects'},
                        {label: 'Other', to: '/other'},
                        {label: 'Changelog', to: '/changelog'},
                        {label: 'Imprint', to: '/imprint'},
                    ],
                },
                {
                    title: 'Connect',
                    items: [
                        {label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucanerlich/'},
                        {label: 'Xing', href: 'https://www.xing.com/profile/Luca_Nerlich'},
                        {label: 'GitHub', href: 'https://github.com/LucaNerlich/lucanerlich.com'},
                        {label: 'Gitlab', href: 'https://gitlab.com/lucanerlich'},
                    ],
                },
            ],
            copyright: `Copyright \u00a9 ${new Date().getFullYear()} Luca Nerlich \u2014 Built with Docusaurus v3.`,
        },
        prism: {
            additionalLanguages: ['groovy', 'java', 'rust', 'python', 'bash', 'yaml', 'csv', 'php'],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
