---
title: "Testing Strapi Applications"
sidebar_label: "Testing"
description: Unit testing services and controllers, integration testing API endpoints, and end-to-end testing strategies for Strapi 5.
slug: /strapi/beginners-guide/testing
tags: [strapi, beginners, testing]
keywords:
  - strapi testing
  - strapi unit tests
  - strapi integration tests
  - strapi jest
  - strapi test database
sidebar_position: 13
---

# Testing Strapi Applications

Testing ensures your CMS behaves correctly as you add features and refactor code. In this chapter, we'll set up a testing environment and write unit, integration, and end-to-end tests for our blog CMS.

## Setting up the test environment

### Install testing dependencies

```bash
npm install --save-dev jest supertest sqlite3
npm install --save-dev @types/jest @types/supertest
npm install --save-dev ts-jest # If using TypeScript
```

### Configure Jest

Create a Jest configuration file:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/admin/**",
    "!src/extensions/**",
  ],
  setupFilesAfterEnv: ["./tests/setup.js"],
  testTimeout: 30000,
};
```

For TypeScript projects:

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/admin/**",
    "!src/extensions/**",
  ],
  setupFilesAfterEnv: ["./tests/setup.ts"],
  testTimeout: 30000,
};
```

### Test database configuration

Create a separate test database configuration:

```javascript
// config/env/test/database.js
module.exports = ({ env }) => ({
  connection: {
    client: "sqlite",
    connection: {
      filename: ".tmp/test.db",
    },
    useNullAsDefault: true,
    // Disable database migrations during tests
    pool: {
      min: 0,
      max: 1,
    },
  },
});
```

### Test setup file

Create a setup file to initialize Strapi for tests:

```javascript
// tests/setup.js
const { createStrapi, compileStrapi } = require("@strapi/strapi");
const fs = require("fs");

let instance;

async function setupStrapi() {
  if (!instance) {
    // Delete test database before tests
    const dbFile = ".tmp/test.db";
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }

    await compileStrapi();
    instance = await createStrapi({ appDir: process.cwd() }).load();
    await instance.server.mount();

    // Create test data if needed
    await createTestData(instance);
  }
  return instance;
}

async function cleanupStrapi() {
  if (instance) {
    await instance.db.connection.destroy();
    await instance.destroy();
    instance = null;
  }
}

async function createTestData(strapi) {
  // Create test content
  await strapi.documents("api::author.author").create({
    data: {
      name: "Test Author",
      email: "author@test.com",
      bio: "Test bio",
    },
  });
}

module.exports = { setupStrapi, cleanupStrapi };
```

> **Note:** The Strapi 5 test bootstrapping API may change between versions. Check the
> [official Strapi testing docs](https://docs.strapi.io/cms/testing) for the latest recommended setup.

### Add test scripts to package.json

```json
{
  "scripts": {
    "test": "NODE_ENV=test jest --forceExit --detectOpenHandles",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage --forceExit"
  }
}
```

## Unit testing services

Test your custom service methods in isolation:

```javascript
// tests/unit/services/post.test.js
const { setupStrapi, cleanupStrapi } = require("../../setup");

describe("Post Service", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  describe("findPopular", () => {
    it("should return maximum 5 posts", async () => {
      // Create 10 test posts
      for (let i = 0; i < 10; i++) {
        await strapi.documents("api::post.post").create({
          data: {
            title: `Post ${i}`,
            slug: `post-${i}`,
            featured: i < 5,
            publishedDate: new Date().toISOString(),
          },
          status: "published",
        });
      }

      const posts = await strapi
        .service("api::post.post")
        .findPopular(5);

      expect(posts).toHaveLength(5);
      expect(posts[0]).toHaveProperty("title");
    });

    it("should only return published posts", async () => {
      // Create a draft post
      await strapi.documents("api::post.post").create({
        data: {
          title: "Draft Post",
          slug: "draft-post",
          featured: true,
        },
        status: "draft",
      });

      const posts = await strapi
        .service("api::post.post")
        .findPopular();

      const draftPost = posts.find(p => p.title === "Draft Post");
      expect(draftPost).toBeUndefined();
    });
  });

  describe("findRelated", () => {
    it("should find posts with same category", async () => {
      // Create a category
      const category = await strapi.documents("api::category.category").create({
        data: {
          name: "JavaScript",
          slug: "javascript",
        },
      });

      // Create posts with the same category
      const post1 = await strapi.documents("api::post.post").create({
        data: {
          title: "Post 1",
          slug: "post-1",
          category: { connect: [category.documentId] },
        },
        status: "published",
      });

      const post2 = await strapi.documents("api::post.post").create({
        data: {
          title: "Post 2",
          slug: "post-2",
          category: { connect: [category.documentId] },
        },
        status: "published",
      });

      const related = await strapi
        .service("api::post.post")
        .findRelated(post1.documentId);

      expect(related).toContainEqual(
        expect.objectContaining({ documentId: post2.documentId })
      );
    });
  });
});
```

## Integration testing API endpoints

Test your API endpoints with actual HTTP requests:

```javascript
// tests/integration/api/post.test.js
const request = require("supertest");
const { setupStrapi, cleanupStrapi } = require("../../setup");

describe("Post API", () => {
  let strapi;
  let app;

  beforeAll(async () => {
    strapi = await setupStrapi();
    app = strapi.server.httpServer;
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  describe("GET /api/posts", () => {
    it("should return published posts", async () => {
      // Create test posts
      await strapi.documents("api::post.post").create({
        data: {
          title: "Published Post",
          slug: "published-post",
        },
        status: "published",
      });

      await strapi.documents("api::post.post").create({
        data: {
          title: "Draft Post",
          slug: "draft-post",
        },
        status: "draft",
      });

      const response = await request(app)
        .get("/api/posts")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty("pagination");

      // Should only include published posts
      const titles = response.body.data.map(p => p.title);
      expect(titles).toContain("Published Post");
      expect(titles).not.toContain("Draft Post");
    });

    it("should filter by category", async () => {
      const category = await strapi.documents("api::category.category").create({
        data: {
          name: "Testing",
          slug: "testing",
        },
      });

      await strapi.documents("api::post.post").create({
        data: {
          title: "Category Post",
          slug: "category-post",
          category: { connect: [category.documentId] },
        },
        status: "published",
      });

      const response = await request(app)
        .get(`/api/posts?filters[category][slug][$eq]=testing`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("Category Post");
    });

    it("should populate relations when requested", async () => {
      const author = await strapi.documents("api::author.author").create({
        data: {
          name: "John Doe",
          email: "john@example.com",
        },
      });

      await strapi.documents("api::post.post").create({
        data: {
          title: "Post with Author",
          slug: "post-with-author",
          author: { connect: [author.documentId] },
        },
        status: "published",
      });

      const response = await request(app)
        .get("/api/posts?populate=author")
        .expect(200);

      const post = response.body.data.find(
        p => p.title === "Post with Author"
      );
      expect(post.author).toBeDefined();
      expect(post.author.name).toBe("John Doe");
    });
  });

  describe("GET /api/posts/:documentId", () => {
    it("should return a single post", async () => {
      const post = await strapi.documents("api::post.post").create({
        data: {
          title: "Single Post",
          slug: "single-post",
          excerpt: "Test excerpt",
        },
        status: "published",
      });

      const response = await request(app)
        .get(`/api/posts/${post.documentId}`)
        .expect(200);

      expect(response.body.data.title).toBe("Single Post");
      expect(response.body.data.excerpt).toBe("Test excerpt");
    });

    it("should return 404 for non-existent post", async () => {
      await request(app)
        .get("/api/posts/non-existent-id")
        .expect(404);
    });
  });

  describe("POST /api/posts", () => {
    it("should create a new post with authentication", async () => {
      // Get API token (you would set this up in your test data)
      const token = "test-api-token";

      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "New Post",
            slug: "new-post",
            excerpt: "Created via API",
            featured: true,
          },
        })
        .expect(201);

      expect(response.body.data.title).toBe("New Post");
      expect(response.body.data.featured).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      await request(app)
        .post("/api/posts")
        .send({
          data: {
            title: "Unauthorized Post",
            slug: "unauthorized-post",
          },
        })
        .expect(401);
    });
  });

  describe("Custom endpoints", () => {
    it("should return featured posts", async () => {
      // Create featured posts
      for (let i = 0; i < 3; i++) {
        await strapi.documents("api::post.post").create({
          data: {
            title: `Featured ${i}`,
            slug: `featured-${i}`,
            featured: true,
          },
          status: "published",
        });
      }

      const response = await request(app)
        .get("/api/posts/featured")
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(post => {
        expect(post.featured).toBe(true);
      });
    });

    it("should find post by slug", async () => {
      await strapi.documents("api::post.post").create({
        data: {
          title: "Slugged Post",
          slug: "unique-slug-123",
        },
        status: "published",
      });

      const response = await request(app)
        .get("/api/posts/by-slug/unique-slug-123")
        .expect(200);

      expect(response.body.data.title).toBe("Slugged Post");
    });
  });
});
```

## Testing lifecycle hooks

Test that your Document Service middleware works correctly:

```javascript
// tests/unit/lifecycle/post-lifecycle.test.js
const { setupStrapi, cleanupStrapi } = require("../../setup");

describe("Post Lifecycle Hooks", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  it("should auto-generate slug from title", async () => {
    const post = await strapi.documents("api::post.post").create({
      data: {
        title: "This Is A Test Post!",
        // No slug provided
      },
    });

    expect(post.slug).toBe("this-is-a-test-post");
  });

  it("should validate title length", async () => {
    await expect(
      strapi.documents("api::post.post").create({
        data: {
          title: "No", // Too short
          slug: "no",
        },
      })
    ).rejects.toThrow("Post title must be at least 5 characters long");
  });

  it("should log content changes", async () => {
    const logSpy = jest.spyOn(strapi.log, "info");

    await strapi.documents("api::post.post").create({
      data: {
        title: "Logged Post",
        slug: "logged-post",
      },
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Content Change] create on api::post.post")
    );

    logSpy.mockRestore();
  });
});
```

## Testing policies

Test your custom policies:

```javascript
// tests/unit/policies/is-owner.test.js
const { setupStrapi, cleanupStrapi } = require("../../setup");

describe("Is Owner Policy", () => {
  let strapi;
  let policy;

  beforeAll(async () => {
    strapi = await setupStrapi();
    policy = require("../../../src/api/post/policies/is-owner");
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  it("should deny access without user", async () => {
    const mockContext = {
      state: { user: null },
      params: { id: "post-123" },
    };

    const result = await policy(mockContext, {}, { strapi });
    expect(result).toBe(false);
  });

  it("should allow access for post owner", async () => {
    const author = await strapi.documents("api::author.author").create({
      data: {
        name: "Owner",
        email: "owner@test.com",
      },
    });

    const post = await strapi.documents("api::post.post").create({
      data: {
        title: "Owned Post",
        slug: "owned-post",
        author: { connect: [author.documentId] },
      },
    });

    const mockContext = {
      state: {
        user: {
          id: author.id,
          documentId: author.documentId,
        },
      },
      params: { id: post.documentId },
    };

    const result = await policy(mockContext, {}, { strapi });
    expect(result).toBe(true);
  });

  it("should deny access for non-owner", async () => {
    const author = await strapi.documents("api::author.author").create({
      data: {
        name: "Author",
        email: "author@test.com",
      },
    });

    const otherAuthor = await strapi.documents("api::author.author").create({
      data: {
        name: "Other",
        email: "other@test.com",
      },
    });

    const post = await strapi.documents("api::post.post").create({
      data: {
        title: "Not My Post",
        slug: "not-my-post",
        author: { connect: [author.documentId] },
      },
    });

    const mockContext = {
      state: {
        user: {
          id: otherAuthor.id,
          documentId: otherAuthor.documentId,
        },
      },
      params: { id: post.documentId },
    };

    const result = await policy(mockContext, {}, { strapi });
    expect(result).toBe(false);
  });
});
```

## Performance testing

Test that your queries perform within acceptable limits:

```javascript
// tests/performance/post-queries.test.js
const { setupStrapi, cleanupStrapi } = require("../setup");

describe("Post Query Performance", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Create a large dataset
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        strapi.documents("api::post.post").create({
          data: {
            title: `Post ${i}`,
            slug: `post-${i}`,
            content: "Lorem ipsum dolor sit amet",
            featured: i % 10 === 0,
          },
          status: "published",
        })
      );
    }
    await Promise.all(promises);
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  it("should fetch posts quickly", async () => {
    const start = Date.now();

    await strapi.documents("api::post.post").findMany({
      status: "published",
      limit: 10,
    });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete within 100ms
  });

  it("should handle complex queries efficiently", async () => {
    const start = Date.now();

    await strapi.documents("api::post.post").findMany({
      filters: {
        featured: true,
        title: { $contains: "Post" },
      },
      populate: {
        author: { fields: ["name"] },
        category: { fields: ["name"] },
      },
      sort: { publishedDate: "desc" },
      limit: 5,
    });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200); // Complex query within 200ms
  });
});
```

## Test utilities

Create reusable test utilities:

```javascript
// tests/utils/auth.js
async function createTestUser(strapi, data = {}) {
  return await strapi.plugins["users-permissions"].services.user.add({
    username: data.username || "testuser",
    email: data.email || "test@example.com",
    password: data.password || "Test1234",
    provider: "local",
    confirmed: true,
    blocked: false,
    role: data.role || 1,
  });
}

async function getAuthToken(strapi, email, password) {
  const response = await strapi.plugins["users-permissions"].services.auth.login({
    identifier: email,
    password: password,
  });
  return response.jwt;
}

module.exports = { createTestUser, getAuthToken };
```

```javascript
// tests/utils/data.js
async function createTestPost(strapi, data = {}) {
  return await strapi.documents("api::post.post").create({
    data: {
      title: data.title || "Test Post",
      slug: data.slug || "test-post",
      excerpt: data.excerpt || "Test excerpt",
      content: data.content || "Test content",
      featured: data.featured || false,
      ...data,
    },
    status: data.status || "published",
  });
}

async function createTestAuthor(strapi, data = {}) {
  return await strapi.documents("api::author.author").create({
    data: {
      name: data.name || "Test Author",
      email: data.email || "author@test.com",
      bio: data.bio || "Test bio",
      ...data,
    },
  });
}

module.exports = { createTestPost, createTestAuthor };
```

## Continuous Integration

Add a GitHub Actions workflow for automated testing:

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

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
```

## Best practices for testing Strapi

### 1. Test database isolation

Always use a separate test database and clean it between test suites:

```javascript
beforeEach(async () => {
  // Clean specific collections
  await strapi.db.query("api::post.post").deleteMany({});
});
```

### 2. Mock external services

Mock external API calls and services:

```javascript
jest.mock("../../../src/services/email", () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));
```

### 3. Test data factories

Create factories for consistent test data:

```javascript
// tests/factories/post.js
const { Factory } = require("fishery");

const postFactory = Factory.define(({ sequence }) => ({
  title: `Post ${sequence}`,
  slug: `post-${sequence}`,
  excerpt: "Test excerpt",
  content: "Test content",
  featured: false,
  publishedDate: new Date().toISOString(),
}));

module.exports = postFactory;
```

### 4. Parallel test execution

Configure Jest to run tests in parallel for faster execution:

```javascript
// jest.config.js
module.exports = {
  maxWorkers: "50%", // Use 50% of available CPU cores
  // ... other config
};
```

### 5. Test coverage goals

Aim for these coverage targets:
- **Services**: 80%+ coverage
- **Controllers**: 70%+ coverage
- **Policies**: 90%+ coverage
- **Lifecycle hooks**: 90%+ coverage

## Summary

You learned:

- Setting up a **test environment** with Jest and a test database
- Writing **unit tests** for services and business logic
- **Integration testing** API endpoints with supertest
- Testing **lifecycle hooks** and **policies**
- **Performance testing** to ensure queries stay fast
- Creating **test utilities** and factories for consistent test data
- Setting up **CI/CD** with GitHub Actions
- **Best practices** for testing Strapi applications

Testing gives you confidence that your CMS works correctly and continues to work as you make changes. With good test coverage, you can refactor and add features without fear of breaking existing functionality.

Next up: [Docker & Deployment Automation](./14-docker-deployment.md) -- containerizing Strapi, docker-compose for development, and automated deployments.