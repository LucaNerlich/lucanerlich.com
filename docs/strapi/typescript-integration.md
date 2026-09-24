---
title: "TypeScript Integration"
sidebar_position: 16
description: "Strapi TypeScript: project setup, type generation, typing controllers and services, typed Document Service queries, custom type utilities, and migration from JS."
tags: [strapi, typescript, types, development]
---

# TypeScript Integration

Strapi 5 supports TypeScript natively. However, the type story is still evolving - auto-generated types from content
schemas, typing custom controllers and services, and getting full IntelliSense requires some setup.

## Starting a TypeScript project

```bash
npx create-strapi@latest my-project --typescript
# or with a specific template:
npx create-strapi@latest my-project --typescript --template blog
```

Strapi detects TypeScript automatically and generates `.ts` files for controllers, services, routes, and policies.

---

## Project structure (TS)

```text
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
npm run strapi ts:generate-types -- --debug
# or
yarn strapi ts:generate-types --debug
```

This generates `types/generated/contentTypes.d.ts` and `types/generated/components.d.ts` based on your schema JSON files,
giving you autocomplete for content-type attributes.

You can ask Strapi to regenerate these files when the server restarts:

```javascript
// config/typescript.js
module.exports = {
  autogenerate: true,
};
```

### Using generated types

```typescript
// The generated types give you interfaces like:
// import { Article } from '../../../types/generated/contentTypes';

// In practice, use Strapi's built-in types:
import type { Core } from '@strapi/strapi';
```

Strapi's public type namespaces should be imported from `@strapi/strapi`, not from `@strapi/types`:

```typescript
import type { Core, Data, UID } from '@strapi/strapi';

const articleUID = 'api::article.article' satisfies UID.ContentType;
type ArticleDocument = Data.ContentType<'api::article.article'>;

function handleKnownArticle(article: ArticleDocument) {
  return article.documentId;
}

function handleGenericContent(uid: UID.ContentType, document: Data.ContentType) {
  return { uid, documentId: document.documentId };
}
```

### Document Service result and parameter types

The Document Service types are the most useful generated-schema types in Strapi 5. The current public surface exposes
content values through `Data.*`, document query helpers through `Modules.Documents.*`, and populate helpers through
`Modules.Documents.Params.Populate`.

```typescript
import type { Core, Data, Modules, UID } from '@strapi/strapi';

type PostUID = 'api::post.post';

type PostDocument = Modules.Documents.Document<PostUID>;
type PostContentType = Data.ContentType<PostUID>;
type SeoComponent = Data.Component<'shared.seo'>;

type FindManyParams = Modules.Documents.ServiceParams<PostUID>['findMany'];
type PopulateParam = Modules.Documents.Params.Populate.Any<PostUID>;

const populate = {
  author: true,
  cover: { fields: ['url', 'alternativeText'] },
  seo: true,
} satisfies PopulateParam;

const params = {
  status: 'published',
  populate,
  fields: ['title', 'slug', 'publishedAt'],
} satisfies FindManyParams;

type PostListResult = Modules.Documents.Result<PostUID, typeof params>;

async function findPosts(strapi: Core.Strapi): Promise<PostListResult[]> {
  return strapi.documents('api::post.post').findMany(params);
}
```

`Data.ContentType<'api::post.post'>` and `Data.Component<'shared.seo'>` represent full generated schema values.
`Modules.Documents.Document<TUID, TParams>` and `Modules.Documents.Result<TUID, TParams>` narrow that value for selected
`fields` and root-level `populate` parameters. Keep query params as literals with `satisfies` or `as const`; if they are
widened to `FindManyParams`, TypeScript loses the exact populated keys. The current Strapi 5 result helpers infer
top-level populated attributes from the `TParams` generic, but nested populate is not deeply modeled, so validate nested
objects at the boundary when the shape matters.

### Components and dynamic zones

`strapi ts:generate-types` also writes `types/generated/components.d.ts`. The generated file declares component schema
interfaces and augments Strapi's public schema registry:

```typescript
import type { Schema, Struct } from '@strapi/strapi';

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
  };
  attributes: {
    metaTitle: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.seo': SharedSeo;
    }
  }
}
```

Dynamic zones contain component values at runtime. In REST and frontend DTOs, model them as a discriminated union with
`__component`; this keeps rendering code exhaustive and avoids unsafe property checks:

```typescript
import type { Data } from '@strapi/strapi';

type BlocksHero = Data.Component<'blocks.hero'> & {
  __component: 'blocks.hero';
};

type BlocksQuote = Data.Component<'blocks.quote'> & {
  __component: 'blocks.quote';
};

type PageBlock = BlocksHero | BlocksQuote;

function isHeroBlock(block: PageBlock): block is BlocksHero {
  return block.__component === 'blocks.hero';
}

function renderBlock(block: PageBlock) {
  if (isHeroBlock(block)) {
    return block.heading;
  }

  switch (block.__component) {
    case 'blocks.quote':
      return block.quote;
    default: {
      const neverBlock: never = block;
      return neverBlock;
    }
  }
}
```

