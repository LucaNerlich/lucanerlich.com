---
title: "GraphQL Customization"
sidebar_position: 13
description: "Strapi GraphQL: custom resolvers, extending the auto-generated schema, middleware, auth in queries, disabling introspection, and solving N+1 problems."
tags: [strapi, graphql, api, resolvers, schema]
---

# GraphQL Customization

Strapi auto-generates a full GraphQL schema from your content types. This page covers how to extend that schema, add custom resolvers, apply middleware, secure queries, and avoid performance traps.

:::danger Mutations are exposed by default

When you install `@strapi/plugin-graphql`, Strapi generates **full CRUD mutations** (`create`, `update`, `delete`) for **every** content type. If you only configure the Public role's REST permissions in the admin panel, the GraphQL mutations may **still be accessible** unless you explicitly lock them down.

**Any attacker who can reach `/graphql` can potentially create, update, or delete content** if you don't take action. See [Securing the default schema](#securing-the-default-schema-critical) below.

:::

## Enabling GraphQL

```bash
npm install @strapi/plugin-graphql
# or
yarn add @strapi/plugin-graphql
```

```js
// config/plugins.js
module.exports = {
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,            // Auto-generate types from content types
      playgroundAlways: false,     // Disable playground in production
      depthLimit: 7,               // Prevent deeply nested queries
      amountLimit: 100,            // Max items per query
      apolloServer: {
        tracing: false,
        introspection: true,       // Set to false in production
      },
    },
  },
};
```

---

## Auto-generated schema

For a content type `Article` with fields `title`, `content`, `author` (relation), and `tags` (relation), Strapi generates:

```graphql
type Article {
  documentId: ID!
  title: String!
  content: String
  author: Author
  tags: [Tag]
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
  locale: String
}

type ArticleEntityResponseCollection {
  data: [Article!]!
  meta: ResponseCollectionMeta!
}

type Query {
  article(documentId: ID!): Article
  articles(
    filters: ArticleFiltersInput
    pagination: PaginationArg
    sort: [String]
    locale: String
    status: PublicationStatus
  ): ArticleEntityResponseCollection!
}

type Mutation {
  createArticle(data: ArticleInput!): Article
  updateArticle(documentId: ID!, data: ArticleInput!): Article
  deleteArticle(documentId: ID!): Article
}
```

---

## Securing the default schema (critical)

This is the **most important section** on this page. By default, the auto-generated schema exposes mutations that allow anyone to create, update, and delete your content -- unless you explicitly deny it.

### The problem

With the GraphQL plugin installed, an attacker can run:

```graphql
# Anyone can delete your articles if mutations are not locked down
mutation {
  deleteArticle(documentId: "abc123") {
    documentId
    title
  }
}

# Or create spam content
mutation {
  createArticle(data: { title: "HACKED", content: "spam" }) {
    documentId
  }
}
```

Even if you carefully configured the Public role in **Settings > Users & Permissions** to only allow `find` and `findOne` for the REST API, the GraphQL plugin generates its own permission layer. You must explicitly configure GraphQL permissions **separately**.

### Solution 1: disable all mutations for public-facing types (recommended)

The cleanest approach -- remove mutations from the schema entirely for content types that should be read-only:

```js
// src/index.js
module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    // Articles: read-only (no create, update, delete via GraphQL)
    extensionService.shadowCRUD('api::article.article').disableMutations();

    // Pages: read-only
    extensionService.shadowCRUD('api::page.page').disableMutations();

    // Authors: read-only
    extensionService.shadowCRUD('api::author.author').disableMutations();

    // Tags: read-only
    extensionService.shadowCRUD('api::tag.tag').disableMutations();

    // Categories: read-only
    extensionService.shadowCRUD('api::category.category').disableMutations();
  },
};
```

After this, the mutations simply **don't exist** in the schema. An attacker can't call what doesn't exist.

### Solution 2: disable entire types that should not be exposed

Some content types should never be accessible via GraphQL at all (internal config, logs, etc.):

```js
// src/index.js
module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    // Completely remove from the GraphQL schema (no queries, no mutations)
    extensionService.shadowCRUD('api::audit-log.audit-log').disable();
    extensionService.shadowCRUD('api::site-settings.site-settings').disable();

    // Hide sensitive user fields even if the type is exposed
    extensionService.shadowCRUD('plugin::users-permissions.user').field('email').disable();
    extensionService.shadowCRUD('plugin::users-permissions.user').field('password').disable();
    extensionService.shadowCRUD('plugin::users-permissions.user').field('resetPasswordToken').disable();
    extensionService.shadowCRUD('plugin::users-permissions.user').field('confirmationToken').disable();
  },
};
```

