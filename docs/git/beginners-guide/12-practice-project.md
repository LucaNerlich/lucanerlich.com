---
title: "Practice Project"
sidebar_label: "Practice Project"
description: An end-to-end exercise covering initialising a repo, feature branches, simulated PR review, squash-merge, and tagging a release.
slug: /git/beginners-guide/practice-project
tags: [git, beginners, version-control]
keywords:
  - git practice
  - git exercise
  - git tutorial
  - end-to-end git
  - git release workflow
  - squash merge
sidebar_position: 12
---

# Practice Project

This chapter is a complete, hands-on exercise. You will build a small command-line task manager called **tasker**
from scratch, using the Git skills you have learned throughout this guide. Every step is real — no "imagine you have
done X." Type every command.

By the end you will have:

- A repository with a proper `.gitignore` and initial commit
- A feature developed on a branch with multiple commits
- A simulated code review with requested changes
- A squash-merged pull request
- A tagged release (`v1.0.0`)

## What You Will Build

A minimal command-line task manager:

```
$ node tasker.js add "Write Git guide"
Task added: [1] Write Git guide

$ node tasker.js list
Tasks:
  [1] Write Git guide
  [2] Review pull requests

$ node tasker.js done 1
Task 1 marked as done.

$ node tasker.js list
Tasks:
  [1] ✓ Write Git guide
  [2] Review pull requests
```

The implementation is deliberately simple — the focus is the Git workflow, not the application code.

## Part 1 — Initialise the Repository

### Step 1: Create the project directory

```bash
mkdir tasker
cd tasker
```

### Step 2: Initialise Git

```bash
git init
git config user.name "Your Name"
git config user.email "you@example.com"
```

### Step 3: Create a .gitignore

```bash
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
tasks.json
EOF
```

> We put `tasks.json` in `.gitignore` so that the saved task data (which will live in a JSON file) is not tracked —
> each user has their own tasks.

### Step 4: Create package.json

```bash
cat > package.json << 'EOF'
{
  "name": "tasker",
  "version": "0.0.0",
  "description": "A simple command-line task manager",
  "main": "tasker.js",
  "scripts": {
    "start": "node tasker.js",
    "test": "node tests/basic.test.js"
  },
  "keywords": ["cli", "tasks", "todo"],
  "license": "MIT"
}
EOF
```

### Step 5: Create a README

```bash
cat > README.md << 'EOF'
# tasker

A minimal command-line task manager.

## Usage

```bash
node tasker.js add "Buy groceries"
node tasker.js list
node tasker.js done 1
```
EOF
```

### Step 6: Initial commit

```bash
git add .gitignore package.json README.md
git status
# On branch main
# Changes to be committed:
#   new file:   .gitignore
#   new file:   README.md
#   new file:   package.json

git commit -m "chore: initialise project with README and gitignore"
```

### Step 7: Create a remote and push (optional — requires GitHub account)

```bash
# If you have GitHub CLI installed:
gh repo create tasker --public --source=. --push

# Or manually:
# 1. Create a repo on github.com
# 2. git remote add origin git@github.com:YOU/tasker.git
# 3. git push -u origin main
```

## Part 2 — Feature Branch: Core Task Commands

### Step 8: Create a feature branch

```bash
git switch -c feature/core-commands
```

### Step 9: Write the storage module

Create a directory and the first module:

```bash
mkdir src
```

```bash
cat > src/storage.js << 'EOF'
import { readFileSync, writeFileSync, existsSync } from 'fs';

const DATA_FILE = 'tasks.json';

export function loadTasks() {
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  const raw = readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function saveTasks(tasks) {
  writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}
EOF
```

Commit this piece of work by itself:

```bash
git add src/storage.js
git commit -m "feat(storage): add JSON-based task persistence"
```

### Step 10: Write the task logic

```bash
cat > src/tasks.js << 'EOF'
import { loadTasks, saveTasks } from './storage.js';

export function addTask(description) {
  const tasks = loadTasks();
  const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const task = { id, description, done: false };
  tasks.push(task);
  saveTasks(tasks);
  console.log(`Task added: [${id}] ${description}`);
}

export function listTasks() {
  const tasks = loadTasks();
  if (tasks.length === 0) {
    console.log('No tasks yet. Add one with: node tasker.js add "Task description"');
    return;
  }
  console.log('Tasks:');
  for (const task of tasks) {
    const status = task.done ? '✓' : ' ';
    console.log(`  [${task.id}] ${status} ${task.description}`);
  }
}

export function markDone(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === parseInt(id, 10));
  if (!task) {
    console.error(`Task ${id} not found.`);
    process.exit(1);
  }
  task.done = true;
  saveTasks(tasks);
  console.log(`Task ${id} marked as done.`);
}
EOF
```

