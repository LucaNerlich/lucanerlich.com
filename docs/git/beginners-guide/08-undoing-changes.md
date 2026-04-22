---
title: "Undoing Changes"
sidebar_label: "Undoing Changes"
description: git restore, git reset (soft/mixed/hard), git revert, git clean, amending commits, and using reflog as a safety net.
slug: /git/beginners-guide/undoing-changes
tags: [git, beginners, version-control]
keywords:
  - git restore
  - git reset
  - git revert
  - git clean
  - git reflog
  - undo git commit
  - amend commit
sidebar_position: 8
---

# Undoing Changes

One of Git's most valuable properties is that it is very hard to permanently lose work. Most "undo" operations are
reversible, and the reflog gives you a time machine to recover from almost any mistake. But there are degrees of
permanence, and the wrong command applied to the wrong situation can cause real headaches — especially on shared
branches.

This chapter covers every major undo operation, when to use each, and how to recover when things go wrong.

## The Undo Decision Tree

Before reaching for an undo command, ask:

1. **Where is the change?** In the working tree? In the staging area? Already committed? Already pushed?
2. **Is the change on a shared branch?** If yes, prefer `git revert` over anything that rewrites history.
3. **How many commits back?** The answer changes which command to use.

| Situation                                  | Command                                   |
|--------------------------------------------|-------------------------------------------|
| Discard unstaged changes in a file         | `git restore <file>`                      |
| Unstage a staged file                      | `git restore --staged <file>`             |
| Undo last commit, keep changes staged      | `git reset --soft HEAD~1`                 |
| Undo last commit, keep changes unstaged    | `git reset --mixed HEAD~1`                |
| Undo last commit, discard changes          | `git reset --hard HEAD~1`                 |
| Undo a pushed commit safely                | `git revert <hash>`                       |
| Remove untracked files from working tree   | `git clean -fd`                           |
| Amend the last commit message or content   | `git commit --amend`                      |
| Recover a dropped commit or branch         | `git reflog`                              |

## git restore — Discarding Working Tree Changes

`git restore` discards changes in the working tree, reverting a file to its last committed (or staged) state. This is
the modern replacement for `git checkout -- <file>`.

### Discard unstaged changes in a file

```bash
# You edited src/auth.js but changed your mind
git restore src/auth.js
```

The file is restored to its state in the last commit. **This discards your edits permanently** — there is no undo.
Be sure before running it.

### Discard all unstaged changes

```bash
git restore .
```

### Unstage a staged file (without discarding changes)

```bash
git add README.md
git restore --staged README.md
# README.md is now unstaged but the edit is still in the working tree
```

This is equivalent to the old `git reset HEAD <file>`.

### Restore a file from a specific commit

```bash
git restore --source a1b2c3d src/config.js
```

Useful for pulling a single file out of history without checking out the whole commit.

### Restore a file from a specific branch

```bash
git restore --source origin/main src/config.js
```

## git reset — Moving the Branch Pointer

`git reset` moves the current branch pointer to a different commit. It is more powerful than `git restore` because it
affects the commit history, not just individual files.

Git reset has three modes, controlling what happens to the staging area and working tree after the branch pointer moves:

| Mode       | Branch pointer | Staging area     | Working tree     | Use when                                       |
|------------|----------------|------------------|------------------|------------------------------------------------|
| `--soft`   | Moved          | Unchanged (staged)| Unchanged        | Keep changes staged, ready to recommit         |
| `--mixed`  | Moved          | Reset to target  | Unchanged        | Keep changes in working tree (default mode)    |
| `--hard`   | Moved          | Reset to target  | Reset to target  | Permanently discard all changes                |

### -soft: undo commit, keep changes staged

```bash
git reset --soft HEAD~1
```

The last commit is gone from the history, but all the changes it contained are back in the staging area, ready to be
committed again (perhaps with a different message or after adding more files).

Useful for: "I committed too early — I have more to add to this commit."

```bash
git reset --soft HEAD~1
# Make more changes
git add additional-file.js
git commit -m "feat(auth): complete login flow with remember-me"
```

### -mixed: undo commit, keep changes unstaged (default)

```bash
git reset HEAD~1
# or explicitly:
git reset --mixed HEAD~1
```

The last commit is gone, and its changes are back in your working tree but not staged. You can review them, modify
them, and re-add selectively.

Useful for: "I want to split this commit into multiple smaller commits."

```bash
git reset HEAD~1
git add src/auth.js
git commit -m "feat(auth): add login endpoint"
git add src/session.js
git commit -m "feat(session): add session management"
```

### -hard: undo commit, discard changes permanently

```bash
git reset --hard HEAD~1
```

The last commit is gone and all changes in it are **permanently discarded** from your working tree and staging area.
This is the most destructive form of reset.

Useful for: "This whole commit was a mistake — throw it away completely."

```bash
# Go back 3 commits and discard everything since then
git reset --hard HEAD~3

# Reset to match remote (discard ALL local commits not on origin)
git reset --hard origin/main
```

> **Warning:** `git reset --hard` discards changes with no easy recovery path. The only way back is via `git reflog`
> (see below). Never run `--hard` on a shared branch.

### Reset to a specific commit

```bash
git log --oneline
# f1e2d3c (HEAD -> main) bad feature
# a9b8c7d good state
# 5d4e3f2 Initial commit

git reset --hard a9b8c7d
```

## git revert — Safe Undo for Shared History

`git revert` creates a **new commit** that undoes the changes of a previous commit. It never rewrites history — it
adds to it. This makes it safe to use on shared branches.

```bash
git revert a1b2c3d
# Opens editor with message: "Revert "feat(auth): add login endpoint""
# Creates new commit that undoes the specified commit
```

