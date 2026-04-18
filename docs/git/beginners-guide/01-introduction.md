---
title: "Introduction to Git"
sidebar_label: "Introduction"
description: What Git is, distributed vs centralised VCS, installing Git, initial configuration, git init, .gitignore, and the three areas of a Git repository.
slug: /git/beginners-guide/introduction
tags: [git, beginners, version-control]
keywords:
  - git introduction
  - what is git
  - distributed version control
  - git install
  - git config
  - git init
  - gitignore
sidebar_position: 1
---

# Introduction to Git

Version control is the practice of tracking and managing changes to files over time. Without it, collaborating on code
means emailing ZIP archives, naming files `report_final_v3_ACTUAL_FINAL.docx`, and spending hours merging conflicting
changes by hand. Git solves all of that.

Git is a **distributed version control system** (DVCS) created by Linus Torvalds in 2005 to manage the Linux kernel
source code. It has since become the standard tool for version control across virtually every software project in the
world.

## Centralised vs Distributed VCS

Before Git, most teams used **centralised** version control systems like Subversion (SVN) or CVS. Understanding the
difference explains why Git feels the way it does.

| Feature                  | Centralised (SVN, CVS)                          | Distributed (Git)                                       |
|--------------------------|-------------------------------------------------|---------------------------------------------------------|
| **Repository location**  | One central server                              | Every developer has a full copy                         |
| **Network requirement**  | Required for most operations                    | Only needed to push/pull with others                    |
| **Offline work**         | Very limited                                    | Full history and branching available offline            |
| **Speed**                | Network-bound                                   | Most operations are local and instant                   |
| **Branching**            | Slow and expensive (copies directories)         | Instant and cheap (just a pointer)                      |
| **Single point of failure** | Yes — server goes down, work stops           | No — every clone is a full backup                       |

With Git, every developer's machine holds the **complete project history**. You can commit, branch, diff, and browse
logs entirely offline. Network access is only needed when you want to share your work with others.

## How Git Stores Data

Most version control systems store data as a list of file changes over time (delta-based storage). Git thinks
differently: every time you commit, Git takes a **snapshot** of the entire project and stores a reference to it. If a
file has not changed, Git stores a link to the previous identical file rather than a copy — this makes snapshots
efficient.

Each snapshot (commit) is identified by a SHA-1 hash — a 40-character string like
`a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2`. This hash is computed from the content of the commit, so it is
effectively a fingerprint. If anything changes, the hash changes.

## Installing Git

### macOS

The easiest way is through Homebrew:

```bash
brew install git
```

Alternatively, install the Xcode Command Line Tools, which include Git:

```bash
xcode-select --install
```

### Linux (Debian / Ubuntu)

```bash
sudo apt update
sudo apt install git
```

### Linux (Fedora / RHEL / CentOS)

```bash
sudo dnf install git
```

### Windows

