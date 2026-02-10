---
title: "Testing Strapi Applications"
sidebar_position: 18
description: "Strapi testing: setting up a test instance, unit testing services, integration testing controllers and APIs, mocking the Document Service, and CI/CD integration."
tags: [strapi, testing, jest, unit-tests, integration-tests]
---

# Testing Strapi Applications

Testing Strapi applications is essential but under-documented. This page covers setting up a test Strapi instance, unit
testing services, integration testing API endpoints, mocking strategies, and CI/CD integration.

## Test environment setup

### Install dependencies

```bash
npm install --save-dev jest supertest @types/jest
# For TypeScript projects:
npm install --save-dev ts-jest @types/supertest
```

### Jest configuration

```js
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(js|ts)', '**/*.test.(js|ts)'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/.cache/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Strapi boot can be slow
  testTimeout: 30000,
  // Run tests sequentially (Strapi is stateful)
  maxWorkers: 1,
};
```

### Strapi test instance helper

```js
// tests/helpers/strapi.js
const Strapi = require('@strapi/strapi');

let instance;

async function setupStrapi() {
  if (!instance) {
    instance = await Strapi().load();
    await instance.server.mount();
  }
  return instance;
}

async function teardownStrapi() {
  if (instance) {
    await instance.destroy();
    instance = null;
  }
}

// Clean database between tests
async function cleanDatabase() {
  const dbSettings = strapi.config.get('database.connection');

  if (dbSettings.client === 'sqlite') {
    // For SQLite, just delete all entries from test tables
    const contentTypes = [
      'api::article.article',
      'api::tag.tag',
      'api::author.author',
    ];

    for (const uid of contentTypes) {
      const tableName = strapi.db.metadata.get(uid)?.tableName;
      if (tableName) {
        await strapi.db.connection(tableName).del();
      }
    }
  }
}

module.exports = { setupStrapi, teardownStrapi, cleanDatabase };
```

### Global test setup/teardown

```js
// tests/setup.js
const { setupStrapi, teardownStrapi } = require('./helpers/strapi');

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await teardownStrapi();
});
```

Add to Jest config:

```js
// jest.config.js
module.exports = {
  // ...
  globalSetup: './tests/setup.js',
  globalTeardown: './tests/teardown.js',
  setupFilesAfterFramework: ['./tests/setup-after.js'],
};
```

---

## Unit testing services

### Testing a custom service

```js
// src/api/article/services/__tests__/article.test.js
const { setupStrapi, teardownStrapi, cleanDatabase } = require('../../../../tests/helpers/strapi');

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await teardownStrapi();
});

afterEach(async () => {
  await cleanDatabase();
});

describe('Article Service', () => {
  it('should create an article', async () => {
    const article = await strapi.documents('api::article.article').create({
      data: {
        title: 'Test Article',
        slug: 'test-article',
        content: 'This is test content',
      },
    });

    expect(article).toBeDefined();
    expect(article.title).toBe('Test Article');
    expect(article.slug).toBe('test-article');
    expect(article.documentId).toBeDefined();
  });

  it('should find articles by slug', async () => {
    // Create test data
    await strapi.documents('api::article.article').create({
      data: { title: 'Found Me', slug: 'found-me', content: 'Content' },
    });

    await strapi.documents('api::article.article').create({
      data: { title: 'Other', slug: 'other', content: 'Other content' },
    });

    // Test the service method
    const result = await strapi.service('api::article.article').findBySlug('found-me');

    expect(result).toBeDefined();
    expect(result.title).toBe('Found Me');
  });

  it('should compute reading time correctly', async () => {
    const service = strapi.service('api::article.article');

    // 200 words = 1 minute
    const words200 = Array(200).fill('word').join(' ');
    expect(await service.computeReadingTime(words200)).toBe(1);

    // 500 words = 3 minutes (ceil)
    const words500 = Array(500).fill('word').join(' ');
    expect(await service.computeReadingTime(words500)).toBe(3);
  });
});
```

---

## Integration testing API endpoints

