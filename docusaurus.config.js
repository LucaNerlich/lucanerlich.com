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
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    staticDirectories: ['static'],
    favicon: 'images/favicon.ico',
    organizationName: 'LucaNerlich',
    projectName: 'blog-3.0',
    trailingSlash: true,
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
                    remarkPlugins: [require('mdx-mermaid')],
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
        'docusaurus-plugin-sass',
        ['@docusaurus/plugin-ideal-image',
            {
                quality: 80,
                max: 1080, // max resized image's size.
                min: 540, // min resized image's size. if original is lower, use that size.
                steps: 4, // the max number of images generated between min and max (inclusive)
                disableInDev: false,
            },
        ], ['@docusaurus/plugin-client-redirects',
            {
                redirects: [
                    {
                        from: '/docs/aem/component-dialogs/', to: '/aem/component-dialogs/',
                    },
                    {
                        from: '/docs/aem/groovy-console/', to: '/aem/groovy-console/',
                    },
                    {
                        from: '/docs/aem/extending-responsive-grid/', to: '/aem/extending-responsive-grid/',
                    },
                    {
                        from: '/docs/category/aem/', to: '/category/aem/',
                    },
                    {
                        from: '/docs/aem/ui/overlays/', to: '/aem/ui/overlays/',
                    },
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
                        rel: 'icon',
                        href: '/img/M10Z_Orange.png',
                    },
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
                        to: '/category/aem',
                        label: 'AEM',
                        className: "font-red",
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
                additionalLanguages: ['groovy', 'java', 'rust', 'python', 'bash', 'shell', 'xml'],
            },
        }),
};

module.exports = config;
