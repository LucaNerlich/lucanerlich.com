---
title: "Hooks and Automation"
sidebar_label: "Hooks & Automation"
description: What git hooks are, pre-commit, commit-msg, and pre-push hooks, with practical examples and tools like husky and lefthook.
slug: /git/beginners-guide/hooks-and-automation
tags: [git, beginners, version-control]
keywords:
  - git hooks
  - pre-commit hook
  - commit-msg hook
  - pre-push hook
  - husky
  - lefthook
  - lint-staged
sidebar_position: 11
---

# Hooks and Automation

Git hooks are scripts that Git runs automatically at specific points in the workflow. They let you enforce standards,
run checks, and automate repetitive tasks without requiring developers to remember to do them manually. A pre-commit
hook can run your linter before every commit. A commit-msg hook can validate your commit message format. A pre-push
hook can run your full test suite before code leaves the machine.

Hooks turn "we should always do X" into "we always do X."

## How Hooks Work

Hooks are executable scripts stored in `.git/hooks/`. Git ships with sample files for every hook:

```bash
ls .git/hooks/
# applypatch-msg.sample
# commit-msg.sample
# pre-commit.sample
# pre-push.sample
# pre-rebase.sample
# prepare-commit-msg.sample
# ...
```

To activate a hook, remove the `.sample` extension and make it executable:

```bash
mv .git/hooks/pre-commit.sample .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Hooks can be written in any language the shell can execute: bash, Python, Node.js, Ruby — whatever is available on
the developer's machine.

### Exit codes matter

Git checks the exit code of the hook script:

- **Exit 0** → success, Git continues the operation
- **Exit non-zero** → failure, Git aborts the operation and shows an error

This is how a pre-commit hook blocks a commit: return a non-zero exit code and Git stops the commit.

### The .git/hooks/ limitation

`.git/` is not tracked by Git. This means hooks written there are **not shared** with the team. Every developer would
have to set them up manually. This is why tools like husky and lefthook exist — they move hooks into the repository
itself (tracked by Git) and install them on `npm install` / first run.

## Common Hook Types

### Client-side hooks

| Hook                 | Runs when                             | Abortable? | Common use                                  |
|----------------------|---------------------------------------|------------|---------------------------------------------|
| `pre-commit`         | Before the commit is made             | Yes        | Lint, format, run quick tests               |
| `prepare-commit-msg` | Before the editor opens for the message | Yes      | Pre-populate template or branch name        |
| `commit-msg`         | After the message is written          | Yes        | Validate conventional commit format         |
| `post-commit`        | After the commit is made              | No         | Notifications, logging                      |
| `pre-push`           | Before pushing to remote              | Yes        | Run full test suite, block broken pushes    |
| `pre-rebase`         | Before rebasing                       | Yes        | Safety checks                               |
| `post-checkout`      | After checkout or switch              | No         | Install dependencies, update environment    |
| `post-merge`         | After a merge                         | No         | Install dependencies                        |

### Server-side hooks

Server-side hooks run on the Git server (GitHub, GitLab, Gitea, Bitbucket) and cannot be bypassed by the client:

| Hook             | Runs when                           | Common use                               |
|------------------|-------------------------------------|------------------------------------------|
| `pre-receive`    | Before server accepts a push        | Enforce branch protection, check access  |
| `update`         | Per-branch during receive           | Per-branch policy enforcement            |
| `post-receive`   | After push is accepted              | Trigger CI, send notifications, deploy   |

This guide focuses on client-side hooks.

## Writing a pre-commit Hook

### Example: Run ESLint before every commit

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run ESLint on staged JavaScript files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx)$')

if [ -z "$STAGED_FILES" ]; then
    # No JS/TS files staged — nothing to lint
    exit 0
fi

echo "Running ESLint on staged files..."
npx eslint $STAGED_FILES

if [ $? -ne 0 ]; then
    echo ""
    echo "ESLint failed. Fix the errors above before committing."
    echo "To skip this check (emergency only): git commit --no-verify"
    exit 1
fi

echo "ESLint passed!"
exit 0
```

### Example: Run Prettier format check

```bash
#!/bin/sh
# .git/hooks/pre-commit

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx|css|json|md)$')

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

echo "Checking formatting with Prettier..."
npx prettier --check $STAGED_FILES

if [ $? -ne 0 ]; then
    echo ""
    echo "Formatting issues found. Run: npx prettier --write ."
    echo "Then re-stage your files and commit again."
    exit 1
fi

exit 0
```

## Writing a commit-msg Hook

The `commit-msg` hook receives the path to a temporary file containing the commit message. Read that file and validate
the format.

### Example: Enforce Conventional Commits format

```bash
#!/bin/sh
# .git/hooks/commit-msg

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Pattern: type(scope): description
# Examples: feat(auth): add login, fix: handle null pointer
PATTERN='^(feat|fix|docs|style|refactor|test|chore|perf|ci|revert|build)(\([a-z0-9-]+\))?(!)?: .{1,100}$'

# Allow merge commits and revert commits
if echo "$COMMIT_MSG" | grep -qE '^(Merge|Revert)'; then
    exit 0
fi

if ! echo "$COMMIT_MSG" | head -1 | grep -qE "$PATTERN"; then
    echo ""
    echo "ERROR: Invalid commit message format."
    echo ""
    echo "Your message: $COMMIT_MSG"
    echo ""
    echo "Expected format: type(scope): description"
    echo ""
    echo "Valid types: feat, fix, docs, style, refactor, test, chore, perf, ci, revert, build"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add password reset flow"
    echo "  fix(cart): prevent duplicate items"
    echo "  docs: update API authentication examples"
    echo ""
    exit 1
fi

exit 0
```

## Writing a pre-push Hook