```js
// tests/api/article.test.js
const request = require('supertest');
const { setupStrapi, teardownStrapi, cleanDatabase } = require('../helpers/strapi');

let app;

beforeAll(async () => {
  const strapiInstance = await setupStrapi();
  app = strapiInstance.server.httpServer;
});

afterAll(async () => {
  await teardownStrapi();
});

afterEach(async () => {
  await cleanDatabase();
});

describe('Article API', () => {
  describe('GET /api/articles', () => {
    it('should return an empty list initially', async () => {
      const res = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.pagination.total).toBe(0);
    });

    it('should return published articles', async () => {
      // Create and publish an article
      const article = await strapi.documents('api::article.article').create({
        data: { title: 'Published', slug: 'published', content: 'Content' },
      });
      await strapi.documents('api::article.article').publish(article.documentId);

      // Create a draft (should NOT appear)
      await strapi.documents('api::article.article').create({
        data: { title: 'Draft', slug: 'draft', content: 'Draft content' },
      });

      const res = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Published');
    });

    it('should support filtering', async () => {
      const article = await strapi.documents('api::article.article').create({
        data: { title: 'JavaScript Guide', slug: 'js-guide', content: 'Content', featured: true },
      });
      await strapi.documents('api::article.article').publish(article.documentId);

      const article2 = await strapi.documents('api::article.article').create({
        data: { title: 'Python Guide', slug: 'py-guide', content: 'Content', featured: false },
      });
      await strapi.documents('api::article.article').publish(article2.documentId);

      const res = await request(app)
        .get('/api/articles?filters[featured][$eq]=true')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('JavaScript Guide');
    });
  });

  describe('POST /api/articles', () => {
    it('should require authentication', async () => {
      await request(app)
        .post('/api/articles')
        .send({ data: { title: 'Test', slug: 'test', content: 'Content' } })
        .expect(403);
    });

    it('should create an article when authenticated', async () => {
      const jwt = await getAuthToken(); // helper function

      const res = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          data: {
            title: 'New Article',
            slug: 'new-article',
            content: 'Content here',
          },
        })
        .expect(201);

      expect(res.body.data.title).toBe('New Article');
    });
  });
});

// Helper to get an auth token for tests
async function getAuthToken() {
  // Create or find a test user
  let testUser = await strapi.query('plugin::users-permissions.user').findOne({
    where: { email: 'test@example.com' },
  });

  if (!testUser) {
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });

    testUser = await strapi.query('plugin::users-permissions.user').create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        provider: 'local',
        confirmed: true,
        role: defaultRole.id,
      },
    });
  }

  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
    id: testUser.id,
  });

  return jwt;
}
```

---

## Testing with mocks (without Strapi instance)

For fast unit tests that don't need a running Strapi:

```js
// tests/unit/article-service.test.js
describe('Article Service (mocked)', () => {
  let mockStrapi;
  let articleService;

  beforeEach(() => {
    // Create mock strapi
    mockStrapi = {
      documents: jest.fn().mockReturnValue({
        findMany: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        publish: jest.fn(),
      }),
      log: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      },
    };

    // Import and instantiate the service
    const serviceFactory = require('../../src/api/article/services/article');
    articleService = serviceFactory({ strapi: mockStrapi });
  });

  it('should find article by slug', async () => {
    const mockArticle = { documentId: 'abc', title: 'Test', slug: 'test' };

    mockStrapi.documents().findMany.mockResolvedValue([mockArticle]);

    const result = await articleService.findBySlug('test');

    expect(result).toEqual(mockArticle);
    expect(mockStrapi.documents).toHaveBeenCalledWith('api::article.article');
    expect(mockStrapi.documents().findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { slug: { $eq: 'test' } },
      })
    );
  });

  it('should return null when article not found', async () => {
    mockStrapi.documents().findMany.mockResolvedValue([]);

    const result = await articleService.findBySlug('nonexistent');

    expect(result).toBeNull();
  });
});
```

---

## Testing lifecycle hooks