### Solution 3: disable individual mutations

If you need `create` but not `delete`, disable specific actions:

```js
module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    // Allow creating reviews, but not updating or deleting them
    extensionService.shadowCRUD('api::review.review').disableAction('update');
    extensionService.shadowCRUD('api::review.review').disableAction('delete');

    // Disable only queries (e.g., write-only contact form)
    extensionService.shadowCRUD('api::contact.contact').disableAction('find');
    extensionService.shadowCRUD('api::contact.contact').disableAction('findOne');
  },
};
```

### Solution 4: require authentication on mutations via resolversConfig

If you want the mutations to exist in the schema (for authenticated admin use) but block unauthenticated access:

```js
module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      resolversConfig: {
        // Public read access (no auth required)
        'Query.articles': { auth: false },
        'Query.article': { auth: false },

        // Mutations require authentication + specific permissions
        'Mutation.createArticle': {
          auth: {
            scope: ['api::article.article.create'],
          },
        },
        'Mutation.updateArticle': {
          auth: {
            scope: ['api::article.article.update'],
          },
        },
        'Mutation.deleteArticle': {
          auth: {
            scope: ['api::article.article.delete'],
          },
        },
      },
    });
  },
};
```

### Solution 5: role-based mutation guard middleware

For fine-grained control, use a middleware that checks the user's role:

```js
module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    // Reusable middleware: only allow specific roles
    const requireRole = (...allowedRoles) => {
      return async (next, parent, args, context, info) => {
        const user = context.state?.user;

        if (!user) {
          throw new Error('Authentication required');
        }

        if (!allowedRoles.includes(user.role?.type)) {
          throw new Error(
            `Forbidden: requires one of [${allowedRoles.join(', ')}], ` +
            `but you are "${user.role?.type}"`
          );
        }

        return next(parent, args, context, info);
      };
    };

    extensionService.use({
      resolversConfig: {
        // Anyone can read
        'Query.articles': { auth: false },
        'Query.article': { auth: false },

        // Only editors and admins can create
        'Mutation.createArticle': {
          middlewares: [requireRole('editor', 'admin')],
        },

        // Only admins can update and delete
        'Mutation.updateArticle': {
          middlewares: [requireRole('admin')],
        },
        'Mutation.deleteArticle': {
          middlewares: [requireRole('admin')],
        },
      },
    });
  },
};
```

### Complete recommended setup for a typical CMS frontend

Most Strapi projects use GraphQL as a **read-only API** for the frontend, while content is managed via the admin panel. Here is the recommended secure configuration:

```js
// src/index.js
module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    // ── 1. Remove mutations from all public-facing content types ──
    const readOnlyTypes = [
      'api::article.article',
      'api::page.page',
      'api::author.author',
      'api::tag.tag',
      'api::category.category',
    ];

    for (const uid of readOnlyTypes) {
      extensionService.shadowCRUD(uid).disableMutations();
    }

    // ── 2. Completely hide internal types ──
    const hiddenTypes = [
      'api::audit-log.audit-log',
      'api::failed-webhook.failed-webhook',
    ];

    for (const uid of hiddenTypes) {
      try {
        extensionService.shadowCRUD(uid).disable();
      } catch {
        // Type might not exist, that's fine
      }
    }

    // ── 3. Hide sensitive user fields ──
    const sensitiveUserFields = [
      'email', 'password', 'resetPasswordToken',
      'confirmationToken', 'provider',
    ];

    for (const field of sensitiveUserFields) {
      try {
        extensionService.shadowCRUD('plugin::users-permissions.user').field(field).disable();
      } catch {
        // Field might not exist
      }
    }

    // ── 4. Make read queries public, require auth for everything else ──
    extensionService.use({
      resolversConfig: {
        'Query.articles': { auth: false },
        'Query.article': { auth: false },
        'Query.pages': { auth: false },
        'Query.page': { auth: false },
        'Query.authors': { auth: false },
        'Query.author': { auth: false },
        'Query.tags': { auth: false },
        'Query.categories': { auth: false },
      },
    });
  },
};
```

### Verifying your lockdown

After applying the configuration, test it:

