---
title: "Remote Repositories"
sidebar_label: "Remote Repositories"
description: git clone, managing remotes, git fetch, git pull, git push, tracking branches, and upstream relationships.
slug: /git/beginners-guide/remote-repositories
tags: [git, beginners, version-control]
keywords:
  - git remote
  - git clone
  - git fetch
  - git pull
  - git push
  - tracking branch
  - upstream
  - origin
sidebar_position: 6
---

# Remote Repositories

So far, all our work has been local. Remote repositories are copies of your repository hosted on a server — GitHub,
GitLab, Bitbucket, or a self-hosted instance. They are how teams collaborate: one canonical "source of truth" that
everyone pushes to and pulls from.

This chapter covers everything you need to work confidently with remote repositories: cloning, fetching, pulling,
pushing, and understanding the tracking relationships that connect your local branches to their remote counterparts.

## git clone — Getting a Copy

`git clone` downloads a remote repository to your machine, including all branches, tags, and the full history.

```bash
git clone https://github.com/facebook/react.git
# Cloning into 'react'...
# remote: Enumerating objects: 312000, done.
# remote: Counting objects: 100% (312000/312000), done.
# Receiving objects: 100% (312000/312000), 145.42 MiB | 8.21 MiB/s, done.
```

This creates a `react/` directory with everything inside.

### Clone into a specific directory

```bash
git clone https://github.com/facebook/react.git my-react-fork
```

### Clone a specific branch

```bash
git clone --branch develop https://github.com/org/repo.git
```

### Shallow clone (for CI or quick inspection)

A shallow clone fetches only the most recent commits — much faster for large repositories when you do not need the
full history:

```bash
git clone --depth 1 https://github.com/facebook/react.git
```

After cloning, Git automatically creates:

- A remote named **`origin`** pointing to the URL you cloned from
- A local tracking branch (`main`) set up to track `origin/main`

## Understanding Remotes

A **remote** is a named URL pointing to another repository. The name `origin` is the conventional name Git uses for
the remote you cloned from. You can have multiple remotes.

### List configured remotes

```bash
git remote
# origin

git remote -v
# origin  https://github.com/you/repo.git (fetch)
# origin  https://github.com/you/repo.git (push)
```

### Add a remote

```bash
git remote add upstream https://github.com/original/repo.git
```

This is the standard pattern for **fork workflows**: `origin` points to your fork, `upstream` points to the original
repository.

```bash
git remote -v
# origin    https://github.com/you/repo.git (fetch)
# origin    https://github.com/you/repo.git (push)
# upstream  https://github.com/original/repo.git (fetch)
# upstream  https://github.com/original/repo.git (push)
```

### Rename a remote

```bash
git remote rename origin github
```

### Remove a remote

```bash
git remote remove upstream
```

### Change a remote's URL

```bash
git remote set-url origin git@github.com:you/repo.git
```

This is useful when switching between HTTPS and SSH authentication.

## SSH vs HTTPS Authentication

| Method    | URL format                              | Authentication        | When to use                      |
|-----------|-----------------------------------------|-----------------------|----------------------------------|
| **HTTPS** | `https://github.com/user/repo.git`      | Username + token      | Simple setup, firewalls           |
| **SSH**   | `git@github.com:user/repo.git`          | SSH key pair          | Daily use, no password prompts    |

To use SSH, generate a key pair and add the public key to your GitHub / GitLab account:

```bash
ssh-keygen -t ed25519 -C "you@example.com"
# Creates ~/.ssh/id_ed25519 (private) and ~/.ssh/id_ed25519.pub (public)

# Add to ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copy the public key and paste it into GitHub Settings > SSH Keys
cat ~/.ssh/id_ed25519.pub
```

## git fetch — Download Without Merging

`git fetch` downloads new commits, branches, and tags from the remote but **does not change your working tree or
local branches**. It updates the remote-tracking references (like `origin/main`).

```bash
git fetch origin
# remote: Enumerating objects: 5, done.
# remote: Counting objects: 100% (5/5), done.
# Unpacking objects: 100% (5/5), done.
# From https://github.com/you/repo
#    a1b2c3d..f4e5d6c  main     -> origin/main
```

After fetching, you can inspect what changed before integrating:

```bash
# See what commits are on origin/main that you don't have
git log main..origin/main --oneline
# f4e5d6c feat(api): add pagination to users endpoint
# 8a7b6c5 fix(auth): handle expired tokens correctly

# See the full diff
git diff main origin/main
```

Then merge or rebase:

```bash
git merge origin/main
# or
git rebase origin/main
```

### Fetch all remotes

```bash
git fetch --all
```

### Fetch and prune deleted remote branches

```bash
git fetch --prune
# or the shorter form
git fetch -p
```

After colleagues delete branches on the remote, `--prune` removes the corresponding `origin/<branch>` references from
your local repo. Without it, you accumulate stale remote-tracking branches.

## git pull — Fetch and Merge in One Step

