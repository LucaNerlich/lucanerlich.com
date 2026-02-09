---
title: "Webhooks and External Integrations"
sidebar_position: 14
description: "Strapi webhooks and integrations: built-in webhooks, custom event listeners, Algolia search sync, Slack notifications, Stripe, and external API consumption."
tags: [strapi, webhooks, integrations, algolia, search, notifications]
---

# Webhooks and External Integrations

Almost every Strapi project needs to talk to external systems -- search indexes, notification services, payment gateways, or static site rebuilds. This page covers Strapi's built-in webhook system, custom event-driven integrations, and patterns for common third-party services.

## Built-in webhooks

Strapi has a webhook system configurable from the admin panel (**Settings > Webhooks**).

### Available events

| Event | Fires when |
|-------|-----------|
| `entry.create` | A content entry is created |
| `entry.update` | A content entry is updated |
| `entry.delete` | A content entry is deleted |
| `entry.publish` | A content entry is published |
| `entry.unpublish` | A content entry is unpublished |
| `media.create` | A media file is uploaded |
| `media.update` | A media file is updated |
| `media.delete` | A media file is deleted |

### Webhook payload

```json
{
  "event": "entry.publish",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "model": "article",
  "uid": "api::article.article",
  "entry": {
    "id": 42,
    "documentId": "abc123",
    "title": "My Article",
    "slug": "my-article",
    "publishedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### Webhook configuration via admin

1. Go to **Settings > Webhooks > Create new webhook**
2. Enter the target URL
3. Select which events to trigger on
4. Optionally add custom headers (e.g., `Authorization: Bearer secret`)

---

## Custom event listeners (programmatic)

For more control, use Document Service middleware or lifecycle subscribers in code.

### Trigger a static site rebuild on publish

```js
// src/index.js
module.exports = {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      const result = await next();

      if (['publish', 'unpublish', 'delete'].includes(context.action)) {
        // Fire and forget -- don't block the response
        setImmediate(async () => {
          try {
            await fetch(process.env.DEPLOY_HOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: context.action,
                contentType: context.uid,
                documentId: context.params.documentId || result?.documentId,
              }),
            });
            strapi.log.info(`[webhook] Deploy hook triggered for ${context.action}`);
          } catch (error) {
            strapi.log.error('[webhook] Deploy hook failed:', error.message);
          }
        });
      }

      return result;
    });
  },
};
```

### Vercel / Netlify deploy hooks

```bash
# .env
DEPLOY_HOOK_URL=https://api.vercel.app/v1/integrations/deploy/prj_xxxxx/yyyyyyy
# or for Netlify:
# DEPLOY_HOOK_URL=https://api.netlify.com/build_hooks/xxxxx
```

---

## Search integration: Algolia

### Setup

```bash
npm install algoliasearch
```

```js
// src/services/algolia.js
const algoliasearch = require('algoliasearch');

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

module.exports = ({ strapi }) => ({
  getIndex(indexName) {
    return client.initIndex(indexName);
  },

  async indexDocument(uid, document) {
    const indexName = uid.replace('api::', '').replace('.', '_');
    const index = this.getIndex(indexName);

    await index.saveObject({
      objectID: document.documentId,
      title: document.title,
      slug: document.slug,
      content: document.content?.replace(/<[^>]*>/g, '').substring(0, 5000),
      publishedAt: document.publishedAt,
      locale: document.locale,
    });

    strapi.log.debug(`[algolia] Indexed ${uid} ${document.documentId}`);
  },

  async removeDocument(uid, documentId) {
    const indexName = uid.replace('api::', '').replace('.', '_');
    const index = this.getIndex(indexName);

    await index.deleteObject(documentId);
    strapi.log.debug(`[algolia] Removed ${uid} ${documentId}`);
  },

  async reindexAll(uid) {
    const indexName = uid.replace('api::', '').replace('.', '_');
    const index = this.getIndex(indexName);

    const documents = await strapi.documents(uid).findMany({
      status: 'published',
      fields: ['title', 'slug', 'content', 'publishedAt'],
      limit: -1,
    });

    const objects = documents.map(doc => ({
      objectID: doc.documentId,
      title: doc.title,
      slug: doc.slug,
      content: doc.content?.replace(/<[^>]*>/g, '').substring(0, 5000),
      publishedAt: doc.publishedAt,
    }));

    await index.replaceAllObjects(objects);
    strapi.log.info(`[algolia] Reindexed ${objects.length} ${uid} documents`);
  },
});
```

### Auto-sync on publish/unpublish

```js
// src/index.js
const searchableTypes = [
  'api::article.article',
  'api::page.page',
];