Download the installer from [git-scm.com](https://git-scm.com/downloads). The installer includes **Git Bash**, a
terminal emulator that provides a Unix-like shell on Windows. All commands in this guide work in Git Bash.

### Verify the installation

```bash
git --version
# git version 2.47.1
```

## Initial Configuration

Before your first commit, tell Git who you are. This information is embedded in every commit you make.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

The `--global` flag writes to `~/.gitconfig`, which applies to all repositories on your machine. You can override
these per-repository by running the same commands without `--global` inside a repository.

### Set your default editor

Git opens a text editor when you need to write commit messages or resolve interactive operations. Set your preferred
editor:

```bash
# VS Code
git config --global core.editor "code --wait"

# Neovim
git config --global core.editor "nvim"

# Nano (good default if you're not sure)
git config --global core.editor "nano"
```

### Set the default branch name

Modern Git allows you to configure the name of the initial branch. The convention has shifted from `master` to `main`:

```bash
git config --global init.defaultBranch main
```

### View your configuration

```bash
git config --list
# user.name=Your Name
# user.email=you@example.com
# core.editor=code --wait
# init.defaultBranch=main
```

Your global config file lives at `~/.gitconfig`. You can open it directly:

```bash
cat ~/.gitconfig
```

```ini
[user]
    name = Your Name
    email = you@example.com
[core]
    editor = code --wait
[init]
    defaultBranch = main
```

## Creating Your First Repository

A **repository** (repo) is a directory that Git tracks. It stores all your files plus the complete history of every
change ever made.

### git init

Navigate to your project directory and initialise a repository:

```bash
mkdir my-project
cd my-project
git init
# Initialized empty Git repository in /home/user/my-project/.git/
```

This creates a hidden `.git/` directory. That directory is the repository — it contains the object database, refs,
configuration, and everything Git needs. **Never delete or manually edit the `.git/` directory.**

```bash
ls -la
# drwxr-xr-x  .git/
```

### What is inside .git/?

You do not need to memorise this, but it helps to know what lives there:

```
.git/
├── HEAD          # Points to the current branch
├── config        # Repository-local configuration
├── objects/      # The object database (blobs, trees, commits)
├── refs/
│   ├── heads/    # Local branches
│   └── tags/     # Tags
└── hooks/        # Git hook scripts
```

## The Three Areas of Git

This is the most important mental model in Git. Every file in your project exists in one of three areas:

```
Working Tree  ──── git add ────►  Staging Area  ──── git commit ────►  History
   (disk)                          (index)                              (.git/)
```

| Area              | Also called   | What it contains                                          |
|-------------------|---------------|-----------------------------------------------------------|
| **Working Tree**  | Working directory | The files on your disk as you see them in your editor |
| **Staging Area**  | Index, Cache  | Changes you have selected to go into the next commit      |
| **History**       | Repository    | All committed snapshots, stored permanently in `.git/`    |

### Why three areas?

The staging area gives you **precise control** over what goes into each commit. Imagine you have edited three files
while fixing a bug, but one of those edits is actually a refactor that belongs in a separate commit. With the staging
area, you can add just the bug-fix files to the index and commit them, then add the refactor separately.

This workflow — edit → stage → commit — is the heartbeat of Git. You will use it hundreds of times a day.

## The .gitignore File

Not every file in your project should be tracked by Git. Build artifacts, editor settings, secrets, and generated files
should be excluded. The `.gitignore` file tells Git which files to ignore.

Create a `.gitignore` in the root of your repository:

```bash
touch .gitignore
```

### Common patterns

```gitignore
# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
*.class
*.jar

# Environment and secrets
.env
.env.local
*.pem
*.key

# Editor files
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Logs
*.log
logs/

# OS files
Thumbs.db
```

### Pattern syntax

| Pattern          | Matches                                    |
|------------------|--------------------------------------------|
| `*.log`          | Any file ending in `.log`                  |
| `build/`         | The `build` directory and all its contents |
| `!important.log` | Un-ignores `important.log`                 |
| `**/temp`        | `temp` directory anywhere in the tree      |
| `doc/*.txt`      | `.txt` files in the `doc/` directory only  |

You can also create a **global** gitignore for things like editor files that apply to all your projects:

```bash
git config --global core.excludesFile ~/.gitignore_global
```

Then add patterns to `~/.gitignore_global`:

```gitignore
.DS_Store
.idea/
*.swp
```

### GitHub's gitignore templates

GitHub maintains a collection of `.gitignore` templates for popular languages and frameworks at
[github.com/github/gitignore](https://github.com/github/gitignore). When starting a new project, copy the appropriate
template for your language.

## Checking Repository Status

At any point, you can ask Git what state your files are in:

```bash
git status
# On branch main
# No commits yet
#
# nothing to commit (create/copy files to start)
```

After creating a file:

```bash
echo "# My Project" > README.md
git status
# On branch main
# No commits yet
#
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#
#         README.md
#
# nothing added to commit but untracked files present
```

Git notices the new file but is not yet tracking it. In the next chapter, we will cover `git add` and `git commit` to
move files through the three areas.

## Summary

You now understand:

- **What Git is** — a distributed version control system that stores snapshots, not diffs
- **How to install and configure Git** with your name, email, and editor
- **How to initialise a repository** with `git init`
- **The three areas** — working tree, staging area, and history — and why they exist
- **How `.gitignore` works** — keeping build artifacts and secrets out of your repository

Next up: [Basic Workflow](./02-basic-workflow.md) — staging changes, writing commits, reading history with `git log`,
and crafting good commit messages.