The `pre-push` hook runs before commits are sent to the remote. It receives the remote name and URL as arguments.
Stdin provides a list of refs being pushed.

### Example: Run tests before push

```bash
#!/bin/sh
# .git/hooks/pre-push

echo "Running tests before push..."
npm test

if [ $? -ne 0 ]; then
    echo ""
    echo "Tests failed. Fix them before pushing."
    echo "To push anyway (dangerous): git push --no-verify"
    exit 1
fi

echo "All tests passed. Pushing..."
exit 0
```

### Example: Prevent pushing directly to main

```bash
#!/bin/sh
# .git/hooks/pre-push

REMOTE="$1"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERROR: Direct push to $BRANCH is not allowed."
    echo "Please create a feature branch and open a pull request."
    exit 1
fi

exit 0
```

## Bypassing Hooks

Any hook can be bypassed with `--no-verify`:

```bash
git commit --no-verify -m "emergency: hotfix for production outage"
git push --no-verify
```

This is an escape hatch for genuine emergencies. Document its use in your team's norms — `--no-verify` should be
rare and traceable.

## husky — Hooks for Node.js Projects

[husky](https://typicode.github.io/husky) is the most popular hook manager for JavaScript/Node.js projects. It
stores hooks as files in your repository and installs them automatically via a `prepare` npm script.

### Setup

```bash
npm install --save-dev husky
npx husky init
```

This creates a `.husky/` directory and adds a `prepare` script to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

Now anyone who runs `npm install` automatically gets the hooks installed.

### Add a pre-commit hook

```bash
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### Add a commit-msg hook

```bash
echo "npx commitlint --edit \$1" > .husky/commit-msg
chmod +x .husky/commit-msg
```

### Directory structure

```
.husky/
├── pre-commit
├── commit-msg
└── pre-push
```

These files are committed to the repository and shared with the whole team.

## lint-staged — Run Linters on Staged Files Only

Running ESLint on your entire codebase before every commit is slow. [lint-staged](https://github.com/lint-staged/lint-staged)
runs linters only on the files that are staged for commit.

### Setup

```bash
npm install --save-dev lint-staged
```

### Configuration in `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### The pre-commit hook calls lint-staged

```bash
# .husky/pre-commit
npx lint-staged
```

Now when you run `git commit`, lint-staged lints and auto-fixes only the staged files, then re-stages them. The commit
only proceeds if all checks pass.

## commitlint — Validate Commit Messages

[commitlint](https://commitlint.js.org/) validates commit messages against a configurable rule set. Combined with the
`commit-msg` hook, it enforces Conventional Commits automatically.

### Setup

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

### The commit-msg hook

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

Now every commit message is validated:

```bash
git commit -m "add some stuff"
# ⧗   input: add some stuff
# ✖   subject may not be empty [subject-empty]
# ✖   type may not be empty [type-empty]
# ✖   found 2 problems, 0 warnings

git commit -m "feat(auth): add multi-factor authentication"
# ✔   commit validated successfully
```

## lefthook — A Fast Alternative to husky

[lefthook](https://github.com/evilmartians/lefthook) is a multi-language hook manager written in Go. It is faster than
husky, works with any language (not just Node.js), and uses a YAML configuration file.

### Setup

```bash
# Install globally or via package manager
npm install --save-dev lefthook
# or: brew install lefthook (macOS)

npx lefthook install
```

### Configuration — `lefthook.yml`

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,jsx,ts,tsx}"
      run: npx eslint {staged_files}
      stage_fixed: true

    format:
      glob: "*.{js,jsx,ts,tsx,css,json,md}"
      run: npx prettier --write {staged_files}
      stage_fixed: true

commit-msg:
  commands:
    validate:
      run: npx commitlint --edit {1}

pre-push:
  commands:
    tests:
      run: npm test
```

`parallel: true` runs all pre-commit commands simultaneously, making hook execution faster on multi-core machines.
`stage_fixed: true` automatically re-stages files that ESLint or Prettier modified.

### lefthook vs husky comparison

| Feature                 | husky                          | lefthook                        |
|-------------------------|--------------------------------|---------------------------------|
| **Language**            | JavaScript / Node.js           | Go (binary, no runtime needed)  |
| **Speed**               | Sequential by default          | Parallel by default             |
| **Config format**       | Per-file scripts               | Single `lefthook.yml`           |
| **Multi-language**      | Works with any shell script    | First-class support             |
| **Ecosystem**           | Largest in JS world            | Growing                         |
| **Zero-dependency**     | No (needs Node)                | Yes (single binary)             |

## Complete Example — JavaScript Project

Here is a complete, production-ready setup for a Node.js / TypeScript project:

```bash
# Install tools
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,json,md}": ["prettier --write"]
  }
}
```

```js
// commitlint.config.js
export default { extends: ['@commitlint/config-conventional'] };
```

```bash
# .husky/pre-commit
npx lint-staged
```

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

```bash
# .husky/pre-push
npm run build && npm test
```

Now every developer on the team automatically has:
- Linting and formatting on every commit
- Commit message validation
- Build and test validation before every push

## Summary

You now understand:

- **Git hooks** are scripts that run automatically at specific points in the Git workflow
- **`pre-commit`** — lint and format staged files before a commit is created
- **`commit-msg`** — validate the commit message format
- **`pre-push`** — run tests or checks before code leaves the machine
- **husky** — the standard hook manager for Node.js projects; stores hooks in the repo
- **lint-staged** — run linters only on staged files for speed
- **commitlint** — enforce Conventional Commits via the `commit-msg` hook
- **lefthook** — a faster, language-agnostic alternative to husky

Next up: [Practice Project](./12-practice-project.md) — a complete end-to-end exercise covering the full workflow from
initialisation to a tagged release.
