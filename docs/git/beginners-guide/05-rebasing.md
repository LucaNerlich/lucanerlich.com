---
title: "Rebasing"
sidebar_label: "Rebasing"
description: git rebase vs merge, interactive rebase for squashing and editing commits, and the golden rule of rebasing.
slug: /git/beginners-guide/rebasing
tags: [git, beginners, version-control]
keywords:
  - git rebase
  - interactive rebase
  - squash commits
  - git rebase -i
  - rebase vs merge
  - golden rule of rebasing
sidebar_position: 5
---

# Rebasing

Rebasing is Git's other strategy for integrating changes from one branch into another. While merging creates a merge
commit that ties two branch histories together, rebasing **rewrites** the commit history to make it appear as though
your work was done on top of the latest state of the target branch. The result is a clean, linear history — no merge
commits, no divergence indicators.

Used well, rebasing produces a project history that reads like a well-edited story. Used carelessly on shared branches,
it causes havoc for collaborators. This chapter explains both uses and the critical rule that prevents the havoc.

## Rebase vs Merge — The Core Difference

Consider two branches that have diverged from a common ancestor:

```
A ── B ── C   ← main
     └── D ── E   ← feature/search
```

### Merging

```bash
git switch main
git merge feature/search
```

Result:

```
A ── B ── C ───── M   ← main
     └── D ── E ─/
```

A merge commit `M` is created with two parents. The history shows that `feature/search` existed as a separate line of
work. The original commits `D` and `E` are unchanged.

### Rebasing

```bash
git switch feature/search
git rebase main
```

Result:

```
A ── B ── C   ← main
          └── D' ── E'   ← feature/search
```

Git replays commits `D` and `E` on top of `C`, producing new commits `D'` and `E'`. The content is the same, but
the commit hashes are **different** (because the parent changed). The history is now linear — `feature/search` looks
like it was always based on `C`.

After rebasing, you can merge with a clean fast-forward:

```bash
git switch main
git merge feature/search
# Fast-forward
```

Result:

```
A ── B ── C ── D' ── E'   ← main, feature/search
```

## Rebase vs Merge — When to Use Each

| Consideration              | Merge                                           | Rebase                                             |
|----------------------------|-------------------------------------------------|----------------------------------------------------|
| **History style**          | Non-linear, shows actual development path       | Linear, like all work was sequential               |
| **Merge commits**          | Yes — explicit integration points               | No — clean history                                 |
| **Shared branches**        | Safe — never rewrites commits                   | Dangerous — rewrites commit hashes                 |
| **Feature branches**       | Works fine                                      | Great for keeping up to date with main             |
| **Public / shared history**| Always safe                                     | Never rebase (the golden rule)                     |
| **Conflict handling**      | Resolve once in the merge commit                | Resolve per replayed commit (can be more work)     |
| **Readability**            | Shows reality — branches existed                | Cleaner log — easier to `bisect` and `blame`       |
| **`git bisect`**           | Works, but non-linear                           | Works better with linear history                   |

**Rule of thumb:**
- Use **merge** for integrating feature branches into long-lived branches like `main`
- Use **rebase** to update a feature branch with the latest changes from `main` before opening a pull request

## Basic Rebase

Update your feature branch with the latest commits from `main`:

```bash
# You are on feature/search
git fetch origin
git rebase origin/main
```

This replays your commits on top of the latest `origin/main`. If there are conflicts, Git pauses and asks you to
resolve them:

```bash
# CONFLICT (content): Merge conflict in src/search.js
# error: could not apply d4e5f6g... feat(search): add fuzzy matching
#
# Resolve all conflicts manually, mark them as resolved with
# "git add/rm <conflicted_files>", then run "git rebase --continue".
# You can instead skip this commit: run "git rebase --skip".
# To abort and get back to the state before "git rebase": run "git rebase --abort".
```

Resolve the conflict in the file, then:

```bash
git add src/search.js
git rebase --continue
```

Git continues replaying the remaining commits. If at any point you want to abandon the rebase entirely:

```bash
git rebase --abort
```

## Interactive Rebase — Rewriting History

Interactive rebase (`git rebase -i`) is a powerful tool for editing commits **before** you share them. It lets you:

- **Squash** multiple commits into one
- **Reword** commit messages
- **Edit** the contents of a commit
- **Reorder** commits
- **Drop** (delete) commits entirely
- **Split** a commit into smaller ones

This is how you clean up a messy series of "WIP" commits into a polished set before opening a pull request.

### Launching interactive rebase

```bash
# Rewrite the last 4 commits
git rebase -i HEAD~4

# Rewrite all commits since branching from main
git rebase -i main

# Rewrite since a specific commit (exclusive)
git rebase -i a1b2c3d
```

