---
title: "Troubleshooting & Migration Guide"
sidebar_label: "Troubleshooting"
description: Common Strapi issues and solutions, debugging techniques, and a complete guide for migrating from Strapi 4 to Strapi 5.
slug: /strapi/beginners-guide/troubleshooting
tags: [strapi, beginners, troubleshooting, migration]
keywords:
  - strapi troubleshooting
  - strapi errors
  - strapi debugging
  - strapi 4 to 5 migration
  - strapi common issues
sidebar_position: 16
---

# Troubleshooting & Migration Guide

This chapter covers common issues you'll encounter with Strapi, debugging techniques, and a comprehensive guide for migrating from Strapi 4 to Strapi 5.

## Common Issues and Solutions

### Installation Issues

#### Node.js version incompatibility

**Error:**
```text
error @strapi/strapi@5.x.x: The engine "node" is incompatible with this module. Expected version ">=20.0.0 <=26.x.x". Got "25.0.0"
```

Strapi 5 only supports Active LTS and Maintenance LTS versions of Node.js (currently v22, v24, and v26). Strapi
5.31.0 (November 2025) dropped Node 18, so the `engines` field now requires at least Node 20. Odd-numbered
"current" releases (21, 23, 25) are not supported.

**Solution:**
```bash
# Use nvm to switch to a compatible version
nvm install 22
nvm use 22

# Verify version
node --version  # Should show v22.x.x
```

#### Permission errors during installation

**Error:**
```text
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution:**
```bash
# Fix npm permissions (don't use sudo)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Or use npx instead of global installs
npx create-strapi@latest my-project
```

### Database Issues

#### Connection refused errors

**Error:**
```text
error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql

# Verify connection settings in .env
DATABASE_HOST=127.0.0.1  # or localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-password
```

#### Migration failures

**Error:**
```text
error: Migration failed: relation "posts" already exists
```

**Solution:**
Back up the database before destructive recovery steps:

```bash
pg_dump -U strapi strapi_blog > backup.sql
```

Then recreate the database from a SQL client if you intentionally want Strapi to rebuild its schema:

```sql
DROP DATABASE strapi_blog;
CREATE DATABASE strapi_blog OWNER strapi;
```

Finally restart Strapi:

```bash
npm run develop
```

### API Issues

#### Relations not populated

**Problem:** Related data not showing in API responses

**Solution:**
Always explicitly populate relations:

```http
GET /api/posts?populate=*
```

Or populate specific fields:

```http
GET /api/posts?populate[author][fields][0]=name&populate[category][fields][0]=name
```

In a controller, set a default populate object before calling the core action:

```javascript
async find(ctx) {
  ctx.query = {
    ...ctx.query,
    populate: ctx.query.populate || {
      author: true,
      category: true,
      tags: true,
    },
  };
  return await super.find(ctx);
}
```

#### 403 Forbidden errors

**Problem:** API returns 403 even for public content

**Solution:**
```bash
# Check permissions in admin panel:
# Settings > Roles > Public > Check appropriate permissions

# Or programmatically with full action UIDs:
```

```javascript
// src/index.js - Set permissions on bootstrap
export default {
  async bootstrap({ strapi }) {
    const publicRole = await strapi
      .db.query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    await strapi
      .db.query('plugin::users-permissions.permission')
      .updateMany({
        where: {
          role: { id: publicRole.id },
          action: {
            $in: ['api::post.post.find', 'api::post.post.findOne'],
          },
        },
        data: {
          enabled: true,
        },
      });
  },
};
```

### Admin Panel Issues

#### Admin panel shows blank page

**Problem:** Admin panel loads but shows white screen

**Solution:**
```bash
# Rebuild admin panel
npm run build

# Clear cache
rm -rf .cache build

# Rebuild with clean cache
npm run build

