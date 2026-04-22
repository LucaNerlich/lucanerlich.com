---
title: "Environment Variables and Secrets"
sidebar_label: "Env & Secrets"
description: Learn how to manage configuration and secrets in Docker using ENV, ARG, .env files, runtime injection, and Docker secrets — without baking sensitive data into images.
slug: /docker/beginners-guide/environment-and-secrets
tags: [docker, beginners, devops]
keywords:
  - docker ENV
  - docker ARG
  - docker secrets
  - env file docker
  - runtime injection
  - docker compose secrets
sidebar_position: 8
---

# Environment Variables and Secrets

Almost every application needs configuration: database URLs, API keys, feature flags, port numbers. Docker provides several mechanisms to inject this configuration into containers. Using them correctly — especially for sensitive data — is one of the most important habits to develop early.

The golden rule: **secrets must never be baked into an image**. An image is a shareable artefact. Anything embedded in it can be extracted by anyone who has access to it, now or in the future.

---

## ENV vs ARG

Both `ENV` and `ARG` set variables in a Dockerfile, but they have different scopes and different security implications.

| Property | `ENV` | `ARG` |
|---|---|---|
| Available during build | Yes | Yes |
| Available at runtime (in running container) | Yes | No |
| Visible in `docker inspect` | Yes | Only if also set as ENV |
| Overridable at `docker run` | Yes (`-e KEY=val`) | No (build-time only) |
| Overridable at `docker build` | No | Yes (`--build-arg KEY=val`) |

### ENV

Use `ENV` for configuration that the application needs at runtime.

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm ci --omit=dev

# These are baked into the image — fine for non-sensitive defaults
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

EXPOSE 3000
CMD ["node", "src/index.js"]
```

At runtime, override specific variables:

```bash
docker run -d -p 3000:3000 \
  -e LOG_LEVEL=debug \
  -e PORT=4000 \
  my-app
```

### ARG

Use `ARG` for values needed only during the build step — version numbers, build flags.

```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

ARG APP_VERSION=dev
RUN echo "Building version: $APP_VERSION"

# ARG is NOT available here at runtime — this would be empty
# CMD ["echo", "$APP_VERSION"]
```

```bash
docker build --build-arg NODE_VERSION=22 --build-arg APP_VERSION=1.3.0 .
```

### The ARG + ENV pattern

To make a build-time value available at runtime, explicitly promote it:

```dockerfile
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
```

---

## Never Bake Secrets into Images

Here are three antipatterns that commit secrets into image layers:

### Antipattern 1: ENV with a real secret

```dockerfile
# BAD — this password is in every layer from here forward
ENV DATABASE_PASSWORD=mysupersecretpassword
```

Even if you later `RUN unset DATABASE_PASSWORD`, the value is still visible in the layer history:

```bash
docker history my-app
docker inspect my-app | grep -i password
```

### Antipattern 2: Secrets copied in via COPY

```dockerfile
# BAD — .env file with secrets is baked into the image layer
COPY .env /app/.env
```

Even if you `RUN rm /app/.env` in a later layer, the file exists in the layer where it was copied and can be extracted.

### Antipattern 3: Secrets passed as ARG

```dockerfile
ARG API_KEY
RUN curl -H "Authorization: Bearer $API_KEY" https://internal.api/setup
```

`ARG` values are visible in `docker history` and the build cache. Never pass real secrets as `ARG`.

---

## .env Files with Docker Compose

The `.env` file is the most practical secret management solution for local development. Compose automatically reads it and substitutes values into `${VARIABLE}` placeholders in the YAML.

```bash
# .env  (never commit to git)
DB_USER=myapp
DB_PASSWORD=supersecret
DB_NAME=myapp_production
REDIS_URL=redis://:redissecret@redis:6379
JWT_SECRET=my-jwt-signing-key
```

```yaml
# docker-compose.yml
services:
  api:
    build: .
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
```

Make sure `.env` is in your `.gitignore` and `.dockerignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local