### Revert without opening the editor

```bash
git revert --no-edit a1b2c3d
```

### Revert a range of commits

```bash
# Revert last 3 commits (creates 3 revert commits)
git revert HEAD~3..HEAD

# Revert without committing (stage all reverts first, then commit once)
git revert --no-commit HEAD~3..HEAD
git commit -m "revert: roll back broken authentication changes"
```

### Revert vs Reset

| Aspect                       | `git revert`                         | `git reset`                           |
|------------------------------|--------------------------------------|---------------------------------------|
| **Rewrites history**         | No — adds a new commit               | Yes — removes commits from history    |
| **Safe on shared branches**  | Yes                                  | No                                    |
| **Undoes pushed commits**    | Yes                                  | Requires force-push (dangerous)       |
| **Creates a commit**         | Yes                                  | No                                    |
| **Traceability**             | Visible in log as a revert           | Commit disappears from history        |

When in doubt on a shared branch: **always use `git revert`**.

## Amending the Last Commit

If you just committed but need to:
- Fix a typo in the commit message
- Add a file you forgot to stage
- Remove a file you accidentally staged

```bash
# Fix the message only
git commit --amend -m "feat(auth): add login endpoint with rate limiting"

# Add a forgotten file to the commit
git add forgotten.js
git commit --amend --no-edit

# Remove a file from the last commit (unstage then amend)
git restore --staged accidentally-staged.env
git commit --amend --no-edit
```

> **Warning:** `--amend` rewrites the last commit (new hash). If the commit has already been pushed, you will need
> to force-push to update the remote — and your colleagues will face conflicts. Only amend unpushed commits.

## git clean — Remove Untracked Files

`git clean` removes files that are not tracked by Git (i.e., not in the staging area or history). Useful for cleaning
up build artifacts, generated files, or test outputs that are not in `.gitignore`.

```bash
# Preview what would be deleted (always do this first)
git clean -n
# Would remove build/
# Would remove coverage/
# Would remove temp.log

# Delete untracked files
git clean -f

# Delete untracked files AND directories
git clean -fd

# Delete untracked files including those in .gitignore
git clean -fdx
```

> **Warning:** `git clean` is irreversible. There is no recycle bin and no reflog for untracked files. Always run
> `git clean -n` first to preview what will be deleted.

## git reflog — Your Safety Net

The **reflog** is Git's journal of everywhere `HEAD` has been. Every time a branch tip moves — whether from a commit,
reset, checkout, rebase, or merge — an entry is added. The reflog is local and private; it is not pushed to remotes.

```bash
git reflog
# a1b2c3d (HEAD -> main) HEAD@{0}: reset: moving to HEAD~1
# f4e5d6c HEAD@{1}: commit: feat(auth): add login endpoint
# 9g8h7i6 HEAD@{2}: commit: feat(db): add users table
# c3d4e5f HEAD@{3}: checkout: moving from feature/auth to main
```

Each entry is `HEAD@{N}` where `N` is how many moves ago it was.

### Recovering a dropped commit

```bash
# You ran git reset --hard and lost a commit
git reflog
# f4e5d6c HEAD@{1}: commit: feat(auth): add login endpoint

# Recover it by creating a branch pointing to it
git branch recovery/lost-auth f4e5d6c

# Or reset back to it
git reset --hard f4e5d6c
```

### Recovering a deleted branch

```bash
# You ran: git branch -D feature/payment (oops)
git reflog
# 8a7b6c5 HEAD@{3}: commit: feat(payment): add Stripe integration

# Re-create the branch
git branch feature/payment 8a7b6c5
```

### Reflog for a specific branch

```bash
git reflog show feature/auth
```

### Reflog expiry

By default, reflog entries expire after 90 days (or 30 days for entries that are unreachable). You have plenty of
time to recover from mistakes.

## Practical Recovery Scenarios

### Scenario 1: Committed to main by mistake

```bash
# You committed directly to main instead of a feature branch
git branch feature/my-feature    # Save the commit on a new branch
git reset --hard HEAD~1          # Remove the commit from main
git switch feature/my-feature    # Continue working on the feature branch
```

### Scenario 2: Squashed a commit too aggressively

```bash
# You ran git rebase -i and squashed something you needed
git reflog
# 3f2e1d0 HEAD@{1}: rebase -i (finish): returning to refs/heads/feature/auth
# 9a8b7c6 HEAD@{2}: rebase -i (squash): feat(auth): add complete auth flow
# d6e5f4a HEAD@{3}: rebase -i (pick): feat(auth): add login form

# The original commits are still in reflog
git reset --hard HEAD@{3}
```

### Scenario 3: Accidental -hard reset

```bash
# You ran git reset --hard and lost uncommitted work
# Unfortunately, uncommitted work is NOT in the reflog
# However, if you HAD committed before the reset:
git reflog
# Find the commit hash before the reset
git reset --hard <hash-before-reset>
```

> **Key insight:** The reflog only tracks committed snapshots. Work that was **never committed** cannot be recovered
> after a `--hard` reset. Commit often — even WIP commits you plan to clean up — to protect your work.

## Summary

You now understand:

- **`git restore`** — discard working tree changes or unstage files
- **`git reset --soft/--mixed/--hard`** — move the branch pointer with varying levels of destructiveness
- **`git revert`** — the safe, history-preserving way to undo committed changes on shared branches
- **`git clean`** — remove untracked files (preview with `-n` first!)
- **`git commit --amend`** — fix the last commit before it is shared
- **`git reflog`** — your time machine for recovering from almost any mistake

Next up: [Advanced Commands](./09-advanced-commands.md) — git stash, cherry-pick, bisect, blame, and shortlog.