```bash
git add src/tasks.js
git commit -m "feat(tasks): add add, list, and done commands"
```

### Step 11: Write the CLI entry point

```bash
cat > tasker.js << 'EOF'
import { addTask, listTasks, markDone } from './src/tasks.js';

const [,, command, ...args] = process.argv;

switch (command) {
  case 'add':
    if (!args[0]) {
      console.error('Usage: node tasker.js add "Task description"');
      process.exit(1);
    }
    addTask(args.join(' '));
    break;

  case 'list':
    listTasks();
    break;

  case 'done':
    if (!args[0]) {
      console.error('Usage: node tasker.js done <id>');
      process.exit(1);
    }
    markDone(args[0]);
    break;

  default:
    console.log('Usage: node tasker.js <command>');
    console.log('Commands: add, list, done');
}
EOF
```

```bash
git add tasker.js
git commit -m "feat(cli): add CLI entry point with add/list/done commands"
```

### Step 12: Add a package.json type for ES modules

```bash
# Edit package.json to add "type": "module"
cat > package.json << 'EOF'
{
  "name": "tasker",
  "version": "0.0.0",
  "description": "A simple command-line task manager",
  "type": "module",
  "main": "tasker.js",
  "scripts": {
    "start": "node tasker.js",
    "test": "node tests/basic.test.js"
  },
  "keywords": ["cli", "tasks", "todo"],
  "license": "MIT"
}
EOF

git add package.json
git commit -m "chore: enable ES module support"
```

### Step 13: Test your work manually

```bash
node tasker.js add "Write Git guide"
node tasker.js add "Review pull requests"
node tasker.js add "Deploy to production"
node tasker.js list
node tasker.js done 1
node tasker.js list
```

You should see:

```
Tasks:
  [1] ✓ Write Git guide
  [2]   Review pull requests
  [3]   Deploy to production
```

### Step 14: Review your branch history

```bash
git log --oneline
# 8a7b6c5 chore: enable ES module support
# 3d2c1b0 feat(cli): add CLI entry point with add/list/done commands
# 9e8f7a6 feat(tasks): add add, list, and done commands
# f1e2d3c feat(storage): add JSON-based task persistence
# a1b2c3d chore: initialise project with README and gitignore
```

## Part 3 — Simulated Code Review

In a real project, you would push the branch and open a pull request. A reviewer would leave comments. Let us
simulate that process.

### Step 15: Push the feature branch

```bash
git push -u origin feature/core-commands
```

### Simulated reviewer comment

Imagine a reviewer says:

> "The `markDone` function exits with `process.exit(1)` but does not throw an error that can be tested. Also, there
> are no automated tests — can you add a basic test file?"

### Step 16: Address review feedback — add tests

```bash
mkdir tests
cat > tests/basic.test.js << 'EOF'
// Minimal test runner using Node built-ins
import { strict as assert } from 'assert';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { loadTasks, saveTasks } from '../src/storage.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// Setup: remove any existing tasks file
if (existsSync('tasks.json')) {
  unlinkSync('tasks.json');
}

console.log('\nStorage tests');

test('loadTasks returns empty array when no file exists', () => {
  const tasks = loadTasks();
  assert.deepEqual(tasks, []);
});

test('saveTasks and loadTasks round-trips correctly', () => {
  const initial = [{ id: 1, description: 'Test task', done: false }];
  saveTasks(initial);
  const loaded = loadTasks();
  assert.deepEqual(loaded, initial);
});

test('saveTasks handles multiple tasks', () => {
  const tasks = [
    { id: 1, description: 'First', done: true },
    { id: 2, description: 'Second', done: false },
  ];
  saveTasks(tasks);
  const loaded = loadTasks();
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0].done, true);
  assert.equal(loaded[1].done, false);
});

// Cleanup
if (existsSync('tasks.json')) {
  unlinkSync('tasks.json');
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
EOF
```

```bash
git add tests/basic.test.js
git commit -m "test(storage): add basic round-trip tests for storage module"
```

### Step 17: Run the tests

```bash
npm test
# Storage tests
#   ✓ loadTasks returns empty array when no file exists
#   ✓ saveTasks and loadTasks round-trips correctly
#   ✓ saveTasks handles multiple tasks
#
# 3 passed, 0 failed
```

### Step 18: Push the updated branch

```bash
git push
```

## Part 4 — Squash-Merge the Pull Request

After approval, merge the feature branch into `main` with a squash — combining all five commits into a single,
clean commit.

### Step 19: Squash and merge locally (simulating what GitHub does)

```bash
git switch main

# Squash merge: applies all changes from the branch as a single unstaged diff
git merge --squash feature/core-commands
```

