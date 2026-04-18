---
title: "Docker Networking"
sidebar_label: "Networking"
description: Learn how Docker networks work, how containers communicate with each other by name, and how port mapping exposes services to the host.
slug: /docker/beginners-guide/networking
tags: [docker, beginners, devops]
keywords:
  - docker networking
  - bridge network
  - docker network create
  - container communication
  - port mapping
  - dns resolution
sidebar_position: 5
---

# Docker Networking

Every container gets its own network namespace — its own virtual network interface, IP address, and routing table. Docker connects containers together (and to the outside world) through **networks**. Understanding how Docker networking works is essential for building multi-container applications where your web server needs to talk to your database, or your API needs to reach a message queue.

---

## Network Drivers

Docker ships with several built-in network drivers. The driver determines how containers are connected at the OS level.

| Driver | Description | When to use |
|---|---|---|
| `bridge` | Virtual switch on the host; containers on the same bridge can communicate | Default for standalone containers |
| `host` | Container shares the host's network stack (no isolation) | Performance-critical workloads, legacy apps |
| `none` | No networking; container is completely isolated | Security-sensitive processing jobs |
| `overlay` | Multi-host networking for Docker Swarm | Distributed / clustered deployments |
| `macvlan` | Each container gets a real MAC address on the host's LAN | Network appliances, legacy apps needing direct LAN access |

The vast majority of development and single-host production work uses `bridge` networks.

---

## The Default Bridge Network

When you start a container without specifying a network, it is attached to the **default bridge** (`bridge` network, named `docker0`). This is the network Docker creates automatically.

```bash
# List networks
docker network ls

# Output:
# NETWORK ID     NAME      DRIVER    SCOPE
# 3a1f2b3c4d5e   bridge    bridge    local
# 7b2c3d4e5f6a   host      host      local
# 9c3d4e5f6a7b   none      null      local
```

Containers on the default bridge can communicate **by IP address** but **not by name**. This is the main limitation of the default bridge network and the reason you should always create custom networks.

```bash
# Start two containers on the default bridge
docker run -d --name c1 alpine sleep 3600
docker run -d --name c2 alpine sleep 3600

# From c2, try to ping c1 by name — this FAILS on the default bridge
docker exec c2 ping c1
# ping: bad address 'c1'

# Pinging by IP works (but IPs change on restart — fragile)
docker exec c2 ping 172.17.0.2
```

---

## Custom Bridge Networks

A **user-defined bridge** is a named network you create yourself. It has one critical advantage over the default bridge: **automatic DNS resolution by container name**.

```bash
# Create a custom network
docker network create my-app-net

# Create it with a specific subnet
docker network create \
  --driver bridge \
  --subnet 192.168.10.0/24 \
  --gateway 192.168.10.1 \
  my-app-net
```

### Connecting containers to a custom network

```bash
# Start containers on the custom network
docker run -d --name web --network my-app-net nginx
docker run -d --name db  --network my-app-net postgres:16 \
  -e POSTGRES_PASSWORD=secret

# From 'web', ping 'db' by name — this WORKS on a custom bridge
docker exec web ping db
# PING db (192.168.10.3): 56 data bytes
# 64 bytes from 192.168.10.3: seq=0 ttl=64 time=0.125 ms
```

Containers on the same user-defined bridge can resolve each other by container name or by the network alias.

### Inspecting a network

```bash
docker network inspect my-app-net
```

```json
[
  {
    "Name": "my-app-net",
    "Driver": "bridge",
    "Containers": {
      "abc123...": {
        "Name": "web",
        "IPv4Address": "192.168.10.2/24"
      },
      "def456...": {
        "Name": "db",
        "IPv4Address": "192.168.10.3/24"
      }
    }
  }
]
```

---

## Port Mapping

Containers on a bridge network are isolated from the host. To reach a service from your browser or from external clients, you must **publish a port** using `-p`.

```bash
# Syntax: -p <host_port>:<container_port>
docker run -d -p 8080:80 nginx
```

After this, requests to `http://localhost:8080` on the host are forwarded to port 80 in the container.

### Port mapping variants

```bash
# Map one port
docker run -d -p 8080:80 nginx

# Map multiple ports
docker run -d -p 8080:80 -p 8443:443 nginx

# Bind to a specific host interface (not exposed to the network)
docker run -d -p 127.0.0.1:5432:5432 postgres

# Let Docker choose a random available host port
docker run -d -p 80 nginx

# Find out which host port was assigned
docker port <container_name> 80
```

