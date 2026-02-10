---
title: "i18n and Multi-Locale Content"
sidebar_position: 11
description: "Strapi i18n: enabling localization, querying by locale, locale fallbacks, translating relations, populating localized components, and frontend integration."
tags: [strapi, i18n, internationalization, locale, translation]
---

# i18n and Multi-Locale Content

Strapi's Internationalization (i18n) plugin lets you manage content in multiple languages. It sounds simple in theory --
in practice, locale-aware querying, relation population, and fallback strategies are where most developers get stuck.

## Enabling i18n

### Plugin configuration

```js
// config/plugins.js
module.exports = {
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'en',
      locales: ['en', 'de', 'fr', 'es', 'ja'],
    },
  },
};
```

### Enabling on a content type

In the Content-Type Builder, toggle **Enable localization** on a content type. Or in the schema:

```json
// src/api/article/content-types/article/schema.json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": {
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "slug": {
      "type": "string",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "content": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "publishedDate": {
      "type": "date",
      "pluginOptions": {
        "i18n": { "localized": false }
      }
    }
  }
}
```

Fields with `"localized": false` share the same value across all locales (e.g., dates, prices, SKUs).

---

## Querying by locale

### REST API

```bash
# Get articles in German
GET /api/articles?locale=de

# Get a specific article in French
GET /api/articles/abc123?locale=fr

# Get all locales for a document (Strapi 5)
GET /api/articles/abc123?populate=localizations
```

### Document Service (backend)

```js
// Find all German articles
const articles = await strapi.documents('api::article.article').findMany({
  locale: 'de',
  status: 'published',
});

// Find one article in French
const article = await strapi.documents('api::article.article').findOne(documentId, {
  locale: 'fr',
});

// Create a localized version
await strapi.documents('api::article.article').create({
  locale: 'de',
  data: {
    title: 'Mein erster Artikel',
    slug: 'mein-erster-artikel',
    content: 'Inhalt auf Deutsch...',
  },
});
```

---

## The locale fallback problem

Strapi does **not** provide automatic locale fallback out of the box. If you request `locale=de` and the German version
doesn't exist, you get `null` -- not the English fallback.

### Implementing fallback in a service

```js
// src/api/article/services/article.js
const { createCoreService } = require('@strapi/strapi').factories;

const FALLBACK_CHAIN = ['de', 'en']; // Try German first, then English

module.exports = createCoreService('api::article.article', ({ strapi }) => ({

  async findOneWithFallback(documentId, { locale, populate, fields } = {}) {
    const chain = locale
      ? [locale, ...FALLBACK_CHAIN.filter(l => l !== locale)]
      : FALLBACK_CHAIN;

    for (const tryLocale of chain) {
      const result = await strapi.documents('api::article.article').findOne(documentId, {
        locale: tryLocale,
        status: 'published',
        populate,
        fields,
      });

      if (result) {
        // Attach which locale was actually used
        result._resolvedLocale = tryLocale;
        result._requestedLocale = locale;
        return result;
      }
    }

    return null;
  },

  async findManyWithFallback({ locale, filters, populate, fields, sort, page, pageSize } = {}) {
    // First try the requested locale
    let results = await strapi.documents('api::article.article').findMany({
      locale: locale || FALLBACK_CHAIN[0],
      status: 'published',
      filters,
      populate,
      fields,
      sort,
      page,
      pageSize,
    });

    // If no results, try fallback locales
    if (results.length === 0) {
      for (const fallbackLocale of FALLBACK_CHAIN) {
        if (fallbackLocale === locale) continue;

        results = await strapi.documents('api::article.article').findMany({
          locale: fallbackLocale,
          status: 'published',
          filters,
          populate,
          fields,
          sort,
          page,
          pageSize,
        });

        if (results.length > 0) break;
      }
    }

    return results;
  },
}));
```

### Field-level fallback

Sometimes you want to fall back individual fields (e.g., show the German title but fall back to the English description
if the German one is empty):

```js
async findOneWithFieldFallback(documentId, { locale, fallbackLocale = 'en', populate } = {}) {
  const [localized, fallback] = await Promise.all([
    strapi.documents('api::article.article').findOne(documentId, {
      locale,
      status: 'published',
      populate,
    }),
    locale !== fallbackLocale
      ? strapi.documents('api::article.article').findOne(documentId, {
          locale: fallbackLocale,
          status: 'published',
          populate,
        })
      : null,
  ]);

  if (!localized) return fallback;
  if (!fallback) return localized;

  // Merge: use localized values, fall back to default for empty fields
  const merged = { ...localized };
  const fallbackFields = ['content', 'description', 'seoDescription'];

  for (const field of fallbackFields) {
    if (!merged[field] && fallback[field]) {
      merged[field] = fallback[field];
      merged._fallbackFields = merged._fallbackFields || [];
      merged._fallbackFields.push(field);
    }
  }

  return merged;
},
```

---

## Populating localized relations

