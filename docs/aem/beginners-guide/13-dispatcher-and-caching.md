---
title: "Dispatcher & Caching"
sidebar_label: "Dispatcher & Caching"
description: Dispatcher architecture, cache rules, filters, rewrites, vanity URLs, cache invalidation, and local Dispatcher SDK testing.
slug: /aem/beginners-guide/dispatcher-and-caching
tags: [aem, beginners]
keywords:
  - aem dispatcher
  - aem caching
  - aem cache invalidation
  - aem dispatcher sdk
  - aem cdn
sidebar_position: 13
---

# Dispatcher & Caching

The Dispatcher is a **caching and load-balancing** layer that sits in front of AEM Publish instances. It is the first
line of defense for performance and security. In AEMaaCS, the Dispatcher runs on Apache HTTP Server with a custom
module.

## Architecture

```mermaid
flowchart LR
    User["Website Visitor"]
    CDN["CDN (Fastly)"]
    Dispatcher["Dispatcher (Apache)"]
    Publish["AEM Publish"]

    User -->|"Request"| CDN
    CDN -->|"Cache miss"| Dispatcher
    Dispatcher -->|"Cache miss"| Publish
    Publish -->|"Response"| Dispatcher
    Dispatcher -->|"Cached"| CDN
    CDN -->|"Cached"| User
```

In AEMaaCS, the flow is:

1. **CDN (Fastly)** -- Adobe's managed CDN. First cache layer
2. **Dispatcher** -- Apache + Dispatcher module. Second cache layer
3. **AEM Publish** -- renders the page if not cached

Most requests should be served from CDN or Dispatcher cache, never reaching Publish.

### What the Dispatcher does

| Function           | Description                                   |
|--------------------|-----------------------------------------------|
| **Caching**        | Stores rendered HTML, images, CSS, JS on disk |
| **Filtering**      | Blocks malicious or unnecessary requests      |
| **Load balancing** | Distributes requests across Publish instances |
| **URL rewriting**  | Maps vanity URLs and redirects                |
| **Security**       | Blocks access to sensitive paths              |

## Dispatcher configuration in your project

The Dispatcher config lives in the `dispatcher/` module:

```
dispatcher/
└── src/
    ├── conf.d/
    │   ├── available_vhosts/
    │   │   └── default.vhost         # Virtual host configuration
    │   ├── enabled_vhosts/
    │   │   └── default.vhost -> ...  # Symlink to enable
    │   ├── rewrites/
    │   │   └── rewrite.rules         # URL rewrite rules
    │   └── variables/
    │       └── custom.vars           # Custom variables
    └── conf.dispatcher.d/
        ├── available_farms/
        │   └── default.farm          # Farm configuration
        ├── enabled_farms/
        │   └── default.farm -> ...   # Symlink to enable
        ├── cache/
        │   └── rules.any             # Cache rules
        ├── clientheaders/
        │   └── clientheaders.any     # Forwarded headers
        ├── filters/
        │   └── filters.any           # Request filters
        └── renders/
            └── default_renders.any   # Publish instance addresses
```

## Cache rules

Cache rules define which responses the Dispatcher stores:

```
# cache/rules.any

# Cache HTML pages
/0000 { /type "allow" /glob "*.html" }

# Cache clientlibs (CSS, JS)
/0001 { /type "allow" /glob "/etc.clientlibs/*" }

# Cache static assets
/0002 { /type "allow" /glob "*.css" }
/0003 { /type "allow" /glob "*.js" }
/0004 { /type "allow" /glob "*.gif" }
/0005 { /type "allow" /glob "*.ico" }
/0006 { /type "allow" /glob "*.jpg" }
/0007 { /type "allow" /glob "*.jpeg" }
/0008 { /type "allow" /glob "*.png" }
/0009 { /type "allow" /glob "*.svg" }
/0010 { /type "allow" /glob "*.webp" }
/0011 { /type "allow" /glob "*.woff2" }

# Do not cache JSON API responses (dynamic)
/0100 { /type "deny" /glob "*.json" }
```

> **Tip:** In AEMaaCS, the default rules are already good. Customize only when needed.

### Cacheable responses

The Dispatcher only caches responses that:

1. Return **HTTP 200**
2. Are **GET requests** (never POST)
3. Do **not** have `Set-Cookie` headers
4. Do **not** have `Authorization` headers
5. Match the **cache rules** (`/cache` section)

## Filters

Filters control which requests reach AEM:

```
# filters/filters.any

# Allow basic content paths
/0001 { /type "allow" /method "GET" /url "/content/*" }
/0002 { /type "allow" /method "GET" /url "/etc.clientlibs/*" }
/0003 { /type "allow" /method "GET" /url "/libs/*" }

# Allow GraphQL persisted queries
/0010 { /type "allow" /method "GET" /url "/graphql/execute.json/*" }

# Block sensitive paths
/0100 { /type "deny" /url "/system/*" }
/0101 { /type "deny" /url "/crx/*" }
/0102 { /type "deny" /url "/bin/*" }
/0103 { /type "deny" /url "*.infinity.json" }
/0104 { /type "deny" /url "*.tidy.json" }
/0105 { /type "deny" /url "*.sysview.xml" }
/0106 { /type "deny" /url "*.docview.xml" }
/0107 { /type "deny" /url "*.query.json" }

# Block selectors that expose raw content
/0200 { /type "deny" /selectors '(feed|rss|pages|languages|blueprint|infinity)' }
```

