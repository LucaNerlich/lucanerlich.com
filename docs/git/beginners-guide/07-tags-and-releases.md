---
title: "Tags and Releases"
sidebar_label: "Tags and Releases"
description: Lightweight vs annotated tags, creating and pushing tags, semantic versioning, deleting tags, and checking out tags.
slug: /git/beginners-guide/tags-and-releases
tags: [git, beginners, version-control]
keywords:
  - git tag
  - annotated tag
  - lightweight tag
  - semantic versioning
  - git release
  - semver
  - git push tags
sidebar_position: 7
---

# Tags and Releases

Every software project eventually ships a version. Tags give you a way to permanently mark a specific commit as a
release point — a snapshot of the codebase at version `v1.0.0`, `v2.3.1`, or any other milestone. Unlike branches,
tags do not move: once created, a tag always refers to the same commit. They are the stable anchors in your project
history.

## Lightweight vs Annotated Tags

Git has two kinds of tags:

| Feature                | Lightweight                          | Annotated                                           |
|------------------------|--------------------------------------|-----------------------------------------------------|
| **Stored as**          | A simple pointer to a commit         | A full Git object with metadata                     |
| **Contains**           | Commit hash only                     | Tagger name, email, date, message, and commit hash  |
| **GPG signing**        | Not supported                        | Supported (`-s`)                                    |
| **Shown in `git describe`** | No (by default)              | Yes                                                 |
| **Best for**           | Local, temporary, private markers    | Public releases, official version tags              |

**Always use annotated tags for releases.** They contain authorship and message metadata and are treated as first-class
objects by tools like `git describe` and GitHub Releases.

## Creating Tags

### Lightweight tag

```bash
git tag v1.0.0
```

This tags the current `HEAD` commit. No metadata, no message — just a name pointing to a hash.

### Annotated tag

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

Or without `-m` to open your editor for a longer message:

```bash
git tag -a v1.0.0
```

### Tag a specific commit

You can tag any commit in history, not just the current one:

```bash
# First find the commit hash
git log --oneline
# a1b2c3d Add login endpoint
# 9f8e7d6 Add database migrations
# c4b5a69 Initial commit

# Tag a past commit
git tag -a v0.9.0 9f8e7d6 -m "Beta release"
```

### Signed tag (GPG)

```bash
git tag -s v1.0.0 -m "Release version 1.0.0"
```

GPG-signed tags provide cryptographic proof of who created the tag. Requires a GPG key configured with Git.

## Listing Tags

```bash
# List all tags
git tag
# v0.9.0
# v1.0.0
# v1.1.0
# v2.0.0

# Filter tags by pattern
git tag -l "v1.*"
# v1.0.0
# v1.1.0

# List with tag details
git tag -n
# v0.9.0          Beta release
# v1.0.0          Release version 1.0.0

# Full details of an annotated tag
git show v1.0.0
# tag v1.0.0
# Tagger: Your Name <you@example.com>
# Date:   Fri Apr 18 14:00:00 2025 +0200
#
# Release version 1.0.0
#
# commit a1b2c3d...
# Author: Your Name <you@example.com>
# Date:   Fri Apr 18 13:45:00 2025 +0200
#
#     feat: finalize authentication flow
```

## Pushing Tags to Remote

By default, `git push` does **not** push tags. You must push them explicitly.

### Push a single tag

```bash
git push origin v1.0.0
```

### Push all tags at once

```bash
git push origin --tags
```

### Push only annotated tags (skip lightweight)

```bash
git push origin --follow-tags
```

`--follow-tags` is recommended: it pushes all reachable annotated tags along with your commits, without pushing
temporary lightweight tags you may have created locally.

## Checking Out a Tag

Tags are not branches — you cannot commit on a tag. Checking out a tag puts you in **detached HEAD** state:

```bash
git checkout v1.0.0
# Note: switching to 'v1.0.0'.
# You are in 'detached HEAD' state.
```

This is useful for:
- Inspecting how the code looked at that release
- Building or testing a specific version
- Reproducing a bug reported against a specific release

To make changes starting from a tagged version, create a branch:

```bash
git checkout -b hotfix/1.0.1 v1.0.0
# Now on branch hotfix/1.0.1, starting from v1.0.0
```

## Deleting Tags

### Delete a local tag

```bash
git tag -d v0.9.0
# Deleted tag 'v0.9.0' (was 9f8e7d6)
```

### Delete a remote tag