```bash
git status
# Changes to be committed:
#   new file:   src/storage.js
#   new file:   src/tasks.js
#   new file:   tasker.js
#   new file:   tests/basic.test.js
#   modified:   package.json
```

### Step 20: Write a single clean commit message

```bash
git commit -m "feat: add core task manager with add, list, and done commands

Implements the complete tasker CLI:
- JSON-based task persistence (src/storage.js)
- Task logic: add, list, mark as done (src/tasks.js)
- CLI entry point with argument parsing (tasker.js)
- Basic round-trip tests for storage module

Reviewed-by: Alice Smith <alice@example.com>"
```

### Step 21: View the result

```bash
git log --oneline
# f9e8d7c feat: add core task manager with add, list, and done commands
# a1b2c3d chore: initialise project with README and gitignore
```

Two commits. Clean and readable.

### Step 22: Delete the feature branch

```bash
git branch -d feature/core-commands
git push origin --delete feature/core-commands
```

## Part 5 — Tag the Release

The feature is merged and working. Time to ship `v1.0.0`.

### Step 23: Run tests one final time on main

```bash
npm test
# All tests pass
```

### Step 24: Update the version in package.json

```bash
cat > package.json << 'EOF'
{
  "name": "tasker",
  "version": "1.0.0",
  "description": "A simple command-line task manager",
  "type": "module",
  "main": "tasker.js",
  "scripts": {
    "start": "node tasker.js",
    "test": "node tests/basic.test.js"
  },
  "keywords": ["cli", "tasks", "todo"],
  "license": "MIT"
}
EOF

git add package.json
git commit -m "chore(release): bump version to 1.0.0"
```

### Step 25: Create an annotated tag

```bash
git tag -a v1.0.0 -m "Release v1.0.0

Initial release of tasker — a minimal command-line task manager.

Features:
- Add tasks: node tasker.js add 'Description'
- List tasks: node tasker.js list
- Mark done: node tasker.js done <id>
- JSON persistence (tasks.json, gitignored per-user)"
```

### Step 26: Push the tag

```bash
git push origin main
git push origin v1.0.0
```

### Step 27: Create a GitHub release (optional)

```bash
gh release create v1.0.0 \
  --title "v1.0.0 — Initial Release" \
  --notes "Initial release of tasker. See README for usage."
```

### Step 28: Verify everything

```bash
git log --oneline
# 3c2b1a0 chore(release): bump version to 1.0.0
# f9e8d7c feat: add core task manager with add, list, and done commands
# a1b2c3d chore: initialise project with README and gitignore

git tag
# v1.0.0

git show v1.0.0 --stat
# tag v1.0.0
# Tagger: Your Name <you@example.com>
# ...
# Release v1.0.0
# ...
```

## Recap — What You Practised

| Step | Skill |
|------|-------|
| Init, `.gitignore`, first commit | Chapter 1 — Introduction |
| Staged commits per logical unit | Chapter 2 — Basic Workflow |
| Feature branch creation and switching | Chapter 3 — Branches |
| Simulated code review changes | Chapter 4 — Merging concepts |
| Squash-merge to main | Chapter 5 — Rebasing (squash) |
| Push, track remote branch | Chapter 6 — Remote Repositories |
| Annotated tag and push | Chapter 7 — Tags and Releases |
| Clean history via squash | Chapter 5 — Rebasing |
| GitHub release creation | Chapter 7 — Tags and Releases |

## What to Try Next

Now that you have a working repository, experiment with the concepts from this guide:

1. **Create a second feature branch** — add a `node tasker.js remove <id>` command. Practice rebasing it onto the
   latest `main` before merging.

2. **Introduce a bug intentionally**, then use `git bisect` to find the commit that broke it.

3. **Set up husky and lint-staged** — install ESLint and enforce it on every commit.

4. **Try interactive rebase** — make some WIP commits, then squash them with `git rebase -i HEAD~3` before merging.

5. **Simulate a conflict** — create two branches that edit the same line in `src/tasks.js`, then merge both and
   resolve the conflict manually.

## Final Thoughts

Git is a deep tool. This guide covers the vast majority of what you will use day to day, but there is always more to
explore: `git worktree`, `git submodule`, `git filter-repo`, bundle files, and the low-level plumbing commands. The
best way to get comfortable is to use Git on real projects, make mistakes, and use `git reflog` to recover.

The key habits to build:

- **Commit small and often.** Small commits are easy to review, revert, and understand.
- **Write meaningful commit messages.** Your future self will thank you.
- **Branch for every piece of work.** Branches are free.
- **Pull (or fetch + rebase) before starting work.** Stay close to the tip of the branch.
- **Never force-push shared branches.** The golden rule.

Welcome to a world where you no longer fear making changes.