`git pull` is a convenience command that does `git fetch` followed by `git merge` (or `git rebase` if configured):

```bash
git pull
# or explicitly:
git pull origin main
```

### Pull with rebase

```bash
git pull --rebase
```

Recommended for keeping a linear history. This fetches the latest commits and replays your local commits on top,
avoiding unnecessary merge commits.

```bash
# Make it the default
git config --global pull.rebase true
```

### When pull fails

If you have local commits that conflict with what was fetched, `git pull` will either create a merge commit (with
merge) or ask you to resolve conflicts before continuing (with rebase). Do not panic — this is normal collaboration.

## git push — Sharing Your Work

`git push` uploads your local commits to the remote repository.

```bash
# Push the current branch to its tracking remote
git push

# Push to a specific remote and branch
git push origin main

# Push a feature branch for the first time
git push -u origin feature/search
```

The `-u` (or `--set-upstream`) flag sets up the tracking relationship so that future `git push` and `git pull`
commands on this branch work without specifying the remote and branch name.

### Push all branches

```bash
git push --all origin
```

### Delete a remote branch

```bash
git push origin --delete feature/old-branch
```

### Force push (use with extreme caution)

```bash
# DANGER: overwrites remote history
git push --force origin feature/my-branch

# Safer: refuses if remote has been updated by someone else since your last fetch
git push --force-with-lease origin feature/my-branch
```

Always prefer `--force-with-lease` over `--force`. Only force-push on personal feature branches that no one else
is working on. **Never force-push to `main` or `master`.**

## Tracking Branches

A **tracking branch** is a local branch that has a relationship with a remote branch. It knows which remote branch it
corresponds to, making `git push` and `git pull` work without explicit arguments.

### View tracking relationships

```bash
git branch -vv
# * main          a1b2c3d [origin/main] Update README
#   feature/auth  9f8e7d6 [origin/feature/auth: ahead 2] Add JWT support
#   feature/old   3d2c1b0 No upstream configured
```

| Indicator              | Meaning                                                        |
|------------------------|----------------------------------------------------------------|
| `[origin/main]`        | Tracks `origin/main`, in sync                                  |
| `[origin/main: ahead 2]` | You have 2 commits to push                                   |
| `[origin/main: behind 3]` | Remote has 3 commits you need to pull                       |
| `[origin/main: ahead 1, behind 2]` | Diverged — need to merge or rebase               |

### Set up tracking manually

```bash
git branch --set-upstream-to=origin/main main

# Or when pushing for the first time
git push -u origin feature/new-branch
```

### Create a local branch from a remote branch

```bash
# Automatically sets up tracking
git switch feature/auth
# Branch 'feature/auth' set up to track remote branch 'feature/auth' from 'origin'.
# Switched to a new branch 'feature/auth'
```

Git is smart: if `feature/auth` does not exist locally but does exist on `origin`, `git switch feature/auth`
automatically creates a local tracking branch.

## The Full Remote Workflow

Here is the complete workflow for contributing to a shared repository:

```bash
# 1. Clone the repository (once)
git clone git@github.com:org/my-app.git
cd my-app

# 2. Create a feature branch
git switch -c feature/notifications

# 3. Do your work
git add src/notifications.js
git commit -m "feat(notifications): add real-time alerts"

# 4. Stay up to date with main while working
git fetch origin
git rebase origin/main

# 5. Push your branch (first time: -u to set upstream)
git push -u origin feature/notifications

# 6. Continue working and pushing updates
git add tests/notifications.test.js
git commit -m "test(notifications): add WebSocket connection tests"
git push   # Just 'git push' works now because of -u

# 7. Open a pull request on GitHub/GitLab
# (Usually done via the web UI or gh CLI)

# 8. After the PR is merged, clean up
git switch main
git pull
git branch -d feature/notifications
git push origin --delete feature/notifications
```

## Inspecting Remote Information

```bash
# Show information about a remote
git remote show origin
# * remote origin
#   Fetch URL: git@github.com:you/repo.git
#   Push  URL: git@github.com:you/repo.git
#   HEAD branch: main
#   Remote branches:
#     feature/auth tracked
#     main         tracked
#   Local branch configured for 'git pull':
#     main merges with remote main
#   Local ref configured for 'git push':
#     main pushes to main (up to date)
```

## Summary

You now understand:

- **`git clone`** — download a repository with full history and set up `origin` automatically
- **Remotes** — named URLs; `origin` by convention, `upstream` for the source of a fork
- **`git fetch`** — download changes without touching your working tree; use `--prune` to clean stale refs
- **`git pull`** — fetch and merge (or rebase) in one command
- **`git push`** — share your commits; use `-u` to set up tracking; use `--force-with-lease` carefully
- **Tracking branches** — the link between local and remote branches that makes push/pull ergonomic

Next up: [Tags and Releases](./07-tags-and-releases.md) — marking specific commits with version numbers and creating
releases.
