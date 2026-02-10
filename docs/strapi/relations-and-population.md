---
title: "Relations and Population"
sidebar_position: 4
description: "Strapi relations and population: defining relations, deep population, filtering on relations, performance optimization, and common query patterns."
tags: [strapi, relations, population, database, queries]
---

# Relations and Population

Relations are one of the most powerful -- and most confusing -- aspects of Strapi. Understanding how to define, query,
and populate them efficiently is essential for any non-trivial project.

## Relation types

| Type             | Example                                                    | Database              |
|------------------|------------------------------------------------------------|-----------------------|
| **One-to-One**   | User has one Profile                                       | FK on either table    |
| **One-to-Many**  | Author has many Articles                                   | FK on the "many" side |
| **Many-to-Many** | Articles have many Tags (and vice versa)                   | Join table            |
| **Many-Way**     | Article references many related Articles (one-directional) | Join table            |
| **Polymorphic**  | Comment belongs to Article or Page                         | Type + ID columns     |

Relations are configured in the Content-Type Builder or directly in the schema JSON:

```json
// src/api/article/content-types/article/schema.json
{
  "attributes": {
    "title": { "type": "string", "required": true },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::author.author",
      "inversedBy": "articles"
    },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tag.tag",
      "inversedBy": "articles"
    },
    "cover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    }
  }
}
```

---

## Population basics

By default, Strapi returns flat data **without** relations populated. You must explicitly request populated fields.

### REST API population

```bash
# Populate one level
GET /api/articles?populate=author

# Populate multiple relations
GET /api/articles?populate[0]=author&populate[1]=tags

# Populate everything (use sparingly!)
GET /api/articles?populate=*

# Deep population (author and author's avatar)
GET /api/articles?populate[author][populate]=avatar

# Using the qs library for cleaner URLs
```

### Using `qs` for complex queries

The `qs` library generates the correct query string for deeply nested population:

```js
import qs from 'qs';

const query = qs.stringify({
  populate: {
    author: {
      populate: ['avatar'],
      fields: ['name', 'email'],
    },
    tags: {
      fields: ['name', 'slug'],
    },
    cover: true,
  },
}, { encodeValuesOnly: true });

const res = await fetch(`/api/articles?${query}`);
```

### Document Service population (backend)

```js
// In a service or controller
const articles = await strapi.documents('api::article.article').findMany({
  populate: {
    author: {
      populate: ['avatar'],
      fields: ['name', 'bio'],
    },
    tags: {
      fields: ['name', 'slug'],
    },
    cover: true,
    seo: {
      populate: ['ogImage'],
    },
  },
});
```

---

## Filtering on relations

### REST API

```bash
# Articles by a specific author name
GET /api/articles?filters[author][name][$eq]=John

# Articles with a specific tag
GET /api/articles?filters[tags][slug][$in][0]=javascript&filters[tags][slug][$in][1]=typescript

# Articles by author with more than 100 followers
GET /api/articles?filters[author][followers][$gt]=100
```

### Document Service

```js
const articles = await strapi.documents('api::article.article').findMany({
  filters: {
    author: {
      name: { $contains: 'John' },
    },
    tags: {
      slug: { $in: ['javascript', 'typescript'] },
    },
    $or: [
      { featured: true },
      { publishedAt: { $notNull: true } },
    ],
  },
  populate: ['author', 'tags'],
});
```

---

## Sorting and pagination with relations

```js
import qs from 'qs';

const query = qs.stringify({
  sort: ['publishedAt:desc', 'author.name:asc'],
  pagination: {
    page: 1,
    pageSize: 25,
  },
  populate: {
    author: { fields: ['name'] },
  },
  fields: ['title', 'slug', 'publishedAt'],
}, { encodeValuesOnly: true });
```

---

## Creating and updating relations

### Setting a relation on create

```js
// REST API: POST /api/articles
const response = await fetch('/api/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      title: 'My New Article',
      author: 3, // author document ID
      tags: [1, 2, 5], // tag document IDs
    },
  }),
});
```

### Updating relations

