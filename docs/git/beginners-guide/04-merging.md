---
title: "Merging"
sidebar_label: "Merging"
description: Fast-forward vs three-way merges, resolving conflicts step by step, git mergetool, and aborting a merge.
slug: /git/beginners-guide/merging
tags: [git, beginners, version-control]
keywords:
  - git merge
  - merge conflict
  - fast-forward merge
  - three-way merge
  - conflict resolution
  - git mergetool
sidebar_position: 4
---

# Merging

Merging is how you bring work from one branch back into another. It is the natural conclusion of the branching
workflow: you work on a feature branch in isolation, then merge it into `main` when the work is done. Git supports
several merge strategies, and knowing which one to expect — and how to handle conflicts — is essential for working
in any team.

## Fast-Forward Merge

A **fast-forward merge** is the simplest case. It happens when the target branch has not diverged from the source
branch — in other words, when every commit on the target is also an ancestor of the source.

Imagine this history:

```
A ── B   ← main
     └── C ── D   ← feature/login
```

`main` is directly behind `feature/login`. There is no divergence. To merge:

```bash
git switch main
git merge feature/login
# Updating b1a2c3d..d4e5f6g
# Fast-forward
#  src/auth.js | 45 +++++++++++++++
#  1 file changed, 45 insertions(+)
```

Git simply moves the `main` pointer forward to `D`:

```
A ── B ── C ── D   ← main, feature/login
```

No merge commit is created. The history remains linear. This is clean and easy to read, but it loses the record that
`feature/login` ever existed as a separate branch.

### Prevent fast-forward (always create a merge commit)

```bash
git merge --no-ff feature/login
```

With `--no-ff`, Git always creates a merge commit even when a fast-forward is possible. This preserves the branch
topology in the history, making it clear that a feature was developed in isolation and merged at a specific point.

```
A ── B ──────────── M   ← main
     └── C ── D ──/
                  ↑ feature/login
```

Many teams enforce `--no-ff` on merge to `main` so the history clearly shows feature boundaries.

## Three-Way Merge

A **three-way merge** happens when both branches have diverged — each has commits the other does not have.

```
A ── B ── C   ← main (has commit C that feature doesn't)
     └── D ── E   ← feature/payment (has D and E that main doesn't)
```

Git cannot simply move a pointer. It must combine the two histories. It does this by finding the **common ancestor**
(commit `B`) and then computing what changed in each branch relative to that ancestor.

```bash
git switch main
git merge feature/payment
```

Git creates a new **merge commit** `M` that has two parents — `C` and `E`:

```
A ── B ── C ───── M   ← main
     └── D ── E ─/
```

The merge commit `M` records the moment the two lines of work were combined.

### Reading merge commit output

```bash
git merge feature/payment
# Merge made by the 'ort' strategy.
#  src/payment.js | 87 ++++++++++++++++++
#  tests/payment.test.js | 42 +++++++++
#  2 files changed, 129 insertions(+)
```

## Merge Conflicts

A **merge conflict** occurs when two branches modify the **same lines** of the same file (or one branch deletes a file
the other modified). Git cannot decide which version is correct — it asks you to resolve the conflict manually.

### When conflicts arise

```bash
git merge feature/checkout
# Auto-merging src/cart.js
# CONFLICT (content): Merge conflict in src/cart.js
# Automatic merge failed; fix conflicts and then commit the result.
```

### Understanding conflict markers

Open the conflicting file and you will see markers Git inserted:

```javascript
function calculateTotal(items) {
<<<<<<< HEAD
  return items.reduce((sum, item) => sum + item.price, 0);
=======
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 - getDiscount());
>>>>>>> feature/checkout
}
```

| Section                       | Meaning                                    |
|-------------------------------|--------------------------------------------|
| `<<<<<<< HEAD`                | Start of your current branch's version    |
| Everything between `<<<` and `===` | Your version (on `main`)              |
| `=======`                     | Separator                                  |
| Everything between `===` and `>>>` | The incoming branch's version          |
| `>>>>>>> feature/checkout`    | End of the incoming branch's version       |

### Resolving conflicts step by step

**Step 1 — Identify all conflicts**

```bash
git status
# On branch main
# You have unmerged paths.
#
# Unmerged paths:
#   (use "git add <file>..." to mark resolution)
#         both modified:   src/cart.js
#         both modified:   src/checkout.js
```