module.exports = {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      const result = await next();

      if (!searchableTypes.includes(context.uid)) return result;

      setImmediate(async () => {
        try {
          const algolia = strapi.service('api::algolia.algolia');

          if (context.action === 'publish') {
            const doc = await strapi.documents(context.uid).findOne(
              result.documentId,
              {
                status: 'published',
                fields: ['title', 'slug', 'content', 'publishedAt'],
              }
            );
            if (doc) await algolia.indexDocument(context.uid, doc);
          }

          if (['unpublish', 'delete'].includes(context.action)) {
            const docId = context.params.documentId || result?.documentId;
            if (docId) await algolia.removeDocument(context.uid, docId);
          }
        } catch (error) {
          strapi.log.error('[algolia] Sync failed:', error.message);
        }
      });

      return result;
    });
  },
};
```

---

## Search integration: Meilisearch

```bash
npm install meilisearch
```

```js
// src/services/meilisearch.js
const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
});

module.exports = ({ strapi }) => ({
  async indexDocument(uid, document) {
    const indexName = uid.replace('api::', '').replace('.', '-');
    const index = client.index(indexName);

    await index.addDocuments([
      {
        id: document.documentId,
        title: document.title,
        slug: document.slug,
        content: document.content?.replace(/<[^>]*>/g, ''),
        publishedAt: document.publishedAt,
      },
    ]);
  },

  async removeDocument(uid, documentId) {
    const indexName = uid.replace('api::', '').replace('.', '-');
    const index = client.index(indexName);
    await index.deleteDocument(documentId);
  },
});
```

---

## Slack notifications

```js
// src/services/slack.js
module.exports = ({ strapi }) => ({
  async notify({ channel, text, blocks }) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text, blocks }),
    });
  },

  async notifyContentPublished(uid, document) {
    const typeName = uid.split('.').pop();

    await this.notify({
      text: `📢 New ${typeName} published: *${document.title}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📢 *New ${typeName} published*\n*${document.title}*\nBy: ${document.createdBy?.firstname || 'Unknown'}\n<${process.env.PUBLIC_URL}/${document.slug}|View on site>`,
          },
        },
      ],
    });
  },
});
```

---

## Consuming external APIs

### Fetching data from an external API in a service

```js
// src/api/weather/services/weather.js
module.exports = ({ strapi }) => ({
  async getCurrentWeather(city) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      strapi.log.error(`[weather] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  },
});
```

### Consuming inbound webhooks (e.g., Stripe)

```js
// src/api/stripe/routes/stripe.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/stripe/webhook',
      handler: 'api::stripe.stripe.handleWebhook',
      config: {
        auth: false,  // Stripe can't authenticate with Strapi JWT
      },
    },
  ],
};

// src/api/stripe/controllers/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  async handleWebhook(ctx) {
    const sig = ctx.request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        ctx.request.body[Symbol.for('unparsedBody')] || ctx.request.body,
        sig,
        endpointSecret
      );
    } catch (err) {
      strapi.log.error(`[stripe] Webhook signature verification failed: ${err.message}`);
      return ctx.badRequest('Invalid signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await strapi.service('api::order.order').fulfillOrder(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await strapi.service('api::subscription.subscription').sync(subscription);
        break;
      }
      default:
        strapi.log.debug(`[stripe] Unhandled event: ${event.type}`);
    }

    ctx.body = { received: true };
  },
};
```

---

## Webhook retry and reliability

Built-in Strapi webhooks have basic retry logic, but for critical integrations, consider:

```js
// src/services/webhook-queue.js
const queue = [];
const MAX_RETRIES = 3;

module.exports = ({ strapi }) => ({
  async enqueue(url, payload, retries = 0) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      strapi.log.debug(`[webhook-queue] Delivered to ${url}`);
    } catch (error) {
      if (retries < MAX_RETRIES) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        strapi.log.warn(
          `[webhook-queue] Retry ${retries + 1}/${MAX_RETRIES} for ${url} in ${delay}ms`
        );
        setTimeout(() => this.enqueue(url, payload, retries + 1), delay);
      } else {
        strapi.log.error(
          `[webhook-queue] Failed after ${MAX_RETRIES} retries: ${url}`,
          error.message
        );
        // Store failed webhook for manual retry
        await strapi.documents('api::failed-webhook.failed-webhook').create({
          data: { url, payload: JSON.stringify(payload), error: error.message },
        });
      }
    }
  },
});
```

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Blocking side effects in middleware | Slow API responses | Use `setImmediate()` for external calls |
| No webhook signature verification | Anyone can fake webhook calls | Verify signatures (Stripe, GitHub, etc.) |
| Algolia admin key in frontend | Key leaks, index gets corrupted | Use the search-only key in the frontend |
| No error handling on external calls | One failed webhook blocks the chain | Wrap in try/catch, use a queue with retries |
| Webhook endpoint missing `auth: false` | External services get 403 | Set `auth: false` on inbound webhook routes |
| Syncing on every update | Too many API calls to search/notifications | Debounce or only sync on `publish` |

---

## See also

- [Lifecycle Hooks](./lifecycle-hooks.md) -- the underlying mechanism for event-driven integrations
- [Custom Routes and Endpoints](./custom-routes-and-endpoints.md) -- creating inbound webhook endpoints
- [Configuration and Deployment](./configuration-and-deployment.md) -- environment variables for API keys
- [Scheduled Publishing](./scheduled-publishing.md) -- cron-based automation patterns