---

## Typing controllers

```typescript
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

For custom controller methods, pass factory generics the same way you do for services:

```typescript
import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

type ArticleUID = 'api::article.article';

type ArticleController = Core.CoreAPI.Controller.Extendable<ArticleUID> & {
  findFeatured: Core.ControllerHandler;
};

export default factories.createCoreController<ArticleUID, ArticleController>(
  'api::article.article',
  ({ strapi }) => ({
    async findFeatured(ctx) {
      const articles = await strapi.documents('api::article.article').findMany({
        filters: { featured: true },
        status: 'published',
      });

      const sanitized = await this.sanitizeOutput(articles, ctx);
      return this.transformResponse(sanitized);
    },
  })
);
```

---

## Typing services

```typescript
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
        pagination: { limit: 1 },
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

### Typing custom core services and `strapi.service()`

`factories.createCoreService()` is generic in the content-type UID and the custom service extension. The service file gets
the strongest inference when you name the custom methods explicitly:

```typescript
// src/api/post/services/post.ts
import { factories } from '@strapi/strapi';
import type { Core, Data } from '@strapi/strapi';

type PostUID = 'api::post.post';
type PostDocument = Data.ContentType<PostUID>;

export type PostService = Core.CoreAPI.Service.Extendable<PostUID> & {
  findBySlug(slug: string, locale?: string): Promise<PostDocument | null>;
  computeReadingTime(markdown: string): number;
};

export default factories.createCoreService<PostUID, PostService>(
  'api::post.post',
  ({ strapi }: { strapi: Core.Strapi }) => ({
    async findBySlug(slug, locale = 'en') {
      return strapi.documents('api::post.post').findFirst({
        filters: { slug: { $eq: slug } },
        locale,
        status: 'published',
        populate: { seo: true, author: true },
      });
    },

    computeReadingTime(markdown) {
      return Math.ceil(markdown.split(/\s+/).filter(Boolean).length / 200);
    },
  })
);
```

In the current public `Core.Strapi` type, `strapi.service(uid)` is not specialized by UID; it returns `Core.Service`.
Cast at the call site or create a small helper in backend code that centralizes the cast:

```typescript
import type { Core } from '@strapi/strapi';
import type { PostService } from '../services/post';

type TypedPostService = Core.CoreAPI.Service.ContentType<'api::post.post'> & PostService;

async function usePostService(strapi: Core.Strapi) {
  const postService = strapi.service('api::post.post') as TypedPostService;

  const post = await postService.findBySlug('hello-world');
  const minutes = postService.computeReadingTime(post?.content ?? '');

  return { post, minutes };
}
```

---

## Typing custom standalone services

```typescript
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

```typescript
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

```typescript
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

`Core.PolicyHandler<TConfig>` is the function signature behind `Core.Policy<TConfig>`. Use it when your policy is a
plain function, or use `Core.Policy<TConfig>` when exporting a named policy object with a validator.

```typescript
// src/policies/is-owner.ts
import type { Core } from '@strapi/strapi';

interface PolicyConfig {
  ownerField?: string;
}

const isOwner: Core.PolicyHandler<PolicyConfig> = (policyContext, config) => {
  const user = policyContext.state.user;
  const ownerField = config.ownerField ?? 'ownerId';
  const ownerId = policyContext.params[ownerField];

  return Boolean(user && ownerId && String(user.id) === String(ownerId));
};

export default isOwner;
```

---

## Typing middleware

```typescript
// src/middlewares/request-logger.ts
import type { Core } from '@strapi/strapi';

interface LoggerConfig {
  slowThreshold?: number;
  logBody?: boolean;
}

const requestLogger: Core.MiddlewareFactory<LoggerConfig> = (config, { strapi }) => {
  const slowThreshold = config.slowThreshold || 1000;

  const handler: Core.MiddlewareHandler = async (ctx, next) => {
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

  return handler;
};

export default requestLogger;
```

---

## Typing the register/bootstrap lifecycle

```typescript
// src/index.ts
import type { Core, Modules } from '@strapi/strapi';

const slugDocumentMiddleware: Modules.Documents.Middleware.Middleware = async (context, next) => {
  if (context.uid === 'api::article.article' && context.action === 'create') {
    const title = context.params.data?.title;

    if (typeof title === 'string') {
      context.params.data = {
        ...context.params.data,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      };
    }
  }

  return next();
};

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(slugDocumentMiddleware);
  },

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('Application bootstrapped');
  },

  destroy({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('Application shutting down');
  },
};
```

Content-type lifecycle hooks receive database lifecycle events. Type them from `@strapi/database`:

```typescript
// src/api/article/content-types/article/lifecycles.ts
import type { Event } from '@strapi/database';

