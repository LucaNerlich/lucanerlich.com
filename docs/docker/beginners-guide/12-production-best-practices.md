---
title: "Production Best Practices"
sidebar_label: "Production Best Practices"
description: Learn how to harden Docker containers for production — non-root users, read-only filesystems, minimal base images, resource limits, restart policies, and a complete end-to-end project.
slug: /docker/beginners-guide/production-best-practices
tags: [docker, beginners, devops]
keywords:
  - docker production
  - non-root docker
  - read-only filesystem
  - alpine distroless
  - docker resource limits
  - container restart policy
sidebar_position: 12
---

# Production Best Practices

Getting a container to run is the easy part. Getting it to run **safely and reliably in production** requires discipline across several dimensions: security, resource management, observability, and operational hygiene. This final chapter brings everything from the guide together into a set of concrete practices, and closes with a full project that containerises a Node.js application from scratch to production.

---

## 1. Run as a Non-Root User

By default, processes inside a container run as `root` (UID 0). If an attacker exploits your application and escapes the container, they have root access on the host — unless you drop privileges.

### In the Dockerfile

```dockerfile
FROM node:20-alpine

# Option A: Use the pre-created 'node' user that official Node images ship with
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --omit=dev
USER node
CMD ["node", "src/index.js"]
```

```dockerfile
# Option B: Create your own user for full control
FROM python:3.12-slim

RUN addgroup --system --gid 1001 appgroup \
 && adduser  --system --uid 1001 --ingroup appgroup appuser

WORKDIR /app
COPY --chown=appuser:appgroup requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=appuser:appgroup . .

USER appuser
CMD ["python", "-m", "gunicorn", "app:app"]
```

### Why it matters

- Limits the blast radius if the application is compromised
- Prevents the process from installing software, modifying system files, or reading `/etc/shadow`
- Required by some Kubernetes admission policies and security benchmarks (CIS, NIST)

### Verifying

```bash
# Who is running inside the container?
docker exec my-app whoami
# appuser  ← good

docker exec my-app id
# uid=1001(appuser) gid=1001(appgroup) groups=1001(appgroup)
```

---

## 2. Use Read-Only Filesystems

Make the container's root filesystem read-only to prevent an attacker (or a buggy application) from modifying system files.

```bash
docker run -d \
  --read-only \
  --tmpfs /tmp:size=50m \
  --tmpfs /var/run:size=5m \
  --name my-app \
  my-app:latest
```

The `--tmpfs` flags provide writable temporary directories for parts of the filesystem that legitimately need to write (PID files, sockets, temporary uploads). Everything else is immutable.

In Docker Compose:

```yaml
services:
  api:
    image: my-app:latest
    read_only: true
    tmpfs:
      - /tmp:size=50m
      - /var/run:size=5m
```

Your application may need adjustment to avoid writing outside `/tmp` and `/var/run`. Common culprits: log files (redirect to stdout), session files (use Redis), and PID files (configure to write to `/var/run`).

---

## 3. Use Minimal Base Images

Every package in a base image is a potential vulnerability. Smaller base images mean fewer CVEs, faster pulls, and a smaller attack surface.

| Base image | Approximate size | Notes |
|---|---|---|
| `ubuntu:24.04` | ~77 MB | Full OS, hundreds of packages |
| `debian:bookworm-slim` | ~74 MB | Minimal Debian |
| `node:20` | ~1.1 GB | Full Debian + Node.js |
| `node:20-slim` | ~230 MB | Slim Debian + Node.js |
| `node:20-alpine` | ~60 MB | Alpine Linux + Node.js |
| `gcr.io/distroless/nodejs20-debian12` | ~110 MB | No shell, no package manager |
| `scratch` | 0 B | Empty — for static binaries only |

### Alpine

Alpine uses `musl` libc instead of `glibc`. This is usually fine for interpreted languages and most compiled software, but some native Node.js addons (e.g., some image processing libraries) require `glibc` and will fail on Alpine. Test thoroughly before using Alpine in production.

```dockerfile
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --omit=dev

USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
```

(`dumb-init` is a tiny init process that correctly forwards signals to child processes — important for graceful shutdown.)

