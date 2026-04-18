---
title: "Images and Containers"
sidebar_label: "Images & Containers"
description: Learn how to pull images, run containers with essential flags, manage container lifecycle, and clean up your local environment.
slug: /docker/beginners-guide/images-and-containers
tags: [docker, beginners, devops]
keywords:
  - docker pull
  - docker run
  - docker ps
  - docker stop
  - docker rm
  - docker images
sidebar_position: 2
---

# Images and Containers

With Docker installed, you are ready to start pulling images and running containers. This chapter walks through the core workflow you will repeat hundreds of times: fetch an image, start a container with the right options, inspect what is running, and clean up when you are done.

---

## Pulling Images

Images live in registries. The `docker pull` command downloads an image to your local machine so you can start containers from it.

```bash
# Pull the latest official nginx image
docker pull nginx

# Pull a specific version (tag)
docker pull nginx:1.27-alpine

# Pull from a non-default registry (GitHub Container Registry)
docker pull ghcr.io/owner/my-app:latest
```

Image names follow the pattern `[registry/][namespace/]name[:tag]`. When you omit the registry, Docker defaults to Docker Hub. When you omit the tag, Docker uses `latest`.

### Browsing available tags

Docker Hub shows available tags at `https://hub.docker.com/_/nginx`. For images you use regularly (Node.js, Postgres, Redis), it is worth checking the tags page to understand what variants exist — `alpine` variants are smaller, numbered tags are stable, `slim` variants have fewer tools pre-installed.

---

## Running Your First Real Container

`docker run` is the most important command in your toolkit. It pulls the image if not cached locally, creates a container from it, and starts it.

```bash
# Start an nginx web server, publish port 8080 on the host to 80 in the container
docker run -d -p 8080:80 --name my-nginx nginx
```

Open `http://localhost:8080` in your browser — you should see the nginx welcome page.

Let us unpack the flags:

| Flag | Long form | Meaning |
|---|---|---|
| `-d` | `--detach` | Run in the background; print the container ID and return to the prompt |
| `-p 8080:80` | `--publish 8080:80` | Map host port 8080 to container port 80 |
| `--name my-nginx` | | Give the container a human-readable name instead of a random one |

---

## Essential Flags

### Detached mode (`-d`)

Without `-d`, the container runs in the foreground and its output streams to your terminal. This is fine for quick tests but impractical for servers. Use `-d` for long-running services.

```bash
# Foreground (blocks your terminal, Ctrl-C stops the container)
docker run nginx

# Background
docker run -d nginx
```

### Port mapping (`-p`)

Containers have their own network stack. A service inside a container is not reachable from your host unless you explicitly map a port.

```bash
# host_port:container_port
docker run -d -p 3000:3000 node-app

# Map multiple ports
docker run -d -p 8080:80 -p 8443:443 nginx

# Bind to a specific host interface (avoid exposing to the network)
docker run -d -p 127.0.0.1:5432:5432 postgres
```

### Volume mounts (`-v`)

Containers have an ephemeral writable layer — data written inside a container is lost when the container is removed. Use `-v` to persist data. Volumes are covered in depth in Chapter 4; here is the syntax:

```bash
# Named volume (Docker manages the storage location)
docker run -d -v pgdata:/var/lib/postgresql/data postgres

# Bind mount (map a host directory into the container)
docker run -d -v /home/user/config:/etc/nginx/conf.d:ro nginx
```

The `:ro` suffix makes the mount read-only inside the container.

### Environment variables (`-e`)

