---
title: "Performance Optimization"
sidebar_label: "Performance"
description: Database indexing, query optimization, caching strategies, CDN setup, and monitoring for high-performance Strapi applications.
slug: /strapi/beginners-guide/performance-optimization
tags: [strapi, beginners, performance]
keywords:
  - strapi performance
  - strapi optimization
  - strapi caching
  - strapi database indexing
  - strapi monitoring
sidebar_position: 15
---

# Performance Optimization

As your Strapi application grows, performance becomes crucial. This chapter covers database optimization, caching strategies, CDN integration, and monitoring to ensure your CMS runs fast at scale.

## Database Optimization

### Adding indexes

Indexes dramatically improve query performance. Add them for frequently queried fields:

```javascript
// database/migrations/add-indexes.js
module.exports = {
  async up(knex) {
    // Index for featured posts
    await knex.schema.alterTable('posts', (table) => {
      table.index(['featured', 'published_at'], 'idx_posts_featured_published');
      table.index(['category_id', 'published_at'], 'idx_posts_category_published');
      table.index('slug', 'idx_posts_slug');
      table.index('published_at', 'idx_posts_published_at');
    });

    // Index for authors
    await knex.schema.alterTable('authors', (table) => {
      table.index('email', 'idx_authors_email');
    });

    // Index for tags (many-to-many join table)
    await knex.schema.alterTable('posts_tags_links', (table) => {
      table.index(['post_id', 'tag_id'], 'idx_posts_tags');
    });
  },

  async down(knex) {
    await knex.schema.alterTable('posts', (table) => {
      table.dropIndex('idx_posts_featured_published');
      table.dropIndex('idx_posts_category_published');
      table.dropIndex('idx_posts_slug');
      table.dropIndex('idx_posts_published_at');
    });

    await knex.schema.alterTable('authors', (table) => {
      table.dropIndex('idx_authors_email');
    });

    await knex.schema.alterTable('posts_tags_links', (table) => {
      table.dropIndex('idx_posts_tags');
    });
  }
};
```

Run the migration:

```bash
npm run strapi database:migrate
```

### Query optimization

#### Use field selection to reduce payload

```javascript
// Bad: Fetches all fields
const posts = await strapi.documents("api::post.post").findMany({
  status: "published",
});

// Good: Only fetch needed fields
const posts = await strapi.documents("api::post.post").findMany({
  status: "published",
  fields: ["title", "slug", "excerpt", "publishedDate"],
});
```

#### Avoid N+1 queries

```javascript
// Bad: N+1 queries
const posts = await strapi.documents("api::post.post").findMany();
for (const post of posts) {
  const author = await strapi.documents("api::author.author").findOne({
    documentId: post.author,
  });
  post.authorName = author.name;
}

// Good: Single query with population
const posts = await strapi.documents("api::post.post").findMany({
  populate: {
    author: { fields: ["name"] },
  },
});
```

#### Pagination for large datasets

```javascript
// Bad: Fetch all records
const allPosts = await strapi.documents("api::post.post").findMany({
  status: "published",
});

// Good: Paginate results
const posts = await strapi.documents("api::post.post").findMany({
  status: "published",
  pagination: {
    page: 1,
    pageSize: 20,
  },
});
```

### Database connection pooling

Configure proper connection pooling:

```javascript
// config/database.js
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST'),
      port: env.int('DATABASE_PORT'),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false),
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
      acquireTimeoutMillis: env.int('DATABASE_POOL_ACQUIRE', 60000),
      createTimeoutMillis: env.int('DATABASE_POOL_CREATE', 30000),
      idleTimeoutMillis: env.int('DATABASE_POOL_IDLE', 30000),
      reapIntervalMillis: env.int('DATABASE_POOL_REAP', 1000),
    },
  },
});
```

## Caching Strategies

### Redis integration

Install Redis cache:

```bash
npm install ioredis
```

Create a Redis service:

```javascript
// src/services/redis.js
import Redis from 'ioredis';

let redis = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (err) => {
      strapi.log.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      strapi.log.info('Redis connected successfully');
    });
  }
  return redis;
}

export async function getCached(key) {
  try {
    const redis = getRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    strapi.log.error('Redis get error:', error);
    return null;
  }
}

export async function setCached(key, value, ttl = 3600) {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    strapi.log.error('Redis set error:', error);
  }
}

export async function invalidateCache(pattern) {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    strapi.log.error('Redis invalidation error:', error);
  }
}
```

### Cache middleware

Create a caching middleware for API responses:

