---
title: "Advanced Commands"
sidebar_label: "Advanced Commands"
description: git stash, git cherry-pick, git bisect for bug hunting, git blame, and git shortlog.
slug: /git/beginners-guide/advanced-commands
tags: [git, beginners, version-control]
keywords:
  - git stash
  - git cherry-pick
  - git bisect
  - git blame
  - git shortlog
  - stash pop
  - binary search git
sidebar_position: 9
---

# Advanced Commands

With the fundamentals mastered, this chapter covers a set of commands that experienced Git users reach for regularly.
Each one solves a specific problem: temporarily shelving unfinished work, transplanting single commits between branches,
hunting down the commit that introduced a bug, and understanding who wrote what.

## git stash — Shelving Unfinished Work

You are halfway through a feature when your team lead asks you to fix an urgent bug on `main`. Your working tree has
uncommitted changes that you do not want to commit yet. `git stash` saves your current work-in-progress to a temporary
stack and restores the working tree to the last commit.

### Save the current state

```bash
git stash
# Saved working directory and index state WIP on feature/dark-mode: a1b2c3d Add toggle button

git status
# On branch feature/dark-mode
# nothing to commit, working tree clean
```

### Save with a descriptive message

```bash
git stash push -m "Dark mode: halfway through CSS variables"
```

Always give your stash a name if you might have multiple stashes — the default message (`WIP on <branch>`) becomes
confusing fast.

### Include untracked files in the stash

By default, `git stash` only stashes tracked files. To include untracked files:

```bash
git stash push --include-untracked -m "Include new files"
# or the short form:
git stash push -u -m "Include new files"
```

To also include files in `.gitignore`:

```bash
git stash push --all -m "Full working tree"
```

### List all stashes

```bash
git stash list
# stash@{0}: On feature/dark-mode: Dark mode: halfway through CSS variables
# stash@{1}: WIP on feature/auth: some unfinished work
```

Stashes are stored as a stack — `stash@{0}` is always the most recent.

### Apply the most recent stash

```bash
git stash pop
```

`pop` applies the stash and then removes it from the stash list.

### Apply a stash without removing it

```bash
git stash apply stash@{1}
```

Useful when you want to apply the same stash to multiple branches.

### Show the contents of a stash

```bash
git stash show
# src/theme.css | 23 +++++++++++++++++
# src/ThemeToggle.jsx | 15 ++++++++++

git stash show -p
# Full diff output
```

### Drop a stash

```bash
git stash drop stash@{0}
```

### Clear all stashes

```bash
git stash clear
```

### Create a branch from a stash

```bash
git stash branch feature/dark-mode-v2 stash@{0}
# Creates a new branch from the commit the stash was made on,
# applies the stash, and drops it if successful
```

This is the cleanest way to resume work when the branch has moved on and the stash conflicts.

## git cherry-pick — Transplanting Commits

`git cherry-pick` applies the changes from one or more specific commits to the current branch, creating new commits.
It is like copying a commit from one branch to another.

### Cherry-pick a single commit

```bash
git log --oneline feature/auth
# 8a7b6c5 feat(auth): add password validation helper
# 3d2c1b0 feat(auth): add login form (you do not need this one)
# 9e8f7a6 Initial auth setup

git switch main
git cherry-pick 8a7b6c5
# [main f1e2d3c] feat(auth): add password validation helper
#  Date: Fri Apr 18 10:00:00 2025
#  1 file changed, 25 insertions(+)
```

The password validation commit is now on `main` with a new hash (it is a copy, not a move).

### Cherry-pick a range of commits

```bash
# Cherry-pick commits from A to B (inclusive, oldest first)
git cherry-pick A..B
```

Note: the `A..B` range excludes `A`. To include `A`:

```bash
git cherry-pick A^..B
```

### Cherry-pick without committing

```bash
git cherry-pick --no-commit 8a7b6c5
# Applies the changes but leaves them staged, not committed
# Useful when you want to combine cherry-picks into one commit
```

### Handle cherry-pick conflicts

```bash
git cherry-pick 8a7b6c5
# CONFLICT (content): Merge conflict in src/auth.js
# error: could not apply 8a7b6c5...

# Resolve conflicts in the file, then:
git add src/auth.js
git cherry-pick --continue

# Or abort the cherry-pick
git cherry-pick --abort
```

### When to use cherry-pick

| Good use cases                                              | Bad use cases                                    |
|-------------------------------------------------------------|--------------------------------------------------|
| Backporting a bug fix to a release branch                   | Moving an entire feature branch to `main`        |
| Pulling a single utility function from a feature branch     | Duplicating commits regularly (leads to confusion) |
| Applying a hotfix to multiple release branches              | As a substitute for a proper merge workflow      |

Cherry-pick creates **duplicate commits** (different hashes, same content). When the original branch is eventually
merged, Git may identify the duplicate changes and handle them — but it can also cause confusing conflicts. Use
cherry-pick deliberately, not habitually.

## git bisect — Binary Search for Bugs

`git bisect` helps you find the exact commit that introduced a bug using binary search. Instead of manually checking
out commit after commit, Git does the math and halves the search space with each step.

### Scenario

Your app worked at `v1.0.0`. The current `HEAD` is broken. Somewhere in 200 commits, something went wrong.

### Step 1 — Start bisect