Most official images are configured through environment variables, following the [12-factor app](https://12factor.net/) principle.

```bash
docker run -d \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  --name pg \
  postgres:16
```

### Naming containers (`--name`)

Without `--name`, Docker generates a random name like `cranky_einstein`. Always name containers you will reference later — it is much easier to type `docker stop my-nginx` than `docker stop 3f9b8c21a0e2`.

---

## Interactive Mode (`-it`)

Some tasks require an interactive shell inside a container — exploring the filesystem, running ad-hoc commands, debugging.

```bash
# Start an Alpine Linux shell
docker run -it alpine sh

# Start a bash shell in an Ubuntu container
docker run -it ubuntu bash
```

The flags:
- `-i` (`--interactive`) — Keep stdin open so you can type commands
- `-t` (`--tty`) — Allocate a pseudo-TTY (terminal), giving you a proper shell prompt

Once inside, you are in an isolated environment. Try:

```bash
# Inside the container
cat /etc/os-release
ls /
exit
```

When you type `exit`, the process exits and the container stops.

### Exec into a running container

To open a shell in an **already running** container (without stopping it):

```bash
docker exec -it my-nginx bash
# or for minimal images that only have sh:
docker exec -it my-nginx sh
```

`docker exec` runs an additional process inside the container's namespace. The container keeps running when you exit this shell.

---

## Listing Containers

```bash
# List running containers
docker ps

# List all containers (including stopped ones)
docker ps -a

# Show only container IDs (useful in scripts)
docker ps -q

# Combine: IDs of all stopped containers
docker ps -aq -f status=exited
```

Sample output of `docker ps`:

```
CONTAINER ID   IMAGE          COMMAND                  CREATED        STATUS        PORTS                  NAMES
3f9b8c21a0e2   nginx:latest   "/docker-entrypoint.…"   2 minutes ago  Up 2 minutes  0.0.0.0:8080->80/tcp   my-nginx
a1b2c3d4e5f6   postgres:16    "docker-entrypoint.s…"   5 minutes ago  Up 5 minutes  127.0.0.1:5432->5432   pg
```

---

## Stopping and Removing Containers

```bash
# Gracefully stop a container (sends SIGTERM, waits, then SIGKILL)
docker stop my-nginx

# Stop immediately (SIGKILL)
docker kill my-nginx

# Remove a stopped container
docker rm my-nginx

# Stop and remove in one step
docker rm -f my-nginx

# Remove all stopped containers
docker container prune
```

:::tip
A stopped container still exists (you can `docker start` it again) and still occupies disk space in the writable layer. If you will never need the container again, remove it.
:::

---

## Managing Images

```bash
# List images on your machine
docker images
# Equivalent:
docker image ls

# Filter by repository name
docker images nginx

# Show image IDs only
docker images -q

# Remove an image
docker rmi nginx:1.27-alpine

# Remove all unused images (not referenced by any container)
docker image prune

# Remove ALL images, including those used by stopped containers
docker image prune -a
```

Removing an image only removes the local copy. The image still exists in the registry and can be pulled again any time.

### Inspecting an image

```bash
# See layers, environment variables, exposed ports, default command
docker inspect nginx

# Just the configuration section
docker inspect --format '{{json .Config}}' nginx | jq
```

---

## Viewing Container Logs

```bash
# Print all logs
docker logs my-nginx

# Stream logs live (like tail -f)
docker logs -f my-nginx

# Last 50 lines
docker logs --tail 50 my-nginx

# With timestamps
docker logs -t my-nginx
```

---

## A Practical Workflow Example

Here is the full lifecycle for running a local Postgres database for development:

```bash
# 1. Start Postgres with named volume for persistence
docker run -d \
  --name dev-postgres \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=myapp \
  -p 127.0.0.1:5432:5432 \
  -v dev-pgdata:/var/lib/postgresql/data \
  postgres:16

# 2. Check it's running
docker ps

# 3. Connect to it via psql inside the container
docker exec -it dev-postgres psql -U dev -d myapp

# 4. View logs if something looks wrong
docker logs dev-postgres

# 5. Stop without losing data (volume persists)
docker stop dev-postgres

# 6. Start it again later
docker start dev-postgres

# 7. When you're done with the project entirely
docker rm -f dev-postgres
docker volume rm dev-pgdata
```

---

## Cleaning Up

Over time, stopped containers, unused images, and dangling build cache accumulate. The `system prune` command clears all of it:

```bash
# Remove all stopped containers, unused networks, dangling images, build cache
docker system prune

# Also remove unused volumes (careful — this deletes data!)
docker system prune --volumes

# Check how much space Docker is using
docker system df
```

---

## Summary

| Command | What it does |
|---|---|
| `docker pull <image>` | Download an image |
| `docker run -d -p host:ctr --name n <image>` | Start a named container in the background |
| `docker run -it <image> sh` | Start an interactive shell |
| `docker ps` / `docker ps -a` | List running / all containers |
| `docker stop <name>` | Gracefully stop a container |
| `docker rm <name>` | Remove a stopped container |
| `docker images` | List local images |
| `docker rmi <image>` | Remove a local image |
| `docker logs -f <name>` | Stream container logs |
| `docker exec -it <name> sh` | Open a shell in a running container |
| `docker system prune` | Clean up unused resources |

You now have the vocabulary and the commands to work with containers day-to-day. The next step is building your own images with a Dockerfile.
