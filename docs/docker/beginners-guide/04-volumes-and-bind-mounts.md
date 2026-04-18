---
title: "Volumes and Bind Mounts"
sidebar_label: "Volumes & Bind Mounts"
description: Understand named volumes and bind mounts, when to use each, and how to persist data across container restarts and rebuilds.
slug: /docker/beginners-guide/volumes-and-bind-mounts
tags: [docker, beginners, devops]
keywords:
  - docker volumes
  - bind mounts
  - docker volume create
  - data persistence
  - tmpfs
sidebar_position: 4
---

# Volumes and Bind Mounts

By default, every file a container writes goes into its **writable layer** — a thin, container-specific filesystem that is thrown away the moment you remove the container. For stateless workloads (web servers, API handlers) that is fine. For anything that holds state — databases, uploaded files, log aggregators — you need a way to survive container restarts and replacements.

Docker solves this with two mechanisms: **named volumes** and **bind mounts**. They look similar from the outside (both use the `-v` flag) but serve different purposes and have different ownership semantics.

---

## The Three Mount Types

| Mount type | Managed by | Storage location | Best for |
|---|---|---|---|
| Named volume | Docker | `/var/lib/docker/volumes/` | Database data, persistent app state |
| Bind mount | You | Anywhere on the host | Source code during dev, config files |
| `tmpfs` mount | Kernel | Host RAM (not persisted) | Sensitive data, non-persistent scratch space |

---

## Named Volumes

A named volume is a directory that Docker creates and manages on the host. You reference it by a logical name, and Docker handles the actual path.

### Creating and listing volumes

```bash
# Create a volume explicitly
docker volume create pgdata

# List all volumes
docker volume ls

# Inspect a volume (see its mountpoint on the host)
docker volume inspect pgdata
```

`docker volume inspect` output:

```json
[
  {
    "CreatedAt": "2024-11-15T09:23:44Z",
    "Driver": "local",
    "Labels": {},
    "Mountpoint": "/var/lib/docker/volumes/pgdata/_data",
    "Name": "pgdata",
    "Options": {},
    "Scope": "local"
  }
]
```

### Using a named volume

```bash
# Mount a named volume at /var/lib/postgresql/data inside the container
docker run -d \
  --name postgres-dev \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16
```

Stop and remove the container — the data in `pgdata` survives:

```bash
docker stop postgres-dev
docker rm postgres-dev

# Start a brand new container using the same volume — data is still there
docker run -d \
  --name postgres-dev \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16
```

### Auto-created volumes

You do not have to `docker volume create` explicitly. If you reference a volume name that does not exist, Docker creates it automatically:

```bash
# This creates 'myvolume' if it doesn't exist
docker run -v myvolume:/data busybox
```

### Volume initialisation behaviour

When Docker mounts a **named volume** into a container and the volume is empty, Docker copies the existing contents of the container's directory into the volume. This is how official database images seed the volume with initial data — Postgres pre-populates `/var/lib/postgresql/data` on first run.

Bind mounts do **not** have this behaviour — they simply overlay whatever is on the host.

---

## Bind Mounts

A bind mount maps a specific directory or file from the host filesystem into the container. Changes on either side are immediately visible on the other.

```bash
# Mount the current working directory into /app in the container
docker run -d \
  --name dev-server \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  node:20-alpine \
  node src/index.js
```

Now every file change you save in your editor is instantly visible inside the container. Pair this with a process watcher like `nodemon` and you get hot-reloading without rebuilding the image:

```bash
docker run -d \
  --name dev-server \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  node:20-alpine \
  npx nodemon src/index.js
```

### Bind mount syntax variants

```bash
# Short form (host_path:container_path)
-v /absolute/host/path:/container/path

# Short form with options (read-only)
-v /host/config:/etc/myapp/config:ro

# Long form (--mount) — more explicit
--mount type=bind,source=/host/path,target=/container/path,readonly
```

The `--mount` form is verbose but removes ambiguity, which is useful in scripts and Compose files where clarity matters.

---

## Read-Only Mounts

Mounting a volume or bind mount as read-only prevents the container from writing to it. This is a useful security measure for configuration files.

```bash
# Nginx reads config but cannot modify it
docker run -d \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx
```

---

## Sharing Volumes Between Containers

