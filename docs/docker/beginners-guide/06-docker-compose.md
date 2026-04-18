---
title: "Docker Compose"
sidebar_label: "Docker Compose"
description: Learn how to define and manage multi-container applications with Docker Compose, covering services, volumes, networks, and a full worked example.
slug: /docker/beginners-guide/docker-compose
tags: [docker, beginners, devops]
keywords:
  - docker compose
  - docker-compose.yml
  - compose services
  - depends_on
  - compose volumes
  - compose networking
sidebar_position: 6
---

# Docker Compose

Running a single container with `docker run` is straightforward. Running a web server, a database, a cache, and a background worker — all wired together, all starting in the right order, all sharing the right volumes and networks — quickly becomes unmanageable with raw CLI commands.

**Docker Compose** solves this by letting you describe your entire application stack in a single YAML file (`docker-compose.yml`) and manage it with a handful of commands.

---

## Installing Docker Compose

If you installed **Docker Desktop**, Compose is already included. On Linux with the Docker Engine, install the Compose plugin:

```bash
sudo apt-get install docker-compose-plugin
docker compose version
# Docker Compose version v2.27.0
```

:::note
The modern command is `docker compose` (two words, a plugin). The legacy standalone binary is `docker-compose` (hyphen). They are functionally equivalent. This guide uses the modern form.
:::

---

## The docker-compose.yml Structure

A Compose file has three top-level sections:

```yaml
services:    # The containers you want to run
volumes:     # Named volumes (optional)
networks:    # Custom networks (optional; Compose creates one by default)
```

Every service maps directly to a `docker run` command, but expressed declaratively.

---

## Services

Each key under `services` is a service name. Compose uses the service name as the container's hostname on the default network.

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"

  api:
    build: .                # Build from Dockerfile in the current directory
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: "3000"
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Key service fields

| Field | Description |
|---|---|
| `image` | Use an existing image from a registry |
| `build` | Build a local Dockerfile (can be a path or an object with `context`/`dockerfile`) |
| `ports` | Publish ports (`"host:container"`) |
| `environment` | Set environment variables |
| `env_file` | Load variables from a file |
| `volumes` | Mount volumes or bind mounts |
| `networks` | Attach to specific networks |
| `depends_on` | Express startup order |
| `restart` | Restart policy (`no`, `always`, `on-failure`, `unless-stopped`) |
| `command` | Override the default `CMD` |
| `entrypoint` | Override the default `ENTRYPOINT` |
| `healthcheck` | Define a health check |
| `profiles` | Assign service to a named profile (started only when that profile is active) |

---

## depends_on

`depends_on` tells Compose to start services in order. Without it, Compose starts all services in parallel.

```yaml
services:
  api:
    build: .
    depends_on:
      - db
      - redis

  db:
    image: postgres:16

  redis:
    image: redis:7-alpine
```

**Important limitation:** `depends_on` only waits for the container to *start*, not for the service *inside* it to be ready. A Postgres container starts in under a second, but Postgres itself may take 2–3 seconds to be ready to accept connections. Use `depends_on` with `condition: service_healthy` for robust ordering:

```yaml
services:
  api:
    build: .
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

With `condition: service_healthy`, Compose will not start `api` until `db` reports healthy.

---

## Environment Variables

### Inline in the Compose file

```yaml
services:
  api:
    environment:
      NODE_ENV: production
      PORT: "3000"
      DATABASE_URL: postgres://myuser:secret@db:5432/myapp
```

### From a .env file

Compose automatically reads a `.env` file in the same directory as the Compose file. Variables defined there can be referenced in the YAML with `${VAR_NAME}`:

```bash
# .env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=secret
POSTGRES_DB=myapp
APP_PORT=3000
```

```yaml
services:
  api:
    ports:
      - "${APP_PORT}:3000"

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
```

You can also point to a specific env file with `env_file`:

```yaml
services:
  api:
    env_file:
      - .env
      - .env.local   # local overrides, not committed to git
```

---

## Volumes in Compose

Named volumes must be declared at the top level:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data   # named volume

  app:
    build: .
    volumes:
      - ./src:/app/src                    # bind mount (relative path ok in Compose)
      - node_modules:/app/node_modules    # named volume to avoid overwriting installed deps

volumes:
  pgdata:
  node_modules:
```

