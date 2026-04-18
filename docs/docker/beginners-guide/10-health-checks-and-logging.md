---
title: "Health Checks and Logging"
sidebar_label: "Health Checks & Logging"
description: Learn how to configure Docker health checks, inspect container health status, manage logs with docker logs, and choose the right log driver for production.
slug: /docker/beginners-guide/health-checks-and-logging
tags: [docker, beginners, devops]
keywords:
  - docker healthcheck
  - docker logs
  - log drivers
  - structured logging
  - container health
  - docker inspect
sidebar_position: 10
---

# Health Checks and Logging

A running container is not necessarily a healthy container. Your web server might be up but unable to reach the database. Your worker process might be stuck in a crash loop. Docker health checks let you define exactly what "healthy" means for your application, and orchestrators like Docker Swarm and Kubernetes use that information to make routing and restart decisions. Logging is the companion story: once your containers are running, you need a way to understand what they are doing.

---

## The HEALTHCHECK Instruction

The `HEALTHCHECK` instruction in a Dockerfile defines a command Docker runs periodically to probe whether the container is working correctly. If the command exits with status `0`, the container is healthy. If it exits with `1`, the container is unhealthy.

### Syntax

```dockerfile
HEALTHCHECK [OPTIONS] CMD <command>

# Disable any inherited health check from the base image
HEALTHCHECK NONE
```

### Options

| Option | Default | Description |
|---|---|---|
| `--interval` | `30s` | How often to run the health check |
| `--timeout` | `30s` | Time to wait for a check to complete before marking it failed |
| `--start-period` | `0s` | Grace period for the container to start before checks count as failures |
| `--start-interval` | `5s` | How often to run the check during the start period |
| `--retries` | `3` | How many consecutive failures before marking unhealthy |

### Examples

**HTTP service health check:**

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm ci --omit=dev

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
```

**PostgreSQL health check:**

```dockerfile
FROM postgres:16

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1
```

**Redis health check:**

```dockerfile
FROM redis:7-alpine

HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
  CMD redis-cli ping | grep -q PONG || exit 1
```

### Exposing a /health endpoint in Node.js

Your application should expose a dedicated health endpoint that checks its own dependencies:

```javascript
// src/health.js
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
    });
  }
});

module.exports = router;
```

A health endpoint that only checks if the HTTP server is up (but not whether the database is reachable) gives you a false sense of security. Check actual dependencies.

---

## Inspecting Container Health

```bash
# See health status in docker ps
docker ps
# CONTAINER ID   IMAGE     STATUS
# abc123         my-app    Up 2 minutes (healthy)
# def456         my-app    Up 30 seconds (starting)
# ghi789         my-app    Up 5 minutes (unhealthy)

# Detailed health information via inspect
docker inspect my-app | jq '.[0].State.Health'
```

`docker inspect` JSON output for health:

```json
{
  "Status": "healthy",
  "FailingStreak": 0,
  "Log": [
    {
      "Start": "2024-11-15T10:00:30.123Z",
      "End": "2024-11-15T10:00:30.145Z",
      "ExitCode": 0,
      "Output": "{\"status\":\"healthy\"}"
    }
  ]
}
```

The `Log` array contains the last five health check results. When debugging an unhealthy container, this is the first place to look.

```bash
# Quick one-liner to get health status
docker inspect --format '{{.State.Health.Status}}' my-app

# Watch health status change (useful during startup)
watch -n 2 'docker inspect --format "{{.State.Health.Status}}" my-app'
```

---

## Health Checks in Docker Compose

```yaml
services:
  api:
    build: .
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      start_period: 30s
      retries: 3

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      start_period: 20s
      retries: 5
```

With `condition: service_healthy`, Compose waits for `db` to pass its health check before starting `api`. This solves the classic race condition where your application tries to connect to a database before it is ready.

---

## Docker Logs

Every container captures the stdout and stderr of its main process. The `docker logs` command reads those captured streams.

```bash
# Print all logs
docker logs my-app

# Stream logs (like tail -f)
docker logs -f my-app

# Last N lines
docker logs --tail 100 my-app

# Logs since a time
docker logs --since 1h my-app
docker logs --since "2024-11-15T10:00:00" my-app

# Logs until a time
docker logs --until 30m my-app

# Include timestamps
docker logs -t my-app

# Combine flags
docker logs -f -t --tail 50 my-app
```

### Logs in Docker Compose

```bash
# All services
docker compose logs -f

# A specific service
docker compose logs -f api

