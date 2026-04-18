---
title: "Writing a Dockerfile"
sidebar_label: "Dockerfile"
description: Learn how to write a Dockerfile to build custom images, understand layer caching, use .dockerignore, and tag and push your builds.
slug: /docker/beginners-guide/dockerfile
tags: [docker, beginners, devops]
keywords:
  - dockerfile
  - docker build
  - FROM RUN COPY
  - layer caching
  - dockerignore
  - docker tag
sidebar_position: 3
---

# Writing a Dockerfile

A **Dockerfile** is a plain-text recipe that tells Docker how to assemble an image. Every official image on Docker Hub is built from a Dockerfile, and you will write your own any time you need to package an application. Once you understand the key instructions and the caching model, building images becomes fast and predictable.

---

## The Basic Structure

A Dockerfile is a sequence of instructions, one per line. Docker executes them from top to bottom, and each instruction adds a new **layer** to the image.

```dockerfile
# Comment
INSTRUCTION arguments
```

Here is a minimal working example — a Node.js application:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

Let us go through every instruction you will use.

---

## Core Instructions

### FROM

Every Dockerfile must start with `FROM`. It sets the **base image** — the starting point your image builds on top of.

```dockerfile
# Start from an official base
FROM node:20-alpine

# Start from a completely empty image (for compiled binaries)
FROM scratch

# Give this stage a name (used in multi-stage builds)
FROM node:20-alpine AS builder
```

Choosing the right base image matters:
- `node:20` — Full Debian-based image (~1 GB). Everything installed.
- `node:20-slim` — Debian with only the essentials (~200 MB).
- `node:20-alpine` — Alpine Linux-based (~60 MB). Smaller, but uses `musl` libc, which occasionally causes compatibility issues with native addons.

### WORKDIR

Sets the working directory for subsequent `RUN`, `COPY`, `ADD`, `CMD`, and `ENTRYPOINT` instructions. If the directory does not exist, Docker creates it.

```dockerfile
WORKDIR /app
```

Prefer `WORKDIR` over `RUN cd /app`. It is explicit and applies to all later instructions.

### COPY

Copies files from your build context (the directory you pass to `docker build`) into the image.

```dockerfile
# Copy a single file
COPY package.json /app/package.json

# Copy with the build WORKDIR as destination (the trailing slash matters)
COPY package*.json ./

# Copy an entire directory
COPY src/ ./src/

# Copy with different ownership (useful for non-root users)
COPY --chown=node:node . .
```

### ADD

`ADD` is like `COPY` but with two extra capabilities: it can unpack local `.tar` archives and it can fetch URLs. In practice, `COPY` is preferred for clarity. Use `ADD` only when you need its extra features.

```dockerfile
# Unpack a local tarball
ADD app.tar.gz /app/

# Fetch from a URL (avoid this — it defeats layer caching and is hard to audit)
ADD https://example.com/config.json /config/
```

### RUN

Executes a shell command during the image build and commits the result as a new layer.

