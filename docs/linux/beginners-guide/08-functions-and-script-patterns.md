---
title: "Functions and Script Patterns"
sidebar_label: "Functions & Script Patterns"
description: Write reusable bash functions with local variables, arguments, error handling with set -e and trap, and heredocs.
slug: /linux/beginners-guide/functions-and-script-patterns
tags: [linux, bash, shell, beginners]
keywords:
  - bash functions
  - set -e set -u bash
  - trap bash
  - bash error handling
  - heredoc bash
sidebar_position: 8
---

# Functions and Script Patterns

Writing a few commands in a script is straightforward. Writing a script that is reliable, maintainable, and safe under failure conditions requires deliberate structure. This chapter covers how to define and use functions, handle errors robustly, and apply the patterns that separate a professional script from a fragile one-liner.

---

## Defining Functions

Functions let you name a block of commands and call it multiple times. This is how you avoid repeating yourself in scripts.

### Syntax

```bash
# Style 1: function keyword
function greet {
    echo "Hello, $1!"
}

# Style 2: parentheses (more portable, preferred)
greet() {
    echo "Hello, $1!"
}

# Call it
greet "World"   # Hello, World!
greet "Ubuntu"  # Hello, Ubuntu!
```

Functions must be defined before they are called. Put all function definitions at the top of the script (or in a separate sourced file), and put the main logic at the bottom.

---

## Arguments Inside Functions

Inside a function, `$1`, `$2`, `$@` refer to the **function's** arguments, not the script's arguments.

```bash
#!/bin/bash

deploy_version() {
    local APP="$1"
    local VERSION="$2"
    local ENV="${3:-production}"    # default to "production" if not provided

    echo "Deploying $APP version $VERSION to $ENV"
}

# Call with arguments
deploy_version "myapp" "1.2.3"
deploy_version "myapp" "1.2.3" "staging"
```

The script's own positional arguments are still accessible via `$BASH_ARGV` inside functions, but it is cleaner to pass them explicitly.

---

## Local Variables

By default, variables defined inside a function are **global** and bleed into the rest of the script. Use `local` to scope them to the function.

```bash
#!/bin/bash

# Without local — BAD
calculate_sum() {
    RESULT=$(( $1 + $2 ))   # RESULT is global — visible outside the function
}

# With local — GOOD
calculate_sum() {
    local a="$1"
    local b="$2"
    local result=$(( a + b ))
    echo "$result"
}

SUM=$(calculate_sum 10 20)
echo "Sum: $SUM"
# "result" variable does not exist here — it was local to the function
```

Always declare function-internal variables as `local`. This prevents accidental name collisions with the rest of the script.

---

## Return Values

Bash functions can "return" values in two ways:

### Exit Code (true/false)

`return N` sets the function's exit code (0 = success, non-zero = failure):

```bash
is_service_running() {
    systemctl is-active --quiet "$1"
    # is-active returns 0 if active, non-zero if not
}

if is_service_running nginx; then
    echo "nginx is running"
else
    echo "nginx is NOT running"
fi
```

### Output Capture

Use `echo` (or `printf`) inside the function and capture it with `$()`:

```bash
get_latest_version() {
    local APP_DIR="$1"
    ls -1 "$APP_DIR" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1
}

LATEST=$(get_latest_version "/opt/myapp")
echo "Latest version: $LATEST"
```

### Combining Both

```bash
get_db_url() {
    local ENV="$1"
    local URL

    case "$ENV" in
        prod)    URL="postgres://prod-db.example.com:5432/mydb" ;;
        staging) URL="postgres://staging-db.example.com:5432/mydb" ;;
        dev)     URL="postgres://localhost:5432/mydb" ;;
        *)
            echo "Unknown environment: $ENV" >&2
            return 1     # signal failure
            ;;
    esac

    echo "$URL"
    return 0
}

DB_URL=$(get_db_url "$ENVIRONMENT") || {
    echo "Failed to get DB URL" >&2
    exit 1
}
```

---

## Sourcing Scripts — `source` and `.`

`source` (or its alias `.`) executes a script in the **current shell** rather than a subshell. This means variables and functions defined in the sourced file become available in your current session or script.

```bash
# lib/common.sh — shared library
log_info() {
    echo "[INFO]  $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2
}

die() {
    log_error "$@"
    exit 1
}
```