# Check browser console for errors
# Common issue: Ad blockers can interfere
```

#### Cannot access admin after deployment

**Problem:** Admin panel not accessible in production

**Solution:**
```javascript
// config/server.js
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Ensure URL is set correctly
  url: env('PUBLIC_URL', 'https://cms.yourdomain.com'),
});
```

```javascript
// config/admin.js
export default ({ env }) => ({
  url: env('ADMIN_URL', '/admin'), // Ensure this matches your reverse proxy config
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
});
```

### File Upload Issues

#### File size limit errors

**Error:**
```text
PayloadTooLargeError: request entity too large
```

**Solution:**
```javascript
// config/middlewares.js
export default [
  // ... other middleware
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '10mb',
      formLimit: '10mb',
      textLimit: '10mb',
      formidable: {
        maxFileSize: 200 * 1024 * 1024, // 200MB
      },
    },
  },
];

// Also update nginx if using reverse proxy:
// client_max_body_size 200M;
```

#### S3 upload failures

**Error:**
```text
Error: AccessDenied: Access Denied
```

**Solution:**
Verify the IAM policy includes both bucket-level and object-level permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StrapiListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT:user/strapi-user"
      },
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::your-bucket"
    },
    {
      "Sid": "StrapiUploadObjects",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT:user/strapi-user"
      },
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

Also check the bucket CORS configuration and Strapi's Content Security Policy if thumbnails fail in the Media Library.

## Debugging Techniques

### Enable debug logging

```javascript
// config/logger.js
export default {
  level: process.env.LOG_LEVEL || 'debug',
};
```

```bash
# Set environment variable
LOG_LEVEL=debug npm run develop

# Or in .env
LOG_LEVEL=debug
DATABASE_DEBUG=true
```

### Use the Strapi console

```bash
# Start interactive console
npm run strapi console

# Test queries and services
> const posts = await strapi.documents('api::post.post').findMany()
> console.log(posts)

> const service = strapi.service('api::post.post')
> const featured = await service.findFeatured()
```

### Debug middleware and lifecycle hooks

```javascript
// Add detailed logging to middleware
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();

    strapi.log.debug(`[${ctx.method}] ${ctx.url} - Starting`);
    strapi.log.debug('Headers:', ctx.headers);
    strapi.log.debug('Query:', ctx.query);

    try {
      await next();
    } catch (error) {
      strapi.log.error('Middleware error:', error);
      throw error;
    }

    const duration = Date.now() - start;
    strapi.log.debug(`[${ctx.method}] ${ctx.url} - ${ctx.status} (${duration}ms)`);
  };
};
```

### Database query debugging

```javascript
// Log all database queries
// config/database.js
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      // ... connection details
    },
    debug: env.bool('DATABASE_DEBUG', false),
    log: {
      warn(msg) { console.warn(msg); },
      error(msg) { console.error(msg); },
      deprecate(msg) { console.warn(msg); },
      debug(msg) {
        if (env.bool('DATABASE_DEBUG', false)) {
          console.debug(msg);
        }
      },
    },
  },
});
```

## Migrating from Strapi 4 to Strapi 5

### Major breaking changes

#### 1. Entity Service → Document Service

**Strapi 4:**
```javascript
// Entity Service (deprecated)
const posts = await strapi.entityService.findMany('api::post.post', {
  filters: { featured: true },
  populate: '*',
});
```

**Strapi 5:**
```javascript
// Document Service (new)
const posts = await strapi.documents('api::post.post').findMany({
  filters: { featured: true },
  status: 'published',
  populate: '*',
});
```

#### 2. Draft & Publish system changes

**Strapi 4:**
- Single document with `publishedAt` field
- Drafts and published in same document

**Strapi 5:**
- Separate draft and published documents
- Use `status` parameter
- New `discardDraft` operation

```javascript
// Strapi 5 - Work with drafts and published separately
const drafts = await strapi.documents('api::post.post').findMany({
  status: 'draft',
});

