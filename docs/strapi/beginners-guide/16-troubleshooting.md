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
```
error strapi@5.x.x: The engine "node" is incompatible with this module. Expected version ">=20.0.0". Got "19.0.0"
```

Strapi 5 only supports LTS versions of Node.js. Since Strapi 5.31.0, the minimum is Node 20. Odd-numbered
releases (19, 21, 23) are never supported.

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
```
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
```
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
```
error: Migration failed: relation "posts" already exists
```

**Solution:**
```javascript
// Clear migrations and rebuild
// 1. Backup your database first!
pg_dump -U strapi strapi_blog > backup.sql

// 2. Drop and recreate the database
DROP DATABASE strapi_blog;
CREATE DATABASE strapi_blog OWNER strapi;

// 3. Re-run Strapi to recreate tables
npm run develop
```

### API Issues

#### Relations not populated

**Problem:** Related data not showing in API responses

**Solution:**
```javascript
// Always explicitly populate relations
// In API call:
GET /api/posts?populate=*

// Or specific relations:
GET /api/posts?populate[author][fields][0]=name&populate[category][fields][0]=name

// In controller:
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

# Or programmatically:
```

```javascript
// src/index.js - Set permissions on bootstrap
export default {
  async bootstrap({ strapi }) {
    // Get public role
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    // Update permissions
    await strapi
      .query("plugin::users-permissions.permission")
      .updateMany({
        where: {
          role: publicRole.id,
          action: ["find", "findOne"],
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
  // Admin panel configuration
  admin: {
    url: '/admin', // Ensure this matches your nginx config
    serveAdminPanel: env.bool('SERVE_ADMIN', true),
  },
});
```

### File Upload Issues

#### File size limit errors

**Error:**
```
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
```
Error: AccessDenied: Access Denied
```

**Solution:**
```javascript
// Verify S3 bucket policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StrapiUpload",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT:user/strapi-user"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}

// Check CORS configuration on S3 bucket
```

## Debugging Techniques

### Enable debug logging

```javascript
// config/logger.js
export default {
  level: process.env.LOG_LEVEL || 'debug',
  // Enable SQL query logging
  database: {
    enabled: true,
    level: 'debug',
  },
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
    debug: true, // Enable query logging
    log: {
      warn(msg) { strapi.log.warn(msg); },
      error(msg) { strapi.log.error(msg); },
      deprecate(msg) { strapi.log.warn(msg); },
      debug(msg) { strapi.log.debug(msg); },
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

#### 3. Lifecycle hooks → Document Service middleware

**Strapi 4:**
```javascript
// src/api/post/content-types/post/lifecycles.js
module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
  },
};
```

**Strapi 5:**
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
          data.slug = slugify(data.title);
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

**Strapi 5** flattens the response -- attributes are directly on the data object, and `documentId` replaces `id` as
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
```javascript
// Create with relations using IDs
POST /api/posts
{
  "data": {
    "title": "Post Title",
    "author": 1,
    "tags": [1, 2, 3]
  }
}
```

**Strapi 5:**
```javascript
// Create with relations using connect/disconnect
POST /api/posts
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

Strapi provides `@strapi/upgrade` with codemods that automate many of the breaking changes. Run it before doing
anything else:

```bash
npx @strapi/upgrade major
```

This tool scans your codebase and automatically applies transformations such as:

- Converting Entity Service calls to Document Service syntax
- Updating import paths
- Converting lifecycle files to Document Service middleware

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

#### Step 2: Create migration script

```javascript
// scripts/migrate-v4-to-v5.js
import { Strapi } from '@strapi/strapi';

async function migrate() {
  const strapi = await Strapi().load();

  try {
    // 1. Update content type schemas
    await migrateSchemas(strapi);

    // 2. Migrate data
    await migrateData(strapi);

    // 3. Update permissions
    await migratePermissions(strapi);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await strapi.destroy();
  }
}

async function migrateSchemas(strapi) {
  // Update schema files to remove deprecated options
  // This typically needs to be done manually
  console.log('Review and update schema files manually');
}

async function migrateData(strapi) {
  // Migrate relation data format
  const posts = await strapi.db.query('api::post.post').findMany({
    populate: ['author', 'category', 'tags'],
  });

  for (const post of posts) {
    // Update relation format if needed
    await strapi.documents('api::post.post').update({
      documentId: post.documentId,
      data: {
        // Update data format as needed
      },
    });
  }
}

async function migratePermissions(strapi) {
  // Update permissions for new Document Service
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany();

  for (const role of roles) {
    // Update permissions as needed
  }
}

migrate();
```

#### Step 3: Update dependencies

```json
// package.json
{
  "dependencies": {
    "@strapi/strapi": "5.0.0",
    "@strapi/plugin-users-permissions": "5.0.0",
    "@strapi/plugin-i18n": "5.0.0",
    "@strapi/plugin-cloud": "5.0.0"
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
// Update all custom controllers, services, and middleware
// Example: Update controller
// Before (Strapi 4):
const { createCoreController } = require('@strapi/strapi').factories;

// After (Strapi 5):
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  // Update methods to use Document Service
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
| Update Node.js to v18 or v20 | ☐ |
| Update Strapi dependencies to v5 | ☐ |
| Convert Entity Service to Document Service | ☐ |
| Update lifecycle hooks to middleware | ☐ |
| Update relation handling in API calls | ☐ |
| Convert require() to ES modules | ☐ |
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
// Enable query logging to find slow queries
// config/database.js
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      // ... connection details
    },
    pool: {
      afterCreate(conn, done) {
        conn.on('query', (query) => {
          const start = Date.now();
          conn.on('query-response', () => {
            const duration = Date.now() - start;
            if (duration > 1000) {
              strapi.log.warn(`Slow query (${duration}ms):`, {
                sql: query.sql,
                bindings: query.bindings,
              });
            }
          });
        });
        done();
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

When reporting issues:

```markdown
## Environment
- Strapi Version: 5.0.0
- Node.js Version: 20.10.0
- Database: PostgreSQL 15
- Operating System: Ubuntu 22.04

## Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Code Examples
```javascript
// Relevant code
```

## Error Messages
```
Full error stack trace
```

## Additional Context
Any other relevant information
```

## Summary

You learned:

- **Common issues** and their solutions across installation, database, API, and admin panel
- **Debugging techniques** including logging, console usage, and query debugging
- **Migration guide** from Strapi 4 to Strapi 5 with breaking changes
- **Performance troubleshooting** for slow queries and memory issues
- **Best practices** for getting help and reporting issues

With this troubleshooting knowledge, you're equipped to handle most issues that arise during Strapi development and can successfully migrate existing projects to Strapi 5.

This completes the Strapi 5 Beginners Guide. You've gone from installation to production deployment, with all the knowledge needed to build and maintain professional CMS-powered applications.