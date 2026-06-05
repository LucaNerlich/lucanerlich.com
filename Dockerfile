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

# Copy dependency files first -- this layer is cached until these files change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (dev + prod, needed for the build).
# The cache mount keeps the pnpm store warm across builds.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source files (separate layer: source changes don't re-install deps)
COPY . .

# Build the Docusaurus site -- output is fully static HTML in build/
RUN pnpm build

# -------------------------
# 2) Runtime stage -- static files only, no Node / no node_modules
# -------------------------
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/build /srv

EXPOSE 3000