```js
describe('Lifecycle Hooks', () => {
  it('should auto-generate slug on create', async () => {
    const article = await strapi.documents('api::article.article').create({
      data: {
        title: 'My Amazing Article Title',
        content: 'Content',
        // slug intentionally omitted
      },
    });

    // If lifecycle hook is working, slug should be auto-generated
    expect(article.slug).toBe('my-amazing-article-title');
  });

  it('should update slug on title change', async () => {
    const article = await strapi.documents('api::article.article').create({
      data: {
        title: 'Original Title',
        slug: 'original-title',
        content: 'Content',
      },
    });

    const updated = await strapi.documents('api::article.article').update(
      article.documentId,
      { data: { title: 'Updated Title' } }
    );

    expect(updated.slug).toBe('updated-title');
  });
});
```

---

## Testing custom middleware

```js
describe('Cache Middleware', () => {
  it('should return cached response on second request', async () => {
    // Create and publish test data
    const article = await strapi.documents('api::article.article').create({
      data: { title: 'Cached', slug: 'cached', content: 'Content' },
    });
    await strapi.documents('api::article.article').publish(article.documentId);

    // First request: cache MISS
    const res1 = await request(app)
      .get('/api/articles')
      .expect(200);

    expect(res1.headers['x-cache']).toBe('MISS');

    // Second request: cache HIT
    const res2 = await request(app)
      .get('/api/articles')
      .expect(200);

    expect(res2.headers['x-cache']).toBe('HIT');
    expect(res2.body).toEqual(res1.body);
  });
});
```

---

## Test database configuration

Use SQLite for fast test runs:

```js
// config/env/test/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: '.tmp/test.db',
    },
    useNullAsDefault: true,
  },
});
```

```bash
# Run tests with test environment
NODE_ENV=test npx jest
```

---

## CI/CD integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: strapi_test
          POSTGRES_USER: strapi
          POSTGRES_PASSWORD: strapi
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Run tests
        run: NODE_ENV=test npx jest --coverage
        env:
          DATABASE_CLIENT: postgres
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: strapi_test
          DATABASE_USERNAME: strapi
          DATABASE_PASSWORD: strapi
          APP_KEYS: test-key-1,test-key-2,test-key-3,test-key-4
          API_TOKEN_SALT: test-api-token-salt
          ADMIN_JWT_SECRET: test-admin-jwt-secret
          JWT_SECRET: test-jwt-secret
          TRANSFER_TOKEN_SALT: test-transfer-token-salt

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
```

---

## Test structure recommendation

```
tests/
├── helpers/
│   ├── strapi.js          # Strapi instance management
│   ├── auth.js            # Auth token helpers
│   └── fixtures.js        # Test data factories
├── unit/
│   ├── services/
│   │   ├── article.test.js
│   │   └── notification.test.js
│   └── policies/
│       └── is-owner.test.js
├── integration/
│   ├── api/
│   │   ├── article.test.js
│   │   ├── auth.test.js
│   │   └── upload.test.js
│   └── graphql/
│       └── article.test.js
├── setup.js
└── teardown.js
```

---

## Common pitfalls

| Pitfall                               | Problem                              | Fix                                           |
|---------------------------------------|--------------------------------------|-----------------------------------------------|
| Tests share state                     | One test's data leaks into another   | Clean database between tests                  |
| Strapi instance not destroyed         | Port still in use, next run fails    | Always call `teardownStrapi()` in `afterAll`  |
| Testing against production DB         | Accidentally deletes real data       | Use `NODE_ENV=test` with a separate database  |
| Slow test suite                       | Strapi boots for every test file     | Use `globalSetup` to boot once                |
| Missing env vars in CI                | Strapi fails to start                | Set all required env vars in CI config        |
| Testing implementation, not behaviour | Brittle tests that break on refactor | Test API responses, not internal method calls |

---

## See also

- [Custom Controllers and Services](custom-controllers-services.md) -- what you're actually testing
- [Middleware and Policies](middleware-and-policies.md) -- testing policies and middleware
- [TypeScript Integration](typescript-integration.md) -- typing test helpers
- [Configuration and Deployment](configuration-and-deployment.md) -- CI/CD setup