Binding to `127.0.0.1` is important for databases and admin panels — it prevents external machines on your network from connecting to a service that should only be accessed locally.

---

## The `host` Network Driver

With `--network host`, the container's processes bind directly to the host's network interfaces. There is no NAT, no port mapping — if the container listens on port 8080, it is immediately reachable on the host's port 8080.

```bash
docker run -d --network host nginx
# nginx now listens on host port 80 (no -p needed or allowed)
```

**Pros:**
- Lowest possible network latency
- No need to manage port mappings

**Cons:**
- No network isolation — container can see all host network traffic
- Port conflicts between containers
- Not available on Docker Desktop (macOS/Windows) — only works on Linux

---

## The `none` Network Driver

A container with `--network none` has no network interfaces except loopback. It cannot initiate or receive network connections.

```bash
docker run --rm --network none alpine wget -qO- http://example.com
# wget: bad address 'example.com'
```

Use `none` for batch processing jobs that handle sensitive data and should never phone home, or for containers that communicate exclusively via shared volumes.

---

## Container-to-Container Communication by Name

The key DNS rule for user-defined networks:

- Containers resolve each other by **container name** (`--name`)
- Containers can also be given **network aliases** — alternative DNS names on that network

```bash
# Create an alias so 'database' resolves to this container
docker run -d \
  --name postgres-prod \
  --network my-app-net \
  --network-alias database \
  postgres:16 \
  -e POSTGRES_PASSWORD=secret

# The app can connect using either 'postgres-prod' or 'database' as the hostname
docker run -d \
  --name api \
  --network my-app-net \
  -e DB_HOST=database \
  my-api-image
```

Aliases are particularly useful when you want to swap out the underlying container (e.g., switch from Postgres to a Postgres replica) without changing application configuration.

---

## Connecting a Container to Multiple Networks

A container can be attached to more than one network simultaneously, allowing it to communicate with different groups of containers while keeping those groups isolated from each other.

```bash
# Create two networks
docker network create frontend-net
docker network create backend-net

# The web service bridges both networks
docker run -d --name web --network frontend-net nginx
docker network connect backend-net web

# Database is only on the backend network (web can reach it, the internet cannot)
docker run -d --name db --network backend-net postgres:16 -e POSTGRES_PASSWORD=secret

# External traffic goes through 'web', which can reach 'db' via backend-net
```

---

## Cleaning Up Networks

```bash
# Remove a specific network (all containers must be disconnected first)
docker network rm my-app-net

# Remove all networks not currently used by any container
docker network prune
```

---

## Practical Example: Web App + Database + Redis

Let us wire up a realistic three-service setup entirely with network commands (before we get to Docker Compose):

```bash
# Create an isolated network
docker network create app-stack

# Start PostgreSQL
docker run -d \
  --name pg \
  --network app-stack \
  -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_USER=myapp \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=myapp \
  postgres:16

# Start Redis
docker run -d \
  --name redis \
  --network app-stack \
  redis:7-alpine

# Start the API (connects to both pg and redis by name)
docker run -d \
  --name api \
  --network app-stack \
  -p 127.0.0.1:3000:3000 \
  -e DATABASE_URL=postgres://myapp:secret@pg:5432/myapp \
  -e REDIS_URL=redis://redis:6379 \
  my-api:latest

# Start nginx as a reverse proxy in front of the API
docker run -d \
  --name nginx \
  --network app-stack \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

Inside `nginx.conf`, you would reference the upstream as `http://api:3000` — Docker's DNS resolves `api` to the API container's IP within the `app-stack` network.

---

## DNS Resolution Summary

| Network type | Resolve by name | Resolve by alias |
|---|---|---|
| Default bridge | No | No |
| User-defined bridge | Yes | Yes (with `--network-alias`) |
| Host | n/a (no isolation) | n/a |
| None | n/a | n/a |

---

## Troubleshooting Network Issues

```bash
# Is the container on the right network?
docker inspect <container> | grep -A 20 '"Networks"'

# Can container A reach container B?
docker exec <container-a> ping <container-b>

# Is a service listening on the expected port inside the container?
docker exec <container> netstat -tlnp
# or on minimal images:
docker exec <container> ss -tlnp

# Which host ports are published?
docker port <container>

# See all firewall rules Docker has added
sudo iptables -L -n -t nat | grep DOCKER
```

---

Custom bridge networks with DNS resolution are one of Docker's most useful features. In the next chapter we will see how Docker Compose manages networks automatically, removing the need to run all these commands by hand.
