---
title: "Docker in CI/CD"
sidebar_label: "Docker in CI/CD"
description: Learn how to build and push Docker images in GitHub Actions, cache layers for faster CI builds, and deploy by pulling and restarting containers.
slug: /docker/beginners-guide/docker-in-ci-cd
tags: [docker, beginners, devops]
keywords:
  - docker github actions
  - CI/CD docker
  - docker layer caching
  - build and push action
  - docker deploy pipeline
sidebar_position: 11
---

# Docker in CI/CD

Building images on your laptop is only the first step. In a team environment, images should be built, tested, scanned, and pushed automatically on every commit — and deployed automatically on merges to the main branch. This is the core of a Docker-based CI/CD pipeline.

This chapter builds a complete GitHub Actions workflow that takes your code from a `git push` to a running container in production.

---

## Why Build in CI?

| Concern | Local build | CI build |
|---|---|---|
| Reproducibility | Depends on developer's machine state | Clean environment every time |
| Security scanning | Easy to forget | Enforced in the pipeline |
| Registry credentials | On developer laptops (risk) | In CI secrets vault |
| Trigger-based | Manual | Automatic on push/PR/tag |
| Parallel builds | Limited by laptop | Scalable |

CI gives you a single, authoritative build process that every team member and every deployment can trust.

---

## GitHub Actions Fundamentals

A GitHub Actions workflow is a YAML file in `.github/workflows/`. It defines:

- **Triggers** (`on:`) — Which events start the workflow (push, pull_request, release, schedule)
- **Jobs** — Parallel or sequential groups of steps
- **Steps** — Individual shell commands or actions (reusable workflow units)
- **Runners** — The VMs that execute jobs (`ubuntu-latest`, `macos-latest`, Windows)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t my-app .
```

---

## Core Actions for Docker

| Action | Purpose |
|---|---|
| `docker/setup-buildx-action` | Enables BuildKit and multi-platform builds |
| `docker/login-action` | Authenticates to a registry |
| `docker/metadata-action` | Generates tags and labels from git metadata |
| `docker/build-push-action` | Builds and optionally pushes an image |

These are the official Docker GitHub Actions, maintained by the Docker team.

---

## A Complete Build-Test-Push Workflow

This workflow runs on every push to `main` and every pull request. It builds the image, runs tests, scans for vulnerabilities, and pushes to GHCR on merges to `main`.

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ["v*.*.*"]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}   # e.g. myorg/my-app

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write         # needed to push to GHCR
      security-events: write  # needed to upload SARIF scan results

    steps:
      # 1. Check out the code
      - name: Checkout repository
        uses: actions/checkout@v4

      # 2. Set up Docker Buildx (enables BuildKit and layer caching)
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # 3. Authenticate to GHCR
      #    Only runs on push (not pull_request from forks, for security)
      - name: Log in to GitHub Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # 4. Generate image tags and labels from git context
      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            # Tag with semver on git tag pushes: v1.2.3 → 1.2.3, 1.2, 1, latest
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            # Tag with short commit SHA on every push
            type=sha,prefix=sha-
            # Tag branch name on branch pushes
            type=ref,event=branch
            # Tag PR number on pull requests
            type=ref,event=pr

      # 5. Build (and push on main/tag)
      - name: Build and push Docker image
        id: build-and-push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          # Cache layers in the GitHub Actions cache
          cache-from: type=gha
          cache-to: type=gha,mode=max
          # Build for multiple platforms
          platforms: linux/amd64,linux/arm64

      # 6. Scan the built image for CVEs
      - name: Run Docker Scout scan
        if: github.event_name != 'pull_request'
        uses: docker/scout-action@v1
        with:
          command: cves
          image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:sha-${{ github.sha }}
          only-severities: critical,high
          exit-code: true   # Fail the job if critical/high CVEs are found
```

---

## Understanding Layer Caching in CI

Without caching, every CI run reinstalls dependencies from scratch. With caching, the dependency-install layer is reused until `package.json` changes — turning a 4-minute build into a 30-second one.

