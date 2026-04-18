---
title: "Multi-Stage Builds"
sidebar_label: "Multi-Stage Builds"
description: Learn how to use multi-stage builds to produce small, secure production images by separating build-time and runtime dependencies.
slug: /docker/beginners-guide/multi-stage-builds
tags: [docker, beginners, devops]
keywords:
  - multi-stage builds
  - docker FROM AS
  - COPY --from
  - build stage
  - runtime stage
  - image size
sidebar_position: 7
---

# Multi-Stage Builds

A common problem with Dockerfiles is that building an application requires a lot of tools — compilers, build systems, test runners, bundlers — that serve no purpose at runtime and only bloat the final image. A Node.js image that includes TypeScript, ts-node, jest, and all the `devDependencies` might be 800 MB. The same application, just the compiled JavaScript and production `node_modules`, might be 80 MB.

**Multi-stage builds** solve this by letting you use multiple `FROM` instructions in a single Dockerfile. Each `FROM` starts a new stage, and you can selectively `COPY` artefacts from one stage into another. Docker discards the intermediate stages — they are never part of the final image.

---

## The Core Concept

Without multi-stage builds, the naive approach is to build inside the container and ship everything:

```dockerfile
# Single-stage — ships build tools, source maps, devDependencies, etc.
FROM node:20

WORKDIR /app
COPY . .
RUN npm install          # installs devDependencies too
RUN npm run build        # compiles TypeScript
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

This works but ships a bloated image. With multi-stage builds:

```dockerfile
# ---- Stage 1: builder ----
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci                        # install all deps including devDependencies
COPY tsconfig.json .
COPY src/ ./src/
RUN npm run build                 # compile TypeScript → dist/

# ---- Stage 2: runtime ----
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev             # production deps only
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

The `--from=builder` flag in `COPY` references the named stage `builder`. Only the compiled `dist/` directory crosses the stage boundary. The build tools, TypeScript source, source maps, and `devDependencies` stay in `builder` and are discarded.

---

## FROM ... AS Syntax

You name a stage by appending `AS <name>` to the `FROM` instruction. Names are case-insensitive and can be referenced in later `COPY --from` and `RUN --mount=from` instructions.

```dockerfile
FROM ubuntu:24.04 AS base
FROM base AS builder
FROM base AS tester
FROM base AS production
```

You can also reference a stage by its zero-indexed position number, but naming stages is far more readable.

---

## COPY --from

`COPY --from` is the mechanism that transfers artefacts between stages.

```dockerfile
# Copy from a named stage
COPY --from=builder /app/dist ./dist

# Copy a single file
COPY --from=builder /app/dist/index.js ./

# Copy from an external image (not just a stage in this Dockerfile)
COPY --from=nginx:alpine /etc/nginx/nginx.conf ./nginx.conf.reference
```

The last form — copying from an external image — is useful for grabbing well-known config templates or static binaries.

---

## Building a Specific Stage

You can stop the build at any stage using `--target`:

```bash
# Build only the 'builder' stage (useful for testing the build step in CI)
docker build --target builder -t my-app:builder .

# Build the full production image
docker build -t my-app:latest .
```

`--target` is invaluable in CI pipelines where you might want to run tests in the `builder` stage before building the final image.

---

## Real-World Example: Node.js TypeScript API

Here is a production-quality Dockerfile for a TypeScript Express API.

```dockerfile
# ============================================================
# Stage 1 — deps: Install ALL dependencies (including dev)
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
# ci installs exactly what's in the lockfile, reproducibly
RUN npm ci


# ============================================================
# Stage 2 — builder: Compile TypeScript
# ============================================================
FROM deps AS builder

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build
# Output: /app/dist/


# ============================================================
# Stage 3 — tester: Run tests (optional; used in CI with --target tester)
# ============================================================
FROM builder AS tester

COPY tests/ ./tests/
RUN npm test


# ============================================================
# Stage 4 — production: Minimal runtime image
# ============================================================
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs appuser

WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled code from builder (NOT the full deps, NOT the source)
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

USER appuser

EXPOSE 3000
ENV NODE_ENV=production PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### Build commands

```bash
# Run tests only
docker build --target tester -t my-app:test .

# Build production image
docker build --target production -t my-app:latest .

# Full build (defaults to the last stage — production)
docker build -t my-app:latest .
```

---

## Size Comparison

To illustrate the difference, here are typical sizes for the same Node.js + TypeScript app at each stage:

| Image variant | Approximate size | What's included |
|---|---|---|
| `node:20` (single stage, all deps) | ~1.1 GB | Full Debian, build tools, devDeps, source |
| `node:20-alpine` (single stage, all deps) | ~320 MB | Alpine, build tools, devDeps, source |
| Multi-stage, `node:20` runtime | ~220 MB | Debian, prod deps, compiled JS only |
| Multi-stage, `node:20-alpine` runtime | ~75 MB | Alpine, prod deps, compiled JS only |
| Multi-stage, `node:20-alpine` + distroless | ~55 MB | Distroless, prod deps, compiled JS only |

Multi-stage builds consistently produce images 4–10× smaller than naive single-stage builds. Smaller images mean faster pushes, faster pulls, and a smaller attack surface.

---

## Example: Go Binary

Go compiles to a single statically-linked binary, making multi-stage builds especially effective:

```dockerfile
# Stage 1: build the Go binary
FROM golang:1.22-alpine AS builder

WORKDIR /app
# Cache dependencies separately
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# CGO_ENABLED=0 produces a fully static binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server

# Stage 2: scratch image (literally empty — just the binary)
FROM scratch

COPY --from=builder /app/server /server
# If your app needs TLS certificates
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 8080
ENTRYPOINT ["/server"]
```

The `scratch` base image contains nothing. The final image contains only the binary and the CA certificates. The result is typically under 10 MB — compared to 800 MB+ for a Go development image.

---

## Example: React Frontend (Build + Nginx)

```dockerfile
# Stage 1: build the React app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Output: /app/dist/

# Stage 2: serve with nginx
FROM nginx:1.27-alpine

# Copy the built static files into nginx's serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

The final image contains only nginx and the compiled HTML/CSS/JS. Node.js and the build toolchain are gone.

---

## Layer Caching Across Stages

Each stage has its own layer cache. The dependency-installation stage (copying `package*.json` and running `npm ci`) is cached independently from the compilation stage (copying source and running `npm run build`). This means:

- A code change only invalidates the compilation layer, not the dependency install.
- A dependency change invalidates both.

Structure your stages so that slow, infrequently-changing steps come first within each stage.

---

## BuildKit and Parallel Stages

Docker BuildKit (enabled by default since Docker 23) can build independent stages in **parallel**, further reducing build time. Stages that do not depend on each other run concurrently.

```bash
# BuildKit is the default in modern Docker, but you can verify:
docker build --progress=plain .
```

If you have a `builder` and a `tester` stage that both start from `deps` but are independent of each other, BuildKit runs them at the same time.

---

## Summary

Multi-stage builds are one of the most impactful practices for production Docker images:

| Goal | Technique |
|---|---|
| Separate build and runtime | Use `FROM ... AS <stage>` + `COPY --from` |
| Run tests in CI, skip in prod | `docker build --target tester` |
| Minimise image size | Use Alpine or distroless as the final base |
| Static binaries | Use `FROM scratch` for Go, Rust |
| Keep secrets out of the final image | Only pass them to builder stages via `--secret` |

Once you adopt multi-stage builds, single-stage Dockerfiles that ship build tools to production will feel obviously wrong.
