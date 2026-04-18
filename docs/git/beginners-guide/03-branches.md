---
title: "Branches"
sidebar_label: "Branches"
description: What branches are, creating and switching between them, deleting branches, HEAD and detached HEAD state, and when to branch.
slug: /git/beginners-guide/branches
tags: [git, beginners, version-control]
keywords:
  - git branch
  - git switch
  - git checkout
  - head
  - detached head
  - branching strategy
sidebar_position: 3
---

# Branches

A branch is one of Git's most powerful features and one of its most misunderstood. In many version control systems,
branching is a heavyweight operation — copying directories, taking minutes, and discouraging frequent use. In Git, a
branch is simply a **movable pointer** to a commit. Creating one takes milliseconds and costs almost no disk space.

Understanding branches unlocks the ability to work on multiple features in parallel, experiment without risk, and
collaborate with a team without stepping on each other's work.

## What Is a Branch?

Every commit in Git has a unique hash. A branch is a named reference that points to one specific commit. When you make
a new commit on a branch, the branch pointer automatically moves forward to the new commit.

Consider this history:

```
A ── B ── C   ← main
```

When you create a branch called `feature/login`, it also points to `C`:

```
A ── B ── C   ← main
          ↑
       feature/login
```

When you commit on `feature/login`, the new commit `D` is added, and `feature/login` moves forward while `main` stays
put:

```
A ── B ── C   ← main
          └── D   ← feature/login
```

This divergence is the whole point of branches: independent lines of work that can later be merged back together.

## HEAD — Where You Are

`HEAD` is a special pointer that tells Git which commit you are currently on. Usually, `HEAD` points to a branch, and
that branch points to a commit. When you make a commit, the branch moves forward, and HEAD follows.

```bash
cat .git/HEAD
# ref: refs/heads/main
```

`HEAD -> main` means: you are on the `main` branch.

## Listing Branches

```bash
# List local branches
git branch
# * main
#   feature/login
#   bugfix/null-pointer

# List all branches (local and remote)
git branch -a
# * main
#   feature/login
#   remotes/origin/main
#   remotes/origin/feature/auth

# List branches with last commit info
git branch -v
# * main          a1b2c3d Add README
#   feature/login 9f8e7d6 Add login form
```

The `*` marks the current branch.

## Creating a Branch

```bash
git branch feature/login
```

This creates the branch pointing at your current commit but **does not switch to it**. You are still on your original
branch. Run `git branch` to confirm:

```bash
git branch
# * main
#   feature/login
```

## Switching Branches

### git switch (recommended — Git 2.23+)

```bash
git switch feature/login
# Switched to branch 'feature/login'
```

### git checkout (older syntax, still works)

```bash
git checkout feature/login
# Switched to branch 'feature/login'
```

### Create and switch in one command

```bash
# Modern syntax
git switch -c feature/payment

# Old syntax
git checkout -b feature/payment
```

This is the most common way to start work on a new feature — you almost always want to switch to a new branch
immediately after creating it.

### Switch back to main

```bash
git switch main
```

When you switch branches, Git:

1. Updates `HEAD` to point to the new branch
2. Updates your working tree to match the snapshot that branch points to
3. Updates the staging area

If you have uncommitted changes that conflict with the target branch, Git will refuse to switch and warn you. Commit or
stash your changes first (stashing is covered in chapter 9).

## A Typical Branch Workflow

```bash
# Start from an up-to-date main
git switch main
git pull

# Create a feature branch
git switch -c feature/dark-mode

# Do your work
# ... edit files ...
git add src/theme.css src/ThemeToggle.jsx
git commit -m "feat(ui): add dark mode toggle"

# ... more work ...
git add tests/ThemeToggle.test.jsx
git commit -m "test(ui): add dark mode toggle tests"

# Check your branch history
git log --oneline
# 3f2e1d0 test(ui): add dark mode toggle tests
# 8a7b6c5 feat(ui): add dark mode toggle
# a1b2c3d (main) Previous commit on main

# When done, merge back (covered in ch. 4)
git switch main
git merge feature/dark-mode
```

## Renaming a Branch

```bash
# Rename the current branch
git branch -m new-name

# Rename a specific branch
git branch -m old-name new-name
```

## Deleting a Branch

Once a branch has been merged, you can safely delete it:

```bash
git branch -d feature/login
# Deleted branch feature/login (was 9f8e7d6).
```

Git will refuse to delete a branch that has unmerged commits (it protects you from losing work):