```dockerfile
# Single command
RUN npm ci --omit=dev

# Chain commands to keep them in a single layer (reduces image size)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

The `&&` chaining pattern is important for package managers: if you run `apt-get update` in one `RUN` and `apt-get install` in another, later rebuilds may use a stale cached `update` layer. Keeping both in a single `RUN` ensures the package index is always fresh when packages are installed. Always clean up cache at the end (`rm -rf /var/lib/apt/lists/*`) to keep the layer small.

### EXPOSE

Documents which network ports the container listens on. It does **not** publish the port — that is done with `-p` at `docker run` time. It is metadata for tooling and humans.

```dockerfile
EXPOSE 3000
EXPOSE 3000/tcp
EXPOSE 5353/udp
```

### ENV

Sets environment variables that are available both during the build and at runtime.

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

### ARG

Defines build-time variables that you can pass with `--build-arg`. Unlike `ENV`, they are not available at runtime (they do not persist into the final image).

```dockerfile
ARG APP_VERSION=1.0.0
RUN echo "Building version $APP_VERSION"
```

```bash
docker build --build-arg APP_VERSION=2.1.0 .
```

### CMD

Provides the **default command** to run when a container starts. It can be overridden by anything you pass after the image name in `docker run`.

```dockerfile
# Exec form (preferred — no shell interpretation, signals work correctly)
CMD ["node", "src/index.js"]

# Shell form (runs via /bin/sh -c)
CMD node src/index.js
```

Always prefer the exec form (`["executable", "arg1", "arg2"]`) so that the process receives OS signals directly. With the shell form, signals are sent to the shell, not your application, which means `docker stop` may not shut down gracefully.

### ENTRYPOINT

Sets the executable that always runs. Unlike `CMD`, it is not overridden by arguments passed to `docker run` — those arguments are passed *to* the entrypoint instead.

```dockerfile
ENTRYPOINT ["node"]
CMD ["src/index.js"]
```

With this setup:
- `docker run my-image` → runs `node src/index.js`
- `docker run my-image src/other.js` → runs `node src/other.js`

A common pattern is to use a shell script as the entrypoint for initialisation tasks:

```dockerfile
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
```

### USER

Switches the user for subsequent `RUN`, `CMD`, and `ENTRYPOINT` instructions. Always drop privileges before the final `CMD` — running as root inside a container is a security risk.

```dockerfile
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
```

Many official images (like `node`) already create a non-root user for you:

```dockerfile
USER node
```

---

## Layer Caching

Docker caches each layer and reuses the cache on subsequent builds, as long as nothing above it in the Dockerfile has changed. Understanding the cache is the key to fast builds.

**Ordering matters.** Put instructions that change rarely at the top and instructions that change frequently near the bottom.

### Slow (cache busted on every code change)

```dockerfile
FROM node:20-alpine
WORKDIR /app
# Copying everything first means a code change invalidates the npm install layer
COPY . .
RUN npm ci --omit=dev
CMD ["node", "src/index.js"]
```

### Fast (dependencies cached separately)

```dockerfile
FROM node:20-alpine
WORKDIR /app
# Only package files first — this layer is cached as long as package.json hasn't changed
COPY package*.json ./
RUN npm ci --omit=dev
# Source code changes only bust layers from here down
COPY . .
CMD ["node", "src/index.js"]
```

With this ordering, `npm ci` only re-runs when `package.json` or `package-lock.json` changes. A code-only change skips straight to the final `COPY`.

---

## .dockerignore

The `.dockerignore` file tells Docker which files to exclude from the build context. A smaller build context means faster uploads to the daemon and avoids accidentally copying secrets or large directories.

```text
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
*.test.js
coverage/
dist/
.DS_Store
Dockerfile*
docker-compose*
README.md
```

Without `.dockerignore`, `node_modules` (often hundreds of megabytes) would be copied into the build context on every `docker build`, then immediately overwritten by `npm ci` — wasting time and bandwidth.

---

## Building an Image

```bash
# Build using the Dockerfile in the current directory
# . is the build context
docker build .

# Tag the image with a name and optional tag (defaults to :latest)
docker build -t my-app .
docker build -t my-app:1.2.3 .

# Specify a different Dockerfile location
docker build -f Dockerfile.prod -t my-app:prod .

# Pass build arguments
docker build --build-arg NODE_ENV=production -t my-app .

# Build without using the cache (forces full rebuild)
docker build --no-cache -t my-app .
```

---

## Tagging Images

A tag is a mutable pointer to a specific image digest. You can add multiple tags to the same image:

```bash
# Tag after building
docker tag my-app:latest my-app:1.2.3
docker tag my-app:latest ghcr.io/yourorg/my-app:latest

# The build and tag in one step
docker build -t my-app:latest -t my-app:1.2.3 .
```

---

## Complete Worked Example

Here is a production-ready Dockerfile for a Node.js API, incorporating all the practices above:

```dockerfile
# ---- Stage: builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached until package files change)
COPY package*.json ./
RUN npm ci

# Copy source and build TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build


# ---- Stage: runtime ----
FROM node:20-alpine

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

WORKDIR /app

# Production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Drop privileges
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000

CMD ["node", "dist/index.js"]
```

This uses multi-stage builds (covered in depth in Chapter 7), non-root users, separate dependency caching, and the exec form of `CMD`.

---

## Common Dockerfile Mistakes

| Mistake | Why it hurts | Fix |
|---|---|---|
| No `.dockerignore` | Copies `node_modules`, `.git`, etc. into context | Always create `.dockerignore` |
| `CMD node app.js` (shell form) | Signals not forwarded; no graceful shutdown | Use exec form `["node", "app.js"]` |
| `apt-get update` in one `RUN`, `install` in another | Cache can serve a stale package index | Chain them with `&&` in one `RUN` |
| Running as root | Privilege escalation risk | Add `USER` instruction |
| Copying source before `npm install` | Dependency cache busted on every code change | Copy `package*.json` first |
| Baking secrets with `ENV` or `ARG` | Secrets visible in image history | Inject at runtime (see Chapter 8) |

---

With a well-structured Dockerfile you can build images that are fast to iterate on, small in size, and safe to deploy. The next chapters cover how to persist data with volumes and connect containers together with networks.
