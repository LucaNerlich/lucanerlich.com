---
title: "TypeScript Integration"
sidebar_label: "TypeScript"
description: Setting up TypeScript in Strapi 5, generating types from content schemas, typing controllers, services, and Document Service queries.
slug: /strapi/beginners-guide/typescript-integration
tags: [strapi, beginners]
keywords:
  - strapi typescript
  - strapi type generation
  - strapi typed controllers
  - strapi typed services
  - strapi ts
sidebar_position: 11
---

# TypeScript Integration

Strapi 5 supports TypeScript natively. Adding types to your project gives you autocompletion, compile-time error checking, and better documentation. In this chapter we will convert our JavaScript project to TypeScript and type everything we have built so far.

If you are not familiar with TypeScript basics, check out the [TypeScript chapter](/javascript/beginners-guide/typescript) in the JavaScript guide first.

## Starting a new project with TypeScript

If you are starting fresh, create a TypeScript project directly:

```bash
npx create-strapi@latest my-blog --typescript
```

This scaffolds the project with `.ts` files and a proper `tsconfig.json` from the start.

## Converting an existing project

If you followed this guide with JavaScript, here is how to convert:

### Step 1 -- Rename files

Rename your JavaScript files to TypeScript:

```bash
# Config files
mv config/admin.js config/admin.ts
mv config/database.js config/database.ts
mv config/middlewares.js config/middlewares.ts
mv config/plugins.js config/plugins.ts
mv config/server.js config/server.ts
mv config/api.js config/api.ts

# Source files
mv src/index.js src/index.ts

# API files (for each content type)
mv src/api/post/controllers/post.js src/api/post/controllers/post.ts
mv src/api/post/services/post.js src/api/post/services/post.ts
mv src/api/post/routes/post.js src/api/post/routes/post.ts
mv src/api/post/routes/custom-post.js src/api/post/routes/custom-post.ts

# Policies and middleware
mv src/api/post/policies/is-owner.js src/api/post/policies/is-owner.ts
mv src/api/post/middlewares/log-request.js src/api/post/middlewares/log-request.ts
mv src/middlewares/request-timer.js src/middlewares/request-timer.ts
```

### Step 2 -- Verify tsconfig.json

Strapi projects include a `tsconfig.json` by default. Verify it has reasonable settings:

```json
{
  "extends": "@strapi/typescript-utils/tsconfigs/server",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": [
    "./src",
    "./config",
    "./"
  ]
}
```

### Step 3 -- Restart the server

```bash
npm run develop
```

Strapi compiles TypeScript automatically on startup. If there are type errors, they appear in the console.

## Generating types from content schemas

Strapi can auto-generate TypeScript types from your content type schemas. This is the most powerful TypeScript feature -- your types stay in sync with your data model.

### Generate types

```bash
npm run strapi ts:generate-types
```

This creates a `types/generated/` directory with types for all your content types:

```
types/
└── generated/
    ├── components.d.ts    # Component types
    └── contentTypes.d.ts  # Content type types
```

### Example generated types

For our Post content type:

```typescript
// types/generated/contentTypes.d.ts (simplified)
export interface ApiPostPost {
  kind: "collectionType";
  collectionName: "posts";
  info: {
    singularName: "post";
    pluralName: "posts";
    displayName: "Post";
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
    slug: Schema.Attribute.UID<"api::post.post", "title"> &
      Schema.Attribute.Required;
    content: Schema.Attribute.Blocks;
    excerpt: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    publishedDate: Schema.Attribute.Date;
    featured: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    seo: Schema.Attribute.Component<"shared.seo">;
    author: Schema.Attribute.Relation<
      "manyToOne",
      "api::author.author"
    >;
    category: Schema.Attribute.Relation<
      "manyToOne",
      "api::category.category"
    >;
    tags: Schema.Attribute.Relation<
      "manyToMany",
      "api::tag.tag"
    >;
    // ... standard Strapi fields (createdAt, updatedAt, etc.)
  };
}
```

> **Tip:** Re-run `npm run strapi ts:generate-types` whenever you change a content type schema. Some teams add this to a pre-build script.