```graphql
# This should work (read):
query { articles { data { documentId title } } }

# This should fail with "Cannot query field" (mutation removed from schema):
mutation { deleteArticle(documentId: "abc") { documentId } }

# This should fail (hidden type):
query { auditLogs { data { documentId } } }

# This should NOT return email (hidden field):
query { usersPermissionsUsers { data { username email } } }
```

If any of these succeed when they shouldn't, review your `register()` configuration.

---

## Extending the schema with custom resolvers

Use the extension service in `src/index.js`:

### Adding a custom query

```js
// src/index.js
module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Query {
          featuredArticles: [Article]!
          articleBySlug(slug: String!, locale: String): Article
        }
      `,

      resolvers: {
        Query: {
          featuredArticles: {
            resolve: async (parent, args, context) => {
              const articles = await strapi.documents('api::article.article').findMany({
                filters: { featured: true },
                status: 'published',
                populate: ['author', 'cover', 'tags'],
                sort: { publishedAt: 'desc' },
                limit: 10,
              });
              return articles;
            },
          },

          articleBySlug: {
            resolve: async (parent, { slug, locale }, context) => {
              const articles = await strapi.documents('api::article.article').findMany({
                filters: { slug: { $eq: slug } },
                locale: locale || 'en',
                status: 'published',
                populate: ['author', 'cover', 'tags', 'seo'],
                limit: 1,
              });
              return articles[0] || null;
            },
          },
        },
      },
    }));
  },
};
```

### Adding a custom mutation

```js
extensionService.use(({ strapi }) => ({
  typeDefs: `
    input ContactFormInput {
      name: String!
      email: String!
      message: String!
      subject: String
    }

    type ContactFormResponse {
      success: Boolean!
      message: String!
    }

    type Mutation {
      submitContactForm(input: ContactFormInput!): ContactFormResponse!
    }
  `,

  resolvers: {
    Mutation: {
      submitContactForm: {
        resolve: async (parent, { input }, context) => {
          const { name, email, message, subject } = input;

          // Validate
          if (!email.includes('@')) {
            return { success: false, message: 'Invalid email address' };
          }

          // Store the submission
          await strapi.documents('api::contact.contact').create({
            data: { name, email, message, subject },
          });

          // Send notification email
          await strapi.plugins['email'].services.email.send({
            to: 'admin@example.com',
            subject: `Contact: ${subject || 'No subject'}`,
            html: `<p><strong>${name}</strong> (${email}):</p><p>${message}</p>`,
          });

          return { success: true, message: 'Message sent successfully' };
        },
      },
    },
  },
}));
```

---

## Custom field resolvers

Add computed fields to existing types:

```js
extensionService.use(({ strapi }) => ({
  typeDefs: `
    type Article {
      readingTime: Int
      excerpt: String
    }
  `,

  resolvers: {
    Article: {
      readingTime: {
        resolve: (parent) => {
          const content = parent.content || '';
          const words = content.split(/\s+/).filter(Boolean).length;
          return Math.ceil(words / 200);
        },
      },

      excerpt: {
        resolve: (parent) => {
          const content = parent.content || '';
          const plainText = content.replace(/<[^>]*>/g, ''); // Strip HTML
          return plainText.length > 200
            ? plainText.substring(0, 200) + '...'
            : plainText;
        },
      },
    },
  },
}));
```

---

## GraphQL middleware

Apply middleware to specific resolvers for logging, caching, or authorization:

```js
extensionService.use({
  resolversConfig: {
    // Apply to a specific query
    'Query.articles': {
      middlewares: [
        // Logging middleware
        async (next, parent, args, context, info) => {
          console.time('articles-query');
          const result = await next(parent, args, context, info);
          console.timeEnd('articles-query');
          return result;
        },

        // Cache-control middleware
        async (next, parent, args, context, info) => {
          info.cacheControl.setCacheHint({ maxAge: 300, scope: 'PUBLIC' });
          return next(parent, args, context, info);
        },
      ],
    },

    // Disable auth for public queries
    'Query.articleBySlug': {
      auth: false,
    },

    // Restrict mutations to authenticated users
    'Mutation.createArticle': {
      auth: {
        scope: ['api::article.article.create'],
      },
    },

    // Custom auth check
    'Mutation.deleteArticle': {
      middlewares: [
        async (next, parent, args, context, info) => {
          const user = context.state?.user;
          if (!user || user.role?.type !== 'admin') {
            throw new Error('Only admins can delete articles');
          }
          return next(parent, args, context, info);
        },
      ],
    },
  },
});
```

---

## Production security

### Disable introspection

```js
// config/env/production/plugins.js
module.exports = {
  graphql: {
    config: {
      playgroundAlways: false,
      apolloServer: {
        introspection: false,   // Prevents schema discovery
      },
    },
  },
};
```

### Query depth limiting

```js
module.exports = {
  graphql: {
    config: {
      depthLimit: 5,       // Prevent { article { author { articles { author { ... } } } } }
      amountLimit: 50,     // Max items per list query
    },
  },
};
```

### Rate limiting on the GraphQL endpoint

Use a global middleware:

```js
// src/middlewares/graphql-rate-limit.js
const rateLimit = new Map();

