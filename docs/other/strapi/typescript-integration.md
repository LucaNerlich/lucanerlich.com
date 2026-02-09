---
title: "TypeScript Integration"
sidebar_position: 16
description: "Strapi TypeScript: project setup, type generation, typing controllers and services, typed Document Service queries, custom type utilities, and migration from JS."
tags: [strapi, typescript, types, development]
---

# TypeScript Integration

Strapi 5 supports TypeScript natively. However, the type story is still evolving -- auto-generated types from content schemas, typing custom controllers and services, and getting full IntelliSense requires some setup.

## Starting a TypeScript project

```bash
npx create-strapi@latest my-project --typescript
# or with a specific template:
npx create-strapi@latest my-project --typescript --template blog
```

Strapi detects TypeScript automatically and generates `.ts` files for controllers, services, routes, and policies.

---

## Project structure (TS)

```
src/
├── admin/
│   └── app.tsx              # Admin panel customization
├── api/
│   └── article/
│       ├── content-types/
│       │   └── article/
│       │       └── schema.json
│       ├── controllers/
│       │   └── article.ts
│       ├── routes/
│       │   └── article.ts
│       └── services/
│           └── article.ts
├── components/
│   └── shared/
│       └── seo.json
├── index.ts                 # Register and bootstrap
├── middlewares/
└── policies/
```

---

## Type generation from schemas

Strapi can generate TypeScript types from your content-type schemas:

```bash
npx strapi ts:generate-types
# or
yarn strapi ts:generate-types
```

This generates type definitions based on your schema JSON files, giving you autocomplete for content-type attributes.

### Using generated types

```ts
// The generated types give you interfaces like:
// import { Article } from '../../../types/generated/contentTypes';

// In practice, use Strapi's built-in types:
import type { Core } from '@strapi/strapi';
```

---

## Typing controllers

```ts
// src/api/article/controllers/article.ts
import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }: { strapi: Core.Strapi }) => ({

    async find(ctx) {
      ctx.query = { ...ctx.query, locale: ctx.query.locale || 'en' };
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async findFeatured(ctx) {
      const articles = await strapi.documents('api::article.article').findMany({
        filters: { featured: true },
        status: 'published',
        populate: ['author', 'cover'],
        sort: { publishedAt: 'desc' },
      });

      const sanitized = await this.sanitizeOutput(articles, ctx);
      return this.transformResponse(sanitized);
    },
  })
);
```

---

## Typing services

```ts
// src/api/article/services/article.ts
import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

export default factories.createCoreService(
  'api::article.article',
  ({ strapi }: { strapi: Core.Strapi }) => ({

    async findBySlug(slug: string, locale: string = 'en') {
      const articles = await strapi.documents('api::article.article').findMany({
        filters: { slug: { $eq: slug } },
        locale,
        status: 'published',
        populate: ['author', 'cover', 'tags', 'seo'],
        limit: 1,
      });

      return articles[0] || null;
    },

    async computeReadingTime(content: string): Promise<number> {
      const words = content.split(/\s+/).filter(Boolean).length;
      return Math.ceil(words / 200);
    },
  })
);
```

---

## Typing custom standalone services

```ts
// src/api/notification/services/notification.ts
import type { Core } from '@strapi/strapi';

interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'error';
}

interface NotificationService {
  send(params: SendNotificationParams): Promise<void>;
  sendBulk(userIds: string[], title: string, body: string): Promise<number>;
}

export default ({ strapi }: { strapi: Core.Strapi }): NotificationService => ({
  async send({ userId, title, body, type }) {
    await strapi.documents('api::notification.notification').create({
      data: { userId, title, body, type, read: false },
    });
  },

  async sendBulk(userIds, title, body) {
    let sent = 0;
    for (const userId of userIds) {
      await this.send({ userId, title, body, type: 'info' });
      sent++;
    }
    return sent;
  },
});
```

---

## Typing routes

```ts
// src/api/article/routes/article.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::article.article', {
  config: {
    find: {
      auth: false,
      middlewares: ['api::article.cache'],
    },
    create: {
      policies: ['global::is-authenticated'],
    },
  },
});
```