```js
// Connect, disconnect, or set relations
const response = await fetch('/api/articles/abc123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      tags: {
        connect: [{ id: 7 }],    // add tag 7
        disconnect: [{ id: 2 }], // remove tag 2
      },
    },
  }),
});

// Or replace all tags at once
const response2 = await fetch('/api/articles/abc123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      tags: {
        set: [{ id: 1 }, { id: 3 }, { id: 7 }],
      },
    },
  }),
});
```

### Backend service

```js
// Connect/disconnect in a service
await strapi.documents('api::article.article').update(documentId, {
  data: {
    tags: {
      connect: [{ documentId: 'tag-abc' }],
      disconnect: [{ documentId: 'tag-xyz' }],
    },
  },
});
```

---

## Performance: avoiding N+1 queries

### Problem

```js
// BAD: N+1 queries -- one query per article to fetch author
const articles = await strapi.documents('api::article.article').findMany({});
for (const article of articles) {
  article.author = await strapi.documents('api::author.author').findOne(article.authorId);
}
```

### Solution: populate upfront

```js
// GOOD: single query with population
const articles = await strapi.documents('api::article.article').findMany({
  populate: {
    author: { fields: ['name', 'avatar'] },
  },
});
```

### Selecting only needed fields

```js
// Only fetch what the frontend needs
const articles = await strapi.documents('api::article.article').findMany({
  fields: ['title', 'slug', 'publishedAt'],
  populate: {
    author: { fields: ['name'] },
    cover: { fields: ['url', 'alternativeText', 'width', 'height'] },
  },
});
```

---

## Default population with middleware

Tired of specifying `populate` on every request? Set defaults:

```js
// src/api/article/middlewares/default-populate.js
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (!ctx.query.populate) {
      ctx.query.populate = {
        author: { fields: ['name'] },
        cover: { fields: ['url', 'alternativeText'] },
        tags: { fields: ['name', 'slug'] },
      };
    }
    await next();
  };
};
```

Apply it to the `find` and `findOne` routes:

```js
// src/api/article/routes/article.js
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::article.article', {
  config: {
    find: {
      middlewares: ['api::article.default-populate'],
    },
    findOne: {
      middlewares: ['api::article.default-populate'],
    },
  },
});
```

---

## Component and dynamic zone population

Components and dynamic zones also need explicit population:

```js
const page = await strapi.documents('api::page.page').findOne(documentId, {
  populate: {
    // Component
    seo: {
      populate: ['ogImage'],
    },
    // Dynamic zone
    blocks: {
      on: {
        'blocks.hero': { populate: ['backgroundImage'] },
        'blocks.text-with-image': { populate: ['image'] },
        'blocks.gallery': { populate: ['images'] },
        'blocks.cta': true,
      },
    },
  },
});
```

### REST API dynamic zone population

```bash
GET /api/pages/abc123?populate[blocks][on][blocks.hero][populate]=backgroundImage&populate[blocks][on][blocks.text-with-image][populate]=image
```

Or with `qs`:

```js
const query = qs.stringify({
  populate: {
    blocks: {
      on: {
        'blocks.hero': { populate: ['backgroundImage'] },
        'blocks.text-with-image': { populate: ['image'] },
        'blocks.gallery': { populate: ['images'] },
      },
    },
  },
}, { encodeValuesOnly: true });
```

---

## Common pitfalls

| Pitfall                             | Problem                                            | Fix                                                      |
|-------------------------------------|----------------------------------------------------|----------------------------------------------------------|
| `populate=*` in production          | Fetches everything, huge payloads, slow            | Explicitly list needed relations and fields              |
| Missing `fields` on populate        | Returns all attributes of the related entity       | Use `fields: ['name']` to restrict                       |
| Circular population                 | Author populates articles which populate author... | Set explicit `maxDepth` or break the chain with `fields` |
| Forgetting dynamic zone `on` syntax | Returns empty array for dynamic zones              | Use the `on` key with component UIDs                     |
| Filtering on unpopulated relation   | Filter silently fails or returns wrong results     | Ensure the relation exists in the query context          |

---

## See also

- [Custom Controllers and Services](custom-controllers-services.md) -- controllers that query relations
- [Lifecycle Hooks](lifecycle-hooks.md) -- hooks that auto-populate or validate relations
- [Custom Routes and Endpoints](custom-routes-and-endpoints.md) -- custom endpoints that return related data