This opens your editor with a list of commits in **oldest-first** order:

```
pick 9e8f7a6 feat(search): add search input component
pick 3d2c1b0 WIP
pick 7a6b5c4 fix typo
pick 1f0e9d8 feat(search): add fuzzy matching algorithm

# Rebase a1b2c3d..1f0e9d8 onto a1b2c3d (4 commands)
#
# Commands:
# p, pick   = use commit
# r, reword = use commit, but edit the commit message
# e, edit   = use commit, but stop for amending
# s, squash = use commit, meld into previous commit
# f, fixup  = like "squash", but discard this commit's log message
# d, drop   = remove commit
# l, label  = label current HEAD with a name
```

### Squashing WIP commits

Change `pick` to `squash` (or `s`) on the commits you want to fold into the one above them:

```
pick 9e8f7a6 feat(search): add search input component
squash 3d2c1b0 WIP
squash 7a6b5c4 fix typo
pick 1f0e9d8 feat(search): add fuzzy matching algorithm
```

When you save and close, Git opens a second editor asking you to write the combined commit message:

```
# This is a combination of 3 commits.
# The first commit's message is:
feat(search): add search input component

# This is the 2nd commit message:
WIP

# This is the 3rd commit message:
fix typo
```

Delete the WIP and typo messages, polish the remaining one, and save.

### Using fixup (squash without message)

`fixup` is like `squash` but automatically discards the fixup commit's message:

```
pick 9e8f7a6 feat(search): add search input component
fixup 3d2c1b0 WIP
fixup 7a6b5c4 fix typo
```

No second editor opens — Git just squashes the commits silently. This is the fastest way to clean up.

### Rewording a commit message

```
reword 9e8f7a6 feat(search): add search input component
pick 1f0e9d8 feat(search): add fuzzy matching algorithm
```

When Git reaches that commit, it opens your editor with the current message. Edit it and save.

### Dropping a commit

```
drop 3d2c1b0 WIP
```

The commit and its changes are permanently removed from the history.

### Editing a commit's content

```
edit 9e8f7a6 feat(search): add search input component
```

Git pauses at that commit. You can add more changes, amend the commit, and then continue:

```bash
# Make changes to files
git add src/search.css
git commit --amend --no-edit
git rebase --continue
```

## Squashing Commits with fixup! and autosquash

A workflow-friendly pattern: create fixup commits as you work, then autosquash them at the end.

```bash
# Normal commit
git commit -m "feat(auth): add password reset flow"

# Oops, fix a bug in that feature
git add src/auth.js
git commit --fixup HEAD~1
# Creates: "fixup! feat(auth): add password reset flow"

# At the end, autosquash all fixup commits
git rebase -i --autosquash main
```

Git automatically moves and marks `fixup!` commits as `fixup` in the interactive editor — you just save and close.

## The Golden Rule of Rebasing

> **Never rebase commits that have been pushed to a shared remote branch.**

Rebasing rewrites commit hashes. If you rebase commits that other people have based their work on, their local history
will diverge from the rewritten history and they will face painful conflicts when they try to pull. This can corrupt
shared history in ways that are difficult to recover from.

### Safe to rebase:
- Local commits that have never been pushed
- Commits on a **personal** feature branch that only you work on (even if pushed — you can force-push if needed and
  inform your team)

### Never rebase:
- `main`, `master`, `develop`, or any other shared branch
- Any branch that a colleague has checked out or is basing work on

### If you must force-push after rebasing

```bash
# Only do this on YOUR feature branch, never on main
git push --force-with-lease origin feature/search
```

`--force-with-lease` is safer than `--force`: it refuses to push if someone else has pushed to the branch since you
last fetched, preventing you from silently overwriting their work.

## Rebasing onto a Different Base

```bash
# Move commits from one base to another
git rebase --onto main old-base feature/search
```

This is useful when a branch was accidentally created off a feature branch instead of `main`. `--onto` lets you
transplant commits to a new base without dragging the old branch along.

## Pull with Rebase

By default, `git pull` performs a merge. To use rebase instead:

```bash
git pull --rebase
```

This keeps your local commits on top of the fetched commits, avoiding unnecessary merge commits in your history.
Many developers configure this as the default:

```bash
git config --global pull.rebase true
```

## Summary

You now understand:

- **Rebase** replays your commits on top of another branch, producing a linear history
- **Merge** creates a merge commit that joins two branch histories; rebase rewrites them
- **Interactive rebase** (`git rebase -i`) lets you squash, reword, drop, and reorder commits
- **`fixup` and `autosquash`** make it easy to clean up commits as you work
- **The golden rule** — never rebase commits that are already on a shared branch

Next up: [Remote Repositories](./06-remote-repositories.md) — cloning, pushing, pulling, and managing remote tracking
branches.