The `node_modules` volume trick is common in Node.js development: it prevents the host's `node_modules` (or the absence of one) from overlaying the container's installed dependencies.

---

## Networks in Compose

By default, Compose creates a single network named `<project>_default`, where `project` is the directory name. All services are attached to it and can reach each other by service name.

For more complex topologies:

```yaml
services:
  nginx:
    image: nginx:alpine
    networks:
      - frontend
      - backend

  api:
    build: .
    networks:
      - backend

  db:
    image: postgres:16
    networks:
      - backend

networks:
  frontend:
  backend:
```

Here, `nginx` can reach both `api` and `db`, but `db` cannot be reached from `frontend` — a useful security boundary.

---

## Core Commands

```bash
# Start all services (build images if needed)
docker compose up

# Start in the background
docker compose up -d

# Build images without starting
docker compose build

# Build and start, forcing a rebuild of all images
docker compose up -d --build

# View running services
docker compose ps

# Stream logs from all services
docker compose logs -f

# Stream logs from a specific service
docker compose logs -f api

# Execute a command in a running service container
docker compose exec db psql -U myuser -d myapp

# Stop services (containers stopped, not removed)
docker compose stop

# Stop and remove containers, networks (volumes are kept)
docker compose down

# Stop, remove containers, networks, AND named volumes
docker compose down --volumes

# Remove orphan containers (from services no longer in the Compose file)
docker compose down --remove-orphans

# Scale a service to N replicas (stateless services only)
docker compose up -d --scale api=3

# Restart a single service
docker compose restart api

# Pull latest images for all services
docker compose pull
```

---

## Full Worked Example: Node.js API + Postgres + Redis

Here is a production-style Compose setup for a Node.js REST API with a Postgres database and Redis for session caching.

### Directory structure

```
my-app/
├── docker-compose.yml
├── docker-compose.override.yml   # local dev overrides
├── .env
├── .dockerignore
├── Dockerfile
└── src/
    └── index.js
```

### .env

```bash
POSTGRES_USER=myapp
POSTGRES_PASSWORD=strongpassword
POSTGRES_DB=myapp
REDIS_PASSWORD=redispassword
APP_PORT=3000
NODE_ENV=production
```

### docker-compose.yml

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    image: my-app:latest
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-net

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-net

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-net

volumes:
  pgdata:
  redisdata:

networks:
  app-net:
    driver: bridge
```

### docker-compose.override.yml (development overrides)

Compose automatically merges this file with `docker-compose.yml` when present. Use it for development-specific settings without modifying the main file.

```yaml
services:
  api:
    build:
      target: development       # use a dev stage in a multi-stage Dockerfile
    volumes:
      - ./src:/app/src          # hot reload
    environment:
      NODE_ENV: development
    command: npx nodemon src/index.js
```

---

## Compose File Validation

```bash
# Validate the Compose file and print the merged config
docker compose config

# Validate a specific file
docker compose -f docker-compose.prod.yml config
```

`docker compose config` is invaluable for debugging variable substitution — it shows the fully-resolved configuration with all `${VAR}` replaced by their actual values.

---

## Multiple Compose Files

You can compose multiple files together with `-f`:

```bash
# Development
docker compose -f docker-compose.yml -f docker-compose.override.yml up

# Staging
docker compose -f docker-compose.yml -f docker-compose.staging.yml up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Each subsequent file is merged on top of the previous one, with later files taking precedence. This pattern lets you keep a common base and environment-specific overrides cleanly separated.

---

## Summary

Docker Compose eliminates the error-prone process of managing multi-container applications with long shell scripts. A single `docker compose up -d` starts your entire stack, correctly wired together. A single `docker compose down` tears it all down cleanly.

Key takeaways:
- Use `depends_on` with `condition: service_healthy` for reliable startup ordering
- Use `.env` files for configuration — keep secrets out of the Compose file
- Use `docker-compose.override.yml` for local development adjustments
- `docker compose config` is your best friend for debugging YAML and variable substitution