```javascript
// src/middlewares/cache.js
import { getCached, setCached } from '../services/redis';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Only cache GET requests
    if (ctx.method !== 'GET') {
      return await next();
    }

    // Skip cache for authenticated requests
    if (ctx.state.user) {
      return await next();
    }

    // Generate cache key
    const cacheKey = `api:${ctx.url}`;

    // Check cache
    const cached = await getCached(cacheKey);
    if (cached) {
      ctx.set('X-Cache', 'HIT');
      ctx.body = cached;
      return;
    }

    // Process request
    await next();

    // Cache successful responses
    if (ctx.status === 200 && ctx.body) {
      ctx.set('X-Cache', 'MISS');
      const ttl = config.ttl || 300; // 5 minutes default
      await setCached(cacheKey, ctx.body, ttl);
    }
  };
};
```

Register the middleware:

```javascript
// config/middlewares.js
export default [
  // ... other middleware
  {
    name: './src/middlewares/cache',
    config: {
      ttl: 300, // 5 minutes
    },
  },
];
```

### Cache invalidation

Invalidate cache when content changes:

```javascript
// src/index.js
export default {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      const result = await next();

      // Invalidate cache on write operations
      if (['create', 'update', 'delete', 'publish', 'unpublish'].includes(context.action)) {
        const { invalidateCache } = await import('./services/redis');

        // Invalidate related cache patterns
        if (context.uid === 'api::post.post') {
          await invalidateCache('api:/api/posts*');
          await invalidateCache('api:/api/posts/featured*');
        }
      }

      return result;
    });
  },
};
```

## Response optimization

### Compression

Enable gzip/brotli compression:

```bash
npm install koa-compress
```

```javascript
// config/middlewares.js
import compress from 'koa-compress';

export default [
  // ... other middleware
  {
    resolve: './src/middlewares/compression',
    config: {},
  },
];
```

```javascript
// src/middlewares/compression.js
import compress from 'koa-compress';

export default (config, { strapi }) => {
  return compress({
    threshold: 2048, // Compress responses larger than 2KB
    gzip: {
      flush: require('zlib').constants.Z_SYNC_FLUSH,
    },
    br: {
      params: {
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: 4,
      },
    },
  });
};
```

### Lazy loading relations

Only populate relations when needed:

```javascript
// src/api/post/controllers/post.js
export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    const { populate } = ctx.query;

    // Default minimal population for list views
    if (!populate) {
      ctx.query.populate = {
        author: { fields: ['name'] },
        category: { fields: ['name', 'slug'] },
      };
    }

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { populate } = ctx.query;

    // Full population for detail views
    if (!populate) {
      ctx.query.populate = {
        author: {
          fields: ['name', 'bio'],
          populate: { avatar: true }
        },
        category: { fields: ['name', 'slug', 'description'] },
        tags: { fields: ['name', 'slug'] },
        seo: true,
      };
    }

    return await super.findOne(ctx);
  },
}));
```

## CDN Integration

### Static asset CDN

Configure a CDN for media files:

```javascript
// config/plugins.js
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_URL', 'https://cdn.yourdomain.com'),
        s3Options: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {
          // Set cache headers for CDN
          CacheControl: 'public, max-age=31536000, immutable',
        },
      },
    },
  },
});
```

### API response caching with CDN

Set appropriate cache headers:

```javascript
// src/api/post/controllers/post.js
export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    const response = await super.find(ctx);

    // Cache public list views
    if (!ctx.state.user) {
      ctx.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      ctx.set('Vary', 'Accept-Encoding, Accept');
    }

    return response;
  },

  async findOne(ctx) {
    const response = await super.findOne(ctx);

    // Cache individual posts longer
    if (!ctx.state.user && response.data) {
      ctx.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      ctx.set('Vary', 'Accept-Encoding, Accept');
    }

    return response;
  },
}));
```

## Image Optimization

### Automatic image resizing

Configure responsive image formats:

```javascript
// config/plugins.js
export default ({ env }) => ({
  upload: {
    config: {
      breakpoints: {
        xlarge: 1920,
        large: 1280,
        medium: 750,
        small: 500,
        xsmall: 320,
      },
      // Generate WebP versions
      formats: ['webp', 'jpg'],
    },
  },
});
```

### Lazy loading implementation

On the frontend:

```html
<!-- Use native lazy loading -->
<img
  src="placeholder.jpg"
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Description"
/>

<!-- Responsive images with lazy loading -->
<picture>
  <source
    type="image/webp"
    srcset="image-320.webp 320w, image-750.webp 750w, image-1280.webp 1280w"
    sizes="(max-width: 320px) 320px, (max-width: 750px) 750px, 1280px"
  />
  <img
    src="image-placeholder.jpg"
    data-src="image-1280.jpg"
    loading="lazy"
    alt="Description"
  />
</picture>
```