const published = await strapi.documents('api::post.post').findMany({
  status: 'published',
});
```

#### 3. Lifecycle hook timing and Document Service middleware

**Strapi 4:**
```javascript
// src/api/post/content-types/post/lifecycles.js
module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.title && !data.slug) {
      data.slug = data.title.toLowerCase().replace(/\s+/g, '-');
    }
  },
};
```

**Strapi 5:** lifecycle hooks still exist, but Document Service methods can trigger them differently. For
document-level behavior, prefer Document Service middleware:
```javascript
// src/index.js
export default {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      if (
        context.uid === 'api::post.post' &&
        context.action === 'create'
      ) {
        const data = context.params.data;
        if (data?.title && !data.slug) {
          data.slug = data.title.toLowerCase().replace(/\s+/g, '-');
        }
      }
      return await next();
    });
  },
};
```

#### 4. Flattened REST API response format

**Strapi 4** wrapped attributes inside a nested `attributes` object:

```json
{ "data": { "id": 1, "attributes": { "title": "My Post" } } }
```

**Strapi 5** flattens the response - attributes are directly on the data object, and `documentId` replaces `id` as
the primary identifier:

```json
{ "data": { "id": 1, "documentId": "abc123", "title": "My Post" } }
```

To ease migration, you can send the `Strapi-Response-Format: v4` header to temporarily restore the old nested format.
This lets you migrate frontend consumers one at a time:

```bash
curl -H "Strapi-Response-Format: v4" http://localhost:1337/api/posts
```

Remove the header once all clients have been updated to the new format.

#### 5. REST API relation handling

**Strapi 4:**
```http
POST /api/posts
Content-Type: application/json

{
  "data": {
    "title": "Post Title",
    "author": 1,
    "tags": [1, 2, 3]
  }
}
```

**Strapi 5:**
```http
POST /api/posts
Content-Type: application/json

{
  "data": {
    "title": "Post Title",
    "author": {
      "connect": ["author-document-id"]
    },
    "tags": {
      "connect": ["tag1-id", "tag2-id", "tag3-id"]
    }
  }
}
```

### Automated upgrade tool

Strapi provides `@strapi/upgrade` with codemods that automate many of the breaking changes. Back up first (see
Step 1 below), then run it on a clean Git working tree:

```bash
npx @strapi/upgrade major
```

This tool scans your codebase and automatically applies transformations such as:

- Converting Entity Service calls to Document Service syntax
- Updating import paths
- Adding `__TODO__` comments where manual migration is still required

Review the changes it makes, then proceed with manual migration steps for anything it could not handle automatically.

### Migration steps

#### Step 1: Backup everything

```bash
# Backup database
pg_dump -U strapi strapi_v4 > strapi_v4_backup.sql

# Backup uploads
tar -czf uploads_backup.tar.gz public/uploads/