This is one of the biggest gotchas. When you populate a relation on a localized document, the related document must
exist in the **same locale**, or the relation appears empty.

```js
// Article (locale: de) -> Author (locale: de) -- works
// Article (locale: de) -> Author (locale: en) -- returns null!
```

### Solutions

**Option A: make the related type non-localized**

If the related content type doesn't need translation (e.g., Authors, Categories with just a slug), disable i18n on it.
Non-localized types always resolve.

**Option B: ensure related entries exist in all locales**

Create the related entry in every locale. This is tedious but correct for fully localized content.

**Option C: populate with fallback in a middleware**

```js
// src/api/article/middlewares/populate-locale-fallback.js
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    // After the response is built, check for empty relations
    if (ctx.body?.data?.attributes?.author?.data === null) {
      const articleLocale = ctx.query.locale || 'en';
      const fallbackLocale = 'en';

      if (articleLocale !== fallbackLocale) {
        // Try fetching the article with the fallback locale for this relation
        const fallbackArticle = await strapi.documents('api::article.article').findOne(
          ctx.params.id,
          {
            locale: fallbackLocale,
            populate: ['author'],
          }
        );

        if (fallbackArticle?.author) {
          ctx.body.data.attributes.author = {
            data: fallbackArticle.author,
            _fallbackLocale: fallbackLocale,
          };
        }
      }
    }
  };
};
```

---

## Components and dynamic zones with i18n

Components inherit the localization setting from their parent content type. If the parent is localized, component data
is stored per locale.

```json
{
  "attributes": {
    "seo": {
      "type": "component",
      "component": "shared.seo",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "blocks": {
      "type": "dynamiczone",
      "components": ["blocks.hero", "blocks.text", "blocks.gallery"],
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    }
  }
}
```

### Populating localized dynamic zones

```js
const page = await strapi.documents('api::page.page').findOne(documentId, {
  locale: 'de',
  populate: {
    seo: { populate: ['ogImage'] },
    blocks: {
      on: {
        'blocks.hero': { populate: ['backgroundImage'] },
        'blocks.text': true,
        'blocks.gallery': { populate: ['images'] },
      },
    },
  },
});
```

---

## Frontend integration patterns

### Next.js with locale routing

```tsx
// app/[locale]/articles/[slug]/page.tsx
import { notFound } from 'next/navigation';

interface Props {
  params: { locale: string; slug: string };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = params;

  const res = await fetch(
    `${process.env.STRAPI_URL}/api/articles?` +
    `filters[slug][$eq]=${slug}&locale=${locale}&populate=*`,
    { next: { revalidate: 60 } }
  );

  const { data } = await res.json();

  if (!data?.length) {
    // Try fallback locale
    const fallbackRes = await fetch(
      `${process.env.STRAPI_URL}/api/articles?` +
      `filters[slug][$eq]=${slug}&locale=en&populate=*`,
      { next: { revalidate: 60 } }
    );
    const fallbackData = await fallbackRes.json();

    if (!fallbackData.data?.length) return notFound();
    // Render with fallback indicator
  }

  const article = data[0];
  return <article><h1>{article.title}</h1></article>;
}

// Generate static params for all locale + slug combinations
export async function generateStaticParams() {
  const locales = ['en', 'de', 'fr'];
  const params = [];

  for (const locale of locales) {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/articles?locale=${locale}&fields[0]=slug`
    );
    const { data } = await res.json();

    for (const article of data) {
      params.push({ locale, slug: article.slug });
    }
  }

  return params;
}
```

### Language switcher data

```js
// Fetch all available locales for a document
async function getAvailableLocales(documentId) {
  const locales = ['en', 'de', 'fr', 'es'];
  const available = [];

  for (const locale of locales) {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/articles/${documentId}?locale=${locale}&fields[0]=slug`
    );

    if (res.ok) {
      const { data } = await res.json();
      if (data) {
        available.push({ locale, slug: data.slug });
      }
    }
  }

  return available;
}
```

---

## Common pitfalls

| Pitfall                             | Problem                                               | Fix                                                                     |
|-------------------------------------|-------------------------------------------------------|-------------------------------------------------------------------------|
| No locale param in query            | Returns default locale only                           | Always pass `locale` explicitly                                         |
| Relation points to wrong locale     | Populated relation is `null`                          | Make shared types non-localized, or ensure entries exist in all locales |
| Slug not localized                  | Same slug for all languages, causes routing conflicts | Enable `localized: true` on the slug field                              |
| No fallback strategy                | Missing translations return empty pages               | Implement service-level or frontend fallback                            |
| Forgetting to create locale entries | Content appears missing                               | Set up editorial workflows that require all locales                     |
| Media not locale-aware              | Same image for all locales                            | Media fields can be localized if needed                                 |

---

## See also

- [Relations and Population](relations-and-population.md) -- general population patterns that apply to localized queries
- [Custom Controllers and Services](custom-controllers-services.md) -- implementing fallback services
- [Content Modeling Patterns](content-modeling-patterns.md) -- deciding which fields to localize
