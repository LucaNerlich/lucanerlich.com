---
title: "API Security Hardening"
sidebar_position: 19
description: "Strapi API security hardening: strict parameter validation, controller sanitization, ownership checks, token types, rate limiting, CORS, CSP, and production checklist."
tags: [strapi, security, api, authentication, hardening]
keywords: [strapi api security, strapi strictParams, strapi sanitization, strapi api tokens, strapi rate limiting]
---

# API Security Hardening

Strapi gives you secure defaults for generated Content API controllers, but custom routes, custom controllers, API
clients, and operational tokens still need deliberate hardening. Treat every public endpoint as untrusted input, and
sanitize every response that did not come directly from a generated core controller.

## Enable strict API parameter validation

Strapi 5 centralizes REST and Document Service API settings in `config/api.js` or `config/api.ts`. Recent new projects
scaffold strict parameter validation by default. Keep it on unless you have a specific compatibility reason not to.

```js
// config/api.js
module.exports = ({ env }) => ({
  rest: {
    prefix: '/api',
    defaultLimit: env.int('API_DEFAULT_LIMIT', 25),
    maxLimit: env.int('API_MAX_LIMIT', 100),
    strictParams: true,
  },
  documents: {
    strictParams: true,
    strictRelations: true,
  },
});
```

| Setting | Scope | Why it matters |
|---------|-------|----------------|
| `rest.strictParams` | Public REST Content API requests | Rejects unknown top-level query and body parameters instead of silently ignoring them. |
| `documents.strictParams` | Backend calls to `strapi.documents()` | Catches invalid server-side Document Service parameters early. |
| `documents.strictRelations` | Document publish validation | Enforces required relation fields before publish. Drafts can still be saved incomplete. |

When you intentionally add custom parameters to Content API routes, register or validate them deliberately; do not turn
off strictness globally just to tolerate one custom endpoint.

## Sanitize and validate custom controllers

Generated core controllers validate input and sanitize output for the current auth context. Custom controller actions are
where leaks usually happen, especially when returning data from services, plugins, or the Document Service.

### Core controller helper pattern

Use the helpers that `createCoreController` adds to `this`:

```js
// src/api/article/controllers/article.js
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async findMine(ctx) {
    if (!ctx.state.user) {
      return ctx.unauthorized('You must be logged in');
    }

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const documents = await strapi.documents('api::article.article').findMany({
      ...sanitizedQuery,
      filters: {
        ...sanitizedQuery.filters,
        owner: ctx.state.user.id,
      },
    });

    const sanitizedOutput = await this.sanitizeOutput(documents, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async create(ctx) {
    const sanitizedInput = await this.sanitizeInput(ctx.request.body, ctx);

    const document = await strapi.documents('api::article.article').create({
      data: {
        ...sanitizedInput.data,
        owner: ctx.state.user.id,
      },
    });

    const sanitizedOutput = await this.sanitizeOutput(document, ctx);
    return this.transformResponse(sanitizedOutput);
  },
}));
```

Use `this.validateQuery(ctx)` when you want bad queries to fail fast with a 400 response. Use `this.sanitizeQuery(ctx)`
even when you skip explicit validation, because sanitization removes fields and populate paths the current user cannot
access.

### Sanitization outside core controllers

Plugin controllers, services, lifecycle hooks, route middleware, and cron jobs do not receive the core controller helper
methods. Use `strapi.contentAPI.sanitize` and `strapi.contentAPI.validate` directly with the correct model schema.

```js
// src/api/report/services/report.js
module.exports = ({ strapi }) => ({
  async findPublicReports(query, auth) {
    const schema = strapi.getModel('api::report.report');

    await strapi.contentAPI.validate.query(query, schema, { auth });
    const sanitizedQuery = await strapi.contentAPI.sanitize.query(query, schema, { auth });

    const reports = await strapi.documents('api::report.report').findMany(sanitizedQuery);

    return strapi.contentAPI.sanitize.output(reports, schema, { auth });
  },

  async createReport(input, auth) {
    const schema = strapi.getModel('api::report.report');

    await strapi.contentAPI.validate.input(input, schema, { auth });
    const sanitizedInput = await strapi.contentAPI.sanitize.input(input, schema, { auth });

    const report = await strapi.documents('api::report.report').create({ data: sanitizedInput });

    return strapi.contentAPI.sanitize.output(report, schema, { auth });
  },
});
```

