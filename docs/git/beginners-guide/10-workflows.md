---
title: "Git Workflows"
sidebar_label: "Workflows"
description: GitHub Flow, GitFlow, trunk-based development, and the fork workflow for open source — and how to choose the right one.
slug: /git/beginners-guide/workflows
tags: [git, beginners, version-control]
keywords:
  - github flow
  - gitflow
  - trunk-based development
  - fork workflow
  - branching strategy
  - feature branch workflow
sidebar_position: 10
---

# Git Workflows

Git does not prescribe how you use branches. That freedom is a strength, but it means teams need to agree on a
workflow — a set of conventions for how branches are named, how work is integrated, and how releases are made. A good
workflow matches your team size, deployment cadence, and product needs. A bad workflow creates bottlenecks,
integration nightmares, and confusion.

This chapter covers the four most common workflows, with honest analysis of their trade-offs.

## GitHub Flow

**GitHub Flow** is a lightweight workflow built around one rule: `main` is always deployable. Everything else is a
short-lived feature branch.

### Branch model

```
main  ●────────────────────────────────────●────────────────▶
       \                                  /
        ●── feature/login ──────────────●
```

### The steps

1. Create a branch from `main`
2. Add commits
3. Open a pull request
4. Discuss and review the code
5. Merge to `main`
6. Deploy immediately (or via CD pipeline)

```bash
# Step 1: Branch from main
git switch main
git pull
git switch -c feature/user-notifications

# Step 2: Do the work
git add src/notifications/
git commit -m "feat(notifications): add real-time alert system"
git add tests/notifications.test.js
git commit -m "test(notifications): add WebSocket handler tests"

# Step 3: Push and open PR
git push -u origin feature/user-notifications
gh pr create --title "feat: add real-time notifications" --body "
## Summary
Adds WebSocket-based notifications for order status updates.

## Test plan
- [ ] Unit tests pass (npm test)
- [ ] Manual test: place an order and verify notification appears
- [ ] Test with slow network connection
"

# Step 5: After approval, merge (via GitHub UI or CLI)
gh pr merge --squash

# Step 6: Clean up locally
git switch main
git pull
git branch -d feature/user-notifications
```

### When to use GitHub Flow

| Criterion              | Fits GitHub Flow?                                    |
|------------------------|------------------------------------------------------|
| Deployment cadence     | Continuous deployment / multiple times per day       |
| Team size              | Any — works well from 1 to 100+ developers           |
| Product type           | Web apps, SaaS, APIs, internal tools                 |
| Release coordination   | Not needed — you deploy directly from main           |
| Branch complexity      | Low — only feature branches and main                 |

### Pros and cons

| Pros                                                | Cons                                                |
|-----------------------------------------------------|-----------------------------------------------------|
| Simple — only one rule to remember                  | Requires strong CI — main must never break          |
| Fast iteration — merge and deploy same day          | Not suited for multiple supported versions          |
| Forces small PRs and frequent integration           | No built-in concept of "release freeze"             |
| Excellent for CD pipelines                          | Less control over when features reach users         |

## GitFlow

**GitFlow** is a more structured workflow created by Vincent Driessen in 2010. It defines specific branch types for
features, releases, and hotfixes, and maintains two long-lived branches: `main` and `develop`.

### Branch model

```
main     ●────────────────────────────────●────────────────▶
          \                              /
release    ●──────────────────────────●/
            \                        /
develop  ●───────────────────────────────────────────────▶
           \          \            /
feature     ●──────────●          ●───────────●
                   feature/A             feature/B
```

### Branch types

| Branch          | Branches from  | Merges into         | Purpose                                              |
|-----------------|----------------|---------------------|------------------------------------------------------|
| `main`          | —              | —                   | Production-ready code only; every commit is a release |
| `develop`       | `main`         | —                   | Integration branch for completed features            |
| `feature/*`     | `develop`      | `develop`           | New features, one branch per feature                 |
| `release/*`     | `develop`      | `main` + `develop`  | Release preparation — bug fixes, version bumps only  |
| `hotfix/*`      | `main`         | `main` + `develop`  | Urgent production fixes                              |

