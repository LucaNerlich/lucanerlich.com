---
title: "Git"
sidebar_label: "Git"
description: Practical Git reference -- branching strategies, rebase vs merge, interactive rebase, undoing mistakes, aliases, and commit conventions.
slug: /git
tags: [git, devtools]
keywords:
  - git branching
  - git rebase
  - git workflow
  - git aliases
  - conventional commits
sidebar_position: 3
---

# Git

This is a practical reference for day-to-day Git work. It assumes you know the basics (`init`, `add`, `commit`, `push`) and focuses on the patterns and workflows that make you productive.

## Branching strategies

Every team needs a branching strategy. The three most common:

### Trunk-based development

```mermaid
gitgraph
    commit id: "A"
    commit id: "B"
    branch feature1
    commit id: "F1"
    checkout main
    merge feature1 id: "merge F1"
    commit id: "C"
    branch feature2
    commit id: "F2"
    checkout main
    merge feature2 id: "merge F2"
    commit id: "D"
```

Everyone works on short-lived branches off `main` and merges back quickly (hours to a day or two). The trunk is always deployable.

| Aspect | Detail |
|--------|--------|
| **Branch lifetime** | Hours to 1--2 days |
| **Merge target** | Always `main` |
| **Releases** | Deploy from `main` (or tag releases) |
| **Best for** | CI/CD-heavy teams, small to medium teams, SaaS products |

### GitHub Flow

Similar to trunk-based but with pull requests and slightly longer branch lifetimes:

1. Branch from `main`
2. Make commits
3. Open a Pull Request
4. Review, discuss, iterate
5. Merge to `main`
6. Deploy

Best for open-source and teams that rely on code review.

### Git Flow

```mermaid
gitgraph
    commit id: "init"
    branch develop
    commit id: "D1"
    branch feature
    commit id: "F1"
    commit id: "F2"
    checkout develop
    merge feature id: "merge feature"
    commit id: "D2"
    branch release
    commit id: "R1"
    checkout main
    merge release id: "v1.0" tag: "v1.0"
    checkout develop
    merge release id: "merge release"
```

Uses `main`, `develop`, `feature/*`, `release/*`, and `hotfix/*` branches. Well-defined but heavyweight.

| Aspect | Detail |
|--------|--------|
| **Branch lifetime** | Days to weeks |
| **Merge target** | `develop` for features, `main` for releases |
| **Releases** | Cut from `develop` into `release/*`, then merge to `main` |
| **Best for** | Versioned software, teams that ship on a schedule |

### Which strategy to pick?

| Situation | Recommendation |
|-----------|---------------|
| Continuous deployment, small team | Trunk-based |
| Code review required, PRs are normal | GitHub Flow |
| Versioned releases, multiple versions in production | Git Flow |
| Unsure | Start with GitHub Flow -- it is the simplest that still gives you pull requests |

## Branching and merging

Three ways to integrate changes from one branch into another:

### Merge (no fast-forward)

```bash
git checkout main
git merge --no-ff feature/login
```

Creates a **merge commit** that preserves the branch history. The default for pull requests on most platforms.

- Preserves full history of when the branch was created and merged
- Can make the log noisy with many merge commits
- Safe -- never rewrites history

### Rebase

```bash
git checkout feature/login
git rebase main
```

Replays your branch's commits **on top of** the target branch. Produces a linear history.

- Clean, linear log -- no merge commits
- Rewrites commit hashes (new SHAs)
- **Never rebase commits that have been pushed and shared** -- this is the "golden rule of rebasing"

### Squash merge

```bash
git checkout main
git merge --squash feature/login
git commit -m "Add login feature"
```

Combines all branch commits into a single commit on the target. Useful for keeping a clean `main` history when the branch had messy work-in-progress commits.

### When to use which

| Strategy | Use when |
|----------|----------|
| **Merge** | You want to preserve full history; default for most PRs |
| **Rebase** | You want linear history and the branch is local (not shared) |
| **Squash** | The branch has many small/WIP commits that should be one logical change |

## Interactive rebase

Interactive rebase lets you edit, reorder, squash, or drop commits before pushing:

```bash
# Rebase the last 4 commits interactively
git rebase -i HEAD~4
```

This opens an editor:

```
pick a1b2c3d Add user model
pick e4f5g6h Fix typo in user model
pick i7j8k9l Add login endpoint
pick m0n1o2p WIP cleanup
```

Change the commands:

| Command | Effect |
|---------|--------|
| `pick` | Keep the commit as-is |
| `reword` | Keep changes, edit the commit message |
| `squash` | Merge into the previous commit, combine messages |
| `fixup` | Merge into the previous commit, discard this message |
| `drop` | Delete the commit entirely |
| `edit` | Pause rebase at this commit so you can amend it |

### Common use cases

**Squash WIP commits before opening a PR:**

```
pick a1b2c3d Add user model
fixup e4f5g6h Fix typo in user model
pick i7j8k9l Add login endpoint
fixup m0n1o2p WIP cleanup
```