```ts
// src/api/article/routes/01-custom-article.ts
export default {
  routes: [
    {
      method: 'GET' as const,
      path: '/articles/featured',
      handler: 'api::article.article.findFeatured',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET' as const,
      path: '/articles/by-slug/:slug',
      handler: 'api::article.article.findBySlug',
      config: {
        auth: false,
      },
    },
  ],
};
```

---

## Typing policies

```ts
// src/policies/is-owner.ts
import type { Core } from '@strapi/strapi';

interface PolicyConfig {
  contentType?: string;
}

const isOwner: Core.Policy = async (policyContext, config: PolicyConfig, { strapi }) => {
  const user = policyContext.state.user;
  const entryId = policyContext.params.id;

  if (!user || !entryId) return false;

  const uid = config.contentType || 'api::article.article';

  const entry = await strapi.documents(uid).findOne(entryId, {
    populate: ['createdBy'],
  });

  if (!entry) return false;

  return user.id === entry.createdBy?.id;
};

export default isOwner;
```

---

## Typing middleware

```ts
// src/middlewares/request-logger.ts
import type { Core } from '@strapi/strapi';

interface LoggerConfig {
  slowThreshold?: number;
  logBody?: boolean;
}

const requestLogger = (config: LoggerConfig, { strapi }: { strapi: Core.Strapi }) => {
  const slowThreshold = config.slowThreshold || 1000;

  return async (ctx: any, next: () => Promise<void>) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    ctx.set('X-Response-Time', `${duration}ms`);

    if (duration > slowThreshold) {
      strapi.log.warn({
        msg: 'Slow request',
        method: ctx.method,
        url: ctx.url,
        duration,
      });
    }
  };
};

export default requestLogger;
```

---

## Typing the register/bootstrap lifecycle

```ts
// src/index.ts
import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Register Document Service middleware
    strapi.documents.use(async (context, next) => {
      if (context.uid === 'api::article.article' && context.action === 'create') {
        const title: string | undefined = context.params.data?.title;
        if (title) {
          context.params.data.slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
      return next();
    });
  },

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('Application bootstrapped');
  },

  destroy({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('Application shutting down');
  },
};
```

---

## Type utilities for content types

Create reusable utility types for your content model:

```ts
// src/types/content.ts

// Base attributes shared by all content types
interface BaseAttributes {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

// Article-specific attributes
export interface ArticleAttributes extends BaseAttributes {
  title: string;
  slug: string;
  content: string;
  featured: boolean;
  publishedDate: string;
  readingTime?: number;
}

// Author-specific attributes
export interface AuthorAttributes extends BaseAttributes {
  name: string;
  bio: string;
  email: string;
}

// With relations populated
export interface ArticleWithRelations extends ArticleAttributes {
  author: AuthorAttributes | null;
  tags: Array<{ name: string; slug: string }>;
  cover: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
    formats: Record<string, { url: string; width: number; height: number }>;
  } | null;
}

// API response shape
export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}
```

### Using in frontend code

```tsx
import type { ArticleWithRelations, StrapiListResponse } from '@/types/content';

async function fetchArticles(locale: string): Promise<StrapiListResponse<ArticleWithRelations>> {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/articles?locale=${locale}&populate=author,cover,tags`
  );
  return res.json();
}
```

---

## tsconfig.json for Strapi

Strapi generates a `tsconfig.json`, but here's a recommended configuration:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.json"],
  "exclude": ["node_modules", "dist", "build", ".cache"]
}
```

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Missing `ts:generate-types` | No autocomplete for content attributes | Run it after schema changes |
| `any` types everywhere | Defeats the purpose of TypeScript | Define interfaces for your content types |
| JSON schemas not in `include` | `resolveJsonModule` doesn't find schemas | Add `"src/**/*.json"` to `include` |
| `ctx` typed as `any` | No type safety in controllers | Strapi's Koa context types are limited; add assertions |
| Forgetting `as const` on route methods | `method` inferred as `string` instead of `'GET'` | Use `'GET' as const` |
| Types diverge from schema | Runtime errors despite TypeScript compiling | Regenerate types after every schema change |

---

## See also

- [Custom Controllers and Services](./custom-controllers-services.md) -- JS examples to convert to TS
- [Plugin Development](./plugin-development.md) -- TypeScript plugin structure
- [Testing Strapi Applications](./testing-strapi-applications.md) -- typing test helpers
