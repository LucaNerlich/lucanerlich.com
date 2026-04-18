---
title: "Registries and Image Management"
sidebar_label: "Registries & Images"
description: Learn how to push and pull images to Docker Hub, GHCR, and private registries, apply tagging conventions, and scan images for vulnerabilities.
slug: /docker/beginners-guide/registries-and-images
tags: [docker, beginners, devops]
keywords:
  - docker registry
  - docker hub
  - GHCR
  - docker push
  - docker pull
  - image tagging
  - docker scout
  - image scanning
sidebar_position: 9
---

# Registries and Image Management

An image built on your laptop is only useful if you can share it. **Registries** are the distribution mechanism for Docker images — they store images, manage versions through tags, and control access. Mastering registries is essential for any team workflow or CI/CD pipeline.

---

## Types of Registries

| Registry | URL | Free tier | Best for |
|---|---|---|---|
| Docker Hub | `docker.io` | Yes (public images unlimited, private limited) | Open-source projects, official images |
| GitHub Container Registry | `ghcr.io` | Yes (public free, private with GitHub plan) | Projects hosted on GitHub |
| AWS ECR | `<account>.dkr.ecr.<region>.amazonaws.com` | 500 MB free private | AWS deployments |
| Google Artifact Registry | `<region>-docker.pkg.dev` | 0.5 GB free | GCP deployments |
| Azure Container Registry | `<name>.azurecr.io` | Paid only | Azure deployments |
| Self-hosted (Docker Registry) | Your own domain | Free (you host it) | Air-gapped environments, full control |

---

## Docker Hub

Docker Hub is the default registry. When you run `docker pull nginx`, Docker looks for the image at `docker.io/library/nginx`.

### Creating a Docker Hub account

