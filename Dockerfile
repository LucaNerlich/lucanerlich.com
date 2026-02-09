# -------------------------
# 1) Build stage
# -------------------------
FROM node:22-alpine AS builder

# Use pnpm (matches packageManager in package.json)
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

# Copy dependency files first -- this layer is cached until these files change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (dev + prod, needed for the build)
RUN pnpm install --frozen-lockfile

# Copy source files (separate layer: source changes don't re-install deps)
COPY . .

# Build the Docusaurus site
RUN pnpm build

# -------------------------
# 2) Production stage
# -------------------------
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

# Copy only what docusaurus serve needs -- not the entire build stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/docusaurus.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "run", "coolify"]
