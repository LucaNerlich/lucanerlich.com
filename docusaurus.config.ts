// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
// const darkCodeTheme = require('prism-react-renderer/themes/vsDark');

// Docusauraus.io config
// https://github.com/facebook/docusaurus/blob/main/website/docusaurus.config.js

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Luca Nerlich - Tech Documentation',
    tagline: 'A Blog ~ ish',
    url: 'https://lucanerlich.com',
    baseUrl: '/',
    markdown: {
        format: 'detect',
        mermaid: true,
        remarkRehypeOptions: {
            footnoteLabel: 'Quellen / Fußnoten',
        },
        hooks:{
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
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: 'https://github.com/LucaNerlich/lucanerlich.com/tree/main',
                    showLastUpdateAuthor: false,
                    showLastUpdateTime: true,
                    remarkPlugins: [],
                    // https://stackoverflow.com/questions/61999271/how-to-set-docs-as-the-main-page
                    routeBasePath: '/',
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                sitemap: {
                    changefreq: 'weekly',
                    priority: 0.5,
                }
            }),
        ],
    ],

    // https://docusaurus.io/blog/releases/3.6
    future: {
        // breaks in docker build
        // × Module not found: Can't resolve '/app/node_modules/@docusaurus/core/lib/client/clientEntry.js' in '/app'
        experimental_faster: false,
    },

    // adding umami
    clientModules: [
        require.resolve('./umami.js'),
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
                    // Note: /aem/components/ is handled by the category page itself
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
                ],
            },
        ],
        ['@docusaurus/plugin-pwa',
            {
                debug: true,
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

    // themeConfig.hideableSidebar has been moved to themeConfig.docs.sidebar.hideable.
    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            docs: {
                sidebar: {
                    hideable: true
                }
            },
            colorMode: {
                defaultMode: 'dark',
                disableSwitch: false,
                respectPrefersColorScheme: true,
            },
            // https://crawler.algolia.com/admin/crawlers/418c876a-d3fa-4976-97e7-2706034e9ec8/overview
            // https://crawler.algolia.com/admin/crawlers/418c876a-d3fa-4976-97e7-2706034e9ec8/configuration/edit
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
                        className: "font-red",
                    },
                    {
                        to: '/javascript',
                        label: 'JavaScript',
                        position: 'left'
                    },
                    {
                        to: '/design-patterns',
                        label: 'Design Patterns',
                        position: 'left'
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
                copyright: `Copyright © ${new Date().getFullYear()} Luca Nerlich - Built with Docusaurus v3.`,
            },
            prism: {
                // theme: lightCodeTheme,
                // darkTheme: darkCodeTheme,
                additionalLanguages: ['groovy', 'java', 'rust', 'python', 'bash', 'rust', 'yaml', 'csv'],
            },
            mermaid: {
                theme: { light: 'default', dark: 'dark' },
            },
        }),
};

module.exports = config;
