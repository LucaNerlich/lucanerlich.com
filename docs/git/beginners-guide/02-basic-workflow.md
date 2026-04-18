---
title: "Basic Workflow"
sidebar_label: "Basic Workflow"
description: git add, git commit, git status, git log, git diff, and writing good commit messages with Conventional Commits.
slug: /git/beginners-guide/basic-workflow
tags: [git, beginners, version-control]
keywords:
  - git add
  - git commit
  - git status
  - git log
  - git diff
  - conventional commits
  - commit messages
sidebar_position: 2
---

# Basic Workflow

The basic Git workflow is a cycle you will repeat many times each day: **edit files**, **stage changes**, **commit
snapshots**. This chapter walks through each step in detail and shows you how to read the history you are building.

## git status — Know Where You Stand

`git status` is your most-used Git command. Run it constantly. It tells you:

- Which branch you are on
- Which files have been modified
- Which changes are staged (ready to commit)
- Which files are untracked (not yet known to Git)

```bash
git status
```

The output has three sections:

```
On branch main

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   src/index.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        notes.txt
```

| Section                     | Meaning                                                             |
|-----------------------------|---------------------------------------------------------------------|
| **Changes to be committed** | Staged — will go into the next commit                               |
| **Changes not staged**      | Modified tracked files — Git sees the change but it is not staged   |
| **Untracked files**         | New files Git has never seen — not staged and not committed         |

### Short status

For a compact view, use `-s` (short):

```bash
git status -s
# M  README.md      # Modified and staged
#  M notes.txt      # Modified but not staged
# ?? scratch.txt    # Untracked
```

The two columns represent: first = staging area, second = working tree. `??` means untracked.

## git add — Staging Changes

`git add` moves changes from the working tree into the staging area.

### Add a specific file

```bash
git add README.md
```

### Add multiple files

```bash
git add src/index.js src/utils.js
```

### Add an entire directory

```bash
git add src/
```

### Add all changes in the repository

```bash
git add .
```

> **Caution:** `git add .` is convenient but adds everything, including files you might not want to commit. Prefer
> adding specific files or directories when precision matters.

### Add parts of a file (interactive staging)

This is one of Git's most powerful features. You can stage individual **hunks** (sections) of a file, so a single
file can have some changes staged and others not:

```bash
git add -p README.md
# Git walks through each hunk and asks what to do:
# Stage this hunk [y,n,q,a,d,s,?]?
#   y = stage this hunk
#   n = skip this hunk
#   s = split into smaller hunks
#   q = quit (stage nothing else)
```

This lets you make several logical changes to one file and commit them as separate, focused commits.

## git commit — Saving a Snapshot

Once you have staged the changes you want, `git commit` saves them permanently in the repository history.

```bash
git commit -m "Add README with project overview"
```

### What happens on commit

1. Git takes all staged changes
2. Creates a new **tree object** representing the project at this point
3. Creates a **commit object** containing: the tree, the parent commit hash, your name, email, timestamp, and message
4. Updates the current branch to point to the new commit

```bash
git commit -m "Add README with project overview"
# [main (root-commit) a1b2c3d] Add README with project overview
#  1 file changed, 1 insertion(+)
#  create mode 100644 README.md
```

### Commit without -m (opens editor)

```bash
git commit
```

This opens your configured editor, letting you write a longer commit message. The file format:

```
Short summary (50 chars or less)

Longer explanation of what was changed and why. This body is
optional but very valuable for future readers. Wrap at 72 chars.

Refs: #42
```

### Amend the last commit

If you forgot to stage a file or made a typo in the message, you can amend the most recent commit **before pushing**:

```bash
git add forgotten-file.js
git commit --amend -m "Add login form with validation"
```

> **Warning:** Amending rewrites the commit. Never amend commits that have already been pushed and shared with others —
> it rewrites history and causes problems for anyone who has pulled your changes.

### Commit all tracked changes at once

```bash
git commit -am "Fix typo in error message"
```

The `-a` flag stages all modifications to **already-tracked** files and commits them. It does not add untracked files.

## git diff — Seeing What Changed

`git diff` shows the line-by-line differences between states.

### Working tree vs staging area (unstaged changes)

```bash
git diff
```

This shows what you have changed but not yet staged.

### Staging area vs last commit (staged changes)

```bash
git diff --staged
# or equivalently:
git diff --cached
```

This shows what will go into the next commit.

### Two commits

```bash
git diff a1b2c3d f4e5d6c
```

### Current state vs a specific commit

```bash
git diff HEAD~3
```

### Reading a diff

```diff
diff --git a/src/app.js b/src/app.js
index 83db48f..bf268d7 100644
--- a/src/app.js
+++ b/src/app.js
@@ -10,7 +10,7 @@ function greet(name) {
-  return "Hello, " + name;
+  return `Hello, ${name}!`;
 }
```

| Symbol | Meaning                       |
|--------|-------------------------------|
| `---`  | The old version of the file   |
| `+++`  | The new version of the file   |
| `-`    | A line that was removed       |
| `+`    | A line that was added         |
| ` `    | A line that is unchanged      |

## git log — Reading History

`git log` shows the commit history.

### Default output

```bash
git log
# commit a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
# Author: Your Name <you@example.com>
# Date:   Fri Apr 18 10:30:00 2025 +0200
#
#     Add README with project overview
```

### Compact one-line format