### Auto-generate on restart

You can configure Strapi to regenerate types on every server restart:

```typescript
// config/admin.ts
export default ({ env }) => ({
  autoGenerateTypes: true,
  // ... other admin config
});
```

## Typing controllers

### Basic typed controller

```typescript
// src/api/post/controllers/post.ts
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: ctx.query.populate || {
          author: { fields: ["name"] },
          category: { fields: ["name", "slug"] },
          tags: { fields: ["name", "slug"] },
        },
      };

      return await super.find(ctx);
    },

    async findFeatured(ctx) {
      const posts = await strapi.documents("api::post.post").findMany({
        filters: { featured: true },
        status: "published",
        populate: {
          author: { fields: ["name"] },
          category: { fields: ["name", "slug"] },
        },
        sort: { publishedDate: "desc" },
        limit: 5,
      });

      const sanitized = await this.sanitizeOutput(posts, ctx);
      return { data: sanitized };
    },

    async findBySlug(ctx) {
      const { slug } = ctx.params as { slug: string };

      const posts = await strapi.documents("api::post.post").findMany({
        filters: { slug },
        status: "published",
        populate: {
          author: { fields: ["name"], populate: { avatar: true } },
          category: { fields: ["name", "slug"] },
          tags: { fields: ["name", "slug"] },
          seo: true,
        },
        limit: 1,
      });

      if (posts.length === 0) {
        return ctx.notFound("Post not found");
      }

      const sanitized = await this.sanitizeOutput(posts[0], ctx);
      return { data: sanitized };
    },
  })
);
```

Notice the differences from JavaScript:

- `import` instead of `require`
- `factories.createCoreController` instead of destructuring
- Type annotations on params: `ctx.params as { slug: string }`
- `export default` instead of `module.exports`

## Typing services

```typescript
// src/api/post/services/post.ts
import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::post.post",
  ({ strapi }) => ({
    async findPopular(limit: number = 5) {
      return await strapi.documents("api::post.post").findMany({
        status: "published",
        sort: { publishedDate: "desc" },
        limit,
        populate: {
          author: { fields: ["name"] },
          category: { fields: ["name"] },
        },
      });
    },

    async findRelated(postId: string, limit: number = 3) {
      const post = await strapi.documents("api::post.post").findOne({
        documentId: postId,
        populate: ["category", "tags"],
      });

      if (!post) return [];

      const tagIds = (post.tags as Array<{ id: number }>)?.map(
        (t) => t.id
      ) || [];

      return await strapi.documents("api::post.post").findMany({
        filters: {
          documentId: { $ne: postId },
          $or: [
            { category: { id: (post.category as { id: number })?.id } },
            { tags: { id: { $in: tagIds } } },
          ],
        },
        status: "published",
        limit,
        populate: {
          author: { fields: ["name"] },
          category: { fields: ["name"] },
        },
      });
    },
  })
);
```

## Typing routes

```typescript
// src/api/post/routes/post.ts
import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::post.post", {
  config: {
    find: {
      middlewares: ["api::post.log-request"],
    },
    update: {
      policies: ["api::post.is-owner"],
    },
    delete: {
      policies: ["api::post.is-owner"],
    },
  },
});
```

```typescript
// src/api/post/routes/custom-post.ts
export default {
  routes: [
    {
      method: "GET" as const,
      path: "/api/posts/featured",
      handler: "api::post.post.findFeatured",
      config: {
        auth: false,
      },
    },
    {
      method: "GET" as const,
      path: "/api/posts/by-slug/:slug",
      handler: "api::post.post.findBySlug",
      config: {
        auth: false,
      },
    },
  ],
};
```

## Typing policies

```typescript
// src/api/post/policies/is-owner.ts
import type { Core } from "@strapi/strapi";

const isOwner: Core.Policy = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  const { id } = policyContext.params as { id: string };

  const post = await strapi.documents("api::post.post").findOne({
    documentId: id,
    populate: { author: { fields: ["id"] } },
  });

  if (!post) {
    return false;
  }

  const author = post.author as { id: number } | null;

  return author?.id === user.id;
};

export default isOwner;
```