### Private attributes are a response boundary, not an excuse

Mark sensitive fields private in schema files so Strapi's Content API sanitizers remove them from responses:

```json
{
  "kind": "collectionType",
  "collectionName": "customers",
  "attributes": {
    "email": {
      "type": "email"
    },
    "internalNotes": {
      "type": "text",
      "private": true
    }
  }
}
```

`private: true` protects sanitized output. It does not make raw backend reads safe to return. The Document Service is a
backend data API and can return fields that must still be sanitized for a public response. Never send raw
`strapi.documents()` results directly to `ctx.body`.

## Ownership checks without leaking existence

Avoid this pattern in public APIs:

1. Fetch an entry by `documentId`.
2. If it exists, compare its owner with `ctx.state.user`.
3. Return `403` when the owner differs.

That flow tells attackers which IDs exist. Prefer filtering by owner as part of the data access and returning the same
not-found response for both "missing" and "not yours".

```js
// src/api/article/controllers/article.js
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async findOwnedOne(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const [article] = await strapi.documents('api::article.article').findMany({
      filters: {
        documentId: ctx.params.documentId,
        owner: user.id,
      },
      pagination: { pageSize: 1 },
    });

    if (!article) {
      return ctx.notFound('Article not found');
    }

    const sanitizedOutput = await this.sanitizeOutput(article, ctx);
    return this.transformResponse(sanitizedOutput);
  },
}));
```

A policy can still enforce authentication and coarse role checks before the controller runs:

```js
// src/policies/is-authenticated.js
module.exports = (policyContext) => Boolean(policyContext.state.user);
```

Then apply the policy to the route and keep the owner filter in the query:

```js
// src/api/article/routes/article.js
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/:documentId/mine',
      handler: 'article.findOwnedOne',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
```

## Choose the right token type

Strapi has several token systems. They are not interchangeable.

| Token type | Used for | Where to create it | Hardening guidance |
|------------|----------|--------------------|--------------------|
| Users & Permissions JWT | End-user Content API requests. | Issued by `/api/auth/local` and related auth flows. | Prefer refresh-token session mode for browser apps; keep access tokens short-lived. |
| API token | Machine-to-machine Content API access. | **Settings > API Tokens**. | Use read-only or custom tokens whenever possible; avoid full-access tokens for frontends. |
| Transfer token | `strapi transfer` operations between instances. | **Settings > Transfer Tokens**. | Scope to push, pull, or full access based on the transfer direction; rotate after migrations. |
| Admin token | Programmatic access to the Strapi Admin API in current Strapi 5. | **Settings > Administration Panel > Admin Tokens**. | Keep separate from Content API tokens; grant only the admin permissions automation needs. |

API tokens have three permission modes:

| API token type | Use case | Risk |
|----------------|----------|------|
| Read-only | Static builds, preview renderers, search indexers reading published content. | Lowest, but still a secret. |
| Full access | Rare automation that must read and write many content types. | High; rotate often and never ship to browsers. |
| Custom | Production integrations with specific content-type permissions. | Preferred for most services. |

Store all tokens in secret managers or environment variables. Never expose API, transfer, or admin tokens in frontend
bundles; browsers should authenticate as users or call a backend that holds the token server-side.

## Rate limiting

### Users & Permissions auth route limit

The Users & Permissions plugin includes a built-in `ratelimit` configuration for sensitive auth routes such as local
login. The option name is lower-case `ratelimit`, and `interval` is in **milliseconds**.

```js
// config/plugins.js
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      ratelimit: {
        interval: env.int('UP_AUTH_RATE_LIMIT_INTERVAL', 5 * 60 * 1000),
        max: env.int('UP_AUTH_RATE_LIMIT_MAX', 5),
      },
    },
  },
});
```

Tune the values for your threat model. Public registration, password reset, and login endpoints usually need tighter
limits than read-only content endpoints.

### Example route-level limiter