```bash
git log --oneline
# a1b2c3d Add README with project overview
# 9f8e7d6 Initial project structure
```

### Visual branch graph

```bash
git log --oneline --graph --all
# * a1b2c3d (HEAD -> main) Add login form
# * 9f8e7d6 Add project structure
# | * f1e2d3c (feature/auth) Add JWT middleware
# |/
# * c4b5a69 Initial commit
```

### Filter by author

```bash
git log --author="Your Name"
```

### Filter by date

```bash
git log --since="2025-01-01" --until="2025-04-01"
```

### Filter by commit message

```bash
git log --grep="fix"
```

### Show changes in each commit

```bash
git log -p
```

### Show files changed in each commit

```bash
git log --stat
```

### Useful combination

```bash
git log --oneline --graph --decorate --all
```

`--decorate` adds branch and tag names next to the relevant commits.

## Writing Good Commit Messages

A commit message is a letter to your future self and your teammates. A good message explains **what** changed and **why**
— not just "fixed stuff". Good messages make `git log` a useful project journal instead of an inscrutable list of hashes.

### The 50/72 rule

- **First line:** 50 characters or fewer. This is the subject. It appears in `git log --oneline`, GitHub PR views, and
  email notifications.
- **Blank line:** separates the subject from the body.
- **Body lines:** 72 characters per line. Explain *what* and *why*, not *how* (the code shows the how).

```
Add rate limiting to the login endpoint

Without rate limiting, the login endpoint was vulnerable to brute-force
attacks. Added a sliding-window rate limiter that allows 5 attempts per
minute per IP address. Returns HTTP 429 with a Retry-After header when
the limit is exceeded.

Closes #147
```

### Conventional Commits

**Conventional Commits** is a specification for commit messages that makes history machine-readable. It is used by
tools that auto-generate changelogs, determine semantic version bumps, and power CI pipelines.

Format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

#### Types

| Type       | When to use                                              |
|------------|----------------------------------------------------------|
| `feat`     | A new feature                                            |
| `fix`      | A bug fix                                                |
| `docs`     | Documentation changes only                               |
| `style`    | Formatting, missing semicolons — no logic change         |
| `refactor` | Code restructure without feature change or bug fix       |
| `test`     | Adding or updating tests                                 |
| `chore`    | Build process, tooling, dependency updates               |
| `perf`     | Performance improvements                                 |
| `ci`       | CI/CD configuration changes                              |
| `revert`   | Revert a previous commit                                 |

#### Examples

```
feat(auth): add OAuth2 login with Google

fix(cart): prevent duplicate items when clicking rapidly

docs(api): update authentication endpoint examples

chore(deps): bump express from 4.18.1 to 4.19.2

feat!: remove support for Node 16

BREAKING CHANGE: Node 16 reached end-of-life. The minimum supported
version is now Node 18.
```

The `!` after the type signals a **breaking change**. Breaking changes can also be noted in the footer with
`BREAKING CHANGE:`.

### Why Conventional Commits matter

```bash
# Tools like standard-version or semantic-release can automatically:
# - Determine the next version number from commit types
# - Generate a CHANGELOG.md from commit history
# - Create GitHub releases with release notes

npx standard-version
# Bumped version 1.2.0 → 1.3.0 based on feat commits
# Generated CHANGELOG.md
# Tagged v1.3.0
```

### Anti-patterns to avoid

| Bad message              | Problem                                        | Better                                    |
|--------------------------|------------------------------------------------|-------------------------------------------|
| `fix`                    | No context at all                              | `fix(checkout): handle empty cart state`  |
| `WIP`                    | Work in progress should not be committed       | Squash before merging                     |
| `changes`                | Meaningless                                    | Describe what changed and why             |
| `fixed the bug`          | Which bug? What fix?                           | `fix(parser): handle null input in lexer` |
| `asdfgh`                 | Clearly a placeholder                          | Take five seconds to write a real message |

## Putting It All Together — A Complete Workflow

Here is a realistic example of a feature being developed:

```bash
# Start on main, create a feature branch (covered in ch. 3)
git switch -c feature/user-registration

# Edit files in your editor...
# Check what changed
git status
git diff

# Stage the migration and the model separately
git add db/migrations/001_create_users.sql
git commit -m "feat(db): add users table migration"

git add src/models/User.js
git commit -m "feat(user): add User model with password hashing"

git add src/routes/auth.js
git commit -m "feat(auth): add POST /register endpoint"

git add tests/auth.test.js
git commit -m "test(auth): add registration endpoint tests"

# Review your work before pushing
git log --oneline
# 4a3b2c1 test(auth): add registration endpoint tests
# 8f7e6d5 feat(auth): add POST /register endpoint
# 2c1b0a9 feat(user): add User model with password hashing
# 9e8d7c6 feat(db): add users table migration
```

Each commit is small, focused, and describes exactly what it does. Someone reading the history six months later can
understand the entire feature implementation at a glance.

## Summary

You now know:

- `git status` — see the state of every file in your working tree and staging area
- `git add` — move changes into the staging area, including partial-file staging with `-p`
- `git commit` — save a snapshot with a meaningful message
- `git diff` — inspect changes between any two states
- `git log` — read the project history with powerful filters and display options
- **Good commit messages** — the 50/72 rule and Conventional Commits

Next up: [Branches](./03-branches.md) — what branches are, how to create and switch between them, and when to use them.
