---
title: "Custom Routes and Endpoints"
sidebar_position: 6
description: "Strapi custom routes: creating custom endpoints, URL parameters, regex routes, route configuration, public routes, and route middleware/policy attachment."
tags: [strapi, routes, endpoints, api]
---

# Custom Routes and Endpoints

Strapi auto-generates REST routes for every content type (`find`, `findOne`, `create`, `update`, `delete`). Custom routes let you add new endpoints, change URL patterns, or restrict access to existing ones.

## Core router vs custom router

| Concept | Core Router | Custom Router |
|---------|-------------|---------------|
| **Created by** | `createCoreRouter()` factory | Manual route definition |
| **Actions** | Maps to default controller CRUD | Maps to any controller action |
| **File** | `src/api/[name]/routes/[name].js` | `src/api/[name]/routes/01-custom.js` |
| **Override config** | Use `config` object to attach middleware/policies | Use per-route `config` object |

---

## Configuring the core router

The core router already handles the five standard CRUD routes. You can customise each action's config:

```js
// src/api/article/routes/article.js
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::article.article', {
  config: {
    // Make find (list) public
    find: {
      auth: false,
      middlewares: ['api::article.default-populate'],
      policies: [],
    },
    // Make findOne public
    findOne: {
      auth: false,
    },
    // Restrict create to authenticated editors
    create: {
      policies: [
        {
          name: 'global::has-role',
          config: { roles: ['editor', 'admin'] },
        },
      ],
    },
    // Only owners can update
    update: {
      middlewares: ['api::article.is-owner'],
    },
    // Only admins can delete
    delete: {
      policies: [
        {
          name: 'global::has-role',
          config: { roles: ['admin'] },
        },
      ],
    },
  },
});
```

---

## Creating custom routes

Custom routes expose new endpoints that map to controller actions.

### Basic custom route

```js
// src/api/article/routes/01-custom-article.js
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/featured',
      handler: 'api::article.article.findFeatured',
      config: {
        auth: false, // public endpoint
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/like',
      handler: 'api::article.article.like',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

> Route files load in **alphabetical order**. Prefix custom routes with `01-` so they load before the core router and avoid being shadowed by wildcard patterns.

### URL parameters

```js
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/by-author/:authorId',
      handler: 'api::article.article.findByAuthor',
    },
    {
      method: 'GET',
      path: '/articles/:year/:month',
      handler: 'api::article.article.findByDate',
    },
  ],
};
```

Parameters are available in the controller via `ctx.params`:

```js
// Controller
async findByAuthor(ctx) {
  const { authorId } = ctx.params;
  const articles = await strapi.documents('api::article.article').findMany({
    filters: { author: { documentId: authorId } },
    populate: ['cover'],
    status: 'published',
  });
  return { data: articles };
},

async findByDate(ctx) {
  const { year, month } = ctx.params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const articles = await strapi.documents('api::article.article').findMany({
    filters: {
      publishedAt: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      },
    },
  });
  return { data: articles };
},
```

### Regex-constrained parameters

```js
module.exports = {
  routes: [
    {
      method: 'GET',
      // Only match numeric IDs
      path: '/articles/:id(\\d+)',
      handler: 'api::article.article.findOne',
    },
    {
      method: 'GET',
      // Only match lowercase slug patterns
      path: '/articles/:slug([a-z0-9-]+)',
      handler: 'api::article.article.findBySlug',
    },
  ],
};
```

---

## Public routes (no authentication)

Set `auth: false` in the route config:

```js
{
  method: 'GET',
  path: '/articles/sitemap',
  handler: 'api::article.article.sitemap',
  config: {
    auth: false,
  },
}
```

You must also enable the route in the **Users & Permissions** plugin under **Public** role permissions.

---

## Route-level middleware and policies

Attach middleware and/or policies directly to a route:

```js
{
  method: 'GET',
  path: '/articles/premium',
  handler: 'api::article.article.findPremium',
  config: {
    policies: [
      'global::is-authenticated',
      {
        name: 'global::has-role',
        config: { roles: ['premium', 'admin'] },
      },
    ],
    middlewares: [
      'api::article.response-time',
      // Inline middleware
      (ctx, next) => {
        ctx.set('X-Content-Type', 'premium');
        return next();
      },
    ],
  },
}
```

---

## Example: full custom API

A complete example of a "search" endpoint with its own route, controller, and service:

### Route

```js
// src/api/search/routes/search.js
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'api::search.search.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

### Controller

```js
// src/api/search/controllers/search.js
module.exports = {
  async search(ctx) {
    const { q, type, page = 1, pageSize = 20 } = ctx.query;

    if (!q || q.length < 2) {
      return ctx.badRequest('Search query must be at least 2 characters');
    }

    const results = await strapi.service('api::search.search').search({
      query: q,
      type,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    return results;
  },
};
```

### Service

```js
// src/api/search/services/search.js
module.exports = ({ strapi }) => ({
  async search({ query, type, page, pageSize }) {
    const searchableTypes = {
      articles: 'api::article.article',
      pages: 'api::page.page',
      products: 'api::product.product',
    };

    const typesToSearch = type
      ? { [type]: searchableTypes[type] }
      : searchableTypes;

    const results = {};

    for (const [key, uid] of Object.entries(typesToSearch)) {
      const { results: items, pagination } = await strapi
        .documents(uid)
        .findMany({
          filters: {
            $or: [
              { title: { $containsi: query } },
              { description: { $containsi: query } },
            ],
          },
          fields: ['title', 'slug', 'description'],
          status: 'published',
          page,
          pageSize,
        });

      results[key] = { items, pagination };
    }

    return { data: results, query };
  },
});
```

---

## TypeScript routes

```ts
// src/api/article/routes/01-custom-article.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/featured',
      handler: 'api::article.article.findFeatured',
      config: {
        auth: false,
      },
    },
  ],
};
```

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Custom route shadowed by core router | Core wildcard `:id` matches your custom path | Prefix custom route file with `01-` |
| `handler` string typo | Route returns 404 | Use the full `api::name.controller.action` format |
| Public route but no role permission | 403 Forbidden despite `auth: false` | Enable the route in Public role settings |
| Duplicate method+path | Only the first route wins | Ensure unique method+path combinations |
| Missing controller action | 500 error on request | Create the corresponding controller method |

---

## See also

- [Custom Controllers and Services](custom-controllers-services.md) -- implementing the handler actions
- [Middleware and Policies](middleware-and-policies.md) -- attaching access control to routes
- [Authentication and Permissions](authentication-and-permissions.md) -- auth configuration for routes