### Distroless

Google's distroless images contain only the language runtime and your application. No shell, no package manager, no utilities. This dramatically reduces the attack surface.

```dockerfile
# Multi-stage: build with a full image, run with distroless
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["src/index.js"]
```

Note: with distroless, `docker exec -it my-app sh` will not work — there is no shell. Use `docker exec my-app node -e "console.log('test')"` for ad-hoc debugging, or temporarily rebuild with a full image.

---

## 4. Set Resource Limits

Without resource limits, a single misbehaving container can consume all available CPU or memory on the host, starving other containers and the host OS.

### Memory limits

```bash
# Hard memory limit — container is killed (OOMKilled) if it exceeds this
docker run -d --memory 512m my-app

# Soft limit (Docker tries to reclaim memory above this when the host is under pressure)
docker run -d --memory 512m --memory-reservation 256m my-app

# Disable swap (important for predictable performance)
docker run -d --memory 512m --memory-swap 512m my-app
```

### CPU limits

```bash
# Limit to 0.5 CPU cores
docker run -d --cpus 0.5 my-app

# Give this container a relative share (default is 1024)
docker run -d --cpu-shares 512 my-app
```

### In Docker Compose

```yaml
services:
  api:
    image: my-app:latest
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.1"
          memory: 128M
```

### Monitoring resource usage

```bash
# Live stats for all running containers
docker stats

# Stats for a specific container
docker stats my-app

# One-shot (no streaming)
docker stats --no-stream my-app
```

---

## 5. Configure Restart Policies

Define what Docker should do when a container exits, crashes, or the host reboots.

| Policy | Behaviour |
|---|---|
| `no` (default) | Never automatically restart |
| `always` | Always restart, including on daemon start after host reboot |
| `unless-stopped` | Always restart, except when manually stopped |
| `on-failure[:N]` | Restart only on non-zero exit code, optionally up to N times |

For long-running production services, `unless-stopped` is typically the right choice:

```bash
docker run -d --restart unless-stopped my-app
```

```yaml
# Docker Compose
services:
  api:
    image: my-app:latest
    restart: unless-stopped
```

Use `on-failure:3` for batch jobs that should retry on transient errors but stop after repeated failures (avoid infinite restart loops).

---

## 6. Other Hardening Practices

### Drop Linux capabilities

Containers inherit many Linux capabilities they rarely need. Drop all and re-add only what is required:

```bash
docker run -d \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \   # Allow binding to ports < 1024 if needed
  my-app
```

### Limit syscalls with seccomp

Docker's default seccomp profile blocks ~44 dangerous syscalls. For stricter environments, use a custom profile:

```bash
docker run -d --security-opt seccomp=/path/to/custom-profile.json my-app
```

### Prevent privilege escalation

```bash
docker run -d --security-opt no-new-privileges my-app
```

This prevents `setuid` binaries inside the container from gaining extra privileges.

### Limit PID count

Prevent fork bombs:

```bash
docker run -d --pids-limit 100 my-app
```

---

## 7. Use .dockerignore Correctly

An effective `.dockerignore` keeps your build context small and prevents secrets from entering the image:

```text
# .dockerignore
.git
.gitignore
node_modules
npm-debug.log*
.env
.env.*
!.env.example
coverage/
dist/
*.test.js
*.spec.js
__tests__/
.nyc_output/
.DS_Store
Thumbs.db
docker-compose*.yml
Dockerfile*
README.md
docs/
.github/
```

---

## Practice Project: Containerise a Node.js App End-to-End

Let us put everything together. We will containerise a simple Node.js Express API with a Postgres database, following every best practice from this guide.

### Application structure

```
my-api/
├── .dockerignore
├── .env.example
├── .github/
│   └── workflows/
│       └── docker.yml
├── docker-compose.yml
├── docker-compose.override.yml
├── Dockerfile
├── package.json
├── package-lock.json
└── src/
    ├── index.js
    ├── routes/
    │   └── health.js
    └── db.js
```

### src/index.js

