---
title: "Docker & Deployment Automation"
sidebar_label: "Docker & CI/CD"
description: Containerizing Strapi with Docker, docker-compose for development, and setting up automated deployments with GitHub Actions.
slug: /strapi/beginners-guide/docker-deployment
tags: [strapi, beginners, docker, ci-cd]
keywords:
  - strapi docker
  - strapi docker-compose
  - strapi github actions
  - strapi ci/cd
  - strapi automated deployment
sidebar_position: 14
---

# Docker & Deployment Automation

Containerizing your Strapi application ensures consistency across development, staging, and production environments. In this chapter, we'll set up Docker, create a development environment with docker-compose, and automate deployments with GitHub Actions.

## Docker Setup

### Create the Dockerfile

```dockerfile
# Dockerfile
# Multi-stage build for smaller production images
FROM node:20-alpine AS base

# Install dependencies for building native modules
RUN apk update && apk add --no-cache \
  build-base \
  gcc \
  autoconf \
  automake \
  zlib-dev \
  libpng-dev \
  vips-dev \
  git \
  > /dev/null 2>&1

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 1337

# Start in development mode
CMD ["npm", "run", "develop"]

# Dependencies stage
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Builder stage
FROM base AS builder

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy application files
COPY . .

# Build the admin panel
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S strapi && \
    adduser -u 1001 -S strapi -G strapi

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=strapi:strapi /app/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/build ./build
COPY --from=builder --chown=strapi:strapi /app/public ./public

# Copy production dependencies
COPY --from=dependencies --chown=strapi:strapi /app/node_modules ./node_modules

# Copy necessary files
COPY --chown=strapi:strapi package*.json ./
COPY --chown=strapi:strapi config ./config
COPY --chown=strapi:strapi src ./src
COPY --chown=strapi:strapi database ./database

# Create uploads directory
RUN mkdir -p public/uploads && chown -R strapi:strapi public/uploads

# Switch to non-root user
USER strapi

# Expose port
EXPOSE 1337

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Strapi
CMD ["npm", "start"]
```

### Create .dockerignore

```bash
# .dockerignore
.tmp/
.cache/
.git/
build/
dist/
node_modules/
.env
.env.*
!.env.example
data/
public/uploads/*
!public/uploads/.gitkeep
*.log
.DS_Store
*.sql
*.sqlite
.idea/
.vscode/
coverage/
.nyc_output/
```

## Docker Compose for Development

### Create docker-compose.yml

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    container_name: strapi-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME:-strapi}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD:-strapi}
      POSTGRES_DB: ${DATABASE_NAME:-strapi}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - strapi-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME:-strapi}"]
      interval: 10s
      timeout: 5s
      retries: 5

  strapi:
    build:
      context: .
      target: development
    container_name: strapi-app
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: ${DATABASE_NAME:-strapi}
      DATABASE_USERNAME: ${DATABASE_USERNAME:-strapi}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD:-strapi}
      DATABASE_SSL: ${DATABASE_SSL:-false}
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET:-change-me-in-production}
      APP_KEYS: ${APP_KEYS:-key1,key2,key3,key4}
      API_TOKEN_SALT: ${API_TOKEN_SALT:-change-me-in-production}
      TRANSFER_TOKEN_SALT: ${TRANSFER_TOKEN_SALT:-change-me-in-production}
    volumes:
      - ./src:/app/src
      - ./config:/app/config
      - ./public:/app/public
      - uploads:/app/public/uploads
      - ./package.json:/app/package.json
      - ./tsconfig.json:/app/tsconfig.json
    ports:
      - "1337:1337"
    networks:
      - strapi-network
    depends_on:
      postgres:
        condition: service_healthy

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    container_name: strapi-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - strapi-network
    command: redis-server --appendonly yes

  # Optional: Adminer for database management
  adminer:
    image: adminer:latest
    container_name: strapi-adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    networks:
      - strapi-network
    depends_on:
      - postgres

volumes:
  postgres-data:
  uploads:
  redis-data:

networks:
  strapi-network:
    driver: bridge
```

### Development environment file

```bash
# .env.docker
NODE_ENV=development
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=local-dev-password
DATABASE_SSL=false

# Generate these with: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
TRANSFER_TOKEN_SALT=your-transfer-token-salt

# Optional Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Docker Compose commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f strapi

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose build strapi
docker-compose up -d strapi

# Access Strapi shell
docker-compose exec strapi sh

# Strapi runs database migrations automatically on startup.
# To force a restart (which triggers migrations):
docker-compose restart strapi

# Clean everything (including volumes)
docker-compose down -v
```

## Production Docker Compose

```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:15-alpine
    container_name: strapi-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - strapi-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME}"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  strapi:
    image: your-registry/strapi:latest
    container_name: strapi-app
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: ${DATABASE_NAME}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_SSL: ${DATABASE_SSL:-false}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      APP_KEYS: ${APP_KEYS}
      API_TOKEN_SALT: ${API_TOKEN_SALT}
      TRANSFER_TOKEN_SALT: ${TRANSFER_TOKEN_SALT}
      PUBLIC_URL: ${PUBLIC_URL}
    volumes:
      - uploads:/app/public/uploads
    networks:
      - strapi-network
    depends_on:
      postgres:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  nginx:
    image: nginx:alpine
    container_name: strapi-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - uploads:/var/www/uploads:ro
    networks:
      - strapi-network
    depends_on:
      - strapi

volumes:
  postgres-data:
  uploads:

networks:
  strapi-network:
    driver: bridge