export default {
  beforeCreate(event: Event) {
    const { data } = event.params;

    if (typeof data?.title === 'string' && !data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
  },
};
```

Document Service middleware is different from database lifecycles. `Modules.Documents.Middleware.Middleware` receives a
typed document context with `uid`, `action`, `contentType`, and the matching action params from
`Modules.Documents.ServiceParams<TUID>`.

---

## Type utilities for content types

Create reusable utility types for your content model:

```typescript
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

```typescript
import type { ArticleWithRelations, StrapiListResponse } from '@/types/content';
import qs from 'qs';

async function fetchArticles(locale: string): Promise<StrapiListResponse<ArticleWithRelations>> {
  const query = qs.stringify({
    locale,
    populate: ['author', 'cover', 'tags'],
  }, { encodeValuesOnly: true });

  const res = await fetch(`${process.env.STRAPI_URL}/api/articles?${query}`);
  return res.json();
}
```

### Sharing types with a frontend

Importing `types/generated/*.d.ts` directly into a frontend looks tempting, but it is awkward in practice:

- the generated declarations augment `@strapi/strapi` and depend on Strapi backend packages;
- `Data.ContentType` describes backend schema values, not necessarily sanitized public API payloads;
- a frontend often needs a smaller, stable DTO contract than the full CMS schema.

Practical options:

1. Publish a small workspace package such as `@acme/strapi-types` that exports frontend-safe DTOs and keeps any
   `@strapi/strapi` dependency type-only and server-only.
2. Use the official `@strapi/client` package for requests. It ships TypeScript declarations and exports generic content
   API helpers such as `API.DocumentResponse<T>`, `API.DocumentResponseCollection<T>`, and `API.BaseQueryParams`, but it
   does not generate schema-specific DTOs for your project.
3. Write explicit REST DTOs for public endpoints. This is often the clearest option for Next.js, Remix, Astro, or other
   frontend apps.

Strapi 5 REST responses are flat; there is no v4-style `attributes` wrapper:

```typescript
export interface RestListResponse<T> {
  data: T[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SeoDto {
  id: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export type ContentBlockDto =
  | {
      __component: 'blocks.hero';
      id: number;
      heading: string;
      subheading?: string | null;
    }
  | {
      __component: 'blocks.quote';
      id: number;
      quote: string;
      author?: string | null;
    };

export interface PostDto {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  publishedAt?: string | null;
  seo?: SeoDto | null;
  blocks?: ContentBlockDto[];
}

async function fetchPosts(): Promise<RestListResponse<PostDto>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?populate=*`);

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }

  return res.json();
}
```

---

## tsconfig.json for Strapi

Strapi TypeScript projects compile to `dist/` for production and admin builds. Prefer extending Strapi's maintained
server config from `@strapi/typescript-utils` instead of hand-maintaining every compiler option:

```json
{
  "extends": "@strapi/typescript-utils/tsconfigs/server",
  "compilerOptions": {
    "strict": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["./", "src/**/*.ts", "src/**/*.json"],
  "exclude": [
    "node_modules/",
    "build/",
    "dist/",
    ".cache/",
    ".tmp/",
    "src/admin/",
    "**/*.test.ts"
  ]
}
```

Run `strapi build` (for example `npm run build` in a generated Strapi project) before production deployment so the
compiled server and admin output are available.

---

## Common pitfalls

| Pitfall                                | Problem                                                              | Fix                                                                 |
|----------------------------------------|----------------------------------------------------------------------|---------------------------------------------------------------------|
| Missing `ts:generate-types`            | No autocomplete for content attributes                               | Run `strapi ts:generate-types` after schema changes                 |
| Stale generated types                  | TypeScript accepts fields that no longer exist, or rejects new ones   | Regenerate with `strapi ts:generate-types --debug` to inspect input |
| `any` types everywhere                 | Defeats the purpose of TypeScript                                    | Use `Data.ContentType`, `Data.Component`, and DTOs at boundaries    |
| Widened Document Service params        | `populate` no longer narrows result keys                             | Keep params as literals with `satisfies` or `as const`              |
| JSON schemas not in `include`          | `resolveJsonModule` doesn't find schemas                             | Add `"src/**/*.json"` to `include`                                  |
| `ctx` typed as `any`                   | No type safety in controllers                                        | Strapi's Koa context types are limited; add focused assertions      |
| Forgetting `as const` on route methods | `method` inferred as `string` instead of `'GET'`                     | Use `'GET' as const`                                                |
| `strict` mode surprises                | Generated optional/null fields expose unsafe assumptions             | Narrow values before use instead of casting away nulls              |
| `dist/` import path issues             | Production runs compiled files while local code imports from `src/`   | Use stable aliases and build with the same `tsconfig` paths         |
| Types diverge from schema              | Runtime errors despite TypeScript compiling                          | Regenerate types after every schema change                          |

---

## See also

- [Custom Controllers and Services](custom-controllers-services.md) - JS examples to convert to TS
- [Plugin Development](plugin-development.md) - TypeScript plugin structure
- [Testing Strapi Applications](testing-strapi-applications.md) - typing test helpers