```bash
#!/bin/bash
# main.sh

# Source the library (both forms are equivalent)
source "$(dirname "$0")/lib/common.sh"
# . "$(dirname "$0")/lib/common.sh"

log_info "Starting deployment"
# ... rest of script ...
```

Sourcing is also how shell configuration files work. When you add something to `~/.bashrc`, new shells source that file and pick up the changes.

---

## Error Handling

The default behaviour of bash is to continue executing after a command fails. This is dangerous in scripts — a failed `mkdir` might lead to writing files in the wrong place, a failed `cd` might cause `rm -rf *` to delete the wrong directory.

### `set -e` — Exit on Error

```bash
#!/bin/bash
set -e   # Exit immediately if any command returns non-zero

echo "Step 1"
cp /nonexistent/file /tmp/   # This fails
echo "Step 2"                # This is NEVER reached — script exits after the cp fails
```

### `set -u` — Error on Undefined Variables

```bash
#!/bin/bash
set -u   # Treat unset variables as errors

echo "$UNDEFINED_VAR"   # Script exits with error instead of using empty string
```

This catches a huge class of bugs: a typo in a variable name no longer silently evaluates to an empty string.

### `set -o pipefail` — Propagate Pipe Errors

By default, a pipe's exit code is the exit code of the **last** command. This means errors early in a pipeline are silently ignored:

```bash
# Without pipefail:
cat /nonexistent | grep "something"
echo $?   # 1 (grep's exit code — nothing found)
# cat's failure was silently swallowed

# With pipefail, the pipe fails if ANY command in it fails
set -o pipefail
cat /nonexistent | grep "something"
echo $?   # 1 (from cat)
```

### The Standard Preamble

Start every non-trivial script with:

```bash
#!/bin/bash
set -euo pipefail
```

This combination catches:
- `e`: Command failures
- `u`: Undefined variables
- `o pipefail`: Pipe failures

---

## `trap` — Cleanup on Exit

`trap` registers commands to run when the script exits or receives a signal. This is how you ensure cleanup always happens, even if the script fails.

### Basic trap

```bash
#!/bin/bash
set -euo pipefail

TEMP_DIR=$(mktemp -d)

# Register cleanup to run when the script exits for any reason
cleanup() {
    echo "Cleaning up temp files..."
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Now do your work — even if this fails, cleanup() will run
cd "$TEMP_DIR"
git clone https://github.com/example/repo.git .
./build.sh
cp output.jar /opt/myapp/releases/
```

### Trap on Multiple Signals

```bash
# Clean up on exit, interrupt (Ctrl+C), or termination
trap cleanup EXIT INT TERM

# Also catch errors explicitly
trap 'echo "Error on line $LINENO" >&2; cleanup; exit 1' ERR
```

### Lock File Pattern with Trap

```bash
#!/bin/bash
set -euo pipefail

LOCK_FILE="/tmp/deploy.lock"

if [ -f "$LOCK_FILE" ]; then
    echo "Another deployment is running (lock file: $LOCK_FILE)" >&2
    exit 1
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

echo "Running deployment..."
# ... deploy commands ...
echo "Deployment complete"
# Lock file is removed automatically when the script exits
```

### Rollback Pattern with Trap

```bash
#!/bin/bash
set -euo pipefail

PREVIOUS_VERSION=$(readlink /opt/myapp/current | xargs basename)
NEW_VERSION="$1"

rollback() {
    echo "Deployment failed — rolling back to $PREVIOUS_VERSION" >&2
    ln -sfn "/opt/myapp/$PREVIOUS_VERSION" /opt/myapp/current
    sudo systemctl restart myapp
}

trap rollback ERR

# Update symlink
ln -sfn "/opt/myapp/$NEW_VERSION" /opt/myapp/current
sudo systemctl restart myapp

# Health check — if this fails, ERR trap triggers rollback
curl --fail http://localhost:3000/health

# Deactivate the rollback trap on clean exit
trap - ERR
echo "Deployment of $NEW_VERSION successful"
```

---

## Heredocs

A heredoc (here document) lets you write multi-line strings directly in a script without needing a separate file.

### Basic Heredoc

```bash
cat << 'EOF'
This is a multi-line string.
Variables like $HOME are NOT expanded (single-quoted delimiter).
Special characters are literal.
EOF
```

```bash
NAME="World"
cat << EOF
Hello, $NAME!
Today is $(date).
Variables ARE expanded (unquoted delimiter).
EOF
```

### Write a Config File with heredoc