### Filter order matters

Filters are evaluated **top to bottom**. The last matching filter wins. A common pattern:

1. **Deny all** (implicit or explicit)
2. **Allow** specific paths
3. **Deny** sensitive paths (overrides allows)

> **Security:** Always deny access to `/crx/*`, `/system/console/*`, and other admin paths on Publish.

## URL rewrites

Rewrite rules map vanity URLs and handle redirects:

```apache
# rewrites/rewrite.rules

# Remove /content/mysite/en prefix for clean URLs
RewriteRule ^/content/mysite/en/(.*)$ /$1 [PT,L]

# Redirect www to non-www
RewriteCond %{HTTP_HOST} ^www\.mysite\.com$
RewriteRule ^(.*)$ https://mysite.com$1 [R=301,L]

# Redirect old URLs
RewriteRule ^/old-page$ /new-page [R=301,L]
```

### Vanity URLs

AEM supports vanity URLs in page properties. An author can set `/products` as a vanity URL for
`/content/mysite/en/products-and-services`. The Dispatcher resolves these through a vanity URL mapping file.

## Cache invalidation

When content is published, the Dispatcher cache must be updated. AEM handles this automatically.

### Auto-invalidation

When a page is published, AEM sends an invalidation request to the Dispatcher. The Dispatcher marks the cached file (and
potentially related files) as **stale**:

```mermaid
sequenceDiagram
    participant Author["Author"]
    participant AEM["AEM Publish"]
    participant Dispatcher
    participant Cache["Cache on Disk"]

    Author->>AEM: Publish page /en/about
    AEM->>Dispatcher: Flush /content/mysite/en/about.html
    Dispatcher->>Cache: Mark about.html as stale
    Note over Cache: Next request fetches fresh copy
```

### Stat file invalidation

The Dispatcher uses a `.stat` file mechanism:

1. When a page is invalidated, the Dispatcher touches the `.stat` file in the cache directory
2. On the next request, the Dispatcher checks if the cached file is **older** than `.stat`
3. If older, the file is re-fetched from Publish
4. If newer, the cached file is served

### Stat file level

The `statfileslevel` setting controls how broadly invalidation spreads:

| Level | Behavior                                                             |
|-------|----------------------------------------------------------------------|
| 0     | One `.stat` at the root -- all content invalidated on any publish    |
| 1     | `.stat` per first-level directory -- `/en/` and `/de/` independent   |
| 2     | `.stat` per second-level -- `/en/blog/` and `/en/about/` independent |

Higher levels = more granular invalidation = better cache hit ratio.

```
# In the farm config
/statfileslevel "2"
```

### Manual cache flush

For emergencies, you can flush the cache manually:

```bash
# Flush a specific path
curl -H "CQ-Action: Activate" \
     -H "CQ-Handle: /content/mysite/en/about" \
     http://dispatcher-host/dispatcher/invalidate.cache

# Flush everything (use sparingly)
curl -H "CQ-Action: Activate" \
     -H "CQ-Handle: /" \
     http://dispatcher-host/dispatcher/invalidate.cache
```

## Local Dispatcher testing with the SDK

The AEMaaCS SDK includes a Dispatcher SDK for local testing.

### Setup

1. Download the Dispatcher SDK from the Software Distribution portal
2. Extract it alongside your AEM SDK
3. The SDK includes Docker-based tools for running the Dispatcher locally

### Validate configuration

```bash
# From the dispatcher SDK directory
./bin/validator full dispatcher/src
```

This validates your Dispatcher configuration against AEMaaCS rules. Common checks:

- No deprecated directives
- No hardcoded IPs
- All includes resolve
- Filters follow security best practices

### Run locally

```bash
# Start the local Dispatcher (Docker required)
./bin/docker_run.sh dispatcher/src host.docker.internal:4503
```

This starts an Apache + Dispatcher instance pointing to your local Publish on port 4503. Test at
`http://localhost:8080`.

### Testing checklist

| Test              | What to verify                                      |
|-------------------|-----------------------------------------------------|
| **Page loads**    | Pages render correctly through the Dispatcher       |
| **Caching**       | Reload and check the `X-Dispatcher` response header |
| **Filters**       | Admin paths return 403 or 404                       |
| **Rewrites**      | Vanity URLs resolve correctly                       |
| **Invalidation**  | Publish a page and verify the cache is refreshed    |
| **Static assets** | CSS, JS, images served with proper cache headers    |

> For detailed configuration, see the [Dispatcher Configuration](/aem/infrastructure/dispatcher-configuration)
> reference. See also [Performance](/aem/infrastructure/performance) for broader optimization strategies
> and [Security Basics](/aem/infrastructure/security) for hardening your Publish tier.

## Summary

You learned:

- **Dispatcher architecture** -- CDN > Dispatcher > Publish
- **Cache rules** -- what gets cached and what does not
- **Filters** -- blocking malicious requests, allowing legitimate ones
- **URL rewrites** -- vanity URLs and redirects
- **Cache invalidation** -- stat files, auto-invalidation on publish, manual flush
- **Stat file level** -- controlling invalidation granularity
- **Local testing** with the Dispatcher SDK

Next up: [Deployment & Cloud Manager](./14-deployment-and-cloud-manager.md) -- Git repo structure, Cloud Manager
pipelines, environments, content transfer, and Rapid Development Environments.