1. Sign up at [hub.docker.com](https://hub.docker.com).
2. Create a repository (public or private).

### Logging in

```bash
docker login
# Prompts for Docker Hub username and password (or access token)

# Login with an access token (preferred over password)
echo $DOCKER_TOKEN | docker login --username myusername --password-stdin
```

Always use **access tokens** (created at hub.docker.com → Account Settings → Security) instead of your account password. Access tokens can be scoped and revoked individually.

### Pushing an image to Docker Hub

Images must be tagged with your Docker Hub username as the namespace before pushing:

```bash
# Build the image
docker build -t myusername/my-app:1.0.0 .

# Also tag it as latest
docker tag myusername/my-app:1.0.0 myusername/my-app:latest

# Push both tags
docker push myusername/my-app:1.0.0
docker push myusername/my-app:latest
```

Or push all tags at once:

```bash
docker push --all-tags myusername/my-app
```

---

## GitHub Container Registry (GHCR)

GHCR is tightly integrated with GitHub Actions and GitHub's permission model. Images are scoped to a GitHub user or organisation.

### Authentication

```bash
# Create a Personal Access Token at github.com → Settings → Developer settings
# Required scopes: read:packages, write:packages, delete:packages

echo $GITHUB_TOKEN | docker login ghcr.io --username $GITHUB_USERNAME --password-stdin
```

### Pushing to GHCR

```bash
# Tag the image with the GHCR namespace
docker build -t ghcr.io/myorg/my-app:1.0.0 .
docker tag ghcr.io/myorg/my-app:1.0.0 ghcr.io/myorg/my-app:latest

docker push ghcr.io/myorg/my-app:1.0.0
docker push ghcr.io/myorg/my-app:latest
```

### Making a GHCR image public

By default, packages inherit the visibility of the repository they are linked to. You can change this at `github.com → Your profile → Packages → <package> → Package settings`.

---

## Private Registries

### Self-hosted Docker Registry

Run the official `registry` image to host your own:

```bash
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v registry-data:/var/lib/registry \
  registry:2
```

Push and pull from it:

```bash
docker tag my-app localhost:5000/my-app:latest
docker push localhost:5000/my-app:latest
docker pull localhost:5000/my-app:latest
```

For production use, add TLS and authentication — an unauthenticated HTTP registry is only suitable for trusted local networks.

### AWS ECR

```bash
# Authenticate (credentials from aws configure or IAM role)
aws ecr get-login-password --region eu-west-1 \
  | docker login --username AWS --password-stdin \
    123456789.dkr.ecr.eu-west-1.amazonaws.com

# Create a repository
aws ecr create-repository --repository-name my-app --region eu-west-1

# Tag and push
docker tag my-app:latest 123456789.dkr.ecr.eu-west-1.amazonaws.com/my-app:latest
docker push 123456789.dkr.ecr.eu-west-1.amazonaws.com/my-app:latest
```

---

## Pulling Images

```bash
# Pull from Docker Hub (default)
docker pull nginx:alpine

# Pull from GHCR
docker pull ghcr.io/owner/repo:tag

# Pull from a private registry
docker pull myregistry.company.com/app:1.2.3

# Pull a specific platform (e.g., for cross-compilation)
docker pull --platform linux/arm64 nginx:alpine
```

---

## Tagging Conventions

Good tagging is critical for production deployments. Inconsistent tags make it hard to know what version is running, roll back, or reproduce issues.

### Common patterns

| Tag | Meaning | Mutable? |
|---|---|---|
| `latest` | Most recent build on the default branch | Yes (anti-pattern in production) |
| `1.2.3` | Exact semantic version | No — treat as immutable |
| `1.2` | Minor version track | Yes — updated with each patch |
| `1` | Major version track | Yes — updated with each minor |
| `main` or `develop` | Branch name | Yes |
| `sha-a1b2c3d` | Git commit SHA (short) | No — immutable |
| `pr-123` | Pull request number | Yes — updated on each PR push |

### Recommended production tagging strategy

Tag with both the full semver **and** the git SHA so you can always trace an image back to the exact commit:

```bash
VERSION=1.2.3
GIT_SHA=$(git rev-parse --short HEAD)

docker build \
  -t myrepo/my-app:${VERSION} \
  -t myrepo/my-app:${GIT_SHA} \
  -t myrepo/my-app:latest \
  .

docker push myrepo/my-app:${VERSION}
docker push myrepo/my-app:${GIT_SHA}
docker push myrepo/my-app:latest
```

### Why `latest` is an antipattern in production

- `latest` is mutable — today's `latest` and tomorrow's `latest` may be different images.
- Pulling `latest` in production means you may get an untested version silently.
- It makes rollbacks ambiguous — you cannot easily deploy "the previous latest."

Use specific version tags in production manifests. Reserve `latest` for pointing developers to the most recent development image.

---

## Inspecting Remote Images

You can inspect an image's metadata without pulling the full image:

```bash
# View image metadata from Docker Hub
docker manifest inspect nginx:alpine

# See the layers and config (requires pulling)
docker pull nginx:alpine
docker inspect nginx:alpine

# See image history (layers and commands)
docker history nginx:alpine

# Show image size and layers
docker image ls --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" nginx
```

---

## Image Scanning with Docker Scout

**Docker Scout** is Docker's built-in vulnerability scanner. It analyses image layers against known CVE databases.

```bash
# Scan a local image
docker scout cves my-app:latest

# Scan an image from a registry
docker scout cves ghcr.io/myorg/my-app:latest

# Get a quick health summary
docker scout quickview my-app:latest

# Compare two images (e.g., before and after a dependency update)
docker scout compare --to my-app:1.0.0 my-app:1.1.0

# List packages and their versions in an image
docker scout sbom my-app:latest
```

Sample `docker scout quickview` output:

```
  Image reference: my-app:latest

  ... ✓ Pulled
  ... Indexed 215 packages

    Overview
    --------
    Name          Packages   Critical   High   Medium   Low   Unspecified
    my-app:1.0.0       215          0      3       12    18             4

  Recommendations
  ---------------
  Tag         Updates                      Benefits
  1.0.0-fix   libssl 3.0.2 → 3.0.11       Fixes 2 HIGH CVEs
```

### Alternative scanners

| Tool | Notes |
|---|---|
| `trivy` | Fast, open-source, supports many formats beyond Docker |
| `grype` | Anchore's open-source scanner |
| `snyk` | Commercial with a free tier, integrates well with CI |
| `docker scout` | Built-in to Docker Desktop and Docker Hub |

```bash
# Trivy example
trivy image my-app:latest
trivy image --severity HIGH,CRITICAL my-app:latest
```

Integrate scanning into your CI pipeline so every image push is checked for vulnerabilities before deployment.

---

## Logging Out

```bash
# Log out from Docker Hub
docker logout

# Log out from a specific registry
docker logout ghcr.io
docker logout 123456789.dkr.ecr.eu-west-1.amazonaws.com
```

Credentials are stored in `~/.docker/config.json`. In CI environments, always log out after pushing to prevent credential leakage.

---

## Working with Multi-Architecture Images

Modern Docker supports building and pushing images for multiple CPU architectures (`amd64`, `arm64`, `arm/v7`) using **Docker Buildx** and **manifest lists**.

```bash
# Create a multi-arch builder
docker buildx create --name multi-arch --use

# Build and push for both x86 and ARM in one command
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myusername/my-app:1.0.0 \
  --push \
  .
```

When a user pulls `myusername/my-app:1.0.0`, Docker automatically selects the layer that matches their CPU architecture. This is how all official Docker Hub images work.

---

## Registry Best Practices

1. **Use access tokens, not passwords** — Tokens can be scoped and rotated.
2. **Pin to specific tags in production** — Never deploy `latest` to production.
3. **Use immutable tags (SHAs or exact versions)** — Makes rollbacks and auditing reliable.
4. **Scan images before deployment** — Integrate Docker Scout or Trivy into CI.
5. **Set up retention policies** — Registries grow; delete old images and untagged digests automatically.
6. **Limit registry access** — Use private repositories for proprietary applications.
7. **Sign images** — Use Docker Content Trust or sigstore/cosign to cryptographically verify image integrity.

```bash
# Sign an image with cosign (after installing cosign)
cosign sign --key cosign.key ghcr.io/myorg/my-app:1.0.0

# Verify before pulling
cosign verify --key cosign.pub ghcr.io/myorg/my-app:1.0.0
```