module.exports = (config, { strapi }) => {
  const { maxRequests = 100, windowMs = 60000 } = config;

  return async (ctx, next) => {
    if (ctx.url !== '/graphql') {
      return next();
    }

    const ip = ctx.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    const requests = rateLimit.get(ip) || [];
    const recentRequests = requests.filter(t => t > windowStart);

    if (recentRequests.length >= maxRequests) {
      ctx.status = 429;
      ctx.body = { errors: [{ message: 'Too many requests' }] };
      return;
    }

    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);

    await next();
  };
};
```

---

## Solving N+1 with DataLoader

The auto-generated schema can cause N+1 queries when resolving relations. For custom resolvers, use DataLoader:

```js
const DataLoader = require('dataloader');

// Create a loader per request
function createAuthorLoader(strapi) {
  return new DataLoader(async (authorIds) => {
    const authors = await strapi.documents('api::author.author').findMany({
      filters: { documentId: { $in: authorIds } },
    });

    // Return in the same order as the input IDs
    const authorMap = new Map(authors.map(a => [a.documentId, a]));
    return authorIds.map(id => authorMap.get(id) || null);
  });
}

// Use in resolver
extensionService.use(({ strapi }) => ({
  resolvers: {
    Article: {
      author: {
        resolve: async (parent, args, context) => {
          if (!context.loaders) {
            context.loaders = {};
          }
          if (!context.loaders.author) {
            context.loaders.author = createAuthorLoader(strapi);
          }
          return context.loaders.author.load(parent.author?.documentId);
        },
      },
    },
  },
}));
```

---

## Example queries

### Filtered list with pagination

```graphql
query Articles($locale: String, $page: Int, $pageSize: Int) {
  articles(
    locale: $locale
    pagination: { page: $page, pageSize: $pageSize }
    sort: "publishedAt:desc"
    filters: { tags: { slug: { eq: "javascript" } } }
    status: PUBLISHED
  ) {
    data {
      documentId
      title
      slug
      publishedAt
      author {
        name
      }
      cover {
        url
        alternativeText
      }
    }
    meta {
      pagination {
        page
        pageSize
        pageCount
        total
      }
    }
  }
}
```

### Single entry with deep population

```graphql
query ArticleBySlug($slug: String!) {
  articleBySlug(slug: $slug) {
    documentId
    title
    content
    publishedAt
    readingTime
    author {
      name
      bio
      avatar { url }
    }
    tags { name slug }
    seo {
      metaTitle
      metaDescription
      ogImage { url width height }
    }
  }
}
```

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| **Mutations exposed by default** | **Anyone can create/update/delete content** | **`disableMutations()` on all read-only types** |
| Introspection enabled in production | Schema leaks to attackers | Set `introspection: false` in production config |
| No depth limit | Malicious nested queries crash the server | Set `depthLimit: 5-7` |
| Trusting REST permissions for GraphQL | GraphQL has its own permission layer | Configure `resolversConfig` and `shadowCRUD` separately |
| N+1 queries on relations | Slow list queries | Use DataLoader or ensure population is optimized |
| Missing `auth: false` on public queries | 403 for anonymous users | Set `auth: false` in `resolversConfig` |
| Playground enabled in production | Security and information disclosure risk | Set `playgroundAlways: false` |
| Sensitive user fields exposed | Email, password hash visible in schema | `field('email').disable()` on user type |

---

## See also

- [Custom Controllers and Services](./custom-controllers-services.md) -- REST counterpart of GraphQL resolvers
- [Relations and Population](./relations-and-population.md) -- population patterns that apply to GraphQL too
- [Authentication and Permissions](./authentication-and-permissions.md) -- auth context in resolvers
- [Performance and Caching](./performance-and-caching.md) -- query optimization strategies