## Typing middleware

```typescript
// src/api/post/middlewares/log-request.ts
import type { Core } from "@strapi/strapi";

const logRequest: Core.MiddlewareFactory = (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();

    strapi.log.info(
      `[POST API] ${ctx.method} ${ctx.url} - Start`
    );

    await next();

    const duration = Date.now() - start;
    strapi.log.info(
      `[POST API] ${ctx.method} ${ctx.url} - ${ctx.status} (${duration}ms)`
    );
  };
};

export default logRequest;
```

## Typing the bootstrap and register functions

```typescript
// src/index.ts
import type { Core } from "@strapi/strapi";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Auto-generate slugs
    strapi.documents.use(async (context, next) => {
      if (
        context.uid === "api::post.post" &&
        (context.action === "create" || context.action === "update")
      ) {
        const data = context.params.data as
          | { title?: string; slug?: string }
          | undefined;

        if (data?.title && !data.slug) {
          data.slug = slugify(data.title);
        }
      }

      return await next();
    });
  },

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info("Strapi bootstrapped successfully");
  },
};
```

## Typing config files

```typescript
// config/server.ts
export default ({ env }: { env: (key: string, defaultValue?: string) => string }) => ({
  host: env("HOST", "0.0.0.0"),
  port: parseInt(env("PORT", "1337"), 10),
  app: {
    keys: env("APP_KEYS", "").split(","),
  },
});
```

```typescript
// config/database.ts
export default ({ env }: { env: (key: string, defaultValue?: string) => string }) => ({
  connection: {
    client: "sqlite",
    connection: {
      filename: env("DATABASE_FILENAME", ".tmp/data.db"),
    },
    useNullAsDefault: true,
  },
});
```

## Custom type utilities

For convenience, create helper types for common patterns:

```typescript
// src/types/index.ts

// Extract the data shape from a content type
type Post = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: unknown;
  excerpt: string | null;
  publishedDate: string | null;
  featured: boolean;
  author?: Author | null;
  category?: Category | null;
  tags?: Tag[];
  seo?: SEO | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

type Author = {
  id: number;
  documentId: string;
  name: string;
  bio: string | null;
  email: string;
  avatar?: MediaFile | null;
};

type Category = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
};

type Tag = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
};

type SEO = {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
};

type MediaFile = {
  id: number;
  documentId: string;
  name: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: Record<string, { url: string; width: number; height: number }>;
  mime: string;
  size: number;
};

export type { Post, Author, Category, Tag, SEO, MediaFile };
```

Use these in your controllers and services:

```typescript
import type { Post } from "../../../types";

async findBySlug(ctx) {
  const posts = await strapi.documents("api::post.post").findMany({
    // ...
  }) as Post[];

  if (posts.length === 0) {
    return ctx.notFound("Post not found");
  }

  return { data: posts[0] };
}
```

## TypeScript tips for Strapi

### Run type checking separately

The dev server transpiles TypeScript but does not do full type checking. Run `tsc` separately:

```bash
npx tsc --noEmit
```

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

### Regenerate types after schema changes

Every time you change a content type schema (via the admin panel or by editing JSON), regenerate types:

```bash
npm run strapi ts:generate-types
```

### Use strict mode

Enable strict mode in `tsconfig.json` for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

> For advanced TypeScript patterns, see the [TypeScript Integration](/strapi/typescript-integration) reference.

## Summary

You learned:

- How to **start a new project** with TypeScript or **convert an existing one**
- **Generating types** from content schemas with `ts:generate-types`
- Typing **controllers**, **services**, **routes**, **policies**, and **middleware**
- Typing the **register** and **bootstrap** functions
- Creating **custom type utilities** for common data shapes
- TypeScript **tips** -- separate type checking, regenerating types, strict mode

Your Strapi project now has full TypeScript support. The type system catches errors at compile time and provides excellent editor autocompletion. In the final chapter we will deploy everything to production.

Next up: [Configuration & Deployment](./12-configuration-and-deployment.md) -- environment config, PostgreSQL, PM2 or systemd, nginx reverse proxy, HTTPS, and security hardening.