```bash
git push origin --delete v0.9.0
# or the older syntax:
git push origin :refs/tags/v0.9.0
```

> **Note:** Deleting a tag from the remote does not delete it locally (and vice versa). You must delete in both places
> if that is your intent.

## Semantic Versioning

Most software that uses tags follows **Semantic Versioning** (SemVer). The format is:

```
vMAJOR.MINOR.PATCH
```

| Part      | When to increment                                                  | Example                     |
|-----------|--------------------------------------------------------------------|-----------------------------|
| **MAJOR** | Incompatible API change (breaking change)                          | `v1.0.0` → `v2.0.0`        |
| **MINOR** | New feature, backward-compatible                                   | `v1.2.0` → `v1.3.0`        |
| **PATCH** | Bug fix, backward-compatible                                       | `v1.2.3` → `v1.2.4`        |

### Pre-release versions

```
v1.0.0-alpha.1    # Early unstable preview
v1.0.0-beta.2     # Feature-complete, may have bugs
v1.0.0-rc.1       # Release candidate, final testing
v1.0.0            # Stable release
```

### Build metadata

```
v1.0.0+build.123  # Build metadata (ignored in precedence)
```

### Why SemVer matters

When your tag is `v2.0.0`, users of your library know immediately that upgrading from `v1.x` involves breaking changes.
When they see `v1.3.0`, they know it is safe to upgrade from `v1.2.x`. This communication is invaluable in
ecosystems where packages have hundreds of dependents.

## git describe — Human-Readable Version Strings

`git describe` generates a version string based on the most recent annotated tag:

```bash
git describe
# v1.2.0-14-g8a7b6c5
```

This means:
- `v1.2.0` — the most recent annotated tag
- `14` — 14 commits since that tag
- `g8a7b6c5` — abbreviated commit hash (`g` prefix means "git")

If you are exactly on a tag:

```bash
git describe
# v1.2.0
```

`git describe` is commonly used in build systems to embed version information:

```bash
VERSION=$(git describe --tags --always)
echo "Building version: $VERSION"
```

The `--always` flag falls back to the commit hash if no tags are found. `--tags` includes lightweight tags.

## Creating GitHub / GitLab Releases

Most platforms treat annotated tags as the basis for creating releases. After pushing a tag:

**GitHub CLI:**

```bash
# Create a release from a tag
gh release create v1.0.0 --title "v1.0.0 — Initial Release" --notes "
## What's New

- User authentication with JWT
- REST API for products and orders
- Admin dashboard
"

# Attach build artifacts to the release
gh release create v1.0.0 ./dist/app-linux-amd64 ./dist/app-darwin-arm64 \
  --title "v1.0.0" --generate-notes
```

`--generate-notes` automatically generates release notes from commit messages since the previous tag.

## Automating Tags with Tools

### standard-version

```bash
npx standard-version
# Reads commit messages (Conventional Commits format)
# Bumps version in package.json
# Generates/updates CHANGELOG.md
# Creates a commit and an annotated tag
```

### semantic-release

```bash
npx semantic-release
# Full automation: determines version, creates tag, publishes to npm, creates GitHub Release
# Runs in CI — no manual steps
```

These tools only work correctly when your commit messages follow the [Conventional Commits](./02-basic-workflow.md#conventional-commits)
specification. This is why adopting a commit message convention pays off.

## A Complete Release Workflow

```bash
# 1. Make sure main is clean and tests pass
git switch main
git pull
npm test

# 2. Create and push the annotated tag
git tag -a v1.1.0 -m "Release v1.1.0

New features:
- Dark mode support
- Bulk user import via CSV

Bug fixes:
- Fix session timeout on mobile browsers
- Fix race condition in payment processing"

git push origin v1.1.0

# 3. Create the GitHub release
gh release create v1.1.0 --title "v1.1.0" --generate-notes

# 4. Verify the tag is visible
git tag -l "v1.*"
# v1.0.0
# v1.1.0
```

## Summary

You now understand:

- **Lightweight tags** — simple pointers, good for local bookmarks
- **Annotated tags** — full objects with metadata, use these for releases
- **Creating, listing, pushing, and deleting** tags on both local and remote
- **Semantic versioning** — MAJOR.MINOR.PATCH and what each part means
- **`git describe`** — generating version strings from tags
- **Release automation** — `standard-version` and `semantic-release`

Next up: [Undoing Changes](./08-undoing-changes.md) — git restore, reset, revert, and using reflog as a safety net.