**Step 2 — Open each conflicting file and edit it**

Decide which version is correct, or write a new version that incorporates both:

```javascript
function calculateTotal(items) {
  // Combine both: apply discount to the summed total
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 - getDiscount());
}
```

Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). The file must be valid code with no markers remaining.

**Step 3 — Stage the resolved files**

```bash
git add src/cart.js
git add src/checkout.js
```

**Step 4 — Commit the merge**

```bash
git commit
# Git pre-fills the commit message with:
# Merge branch 'feature/checkout'
```

You can edit the message to add context about how you resolved the conflict.

### Check for remaining conflicts

```bash
git diff --check
```

This flags any remaining conflict markers — useful before committing.

## git mergetool — Visual Conflict Resolution

For complex conflicts, a visual merge tool is far easier than editing raw conflict markers.

### Configure a mergetool

```bash
# VS Code
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Neovim (with vim-fugitive or similar)
git config --global merge.tool nvimdiff

# IntelliJ / WebStorm
git config --global merge.tool intellij
git config --global mergetool.intellij.cmd 'idea merge "$LOCAL" "$REMOTE" "$BASE" "$MERGED"'
git config --global mergetool.intellij.trustExitCode true
```

### Run the mergetool

```bash
git mergetool
```

Git opens your configured tool for each conflicting file in sequence. The tool shows three panes:
- **LOCAL** — your branch's version
- **REMOTE** — the incoming branch's version
- **BASE** — the common ancestor (helps you understand what changed in each branch)
- **MERGED** — the result you are editing

After saving and closing the tool, Git marks the file as resolved. When all files are resolved, run `git commit` to
complete the merge.

## Aborting a Merge

If you start a merge and want to abandon it entirely, returning to the state before you ran `git merge`:

```bash
git merge --abort
```

This works at any point during the merge, including when there are conflicts. It resets the working tree and index to
the state before the merge began.

## Fast-Forward vs Three-Way vs No-FF — Quick Reference

| Scenario                               | Merge type         | Creates merge commit? | History        |
|----------------------------------------|--------------------|-----------------------|----------------|
| Target is ancestor of source           | Fast-forward       | No (by default)       | Linear         |
| Target is ancestor, `--no-ff` flag     | No-FF              | Yes                   | Shows branches |
| Both branches have diverged            | Three-way          | Yes                   | Shows branches |
| Conflicting changes                    | Three-way (manual) | Yes (after resolving) | Shows branches |

## Merge Commit Messages

By default, Git generates a merge commit message like:

```
Merge branch 'feature/payment' into main
```

You can write a more descriptive message:

```bash
git merge --no-ff feature/payment -m "feat: merge payment feature

Integrates Stripe payment processing with the checkout flow.
Includes retry logic and webhook handling."
```

## Practical Tips

### Always be on the target branch before merging

```bash
# You want to merge feature/login INTO main
git switch main   # Switch to the destination
git merge feature/login
```

A common mistake is being on `feature/login` and running `git merge main` — that merges `main` into your feature
branch, which may not be what you want (though it is sometimes useful for staying up to date with main).

### Pull before merging

If you are working with a remote, make sure your local `main` is up to date before merging:

```bash
git switch main
git pull
git merge feature/login
```

### Delete the branch after merging

```bash
git branch -d feature/login
```

If the branch was pushed to the remote:

```bash
git push origin --delete feature/login
```

### Merge conflicts are normal

Do not be alarmed by merge conflicts. They are Git telling you that two people edited the same part of the code and
it needs a human decision. The process of resolving them carefully is part of collaboration. The longer you wait to
merge branches, the more conflicts you accumulate — so merge often.

## Summary

You now understand:

- **Fast-forward merge** — the simplest case, no merge commit, linear history
- **Three-way merge** — when branches diverge, Git creates a merge commit with two parents
- **`--no-ff`** — always create a merge commit to preserve branch topology
- **Conflict resolution** — edit conflict markers, stage resolved files, commit
- **`git mergetool`** — visual conflict resolution with your preferred editor
- **`git merge --abort`** — escape hatch when a merge goes wrong

Next up: [Rebasing](./05-rebasing.md) — an alternative to merging that rewrites history to keep it linear, with
interactive rebase for cleaning up commits before sharing them.