# Backup entire project
tar -czf strapi_v4_project.tar.gz --exclude=node_modules --exclude=.tmp .
```

#### Step 2: Create database migrations for data changes

```javascript
// database/migrations/2026.09.24T00.00.00.migrate-post-data.js
module.exports = {
  async up(knex) {
    // Migrations run before Strapi's schema sync and are one-way.
    // Use Knex here for table/column data moves that must happen before sync.
    await knex('posts')
      .whereNull('excerpt')
      .update({ excerpt: '' });
  },
};
```

#### Step 3: Update dependencies

`npx @strapi/upgrade major` bumps these for you. If you update manually, keep all `@strapi/*` packages on the same
version. `@strapi/plugin-i18n` is a v4-only package -- i18n is part of the Strapi 5 core, so remove it from
`package.json`:

```json
{
  "dependencies": {
    "@strapi/strapi": "^5.55.0",
    "@strapi/plugin-users-permissions": "^5.55.0",
    "@strapi/plugin-cloud": "^5.55.0"
  }
}
```

```bash
# Install new dependencies
npm install

# Clear cache
rm -rf .cache node_modules package-lock.json
npm install
```

#### Step 4: Update custom code

```javascript
// The factory signature is unchanged; CommonJS still works in Strapi 5 JavaScript projects.
// What changes is the code inside: replace Entity Service calls with the Document Service.
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async findOne(ctx) {
    // Before (Strapi 4): strapi.entityService.findOne('api::post.post', ctx.params.id)
    const post = await strapi.documents('api::post.post').findOne({
      documentId: ctx.params.id, // the :id route param now carries the documentId
    });
    const sanitized = await this.sanitizeOutput(post, ctx);
    return this.transformResponse(sanitized);
  },
}));
```

#### Step 5: Test thoroughly

```bash
# Run in development mode
npm run develop

# Run tests
npm test

# Test all API endpoints
curl http://localhost:1337/api/posts
curl http://localhost:1337/api/posts/document-id

# Verify admin panel
# Check all content types
# Test CRUD operations
```

### Migration checklist

| Task | Status |
|------|--------|
| Backup database and files | ☐ |
| Update Node.js to a supported LTS release (v22, v24, or v26) | ☐ |
| Update Strapi dependencies to v5 | ☐ |
| Convert Entity Service to Document Service | ☐ |
| Review lifecycle hooks and use Document Service middleware where appropriate | ☐ |
| Update relation handling in API calls | ☐ |
| Remove `@strapi/plugin-i18n` (i18n is built into v5) | ☐ |
| Update custom controllers and services | ☐ |
| Update middleware and policies | ☐ |
| Test all API endpoints | ☐ |
| Test admin panel functionality | ☐ |
| Update frontend API calls | ☐ |
| Run performance tests | ☐ |
| Deploy to staging | ☐ |
| Monitor for issues | ☐ |
| Deploy to production | ☐ |

## Performance troubleshooting

### Slow queries

```javascript
// Enable query logging to find expensive SQL, then use your database slow-query log
// or APM tool for duration thresholds.
// config/database.js
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      // ... connection details
    },
    debug: env.bool('DATABASE_DEBUG', false),
    log: {
      warn(msg) {
        console.warn(msg);
      },
      error(msg) {
        console.error(msg);
      },
      deprecate(msg) {
        console.warn(msg);
      },
      debug(msg) {
        if (env.bool('DATABASE_DEBUG', false)) {
          console.debug(msg);
        }
      },
    },
  },
});
```

### Memory leaks

```javascript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  strapi.log.info('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`,
  });
}, 60000); // Log every minute

// Use heap snapshots for detailed analysis
// node --inspect npm run develop
// Open chrome://inspect and take heap snapshots
```

## Getting help

### Resources

1. **Official Documentation**: https://docs.strapi.io
2. **GitHub Issues**: https://github.com/strapi/strapi/issues
3. **Discord Community**: https://discord.strapi.io
4. **Forum**: https://forum.strapi.io
5. **Stack Overflow**: Tag questions with `strapi`

### Creating good bug reports

When reporting issues, include the following in your report:

- **Environment** - Strapi version, Node.js version, database, and operating system
- **Description** - a clear description of the issue
- **Steps to Reproduce** - a numbered list of steps that consistently triggers the problem
- **Expected Behavior** - what should happen
- **Actual Behavior** - what actually happens
- **Code Examples** - the smallest snippet that reproduces the issue
- **Error Messages** - the full error stack trace, verbatim, with credentials, tokens, and other
  secrets redacted
- **Additional Context** - anything else that might be relevant (logs, screenshots, related PRs),
  redacted of credentials, tokens, and personal data

Never post unredacted credentials, tokens, or personal data to a public GitHub issue. If a report
can only be made useful by including data you cannot safely redact, or if the issue itself is a
security vulnerability, report it through Strapi's private security channel instead (see
[strapi.io/security](https://strapi.io/security)) rather than a public issue or forum post.

## Summary

You learned:

- **Common issues** and their solutions across installation, database, API, and admin panel
- **Debugging techniques** including logging, console usage, and query debugging
- **Migration guide** from Strapi 4 to Strapi 5 with breaking changes
- **Performance troubleshooting** for slow queries and memory issues
- **Best practices** for getting help and reporting issues

With this troubleshooting knowledge, you're equipped to handle most issues that arise during Strapi development and can successfully migrate existing projects to Strapi 5.

This completes the Strapi 5 Beginners Guide. You've gone from installation to production deployment, with all the knowledge needed to build and maintain professional CMS-powered applications.