```bash
#!/bin/bash
set -euo pipefail

APP_NAME="myapp"
DB_HOST="prod-db.example.com"
DB_PORT="5432"

sudo tee /etc/myapp/config.conf > /dev/null << EOF
# Generated by deploy.sh on $(date)
app.name=${APP_NAME}
db.host=${DB_HOST}
db.port=${DB_PORT}
db.name=${APP_NAME}
log.level=info
EOF

echo "Config written to /etc/myapp/config.conf"
```

### Create a systemd Unit with heredoc

```bash
create_service_unit() {
    local APP="$1"
    local USER="$2"
    local WORK_DIR="$3"

    sudo tee "/etc/systemd/system/${APP}.service" > /dev/null << EOF
[Unit]
Description=${APP} application
After=network.target

[Service]
Type=simple
User=${USER}
WorkingDirectory=${WORK_DIR}
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    echo "Service unit created for ${APP}"
}

create_service_unit "myapp" "deploy" "/opt/myapp/current"
```

### Send Multi-line Commands Over SSH

```bash
ssh deploy@myserver << 'EOF'
set -e
cd /opt/myapp
git pull origin main
npm install --production
sudo systemctl restart myapp
EOF
```

---

## Complete Production-Grade Script Template

This template incorporates all the patterns from this chapter:

```bash
#!/bin/bash
# =============================================================================
# Script: deploy.sh
# Description: Deploy application to a server environment
# Usage: ./deploy.sh <environment> <version>
# =============================================================================
set -euo pipefail

# ---------- Configuration ----------------------------------------------------
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"
readonly LOG_FILE="/var/log/deploy.log"

# ---------- Logging ----------------------------------------------------------
log()       { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  $*" | tee -a "$LOG_FILE"; }
log_warn()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]  $*" | tee -a "$LOG_FILE" >&2; }
log_error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" | tee -a "$LOG_FILE" >&2; }
die()       { log_error "$*"; exit 1; }

# ---------- Argument Validation ----------------------------------------------
usage() {
    cat << EOF
Usage: $SCRIPT_NAME <environment> <version>

Arguments:
  environment    Target environment: dev, staging, or prod
  version        Version to deploy (e.g. 1.2.3)

Examples:
  $SCRIPT_NAME staging 1.2.3
  $SCRIPT_NAME prod 1.2.3
EOF
    exit 1
}

[ $# -eq 2 ] || usage

readonly ENVIRONMENT="$1"
readonly VERSION="$2"

# ---------- Validate Arguments -----------------------------------------------
case "$ENVIRONMENT" in
    dev|staging|prod) ;;
    *) die "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod." ;;
esac

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    die "Invalid version format: $VERSION. Expected format: X.Y.Z"
fi

# ---------- Setup & Cleanup --------------------------------------------------
LOCK_FILE="/tmp/deploy-${ENVIRONMENT}.lock"
TEMP_DIR=""

cleanup() {
    local exit_code=$?
    [ -n "$TEMP_DIR" ] && rm -rf "$TEMP_DIR"
    rm -f "$LOCK_FILE"
    if [ $exit_code -ne 0 ]; then
        log_error "Deployment failed (exit code: $exit_code)"
    fi
}
trap cleanup EXIT

# Prevent concurrent deployments
if [ -f "$LOCK_FILE" ]; then
    die "Another deployment is already running for $ENVIRONMENT (lock: $LOCK_FILE)"
fi
touch "$LOCK_FILE"

# ---------- Main Logic -------------------------------------------------------
TEMP_DIR=$(mktemp -d)
APP_DIR="/opt/myapp"
RELEASE_DIR="${APP_DIR}/${VERSION}"

log "Starting deployment: version=$VERSION environment=$ENVIRONMENT"

# Verify release directory exists
[ -d "$RELEASE_DIR" ] || die "Release directory not found: $RELEASE_DIR"

# Update symlink
log "Updating symlink: current -> $VERSION"
ln -sfn "$RELEASE_DIR" "${APP_DIR}/current"

# Restart service
log "Restarting myapp service"
sudo systemctl restart myapp

# Health check
log "Running health check"
RETRIES=0
until curl -sf http://localhost:3000/health > /dev/null; do
    RETRIES=$((RETRIES + 1))
    [ $RETRIES -ge 15 ] && die "Health check failed after 15 attempts"
    log_warn "Health check attempt $RETRIES/15..."
    sleep 3
done

log "Deployment complete: $ENVIRONMENT is running version $VERSION"
```