For custom routes, add explicit middleware. The following example uses an in-memory `Map` so it works as a teaching
example only. Use Redis or another shared store in production, especially when Strapi runs on multiple instances.

```js
// src/middlewares/route-rate-limit.js
const buckets = new Map();

module.exports = (config) => {
  const windowMs = config.windowMs || 60_000;
  const max = config.max || 30;

  return async (ctx, next) => {
    const key = `${ctx.ip}:${ctx.method}:${ctx.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      ctx.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return ctx.tooManyRequests('Too many requests. Try again later.');
    }

    return next();
  };
};
```

Attach it to a route:

```js
// src/api/invite/routes/invite.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/invites',
      handler: 'invite.create',
      config: {
        middlewares: [
          {
            name: 'global::route-rate-limit',
            config: { windowMs: 15 * 60 * 1000, max: 10 },
          },
        ],
      },
    },
  ],
};
```

If you prefer a package, `koa-ratelimit` and `koa2-ratelimit` both exist on npm and support Koa-style limiting; wire them
through Strapi middleware and use Redis or another shared store for production deployments.

## CORS, CSP, and security headers

CORS and CSP are global middleware concerns, not controller concerns. Keep them close to deployment configuration:

- [Configuration and Deployment](./configuration-and-deployment.md) shows `strapi::security` and `strapi::cors`
    examples.
- [Middleware and Policies](./middleware-and-policies.md) explains global and route-level middleware order.
- [File Uploads and Media](./file-uploads-and-media.md) covers CSP and bucket CORS for remote media providers.

For browser auth with HTTP-only refresh cookies, CORS must allow the exact frontend origin and credentials. Avoid
wildcard origins on credentialed endpoints.

## Common pitfalls

| Pitfall | Impact | Fix |
|---------|--------|-----|
| Returning raw Document Service data | Private fields and unauthorized relations can leak. | Always call `sanitizeOutput` or `strapi.contentAPI.sanitize.output`. |
| Disabling `strictParams` globally | Invalid parameters are ignored or may reach custom logic. | Keep strictness on and explicitly handle custom parameters. |
| Fetch-then-check ownership | Attackers can distinguish missing records from records they do not own. | Filter by owner in the query and return a generic not-found response. |
| Full-access API token in frontend code | Anyone can write to your Content API. | Never ship machine tokens to browsers; use U&P auth or a backend proxy. |
| One rate limit for all traffic | Login abuse and content reads have different risk profiles. | Rate-limit auth routes tightly and add route-level limits for expensive actions. |
| Broad CORS with cookies | Any allowed origin can send credentialed requests. | Use exact origins and credentials only where needed. |

## Security checklist

| Check | Done |
|-------|------|
| `rest.strictParams` is enabled in `config/api.js`. |  |
| `documents.strictParams` is enabled for backend Document Service calls. |  |
| `documents.strictRelations` is enabled where required relations must block publish. |  |
| Every custom controller validates or sanitizes query parameters. |  |
| Every custom create/update action sanitizes input before writing. |  |
| Every custom response sanitizes output before `ctx.body` or `transformResponse`. |  |
| Sensitive schema fields use `private: true`. |  |
| Ownership checks filter by owner in the query and do not leak existence. |  |
| API tokens are read-only or custom unless full access is truly required. |  |
| Admin tokens are separate from Content API tokens and scoped to admin automation. |  |
| Transfer tokens are disabled or rotated after migrations. |  |
| Users & Permissions `ratelimit` is configured for auth routes. |  |
| Expensive custom routes have route-level rate limiting with a shared production store. |  |
| CORS uses exact origins and credentials only for trusted browser frontends. |  |
| CSP allows only the frontend, media, and integration hosts the project actually uses. |  |

## See also

- [Authentication and Permissions](./authentication-and-permissions.md) - Users & Permissions, JWTs, refresh sessions, roles, and API tokens
- [Middleware and Policies](./middleware-and-policies.md) - route guards, middleware order, and owner checks
- [Custom Controllers and Services](./custom-controllers-services.md) - controller structure and response sanitization
- [Configuration and Deployment](./configuration-and-deployment.md) - CORS, CSP, secrets, and production config