### GitHub Actions cache (`type=gha`)

The `cache-from: type=gha` / `cache-to: type=gha` lines in `build-push-action` store BuildKit's layer cache in GitHub's cache service (up to 10 GB per repository, evicted after 7 days of inactivity).

This is the simplest caching strategy for GitHub Actions and works well for most projects.

### Registry cache (`type=registry`)

Alternatively, store the cache in the same container registry:

```yaml
- uses: docker/build-push-action@v6
  with:
    cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:cache
    cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:cache,mode=max
```

This is useful for self-hosted runners that cannot use GitHub's cache service.

### Maximising cache hit rates

For good caching, your Dockerfile must be ordered correctly (see Chapter 3). The `mode=max` option on `cache-to` exports all layers (not just the final stage), giving you the best chance of cache hits on subsequent builds.

---

## Running Tests in CI

Run tests inside the Docker build itself using a `tester` stage (from Chapter 7), or run them as a separate step before building:

### Option A: Tests inside the Docker build

```dockerfile
# In your Dockerfile
FROM deps AS tester
COPY tests/ ./tests/
RUN npm test
```

```yaml
# In GitHub Actions
- name: Build (runs tests as part of the build)
  uses: docker/build-push-action@v6
  with:
    target: tester   # build only up to the tester stage
    push: false
```

### Option B: Tests as a separate CI step

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          docker build --target tester -t my-app:test .
          docker run --rm my-app:test

  build-push:
    needs: test   # only runs if test job passes
    runs-on: ubuntu-latest
    steps:
      # ... build and push steps
```

---

## Deploying After Push

The simplest deployment strategy for a single server is to SSH in and `docker pull` + restart the container. This is not suitable for zero-downtime deployments (use Kubernetes or Docker Swarm for that), but it is perfectly adequate for many production workloads.

### Deployment via SSH

```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            # Pull the new image
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io \
              -u ${{ github.actor }} --password-stdin

            docker pull ghcr.io/${{ github.repository }}:sha-${{ github.sha }}

            # Tag it as the current active version
            docker tag \
              ghcr.io/${{ github.repository }}:sha-${{ github.sha }} \
              ghcr.io/${{ github.repository }}:current

            # Restart the service with the new image
            docker compose -f /opt/my-app/docker-compose.yml pull
            docker compose -f /opt/my-app/docker-compose.yml up -d --no-deps api

            # Clean up old images
            docker image prune -f
```

### Using GitHub Environments for protection

Note the `environment: production` in the job above. In your GitHub repo settings, you can configure environments with:

- **Required reviewers** — A human must approve before the job runs
- **Deployment branches** — Only `main` can deploy to production
- **Wait timer** — Add a delay before deployment proceeds

This gives you a lightweight approval gate without a separate deployment tool.

---

## A Minimal End-to-End Workflow

Here is a simplified workflow you can copy-paste and adapt:

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        if: github.event_name == 'push'
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: ${{ github.event_name == 'push' }}
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy
        if: github.event_name == 'push'
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            docker pull ghcr.io/${{ github.repository }}:${{ github.sha }}
            docker stop my-app || true
            docker rm my-app || true
            docker run -d \
              --name my-app \
              --restart unless-stopped \
              -p 3000:3000 \
              --env-file /opt/my-app/.env \
              ghcr.io/${{ github.repository }}:${{ github.sha }}
```

---

## CI/CD Best Practices

1. **Never use `latest` as the deploy tag** — Always deploy by the exact image SHA or semver tag.
2. **Scan before deploying** — Block the pipeline if critical CVEs are found.
3. **Pin action versions** — Use `@v4` not `@main` to avoid supply-chain attacks.
4. **Store credentials in GitHub Secrets** — Never hardcode registry credentials in YAML.
5. **Use environments with protection rules** — Require approval for production deployments.
6. **Keep build and deploy jobs separate** — Build once, deploy the same image to staging and then production.
7. **Clean up old images** — Add `docker image prune` to your deployment script.
8. **Test rollback** — Have a documented and tested procedure for reverting to the previous image tag.
