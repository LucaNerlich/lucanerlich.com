---
title: "Introduction to Docker"
sidebar_label: "Introduction"
description: Learn what Docker is, how containers differ from virtual machines, and how to install and verify Docker on your system.
slug: /docker/beginners-guide/introduction
tags: [docker, beginners, devops]
keywords:
  - docker introduction
  - containers vs vms
  - docker install
  - docker desktop
  - docker engine
sidebar_position: 1
---

# Introduction to Docker

Docker is a platform that lets you package, ship, and run applications inside isolated environments called **containers**. Instead of saying "it works on my machine," you package your application along with everything it needs — its runtime, libraries, configuration — into a single portable unit that behaves identically on a developer laptop, a CI server, and a production host.

Since its public release in 2013, Docker has become the de-facto standard for containerisation and is at the heart of the modern software delivery pipeline. Understanding Docker is now a baseline skill for developers, regardless of their speciality.

---

## Containers vs Virtual Machines

Before Docker, the standard way to isolate an application was to run a **Virtual Machine (VM)**. A VM emulates an entire physical computer: it has its own operating system kernel, its own virtualised hardware, and it consumes a fixed block of RAM and disk just to boot up.

Containers take a different approach. They share the host machine's OS kernel and isolate only the user-space processes and filesystem. The result is dramatically lower overhead.

| Property | Virtual Machine | Container |
|---|---|---|
| Boot time | 30 seconds – several minutes | Milliseconds |
| Image size | Gigabytes | Megabytes (often < 100 MB) |
| OS kernel | Each VM has its own | Shared with the host |
| Isolation | Hardware-level | OS process-level |
| Portability | Tied to hypervisor format | Runs anywhere Docker runs |
| Resource usage | High (reserved vCPU + RAM) | Low (only what the process uses) |

This does not mean containers are always superior. VMs provide stronger isolation (useful for multi-tenant cloud hosts), can run different kernels (run Windows on a Linux host), and are better suited when you need full OS access. For most application workloads, though, containers offer a much faster feedback loop and far simpler delivery.

### How container isolation works

Linux containers rely on two kernel primitives:

- **Namespaces** — Each container gets its own view of process IDs, network interfaces, filesystem mounts, user IDs, and hostname. A process inside a container cannot see processes in other containers.
- **cgroups (control groups)** — Limits the CPU, memory, and I/O that a container's processes can consume.

Docker wraps these primitives with a friendly CLI and image format, making them accessible without deep kernel knowledge.

---

## Key Concepts

Before you write your first command, you need four terms in your vocabulary.

### Image

An image is a **read-only template** that describes the filesystem and metadata needed to run a container. Think of it as a blueprint or a class in object-oriented programming. Images are built in layers: each instruction in a `Dockerfile` produces an additional layer on top of the previous one, and Docker caches each layer independently for fast rebuilds.

### Container

A container is a **running instance of an image** — the object to the image's class. You can start many containers from the same image simultaneously, and each has its own writable layer on top of the image layers. Stopping or deleting a container does not affect the underlying image.

### Registry

A registry is a **storage and distribution service for images**. The default public registry is [Docker Hub](https://hub.docker.com). When you run `docker pull nginx`, Docker downloads the `nginx` image from Docker Hub. Private registries (GitHub Container Registry, AWS ECR, self-hosted) work the same way but require authentication.

### Daemon

The Docker **daemon** (`dockerd`) is the background service that manages images, containers, networks, and volumes on your host. The `docker` CLI you type commands into is just a client that talks to the daemon over a local Unix socket (or TCP on remote hosts). You rarely need to interact with the daemon directly, but it is useful to know it exists when troubleshooting.

---

## Installing Docker

### Option A — Docker Desktop (macOS / Windows / Linux GUI)

Docker Desktop is the easiest way to get started on a developer workstation. It bundles the Docker daemon, the CLI, Docker Compose, and a graphical dashboard.

1. Visit [https://docs.docker.com/desktop/](https://docs.docker.com/desktop/) and download the installer for your OS.
2. Run the installer and follow the prompts.
3. Start Docker Desktop from your Applications folder / Start menu.

On macOS and Windows, Docker Desktop runs the Linux daemon inside a lightweight VM (using HyperKit / WSL 2) because those kernels do not have native Linux namespace support. This is transparent to you as a user.

### Option B — Docker Engine on Linux (production / headless servers)

On a Linux server you typically install just the engine, without the GUI.

```bash
# Remove any old versions first
sudo apt-get remove docker docker-engine docker.io containerd runc

# Set up Docker's apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install the engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
```

**Allow your user to run Docker without `sudo`** (you will need to log out and back in for this to take effect):

```bash
sudo usermod -aG docker $USER
```

For other distributions (Fedora, Arch, RHEL) the steps are similar — consult the [official install docs](https://docs.docker.com/engine/install/).

---

## Verifying the Installation

Once Docker is installed and running, open a terminal and confirm everything works:

```bash
# Check the CLI version
docker --version
# Docker version 26.1.4, build 5650f9b

# Check both client and daemon versions
docker version

# Run the classic hello-world container
docker run hello-world
```

The `hello-world` image is tiny (~13 KB) and designed purely to verify the entire pipeline: the daemon pulls the image from Docker Hub, starts a container, the container prints a confirmation message, then exits. If you see "Hello from Docker!" in your output, everything is working correctly.

```bash
# Show system-wide information (daemon version, storage driver, etc.)
docker info
```

`docker info` is useful when troubleshooting because it shows the storage driver, cgroup driver, number of running containers, and much more.

---

## The Docker CLI at a Glance

The CLI follows a consistent structure: `docker <object> <verb>`. For example:

```bash
docker container run ...   # equivalent to docker run ...
docker image ls            # equivalent to docker images
docker volume create ...
docker network inspect ...
```

Many older "shorthand" commands (`docker run`, `docker images`) still work and are commonly used. You will see both forms throughout this guide.

```bash
# Get help on any command
docker --help
docker run --help
docker image --help
```

---

## What Comes Next

Now that Docker is installed and you understand the core vocabulary, the next chapter dives into working with images and containers — pulling images from Docker Hub, starting and stopping containers, and understanding the flags you will use every day.

You will quickly find that Docker's CLI is opinionated and consistent, which means once you learn the pattern for one command, most others feel familiar immediately.