```javascript
const express = require('express');
const healthRouter = require('./routes/health');

const app = express();
app.use(express.json());
app.use(healthRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Docker!', env: process.env.NODE_ENV });
});

const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({ level: 'info', message: `Server running on port ${port}` }));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(JSON.stringify({ level: 'info', message: 'SIGTERM received, shutting down' }));
  process.exit(0);
});
```

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

# ============================================================
# Stage 1: Install ALL dependencies
# ============================================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ============================================================
# Stage 2: Install PROD dependencies only
# ============================================================
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ============================================================
# Stage 3: Production runtime
# ============================================================
FROM node:20-alpine AS production

# Use dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs appuser

WORKDIR /app

# Copy production dependencies
COPY --from=prod-deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:nodejs src/ ./src/
COPY --chown=appuser:nodejs package.json ./

# Drop privileges
USER appuser

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
```

### docker-compose.yml

```yaml
services:
  api:
    build:
      context: .
      target: production
    image: my-api:latest
    ports:
      - "127.0.0.1:${APP_PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /tmp:size=10m
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
    networks:
      - app-net

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      start_period: 30s
      retries: 5
    restart: unless-stopped
    networks:
      - app-net

volumes:
  pgdata:

networks:
  app-net:
    driver: bridge
```

### docker-compose.override.yml

```yaml
# Development overrides (automatically merged when using 'docker compose up')
services:
  api:
    build:
      target: deps        # Use the deps stage which has all devDependencies
    volumes:
      - ./src:/app/src    # Hot reload
    environment:
      NODE_ENV: development
    read_only: false      # Disable in dev for convenience
    command: ["npx", "nodemon", "src/index.js"]
```

### .env.example

```bash
APP_PORT=3000
DB_USER=myapp
DB_PASSWORD=changeme
DB_NAME=myapp
```

### Running the project

```bash
# Development (uses docker-compose.override.yml automatically)
cp .env.example .env
# Edit .env with real values
docker compose up --build

# Production (explicitly exclude the override)
docker compose -f docker-compose.yml up -d --build

# View logs
docker compose logs -f api

# Connect to the database
docker compose exec db psql -U myapp -d myapp

# Check health
docker inspect my-api_api_1 --format '{{.State.Health.Status}}'

# Scale the API (stateless, so this is safe)
docker compose up -d --scale api=3
```

---

## Production Deployment Checklist

Before going live with a Dockerised application, verify:

**Security**
- [ ] Container runs as non-root user
- [ ] No secrets baked into the image (`docker history` check)
- [ ] `.env` is not in the image and not committed to git
- [ ] Base image has been scanned for CVEs (`docker scout cves`)
- [ ] Read-only filesystem enabled where possible
- [ ] `--cap-drop ALL` and `--security-opt no-new-privileges` applied

**Reliability**
- [ ] `HEALTHCHECK` defined in Dockerfile
- [ ] `restart: unless-stopped` set for long-running services
- [ ] `depends_on: condition: service_healthy` for service ordering
- [ ] Resource limits (`memory`, `cpus`) defined

**Operations**
- [ ] Application logs to stdout in structured (JSON) format
- [ ] Log driver configured with rotation (`max-size`, `max-file`)
- [ ] Image tagged with a specific version (not `latest`) in production
- [ ] A rollback procedure is documented and tested
- [ ] `docker system prune` runs periodically on the host

---

## Summary of All Best Practices

| Practice | Why |
|---|---|
| Non-root `USER` | Limits blast radius of compromise |
| `--read-only` filesystem | Prevents runtime modifications |
| Minimal base image (Alpine / distroless) | Fewer vulnerabilities, smaller image |
| `--memory` and `--cpus` limits | Prevents resource starvation |
| `restart: unless-stopped` | Automatic recovery from crashes |
| `HEALTHCHECK` in Dockerfile | Enables health-aware orchestration |
| Structured logging to stdout | Enables log aggregation and search |
| Specific image tags in production | Reproducible, auditable deployments |
| `docker scout` in CI | Catches CVEs before deployment |
| `.dockerignore` | Keeps context small and secrets safe |

Containerisation is not just about packaging — it is a discipline. The practices in this chapter make your containers reliable, observable, and defensible in production. Combined with the CI/CD workflow from the previous chapter, you have a complete, professional Docker workflow from development to production.
