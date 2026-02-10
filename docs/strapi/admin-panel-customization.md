---
title: "Admin Panel Customization"
sidebar_position: 7
description: "Strapi admin panel customization: branding, logos, themes, custom fields, injection zones, locales, bundler config, and extending the content manager."
tags: [ strapi, admin, customization, frontend ]
---

# Admin Panel Customization

The Strapi admin panel is a React-based SPA that can be extensively customised: swap logos, adjust themes, inject
components, add sidebar links, or replace the rich text editor entirely.

## Setup

Before customising, ensure the entry file is ready:

```bash
# Rename the example file
mv src/admin/app.example.tsx src/admin/app.tsx  # or .js

# Create the extensions folder
mkdir -p src/admin/extensions
```

In Strapi 5, the dev server runs in `watch-admin` mode by default -- changes to `src/admin/` hot-reload automatically.

---

## Branding: logos and favicon

```ts
// src/admin/app.tsx
import AuthLogo from './extensions/my-auth-logo.svg';
import MenuLogo from './extensions/my-menu-logo.svg';
import favicon from './extensions/favicon.ico';

export default {
    config: {
        auth: {
            logo: AuthLogo,   // Login screen logo
        },
        menu: {
            logo: MenuLogo,   // Sidebar navigation logo
        },
        head: {
            favicon: favicon,
        },
    },
    bootstrap() {
    },
};
```

Place image files in `src/admin/extensions/`. SVG is recommended for crisp rendering at all sizes.

---

## Theme customization

Override light and/or dark theme colors:

```ts
// src/admin/app.tsx
export default {
    config: {
        theme: {
            light: {
                colors: {
                    primary100: '#f0f4ff',
                    primary200: '#c7d7fe',
                    primary500: '#4f6dff',
                    primary600: '#3a5bff',
                    primary700: '#2948cc',
                    buttonPrimary500: '#4f6dff',
                    buttonPrimary600: '#3a5bff',
                },
            },
            dark: {
                colors: {
                    primary100: '#1a1f36',
                    primary200: '#2a3154',
                    primary500: '#6b7fff',
                    primary600: '#8b9aff',
                    primary700: '#a8b5ff',
                },
            },
        },
    },
    bootstrap() {
    },
};
```

The full list of overridable color keys is in
the [Strapi Design System source](https://github.com/strapi/design-system/tree/main/packages/design-system/src/themes).

---

## Locales and translations

Add languages and override default strings:

```ts
export default {
    config: {
        locales: ['en', 'de', 'fr', 'es'],
        translations: {
            de: {
                'Auth.form.email.label': 'E-Mail-Adresse',
                'Auth.form.password.label': 'Passwort',
                'app.components.LeftMenu.navbrand.title': 'Meine CMS',
                'content-manager.popUpWarning.warning.publish-question':
                    'Möchten Sie diesen Eintrag veröffentlichen?',
            },
            fr: {
                'app.components.LeftMenu.navbrand.title': 'Mon CMS',
            },
        },
    },
    bootstrap() {
    },
};
```

Find all translation keys in
the [Strapi GitHub source](https://github.com/strapi/strapi/tree/develop/packages/core/admin/admin/src/translations).

---

## Disabling tutorials and release notifications

```ts
export default {
    config: {
        tutorials: false,
        notifications: {releases: false},
    },
    bootstrap() {
    },
};
```

---

## Bundler configuration

Strapi 5 uses **Vite** by default. You can customise it or switch to **webpack**.

### Vite (default)

```js
// src/admin/vite.config.js
const {mergeConfig} = require('vite');

module.exports = (config) => {
    return mergeConfig(config, {
        resolve: {
            alias: {
                '@': '/src',
            },
        },
    });
};
```

### Webpack

```bash
# Start with webpack instead of Vite
strapi develop --bundler=webpack
```

```js
// src/admin/webpack.config.js
module.exports = (config, webpack) => {
    config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));
    return config;
};
```

---

## Injection zones

Plugins and extensions can inject React components into predefined zones in the admin panel:

```js
// In a plugin's bootstrap function or src/admin/app.tsx bootstrap
export default {
    bootstrap(app) {
        // Inject a component above the Content Manager's edit view
        app.injectContentManagerComponent('editView', 'right-links', {
            name: 'my-custom-button',
            Component: () => {
                return <button onClick={() => alert('Custom action!')}>My Button</button>;
            },
        });
    },
};
```

Available injection zones:

- `editView` > `informations`, `right-links`
- `listView` > `actions`, `deleteModalAdditionalInfos`

---

## Custom homepage widgets

Strapi 5 supports custom homepage widgets:

```tsx
// src/admin/extensions/HomepageWidget.tsx
import React from 'react';
import {Box, Typography} from '@strapi/design-system';

const DashboardWidget = () => {
    return (
        <Box padding={4} background="neutral0" shadow="filterShadow" hasRadius>
            <Typography variant="beta">Quick Stats</Typography>
            <Typography variant="omega">Articles: 42 | Users: 128</Typography>
        </Box>
    );
};

export default DashboardWidget;
```

---

## Extending the Content Manager

### Custom document actions

Add buttons to the edit view toolbar:

```tsx
// src/admin/app.tsx
export default {
    bootstrap(app) {
        app.addDocumentAction([
            {
                name: 'export-pdf',
                // Only show for articles
                Component: ({document}) => {
                    if (document.contentType !== 'api::article.article') return null;

                    return (
                        <button
                            onClick={async () => {
                                const res = await fetch(`/api/articles/${document.id}/export-pdf`);
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                            }}
                        >
                            Export PDF
                        </button>
                    );
                },
            },
        ]);
    },
};
```

### Custom sidebar panels

```tsx
export default {
    bootstrap(app) {
        app.addEditViewSidePanel([
            {
                name: 'seo-checker',
                Component: ({document}) => {
                    const title = document?.title || '';
                    const titleLength = title.length;

                    return (
                        <div style={{padding: '16px'}}>
                            <h3>SEO Check</h3>
                            <p>
                                Title length: {titleLength}/60{' '}
                                {titleLength > 60 ? '(too long)' : '(ok)'}
                            </p>
                        </div>
                    );
                },
            },
        ]);
    },
};
```

---

## Admin panel host and port

For deployments where the admin is served from a different origin:

```js
// config/admin.js
module.exports = ({env}) => ({
    url: '/dashboard',           // Change the admin path from /admin to /dashboard
    host: env('ADMIN_HOST', '0.0.0.0'),
    port: env.int('ADMIN_PORT', 8000),
    auth: {
        secret: env('ADMIN_JWT_SECRET'),
    },
    rateLimit: {
        enabled: true,
        interval: {min: 5},
        max: 5,
    },
});
```

---

## Common pitfalls

| Pitfall                                  | Problem                    | Fix                                         |
|------------------------------------------|----------------------------|---------------------------------------------|
| Editing `app.example.tsx`                | Changes not picked up      | Rename to `app.tsx`                         |
| Logo uploaded via admin overrides config | Confusing behaviour        | Upload OR config, not both                  |
| Missing `bootstrap()` export             | Admin panel fails to load  | Always export both `config` and `bootstrap` |
| Non-SVG logos look blurry                | Raster images scale poorly | Use SVG for logos                           |
| Translation key not matching             | Override has no effect     | Check exact keys from Strapi source         |

---

## See also

- [Plugin Development](plugin-development.md) -- building full plugins with admin UI
- [Configuration and Deployment](configuration-and-deployment.md) -- admin server configuration
- [Authentication and Permissions](authentication-and-permissions.md) -- admin panel security
