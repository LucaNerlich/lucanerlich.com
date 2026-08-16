# syntax=docker/dockerfile:1

# -------------------------
# 1) Build stage
# -------------------------
FROM node:22-alpine AS builder

# Use pnpm via corepack; the packageManager field in package.json pins the version
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable

WORKDIR /app

# Copy dependency files first - this layer is cached until these files change.
# .npmrc carries the supply-chain protections (7-day minimum release age,
# exotic-subdependency block, ignored lifecycle scripts) and must be in place
# before pnpm install so the install layer honors them.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Install all dependencies (dev + prod, needed for the build).
# The cache mount keeps the pnpm store warm across builds.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source files (separate layer: source changes don't re-install deps)
COPY . .

# Build the Docusaurus site - output is fully static HTML in build/
RUN pnpm build

# -------------------------
# 2) Runtime stage - static files served by a tiny Node static server.
# Reuses the node:22-alpine base (already pulled reliably in this env) so no
# extra base image is needed. `serve` uses serve-handler - the same engine
# `docusaurus serve` uses - so it auto-serves build/404.html, and serve.json
# enforces trailingSlash to match the Docusaurus config. Only `serve` and the
# static build/ are present - none of the ~1.5GB build toolchain.
# -------------------------
FROM node:22-alpine

# curl: required by Coolify's container healthcheck (alpine has no curl, and
# busybox wget does not fall back from IPv6 ::1 to IPv4). serve: static host.
# app: unprivileged runtime user (no root in the runtime container).
RUN apk add --no-cache curl && npm install -g serve@14.2.6 \
    && addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --chown=app:app --from=builder /app/build ./build
COPY --chown=app:app serve.json ./build/serve.json

ENV NODE_ENV=production

EXPOSE 3000

USER app

CMD ["serve", "build", "-l", "tcp://0.0.0.0:3000"]