### Feature branch workflow

```bash
# Start a feature
git switch develop
git pull
git switch -c feature/inventory-management

# Work on the feature
git commit -m "feat(inventory): add stock level tracking"
git commit -m "feat(inventory): add low-stock alerts"

# Merge back to develop (no fast-forward to preserve history)
git switch develop
git merge --no-ff feature/inventory-management -m "Merge feature/inventory-management"
git branch -d feature/inventory-management
git push origin develop
```

### Release branch workflow

```bash
# When develop is ready for release
git switch develop
git switch -c release/2.3.0

# Only bug fixes on the release branch — no new features
git commit -m "fix(checkout): handle PayPal timeout correctly"
git commit -m "chore(release): bump version to 2.3.0"

# Merge to main and tag
git switch main
git merge --no-ff release/2.3.0 -m "Release 2.3.0"
git tag -a v2.3.0 -m "Release 2.3.0"

# Merge back to develop (to include release fixes)
git switch develop
git merge --no-ff release/2.3.0 -m "Merge release/2.3.0 back to develop"
git branch -d release/2.3.0

git push origin main develop --follow-tags
```

### Hotfix workflow

```bash
# Critical bug found in production
git switch main
git switch -c hotfix/payment-race-condition

git commit -m "fix(payment): prevent double-charge on rapid clicks"

# Merge to main (fix the production issue)
git switch main
git merge --no-ff hotfix/payment-race-condition -m "Hotfix: payment race condition"
git tag -a v2.2.1 -m "Hotfix release 2.2.1"

# Merge to develop (so it is included in future releases)
git switch develop
git merge --no-ff hotfix/payment-race-condition -m "Merge hotfix back to develop"
git branch -d hotfix/payment-race-condition

git push origin main develop --follow-tags
```

### When to use GitFlow

| Criterion              | Fits GitFlow?                                          |
|------------------------|--------------------------------------------------------|
| Deployment cadence     | Scheduled releases (weekly, monthly)                   |
| Team size              | Medium to large teams with release managers            |
| Product type           | Desktop apps, mobile apps, versioned APIs, libraries   |
| Release coordination   | Needed — dedicated release branches allow freeze periods |
| Compliance / auditing  | Fits well — clear separation of release and development |

### Pros and cons

| Pros                                                    | Cons                                                       |
|---------------------------------------------------------|------------------------------------------------------------|
| Explicit process for releases and hotfixes              | Complex — many branch types to remember                    |
| Supports multiple concurrent versions                   | Long-lived branches cause large merge conflicts            |
| Feature isolation until explicitly merged to develop    | Slower feedback — features wait for next release cycle     |
| Familiar to enterprise teams                            | `git flow` CLI tool helps but adds tooling dependency      |

> **Note:** Vincent Driessen himself added a note to the original blog post in 2020: "If your team is doing continuous
> delivery of software, I would suggest to adopt a much simpler workflow (like GitHub Flow) instead of trying to shoehorn
> git-flow into your team."

## Trunk-Based Development

**Trunk-based development** (TBD) takes simplification even further than GitHub Flow: developers commit **directly to
main** (the "trunk") multiple times per day. Feature branches, when used, are very short-lived (hours, not days).

### The rules

1. Commit to `main` (or merge very short-lived branches) multiple times per day
2. Keep `main` always green (all tests pass)
3. Use **feature flags** to hide incomplete features from users
4. Use CI to validate every commit within minutes

```bash
# Developer Alice
git switch main
git pull

# Very small, focused change
git add src/notifications/email.js
git commit -m "feat(notifications): add email template for order confirmation"
git push origin main
# CI runs, tests pass, code is deployed automatically

# Developer Bob (simultaneously)
git switch main
git pull

git add src/products/search.js
git commit -m "feat(search): improve relevance ranking algorithm"
git push origin main
```

### Feature flags

Features that are not ready for users are hidden behind a flag:

```javascript
// src/features.js
export const features = {
  newCheckoutFlow: process.env.FEATURE_NEW_CHECKOUT === 'true',
  recommendationEngine: false, // disabled until v2.1 launch
};

// src/CheckoutPage.jsx
import { features } from './features';

export function CheckoutPage() {
  if (features.newCheckoutFlow) {
    return <NewCheckout />;
  }
  return <LegacyCheckout />;
}
```

This decouples **deployment** (code goes to production) from **release** (users see the feature).

### Short-lived feature branches

For changes that take more than a few hours, short-lived branches are acceptable:

```bash
git switch -c feat/recommendation-engine
# Work for 1-2 days maximum
git push -u origin feat/recommendation-engine
# Open a tiny PR
gh pr merge --squash
# Branch deleted, work integrated
```

The key: branches measured in hours or days, not weeks.

### When to use TBD

| Criterion              | Fits TBD?                                              |
|------------------------|--------------------------------------------------------|
| Deployment cadence     | Continuous deployment, multiple times per day          |
| Team size              | Any, but requires high CI maturity                     |
| Product type           | High-velocity web products, microservices              |
| Release coordination   | Handled by feature flags, not branches                 |
| Team discipline        | Requires very high test coverage and CI confidence     |

## Fork Workflow — Open Source Collaboration

The **fork workflow** is standard for open-source projects. Contributors do not have write access to the main
repository. Instead, they **fork** (copy) the repository to their own account, make changes, and submit a pull request.

```bash
# 1. Fork on GitHub (via the web UI)
# This creates https://github.com/YOU/original-repo

# 2. Clone your fork
git clone git@github.com:YOU/original-repo.git
cd original-repo

# 3. Add the original repo as "upstream"
git remote add upstream git@github.com:ORIGINAL-OWNER/original-repo.git

# 4. Create a feature branch
git switch -c fix/typo-in-readme

# 5. Make your change
git add README.md
git commit -m "docs: fix typo in installation section"

# 6. Push to YOUR fork
git push -u origin fix/typo-in-readme

# 7. Open a PR from your fork to the upstream repo
gh pr create --repo ORIGINAL-OWNER/original-repo \
  --title "docs: fix typo in installation section" \
  --body "Fixes a typo in the Prerequisites section."

# 8. Keep your fork up to date with upstream
git fetch upstream
git switch main
git merge upstream/main
git push origin main
```

### Why fork instead of branch?

In open source, maintainers cannot grant write access to every potential contributor — the contributor base is
unbounded. The fork model solves this: anyone can fork and propose changes without needing permissions, and
maintainers review PRs before anything is merged.

## Choosing the Right Workflow

| Factor                        | GitHub Flow | GitFlow    | Trunk-Based | Fork Workflow |
|-------------------------------|-------------|------------|-------------|---------------|
| **Deployment cadence**        | Continuous  | Scheduled  | Continuous  | Any           |
| **Team size**                 | Any         | Medium–large | Any        | Open source   |
| **Multiple versions**         | No          | Yes        | No          | Depends       |
| **Process complexity**        | Low         | High       | Low         | Medium        |
| **CI/CD maturity needed**     | Medium      | Low        | High        | Medium        |
| **Feature flag tooling**      | Optional    | Not needed | Required    | Optional      |

### Decision guide

- **Solo or small team, web app, CD pipeline?** → **GitHub Flow**
- **Versioned software, scheduled releases, enterprise compliance?** → **GitFlow**
- **High-velocity team, microservices, mature CI, comfortable with feature flags?** → **Trunk-based development**
- **Contributing to open source or accepting external contributions?** → **Fork workflow**

No workflow is universally "best." The best workflow is the one your team will actually follow consistently.

## Summary

You now understand:

- **GitHub Flow** — feature branches + PRs + merge to always-deployable main; simple and fast
- **GitFlow** — `main` + `develop` + feature/release/hotfix branches; structured and scheduled
- **Trunk-based development** — commit to main frequently with feature flags; maximum velocity
- **Fork workflow** — copy the repo, make changes in isolation, submit a PR; standard for open source

Next up: [Hooks and Automation](./11-hooks-and-automation.md) — enforcing standards automatically with pre-commit,
commit-msg, and pre-push hooks.