Result: two clean commits instead of four messy ones.

**Reword a commit message:**

```
reword a1b2c3d Add user model
pick i7j8k9l Add login endpoint
```

The editor opens again to let you write a better message.

> **Warning:** Only interactive-rebase commits that have **not been pushed**. Rebasing shared history forces collaborators to deal with diverged branches.

## Staging and stashing

### Partial staging

Stage specific hunks (sections) of a file instead of the whole file:

```bash
git add -p
```

Git shows each change hunk and asks:

```
Stage this hunk [y,n,q,a,d,s,e,?]?
```

| Option | Meaning |
|--------|---------|
| `y` | Stage this hunk |
| `n` | Skip this hunk |
| `s` | Split into smaller hunks |
| `e` | Manually edit the hunk |
| `q` | Quit (stop staging) |

This lets you make one commit for a bug fix and a separate commit for a new feature, even if both changes are in the same file.

### Stashing

Save work-in-progress without committing:

```bash
# Stash with a description
git stash push -m "WIP: login form validation"

# List stashes
git stash list
# stash@{0}: On feature/login: WIP: login form validation
# stash@{1}: On main: experiment with new layout

# Apply the most recent stash (keeps it in the stash list)
git stash apply

# Apply and remove from the stash list
git stash pop

# Apply a specific stash
git stash apply stash@{1}

# Drop a specific stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

**Include untracked files:**

```bash
git stash push -u -m "WIP: includes new files"
```

**Stash only specific files:**

```bash
git stash push -m "just the config" -- config.json .env.example
```

## Undoing things

### The three resets

```bash
# Soft: undo commit, keep changes staged
git reset --soft HEAD~1

# Mixed (default): undo commit, keep changes unstaged
git reset HEAD~1

# Hard: undo commit, discard all changes
git reset --hard HEAD~1
```

| Reset mode | Commit | Staging area | Working directory |
|-----------|--------|-------------|-------------------|
| `--soft` | Undone | Preserved | Preserved |
| `--mixed` | Undone | Cleared | Preserved |
| `--hard` | Undone | Cleared | **Cleared** |

> **Warning:** `--hard` permanently destroys uncommitted changes. Use with caution.

### Revert (safe undo for shared history)

```bash
# Create a new commit that undoes the given commit
git revert abc1234
```

Unlike `reset`, `revert` does not rewrite history. Safe for commits that have already been pushed.

### Restore (undo file changes)

```bash
# Discard unstaged changes in a file
git restore path/to/file.js

# Unstage a file (keep changes in working directory)
git restore --staged path/to/file.js

# Restore a file from a specific commit
git restore --source=abc1234 path/to/file.js
```

### Recovering from mistakes with reflog

The reflog records every HEAD movement. Even after a hard reset, you can recover:

```bash
# Show the reflog
git reflog
# abc1234 HEAD@{0}: reset: moving to HEAD~3
# def5678 HEAD@{1}: commit: Add important feature
# ghi9012 HEAD@{2}: commit: Fix login bug

# Recover by resetting to the reflog entry
git reset --hard def5678
```

Reflog entries are kept for 90 days by default. As long as a commit exists in the reflog, it is not lost.

## Cherry-pick and bisect

### Cherry-pick

Apply a specific commit from one branch to another:

```bash
# Apply commit abc1234 to the current branch
git cherry-pick abc1234

# Cherry-pick without committing (stage the changes)
git cherry-pick --no-commit abc1234

# Cherry-pick a range of commits
git cherry-pick abc1234..def5678
```

Use cases:

- Backporting a bug fix from `main` to a release branch
- Pulling a single commit from a feature branch that is not ready to merge

### Bisect

Binary search through commit history to find which commit introduced a bug:

```bash
# Start bisect
git bisect start

# Mark the current commit as bad (has the bug)
git bisect bad

# Mark a known good commit (before the bug)
git bisect good v1.0

# Git checks out a commit halfway between good and bad
# Test it, then mark:
git bisect good   # if the bug is not present
git bisect bad    # if the bug is present

# Git narrows down and eventually outputs the offending commit

# When done
git bisect reset
```

Bisect tests O(log n) commits instead of O(n). For 1000 commits, you only test ~10.

## Tags and releases

### Lightweight vs annotated tags

```bash
# Lightweight tag (just a pointer)
git tag v1.0.0

# Annotated tag (recommended -- includes metadata)
git tag -a v1.0.0 -m "Release 1.0.0: initial public release"
```

Annotated tags store the tagger name, date, and a message. Always use annotated tags for releases.

### Tag operations

```bash
# List tags
git tag

# List tags matching a pattern
git tag -l "v1.*"

# Tag a specific commit (not HEAD)
git tag -a v0.9.0 abc1234 -m "Beta release"

# Push a single tag
git push origin v1.0.0

# Push all tags
git push origin --tags

# Delete a local tag
git tag -d v1.0.0