```

## GitHub Actions CI/CD

### Build and test workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: strapi
          POSTGRES_PASSWORD: strapi
          POSTGRES_DB: strapi_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          DATABASE_CLIENT: postgres
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: strapi_test
          DATABASE_USERNAME: strapi
          DATABASE_PASSWORD: strapi

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info

  build-docker:
    runs-on: ubuntu-latest
    needs: lint-and-test
    if: github.event_name == 'push'

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          target: production
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64
```

### Deployment workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_run:
    workflows: ["CI"]
    types:
      - completed
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  deploy-staging:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /app/strapi
            docker-compose pull strapi
            docker-compose up -d strapi
            # Strapi runs database migrations automatically on startup

      - name: Health check
        run: |
          sleep 30
          curl -f https://staging.yourdomain.com/api/health || exit 1

      - name: Notify Slack on success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Staging deployment successful! :rocket:'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify Slack on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Staging deployment failed! :x:'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app/strapi

            # Backup database before deployment
            docker-compose exec -T postgres pg_dump -U strapi strapi > backup-$(date +%Y%m%d-%H%M%S).sql

            # Pull and deploy new version
            docker-compose pull strapi
            docker-compose up -d strapi
            # Strapi runs database migrations automatically on startup

            # Clear cache if using Redis
            docker-compose exec -T redis redis-cli FLUSHALL

      - name: Health check
        run: |
          sleep 30
          curl -f https://cms.yourdomain.com/api/health || exit 1

      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release ${{ github.run_number }}
          body: |
            Production deployment completed successfully
            Commit: ${{ github.sha }}
```

## Database migrations

### Create migration scripts

```javascript
// scripts/migrate.js
import Strapi from "@strapi/strapi";

async function migrate() {
  const strapi = await Strapi().load();

  try {
    // Run Strapi's built-in migrations
    await strapi.db.migrations.up();

    // Custom migrations
    const migrations = [
      // Add your custom migrations here
      async () => {
        // Example: Add index
        await strapi.db.connection.raw(`
          CREATE INDEX IF NOT EXISTS idx_posts_featured
          ON posts(featured)
          WHERE featured = true;
        `);
      },
    ];

    for (const migration of migrations) {
      await migration();
    }

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await strapi.destroy();
  }
}

migrate();
```

## Health check endpoint

Add a health check endpoint for monitoring:

```javascript
// src/api/health/routes/health.js
export default {
  routes: [
    {
      method: "GET",
      path: "/api/health",
      handler: async (ctx) => {
        try {
          // Check database connection
          await strapi.db.connection.raw("SELECT 1");

          // Check Redis if configured
          if (strapi.redis) {
            await strapi.redis.ping();
          }

          ctx.body = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: strapi.config.get("info.strapi"),
            environment: process.env.NODE_ENV,
            uptime: process.uptime(),
          };
        } catch (error) {
          ctx.status = 503;
          ctx.body = {
            status: "unhealthy",
            error: error.message,
          };
        }
      },
      config: {
        auth: false,
      },
    },
  ],
};
```

## Docker best practices

### 1. Multi-stage builds

Use multi-stage builds to minimize image size:

```dockerfile
# Bad: Single stage with all dependencies
FROM node:20
COPY . .
RUN npm install
CMD ["npm", "start"]
# Result: ~1.5GB image

# Good: Multi-stage build
FROM node:20-alpine AS builder
# ... build steps
FROM node:20-alpine
COPY --from=builder /app/dist ./dist
# Result: ~200MB image
```

### 2. Security scanning

Add security scanning to your CI pipeline:

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload Trivy results to GitHub Security
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: 'trivy-results.sarif'
```

### 3. Resource limits

Always set resource limits in production:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

### 4. Non-root user

Never run containers as root in production:

```dockerfile
RUN addgroup -g 1001 -S strapi && \
    adduser -u 1001 -S strapi -G strapi
USER strapi
```

## Kubernetes deployment (optional)

For larger deployments, consider Kubernetes.

> **Important:** Strapi has limitations with horizontal scaling. Before running multiple replicas, ensure:
>
> - **Media storage** uses an external provider (S3, Cloudinary) - the local upload provider stores files on disk and
>   will not sync across instances
> - **Admin panel sessions** are sticky or backed by shared storage - admin login state is not shared by default
> - **Caching** uses Redis or another shared store - in-memory caches are per-instance
> - **Database connections** are properly pooled - multiple replicas multiply connection usage
>
> Running a single replica with vertical scaling (more CPU/RAM) is simpler and avoids these issues for most workloads.

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: strapi
  labels:
    app: strapi
spec:
  replicas: 3
  selector:
    matchLabels:
      app: strapi
  template:
    metadata:
      labels:
        app: strapi
    spec:
      containers:
      - name: strapi
        image: ghcr.io/yourorg/strapi:latest
        ports:
        - containerPort: 1337
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: strapi-secrets
              key: database-password
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 1337
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 1337
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Summary

You learned:

- Creating a **multi-stage Dockerfile** for optimized production images
- Setting up **docker-compose** for local development with PostgreSQL and Redis
- Implementing **GitHub Actions workflows** for CI/CD
- Automating **deployment** to staging and production
- Adding **health checks** and monitoring endpoints
- Following **Docker best practices** for security and performance
- Optional **Kubernetes deployment** for scaling

With Docker and CI/CD automation, you have a professional deployment pipeline that ensures consistent, reliable deployments from development to production.

Next up: [Performance Optimization](./15-performance-optimization.md) - database indexing, query optimization, caching strategies, CDN setup, and monitoring for high-performance Strapi applications.