# Last 50 lines from all services
docker compose logs --tail 50
```

---

## Log Drivers

By default, Docker captures container logs using the `json-file` driver, which stores logs as JSON on disk at `/var/lib/docker/containers/<id>/<id>-json.log`. This is convenient for `docker logs`, but it has limitations: no log rotation by default, no forwarding, and disk can fill up with verbose services.

### Available log drivers

| Driver | Description |
|---|---|
| `json-file` | Default. Stores JSON on disk. Supports `docker logs`. |
| `local` | Compressed binary format. More efficient than `json-file`, supports `docker logs`. |
| `syslog` | Forwards to syslog daemon on the host |
| `journald` | Forwards to systemd journal |
| `gelf` | Sends to a Graylog Extended Log Format endpoint |
| `fluentd` | Forwards to Fluentd |
| `awslogs` | Sends to AWS CloudWatch Logs |
| `gcplogs` | Sends to Google Cloud Logging |
| `splunk` | Sends to Splunk |
| `none` | Disables logging (no `docker logs`) |

### Configuring the log driver globally

Edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "local",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

This configures log rotation: each log file caps at 10 MB, and Docker keeps the last 3 files (30 MB max per container). Restart the daemon after changes:

```bash
sudo systemctl restart docker
```

### Configuring the log driver per container

```bash
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --name my-app \
  my-app:latest
```

### Sending logs to AWS CloudWatch

```bash
docker run -d \
  --log-driver awslogs \
  --log-opt awslogs-region=eu-west-1 \
  --log-opt awslogs-group=/my-app/production \
  --log-opt awslogs-stream=api-$(date +%Y%m%d) \
  --name my-app \
  my-app:latest
```

Note: when you use a non-`json-file` or non-`local` driver, `docker logs` stops working because logs are no longer stored locally. This is a common gotcha — you must use your log aggregation system (CloudWatch console, Graylog, etc.) to view them.

---

## Structured Logging Best Practices

For logs to be useful at scale, they must be **structured** (machine-readable) and consistent.

### Use JSON log format in your application

```javascript
// Using pino (a popular Node.js structured logger)
const pino = require('pino');
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // In production, output plain JSON
  // In development, use pino-pretty for human-readable output
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Log with structured fields
logger.info({ requestId: '123', userId: 'u-456', duration: 42 }, 'Request completed');
logger.error({ err, requestId: '123' }, 'Database query failed');
```

JSON output (what Docker captures):

```json
{"level":30,"time":1700042400000,"requestId":"123","userId":"u-456","duration":42,"msg":"Request completed"}
```

### Log to stdout/stderr, not files

Containers are ephemeral. If your application writes logs to a file inside the container, those logs are lost when the container is removed. Always log to stdout (info/debug) and stderr (errors), and let Docker's log driver handle collection and forwarding.

```javascript
// Good — logs go to stdout where Docker captures them
console.log(JSON.stringify({ level: 'info', message: 'Server started' }));

// Bad — logs go to a file in the ephemeral container filesystem
fs.appendFileSync('/var/log/app.log', 'Server started\n');
```

### Recommended fields for every log entry

| Field | Description |
|---|---|
| `timestamp` | ISO 8601 timestamp |
| `level` | `debug`, `info`, `warn`, `error`, `fatal` |
| `message` | Human-readable description |
| `requestId` | Unique identifier to trace a request across logs |
| `service` | Service name (useful in aggregated logs) |
| `environment` | `production`, `staging`, etc. |
| `err.message` | Error message if applicable |
| `err.stack` | Stack trace if applicable |

---

## Centralised Log Aggregation

For production environments with multiple containers, centralised logging is essential. Common stacks:

**EFK Stack (Elasticsearch + Fluentd + Kibana):**
```yaml
services:
  app:
    image: my-app:latest
    logging:
      driver: fluentd
      options:
        fluentd-address: localhost:24224
        tag: my-app.{{.Name}}
```

**Loki + Promtail + Grafana (lightweight alternative):**
```yaml
services:
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

Loki with Promtail is particularly popular for Docker environments because Promtail can scrape Docker container logs directly via the Docker socket.

---

## Summary

| Goal | Command / Technique |
|---|---|
| Add a health check | `HEALTHCHECK CMD ...` in Dockerfile |
| See container health status | `docker ps` or `docker inspect --format '{{.State.Health.Status}}'` |
| Stream logs | `docker logs -f <container>` |
| Rotate logs automatically | Set `max-size` and `max-file` in daemon.json or per container |
| Ship logs to CloudWatch | `--log-driver awslogs` |
| Structured application logs | Log JSON to stdout using a library like pino or winston |
| Health-aware startup ordering | `depends_on: condition: service_healthy` in Compose |

Observability is not optional in production. Health checks and structured logs are the minimum you need to know whether your application is running correctly and to diagnose problems when it is not.