```bash
git branch -d feature/experimental
# error: The branch 'feature/experimental' is not fully merged.
# If you are sure you want to delete it, run 'git branch -D feature/experimental'.
```

To force-delete an unmerged branch (discarding its commits):

```bash
git branch -D feature/experimental
```

> **Warning:** `git branch -D` discards commits that exist only on that branch. Make sure you really do not need them.
> If you accidentally delete a branch, `git reflog` (covered in chapter 8) can help you recover the commits.

### Delete a remote branch

```bash
git push origin --delete feature/login
```

## Detached HEAD State

Normally, `HEAD` points to a branch, which points to a commit. **Detached HEAD** happens when `HEAD` points directly
to a commit hash instead of a branch.

```bash
git checkout a1b2c3d
# Note: switching to 'a1b2c3d'.
#
# You are in 'detached HEAD' state. You can look around, make experimental
# changes and commit them, and you can discard any commits you make in this
# state without impacting any branches by switching back to a branch.
```

This is useful for:

- **Inspecting old code** — browse how the project looked at a specific commit
- **Running old tests** — reproduce a bug that existed at a known commit
- **Experimental work** — try something without committing to a branch name

When you are in detached HEAD state:

```bash
git status
# HEAD detached at a1b2c3d
```

### Returning to normal

```bash
# Go back to a branch
git switch main
```

### Saving work from detached HEAD

If you make commits in detached HEAD state and want to keep them, create a branch **before** switching away:

```bash
git switch -c experiment/cache-layer
# Saved the experimental commits on a named branch
```

If you switch away without creating a branch, those commits become **unreachable** and will eventually be garbage-collected
by Git. You can still recover them with `git reflog` shortly after, but it is better to save them proactively.

## Branch Naming Conventions

Good branch names communicate intent. Common conventions:

| Pattern              | Example                         | Used for                      |
|----------------------|---------------------------------|-------------------------------|
| `feature/<name>`     | `feature/user-authentication`   | New features                  |
| `fix/<name>`         | `fix/null-pointer-on-empty-cart`| Bug fixes                     |
| `bugfix/<name>`      | `bugfix/session-timeout`        | Bug fixes (alternative)       |
| `hotfix/<name>`      | `hotfix/critical-payment-error` | Urgent production fixes       |
| `release/<version>`  | `release/2.4.0`                 | Release preparation branches  |
| `chore/<name>`       | `chore/upgrade-dependencies`    | Maintenance work              |
| `docs/<name>`        | `docs/api-reference`            | Documentation only            |
| `experiment/<name>`  | `experiment/new-rendering-engine` | Exploratory work             |

Tips:
- Use **lowercase with hyphens**, not underscores or camelCase
- Be **descriptive** — `fix/login` is too vague, `fix/login-redirect-loop-after-oauth` is clear
- Avoid **very long names** — they are hard to type and read in terminal output

## When to Branch

Branch early and often. Branches are cheap in Git. Good times to create a branch:

- Starting any new feature, no matter how small
- Fixing any bug
- Experimenting with an idea you are not sure about
- Working on a pull request / code review
- Preparing a release
- Performing a risky refactor

**Do not** commit directly to `main` (or `master`) except in personal, solo projects. Even alone, branching gives you
a clean history and a place to revert if something goes wrong.

## Viewing Branch History Visually

```bash
git log --oneline --graph --all
# * 4d3c2b1 (HEAD -> feature/dark-mode) feat(ui): add dark mode tests
# * 9e8f7a6 feat(ui): add dark mode toggle
# | * 2a1b0c9 (feature/payment) feat(payment): add Stripe integration
# |/
# * a1b2c3d (main, origin/main) feat(auth): merge login feature
# * 8f7e6d5 Initial commit
```

This graph shows:
- `feature/dark-mode` and `feature/payment` branched from the same `main` commit
- `HEAD` is on `feature/dark-mode`
- `origin/main` (the remote) matches the local `main`

## Summary

You now understand:

- A **branch** is a lightweight pointer to a commit — not a copy of the codebase
- `git branch <name>` creates a branch; `git switch <name>` switches to it
- `git switch -c <name>` creates and switches in one command
- `HEAD` points to your current location; **detached HEAD** points directly to a commit
- Branches should be **deleted after merging** to keep the repository clean
- Branch **naming conventions** communicate intent and integrate with workflows

Next up: [Merging](./04-merging.md) — bringing branches back together with fast-forward merges, three-way merges, and
conflict resolution.