Multiple containers can mount the same volume simultaneously. This is how sidecar patterns work — for example, a log shipper container reading log files written by the main app.

```bash
# Main app writes logs to the volume
docker run -d \
  --name app \
  -v shared-logs:/var/log/myapp \
  my-app

# Log shipper reads from the same volume
docker run -d \
  --name log-shipper \
  -v shared-logs:/logs:ro \
  fluentd
```

Be careful with concurrent writes from multiple containers — you are responsible for handling any write conflicts at the application level.

---

## Removing Volumes

Volumes are not removed when you remove a container. This is intentional — Docker does not want to silently destroy your database data.

```bash
# Remove a specific volume (must not be in use by any container)
docker volume rm pgdata

# Remove all volumes not currently used by any container
docker volume prune

# Remove a container AND its anonymous volumes at the same time
docker rm -v my-container
```

Anonymous volumes — those created without a name, such as the implicit volume created by a `VOLUME` instruction in a Dockerfile — are removed with the container when you pass `-v` to `docker rm`.

---

## tmpfs Mounts

A `tmpfs` mount lives in the host's RAM and is never written to disk. It disappears when the container stops. Use it for sensitive data (API keys, session tokens) that must not be persisted, or for high-speed temporary scratch space.

```bash
docker run -d \
  --name my-app \
  --mount type=tmpfs,destination=/tmp,tmpfs-size=100m \
  my-app
```

---

## Volume Drivers

The default `local` driver stores volumes on the host filesystem. Docker supports third-party **volume drivers** that store data elsewhere:

- `convoy` — AWS EBS, NFS
- `rexray` — Multi-cloud (AWS, GCE, Azure)
- `nfs` — Network File System shares

```bash
# Create a volume using an NFS driver (plugin must be installed)
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/data/shared \
  nfs-data
```

For most developers, the local driver is all you need. Volume drivers become relevant when running Docker on multiple nodes (Swarm) or mounting cloud storage.

---

## When to Use Each

### Use named volumes when:

- You are running a **database** (Postgres, MySQL, MongoDB, Redis)
- You need **data to survive container replacement** in production
- You do not care about the exact location of files on the host
- You want Docker Compose to manage the lifecycle

### Use bind mounts when:

- You are **developing locally** and want your code changes to reflect immediately
- You need to **inject configuration files** from the host (nginx.conf, .env)
- You need to **read host files** from inside a container (e.g., SSH keys for a CI runner)
- You want to **write output** to a known host path (reports, exports)

### Never use bind mounts for:

- Database data in production (host path dependencies make deployments fragile)
- Secrets management (use Docker secrets or a vault instead)

---

## Docker Compose Volumes

In Compose, volumes are declared at two levels: under the service (where to mount) and at the top level (volume definition).

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    volumes:
      # Bind mount for development hot-reloading
      - ./src:/app/src
      # Named volume for uploaded files
      - uploads:/app/uploads

volumes:
  pgdata:
  uploads:
```

Running `docker compose down` does **not** remove named volumes by default. Pass `--volumes` to also remove them:

```bash
docker compose down --volumes
```

---

## Inspecting Volume Data

Sometimes you need to peek at what is in a volume without starting the application container. The quickest way is to mount it into a utility container:

```bash
# Open a shell with the volume mounted
docker run --rm -it \
  -v pgdata:/data \
  alpine sh

# Inside the shell
ls /data
```

Or copy data out of a volume to the host:

```bash
# Copy from volume to current directory
docker run --rm \
  -v pgdata:/source \
  -v $(pwd):/dest \
  alpine cp -r /source/. /dest/backup/
```

---

## Summary

| Concept | Key command |
|---|---|
| Create a volume | `docker volume create myvolume` |
| List volumes | `docker volume ls` |
| Inspect a volume | `docker volume inspect myvolume` |
| Mount named volume | `-v myvolume:/container/path` |
| Mount bind (host dir) | `-v /host/path:/container/path` |
| Read-only mount | `-v /host/path:/container/path:ro` |
| Remove a volume | `docker volume rm myvolume` |
| Remove unused volumes | `docker volume prune` |

Data persistence is one of the first things developers get wrong with Docker. Understanding the difference between named volumes (Docker-managed, portable) and bind mounts (host-coupled, convenient for development) will save you from unexpected data loss and help you design robust production setups.