# .dockerignore
.env
.env.*
```

Provide a `.env.example` with placeholder values that developers can copy:

```bash
# .env.example  (safe to commit)
DB_USER=changeme
DB_PASSWORD=changeme
DB_NAME=myapp
REDIS_URL=redis://redis:6379
JWT_SECRET=changeme
```

---

## Runtime Injection Patterns

### docker run with -e

The simplest approach for standalone containers:

```bash
docker run -d \
  -e DATABASE_URL="postgres://user:pass@host:5432/db" \
  -e JWT_SECRET="$(cat /run/secrets/jwt_secret)" \
  my-app
```

### docker run with -env-file

Load multiple variables from a file:

```bash
# production.env
DATABASE_URL=postgres://user:strongpass@prod-db:5432/myapp
JWT_SECRET=production-jwt-key-here
REDIS_URL=redis://prod-redis:6379

docker run -d --env-file production.env my-app
```

Unlike Compose's `.env` (which substitutes into YAML), `--env-file` injects variables directly into the container. The file is not read by the daemon — it is processed by the CLI on your local machine.

---

## Docker Secrets (Swarm / Compose)

Docker Swarm has native secret management. Compose v3+ can use the same mechanism for local development (with limitations).

Secrets are stored encrypted at rest (in Swarm's Raft store) and mounted as files inside the container at `/run/secrets/<name>`. They are never exposed as environment variables, making them harder to accidentally leak.

### Creating secrets in Swarm

```bash
# Create a secret from a string
echo "mysupersecretpassword" | docker secret create db_password -

# Create a secret from a file
docker secret create ssl_cert ./certs/server.crt

# List secrets
docker secret ls

# Secrets cannot be read back after creation — this is intentional
```

### Using secrets in a Compose file (Swarm deploy)

```yaml
services:
  api:
    image: my-app:latest
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true   # created via `docker secret create`
  jwt_secret:
    external: true
```

Inside the container, the secret is available at `/run/secrets/db_password`. Your application reads it from the filesystem rather than from an environment variable:

```javascript
// Node.js — read secret from file
const fs = require('fs');
const dbPassword = fs.readFileSync('/run/secrets/db_password', 'utf8').trim();
```

### Secrets in Compose for local development

Without Swarm, you can use file-based secrets in Compose:

```yaml
services:
  api:
    image: my-app:latest
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt   # local file, not committed to git
```

The file is mounted read-only at `/run/secrets/db_password` inside the container.

---

## Using Build Secrets (BuildKit)

For secrets needed only during `docker build` (e.g., an NPM token to install private packages), use BuildKit's `--secret` flag. The secret is mounted at build time and is **never stored in any image layer**.

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./

# Mount the NPM_TOKEN secret during this RUN step only
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) \
    npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN \
    && npm ci \
    && npm config delete //registry.npmjs.org/:_authToken

COPY . .
RUN npm run build
```

```bash
# Pass the secret at build time — it never enters the image
docker build \
  --secret id=npm_token,src=$HOME/.npmrc \
  -t my-app .
```

This is the correct way to use credentials during builds.

---

## Summary of Patterns

| Scenario | Recommended approach |
|---|---|
| Non-sensitive runtime config | `ENV` in Dockerfile with defaults |
| Development secrets | `.env` file + Docker Compose variable substitution |
| Build-time version strings | `ARG` in Dockerfile |
| Build-time credentials (NPM token, etc.) | BuildKit `--secret` mount |
| Production standalone containers | `--env-file` at `docker run` |
| Production Swarm deployments | `docker secret create` + secrets in service spec |
| CI/CD pipelines | Inject from CI secrets manager (GitHub Actions secrets, etc.) as `-e` |

---

## Checklist

Before shipping a Docker image:

- [ ] No hardcoded passwords, API keys, or tokens in the Dockerfile
- [ ] `.env` is in `.gitignore` and `.dockerignore`
- [ ] `docker history my-image` shows no secrets
- [ ] `docker inspect my-image | grep -i secret` returns nothing sensitive
- [ ] Secrets are injected at runtime, not baked in at build time
- [ ] A `.env.example` with placeholder values exists for onboarding new developers

Proper secret handling is not just about security — it makes your images truly portable. An image without hardcoded secrets can be deployed to development, staging, and production by injecting the appropriate values at runtime.