## Monitoring and APM

### Application Performance Monitoring

Install New Relic or similar APM:

```bash
npm install newrelic
```

```javascript
// newrelic.js (at project root)
exports.config = {
  app_name: ['Strapi Blog CMS'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  distributed_tracing: {
    enabled: true,
  },
  logging: {
    level: 'info',
  },
  error_collector: {
    enabled: true,
  },
  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated',
  },
};
```

### Custom metrics

Track custom performance metrics:

```javascript
// src/services/metrics.js
export class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(label) {
    this.metrics.set(label, {
      start: process.hrtime.bigint(),
    });
  }

  endTimer(label) {
    const metric = this.metrics.get(label);
    if (!metric) return;

    const end = process.hrtime.bigint();
    const duration = Number(end - metric.start) / 1000000; // Convert to ms

    strapi.log.info(`[Performance] ${label}: ${duration.toFixed(2)}ms`);

    // Send to monitoring service
    if (strapi.monitoring) {
      strapi.monitoring.recordMetric(label, duration);
    }

    this.metrics.delete(label);
    return duration;
  }
}

// Usage in controllers
const tracker = new PerformanceTracker();

tracker.startTimer('post-query');
const posts = await strapi.documents('api::post.post').findMany({
  // ... query
});
tracker.endTimer('post-query');
```

### Database query monitoring

Log slow queries:

```javascript
// config/database.js
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      // ... connection details
    },
    debug: env.bool('DATABASE_DEBUG', false),
    // Log queries taking longer than 1 second
    pool: {
      afterCreate(conn, done) {
        conn.on('query', (query) => {
          const start = Date.now();
          conn.on('query-response', () => {
            const duration = Date.now() - start;
            if (duration > 1000) {
              strapi.log.warn(`Slow query (${duration}ms): ${query.sql}`);
            }
          });
        });
        done();
      },
    },
  },
});
```

## Performance best practices

### 1. Optimize startup time

Lazy load heavy dependencies:

```javascript
// Bad: Load at startup
import heavyLibrary from 'heavy-library';

// Good: Load when needed
let heavyLibrary;
function getHeavyLibrary() {
  if (!heavyLibrary) {
    heavyLibrary = require('heavy-library');
  }
  return heavyLibrary;
}
```

### 2. Use streaming for large responses

```javascript
// Stream large files instead of loading into memory
export default {
  async downloadLargeFile(ctx) {
    const stream = fs.createReadStream('large-file.csv');
    ctx.type = 'text/csv';
    ctx.body = stream;
  },
};
```

### 3. Implement request queuing

Prevent overload with rate limiting:

```javascript
// config/middlewares.js
export default [
  // ... other middleware
  {
    name: 'strapi::rateLimit',
    config: {
      interval: 60000, // 1 minute
      max: 100, // 100 requests per minute
      delayAfter: 50, // Start slowing down after 50 requests
      timeWait: 10000, // 10 second delay
    },
  },
];
```

### 4. Database query batching

Batch multiple queries:

```javascript
// Bad: Multiple individual queries
for (const id of postIds) {
  const post = await strapi.documents('api::post.post').findOne({
    documentId: id,
  });
  posts.push(post);
}

// Good: Single batched query
const posts = await strapi.documents('api::post.post').findMany({
  filters: {
    documentId: { $in: postIds },
  },
});
```

## Load testing

Test your application's performance limits:

```bash
# Install k6
brew install k6

# Create a load test
```

```javascript
// k6-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function () {
  // Test homepage
  const res1 = http.get('https://cms.yourdomain.com/api/posts');
  check(res1, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test individual post
  const res2 = http.get('https://cms.yourdomain.com/api/posts/sample-post-id');
  check(res2, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
```

Run the load test:

```bash
k6 run k6-test.js
```

## Summary

You learned:

- **Database optimization** with indexes and connection pooling
- **Query optimization** techniques to avoid N+1 queries
- **Redis caching** for API responses
- **CDN integration** for static assets and API caching
- **Image optimization** with responsive formats
- **Monitoring** with APM and custom metrics
- **Performance testing** with k6 load testing
- **Best practices** for high-performance Strapi applications

With these optimizations, your Strapi application can handle significant traffic while maintaining fast response times.

Next up: [Troubleshooting & Migration Guide](./16-troubleshooting.md) -- common issues, debugging techniques, and migrating from Strapi 4.