```bash
git bisect start
```

### Step 2 — Mark the known bad commit (HEAD)

```bash
git bisect bad
```

### Step 3 — Mark a known good commit

```bash
git bisect good v1.0.0
# Bisecting: 99 revisions left to test after this (roughly 7 steps)
# [a1b2c3d] feat(api): add pagination
```

Git checks out the midpoint commit.

### Step 4 — Test and mark

Test the current commit. Does the bug exist?

```bash
# If the bug exists:
git bisect bad

# If the bug does not exist:
git bisect good
```

Git checks out a new midpoint each time, halving the search space.

### Step 5 — Git finds the culprit

After roughly `log2(200) ≈ 8` steps:

```bash
# After marking a few good/bad:
# f4e5d6c is the first bad commit
# commit f4e5d6c
# Author: Developer Name <dev@example.com>
# Date:   Thu Apr 10 09:30:00 2025
#
#     refactor(parser): simplify expression evaluation
```

### Step 6 — End bisect

```bash
git bisect reset
# Back to HEAD and your original branch
```

### Automate bisect with a test script

If you have a script that exits `0` for good and non-zero for bad:

```bash
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
git bisect run npm test
# Git runs npm test at each step and automatically marks good/bad
# Returns the first bad commit
git bisect reset
```

This can reduce a bug hunt from hours to minutes.

## git blame — Who Wrote This Line?

`git blame` annotates every line of a file with the commit hash, author, and date of the last change to that line.

```bash
git blame src/auth.js
# a1b2c3d (Alice Smith   2025-03-15 10:00:00 +0200 1) import jwt from 'jsonwebtoken';
# f4e5d6c (Bob Jones     2025-04-01 14:30:00 +0200 2)
# a1b2c3d (Alice Smith   2025-03-15 10:00:00 +0200 3) export function generateToken(userId) {
# 9g8h7i6 (Carol White   2025-04-10 09:15:00 +0200 4)   const expiry = process.env.TOKEN_EXPIRY ?? '24h';
# a1b2c3d (Alice Smith   2025-03-15 10:00:00 +0200 5)   return jwt.sign({ userId }, process.env.JWT_SECRET, {
# 9g8h7i6 (Carol White   2025-04-10 09:15:00 +0200 6)     expiresIn: expiry
# a1b2c3d (Alice Smith   2025-03-15 10:00:00 +0200 7)   });
# a1b2c3d (Alice Smith   2025-03-15 10:00:00 +0200 8) }
```

### Blame a specific line range

```bash
git blame -L 20,40 src/auth.js
```

### Blame ignoring whitespace changes

```bash
git blame -w src/auth.js
```

### Blame from a specific commit

```bash
git blame v1.0.0 src/auth.js
```

### From blame to the commit

Once you find the commit hash from `git blame`, use `git show` to see the full commit:

```bash
git show 9g8h7i6
# Shows the diff and commit message for that hash
```

> **Note on culture:** `git blame` is a debugging tool, not an accusation. The goal is to understand context —
> "what was the reasoning here?" — not to assign fault. In a healthy team, anyone should be able to run `git blame`
> without it creating interpersonal tension.

## git shortlog — Summarise Contributions

`git shortlog` groups commits by author, making it easy to see who has contributed what to a project.

```bash
git shortlog
# Alice Smith (28):
#       feat(auth): add login endpoint
#       feat(auth): add password reset
#       ...
#
# Bob Jones (14):
#       feat(api): add user list endpoint
#       fix(api): handle empty results
#       ...
```

### Summary (commit count only)

```bash
git shortlog -sn
# 28  Alice Smith
# 14  Bob Jones
#  9  Carol White
```

`-s` shows only the count, `-n` sorts by count (descending).

### For a specific date range

```bash
git shortlog -sn --since="2025-01-01" --until="2025-04-01"
```

### For a specific branch or range

```bash
git shortlog -sn v1.0.0..HEAD
# Shows contributions since v1.0.0
```

### Group by email instead of name

```bash
git shortlog -se
```

Useful when the same person has committed under different names.

## Combining These Commands — A Real Investigation

Here is how these commands work together in practice:

```bash
# Something broke in the last release. Find the commit.
git bisect start
git bisect bad HEAD
git bisect good v2.1.0
git bisect run ./scripts/smoke-test.sh
# → "f4e5d6c is the first bad commit"

# See exactly what changed in that commit
git show f4e5d6c

# Find out more about the specific line that looks wrong
git blame src/pricing.js -L 45,55

# Jump to the commit that last touched those lines
git show 9g8h7i6

# See if there's a pattern — did this author make other related changes?
git log --author="Carol White" --oneline --since="2025-04-01"
```

In 10 minutes you have identified the commit, the author, and the context — without anyone having to manually search
through hundreds of commits.

## Summary

You now know:

- **`git stash`** — shelve work-in-progress and restore it later; list, apply, pop, and drop stashes
- **`git cherry-pick`** — copy specific commits to the current branch; handle conflicts with `--continue`
- **`git bisect`** — binary search your history to find the commit that introduced a bug; automate with a test script
- **`git blame`** — see who last changed each line of a file and when
- **`git shortlog`** — summarise contributions by author

Next up: [Workflows](./10-workflows.md) — GitHub Flow, GitFlow, trunk-based development, and choosing the right
workflow for your team.