# Delete a remote tag
git push origin --delete v1.0.0
```

### Semantic versioning

Follow [SemVer](https://semver.org/): `MAJOR.MINOR.PATCH`

| Change type | Version bump | Example |
|-------------|-------------|---------|
| Breaking API changes | MAJOR | 1.0.0 -> 2.0.0 |
| New features (backward compatible) | MINOR | 1.0.0 -> 1.1.0 |
| Bug fixes | PATCH | 1.0.0 -> 1.0.1 |
| Pre-release | Suffix | 2.0.0-beta.1 |

## Useful aliases and .gitconfig

Add these to `~/.gitconfig` (or run `git config --global alias.<name> "<command>"`):

```ini
[alias]
    # Pretty log with graph
    lg = log --oneline --graph --decorate --all

    # Short status
    s = status -sb

    # Quick amend (add staged changes to the last commit, keep message)
    amend = commit --amend --no-edit

    # Undo the last commit (soft reset)
    undo = reset --soft HEAD~1

    # List branches sorted by last commit date
    recent = branch --sort=-committerdate --format='%(committerdate:relative) %(refname:short)'

    # Delete merged branches (except main/master/develop)
    cleanup = "!git branch --merged | grep -vE '(main|master|develop|\\*)' | xargs -r git branch -d"

    # Show what changed in the last commit
    last = log -1 --stat

    # Diff with word-level changes (great for prose)
    wdiff = diff --word-diff

[pull]
    # Always rebase on pull instead of merge
    rebase = true

[push]
    # Push the current branch to its upstream automatically
    default = current

    # Enable --force-with-lease safety by default
    autoSetupRemote = true

[init]
    # Default branch name for new repos
    defaultBranch = main

[core]
    # Global gitignore
    excludesFile = ~/.gitignore_global

    # Better diff algorithm
    algorithm = histogram
```

### Global .gitignore

Create `~/.gitignore_global` for editor and OS files you never want to commit:

```
# Editors
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Env files
.env
.env.local
```

## Working with remotes

### Multiple remotes

Common when you fork a repo:

```bash
# Add the original repo as "upstream"
git remote add upstream https://github.com/original/repo.git

# Fetch from upstream
git fetch upstream

# Merge upstream changes into your local main
git checkout main
git merge upstream/main

# List all remotes
git remote -v
```

### Force push safely

Never use `git push --force` on shared branches. Use `--force-with-lease` instead:

```bash
git push --force-with-lease
```

`--force-with-lease` refuses to push if the remote has commits you have not seen. It prevents accidentally overwriting a colleague's work.

### Upstream tracking

```bash
# Push and set upstream in one command
git push -u origin feature/login

# See what each branch tracks
git branch -vv
```

## Commit message conventions

Good commit messages are a gift to your future self and your teammates.

### Conventional Commits

A widely adopted format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (not CSS) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependencies, tooling |
| `ci` | CI/CD configuration |

**Examples:**

```
feat(auth): add OAuth2 login with Google

fix(cart): prevent negative quantities on line items

docs: update deployment guide for Docker

refactor(api): extract validation into middleware

chore(deps): upgrade Spring Boot to 3.2.1
```

### Good vs bad messages

| Bad | Good |
|-----|------|
| `fix` | `fix(search): return empty array instead of null for no results` |
| `update stuff` | `refactor(user): extract email validation into shared utility` |
| `WIP` | `feat(dashboard): add skeleton loading states for chart widgets` |
| `changes` | `fix(i18n): use correct locale fallback for unsupported languages` |

### Rules of thumb

1. **Subject line under 72 characters** -- fits in `git log --oneline`
2. **Use imperative mood** -- "Add feature" not "Added feature"
3. **Explain why, not what** -- the diff shows what changed; the message explains why
4. **Reference issues** -- `fix(auth): handle expired tokens (#142)`

> Git is central to the deployment workflows covered in the [AEM: Deployment & Cloud Manager](/aem/beginners-guide/deployment-and-cloud-manager), [Java: Deploy to VPS](/java/beginners-guide/deploy-vps-nginx), and [JavaScript: Deploy to VPS](/javascript/beginners-guide/deploy-vps-nginx) guides.

## Summary

| Topic | Key takeaway |
|-------|-------------|
| **Branching strategies** | Start with GitHub Flow; use Git Flow only if you need versioned releases |
| **Merge vs rebase** | Merge for shared branches, rebase for local cleanup, squash for messy feature branches |
| **Interactive rebase** | Clean up commits before pushing -- squash, reword, reorder |
| **Staging** | `git add -p` for partial staging; stash for context switching |
| **Undoing** | `reset` for local, `revert` for shared, `reflog` for recovery |
| **Cherry-pick** | Move individual commits between branches |
| **Bisect** | Binary search for the commit that introduced a bug |
| **Tags** | Use annotated tags for releases; follow SemVer |
| **Aliases** | Invest 10 minutes in `.gitconfig` -- save hours over a career |
| **Force push** | Always `--force-with-lease`, never `--force` on shared branches |
| **Commit messages** | Conventional Commits format; imperative mood; explain why, not what |
