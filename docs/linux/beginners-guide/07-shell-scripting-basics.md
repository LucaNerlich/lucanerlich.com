---
title: "Shell Scripting Basics"
sidebar_label: "Shell Scripting Basics"
description: Write bash scripts with variables, conditionals, loops, and command substitution to automate repetitive server tasks.
slug: /linux/beginners-guide/shell-scripting-basics
tags: [linux, bash, shell, beginners]
keywords:
  - bash scripting
  - shell variables
  - if elif else bash
  - for while loop bash
  - bash shebang exit code
sidebar_position: 7
---

# Shell Scripting Basics

A shell script is a text file containing a sequence of shell commands. Instead of typing those commands manually each time, you write them once and execute the file. Shell scripts are how you automate deployments, scheduled tasks, system setup, and anything else you do repeatedly on a Linux server.

This chapter covers the fundamentals. Chapter 8 builds on these with functions, error handling, and advanced patterns.

---

## The Shebang Line

The first line of every script should be a **shebang** (`#!`) that tells the kernel which interpreter to use:

```bash
#!/bin/bash
```

Without it, the script may be executed by the current shell, which might be `sh`, `zsh`, or something else — and subtle differences can cause bugs. Always specify `#!/bin/bash` explicitly.

Other shebangs you may see:

```bash
#!/usr/bin/env bash   # Finds bash in $PATH — more portable but slightly slower
#!/bin/sh             # POSIX sh — maximum portability, fewer features
#!/usr/bin/env python3
#!/usr/bin/env node
```

### Creating and Running a Script

```bash
# Create the script
cat > hello.sh << 'EOF'
#!/bin/bash
echo "Hello from a bash script"
date
whoami
EOF

# Make it executable
chmod +x hello.sh

# Run it
./hello.sh

# Or run it with bash explicitly (doesn't need +x)
bash hello.sh
```

---

## Variables

### Assigning Variables

```bash
#!/bin/bash

# No spaces around the equals sign
NAME="ubuntu"
PORT=8080
LOG_DIR="/var/log/myapp"

# Print a variable
echo "$NAME"
echo "Port: $PORT"
echo "Logs in: $LOG_DIR"
```

**Critical:** There must be no spaces around `=`. `NAME = "ubuntu"` is a syntax error (bash interprets `NAME` as a command and `=` and `"ubuntu"` as arguments).

### Using Variables

Always quote variables with double quotes. Unquoted variables break when values contain spaces.

```bash
FILE="/path/with spaces/file.txt"

# WRONG: the space causes word splitting
cat $FILE       # cat /path/with and then "spaces/file.txt"

# CORRECT: quotes preserve the value
cat "$FILE"
```

```bash
# Variable in a path
BASE_DIR="/opt/myapp"
CONFIG="$BASE_DIR/config/app.conf"
echo "$CONFIG"   # /opt/myapp/config/app.conf

# Append to variable
GREETING="Hello"
GREETING="${GREETING}, World!"
echo "$GREETING"   # Hello, World!
```

### Special Variables

| Variable | Meaning |
|---|---|
| `$0` | Name of the script |
| `$1`, `$2`, ... | Positional arguments (the Nth argument) |
| `$@` | All arguments as separate words |
| `$*` | All arguments as a single string |
| `$#` | Number of arguments |
| `$?` | Exit code of the last command |
| `$$` | PID of the current shell |
| `$!` | PID of the last background process |
| `$HOME` | Home directory |
| `$USER` | Current username |
| `$PWD` | Current working directory |
| `$PATH` | Executable search path |

```bash
#!/bin/bash
echo "Script name: $0"
echo "First argument: $1"
echo "All arguments: $@"
echo "Argument count: $#"
echo "Current user: $USER"
echo "Script PID: $$"
```

---

## Quoting

Quoting controls how the shell interprets special characters.

### Double Quotes — `"..."`

Variables and command substitutions are expanded inside double quotes. Spaces are preserved.

```bash
NAME="World"
echo "Hello, $NAME!"    # Hello, World!
echo "Home: $HOME"      # Home: /home/ubuntu
echo "Today: $(date)"   # Today: Fri Apr 10 09:00:00 UTC 2026
```

### Single Quotes — `'...'`

Everything inside single quotes is literal. No expansion at all.

```bash
NAME="World"
echo 'Hello, $NAME!'    # Hello, $NAME!  (literal)
echo 'Today: $(date)'   # Today: $(date)  (literal)
```

Use single quotes when you want to pass a string with special characters verbatim — for example, a regex pattern or a literal dollar sign.

### Escaping — `\`

A backslash escapes the next character inside double quotes:

```bash
echo "She said \"hello\""     # She said "hello"
echo "Price: \$5.00"          # Price: $5.00
echo "Line1\nLine2"           # Line1\nLine2 (echo does not expand \n by default)
echo -e "Line1\nLine2"        # Line1
                               # Line2 (with -e flag)
```

---

## Command Substitution

Command substitution captures the output of a command and uses it as a value.

```bash
# Modern syntax: $(...)  — preferred
CURRENT_DATE=$(date +%Y-%m-%d)
echo "Today is $CURRENT_DATE"

# Count files in a directory
FILE_COUNT=$(ls /var/log/*.log | wc -l)
echo "Log file count: $FILE_COUNT"

# Get the Java version
JAVA_VERSION=$(java -version 2>&1 | grep -oP '(?<=version ")[^"]+')
echo "Java version: $JAVA_VERSION"

# Nested command substitution
OLDEST_LOG=$(ls -t /var/log/*.log | tail -1)
echo "Oldest log: $OLDEST_LOG"

# Backtick syntax — legacy, avoid in new scripts
HOSTNAME=`hostname`   # works, but harder to nest and read
```

---

## Exit Codes

Every command returns an **exit code**: 0 means success, any non-zero value means failure.

```bash
# Check the exit code of the last command
ls /etc
echo $?    # 0 (success)

ls /nonexistent
echo $?    # 2 (failure: no such file or directory)

# Use exit codes in scripts
grep "ERROR" /var/log/app.log
if [ $? -eq 0 ]; then
    echo "Errors found"
else
    echo "No errors"
fi

# More idiomatic: use the command directly
if grep -q "ERROR" /var/log/app.log; then
    echo "Errors found"
fi
```

```bash
# Set your script's exit code with exit
#!/bin/bash
# ... do work ...
if [ something_failed ]; then
    exit 1    # non-zero = failure
fi
exit 0        # 0 = success
```

Exit codes matter when scripts call other scripts or when CI/CD systems check whether a step succeeded.

---

## Conditionals — `if`, `elif`, `else`

### Basic Syntax

```bash
if [ condition ]; then
    # commands
elif [ other-condition ]; then
    # commands
else
    # commands
fi
```

### Test Conditions

```bash
# String comparisons
if [ "$NAME" = "ubuntu" ]; then echo "yes"; fi
if [ "$NAME" != "root" ]; then echo "not root"; fi
if [ -z "$VAR" ]; then echo "VAR is empty"; fi
if [ -n "$VAR" ]; then echo "VAR is not empty"; fi

# Numeric comparisons
if [ "$COUNT" -eq 0 ]; then echo "zero"; fi
if [ "$COUNT" -gt 10 ]; then echo "greater than 10"; fi
if [ "$COUNT" -lt 5 ]; then echo "less than 5"; fi
if [ "$COUNT" -ge 1 ]; then echo "at least 1"; fi
if [ "$COUNT" -le 100 ]; then echo "100 or fewer"; fi
```

| Operator | Meaning |
|---|---|
| `-eq` | Equal (numeric) |
| `-ne` | Not equal (numeric) |
| `-gt` | Greater than |
| `-lt` | Less than |
| `-ge` | Greater or equal |
| `-le` | Less or equal |
| `=` | Equal (string) |
| `!=` | Not equal (string) |
| `-z` | String is empty |
| `-n` | String is not empty |

### File Test Conditions

```bash
# File existence and type
if [ -f "/etc/nginx/nginx.conf" ]; then echo "file exists"; fi
if [ -d "/opt/myapp" ]; then echo "directory exists"; fi
if [ -e "/tmp/lockfile" ]; then echo "path exists (file or dir)"; fi
if [ -L "/opt/myapp/current" ]; then echo "is a symlink"; fi

# File permissions
if [ -r "$FILE" ]; then echo "readable"; fi
if [ -w "$FILE" ]; then echo "writable"; fi
if [ -x "$SCRIPT" ]; then echo "executable"; fi

# File size
if [ -s "$FILE" ]; then echo "file is not empty"; fi
```

### Logical Operators

```bash
# AND: both conditions must be true
if [ -f "$CONFIG" ] && [ -r "$CONFIG" ]; then
    source "$CONFIG"
fi

# OR: at least one condition must be true
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
    echo "production mode"
fi

# NOT
if ! grep -q "ERROR" /var/log/app.log; then
    echo "No errors found"
fi
```

### Double Brackets `[[` — Extended Test

`[[` is a bash-specific extension that is safer and more feature-rich than `[`:

```bash
# No need to quote variables (word splitting doesn't apply)
if [[ $NAME = "ubuntu" ]]; then echo "yes"; fi

# Regex matching with =~
if [[ "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "valid email"
fi

# Pattern matching with glob
if [[ "$FILE" == *.log ]]; then
    echo "is a log file"
fi

# AND/OR with && and || inside [[ ... ]]
if [[ $PORT -ge 1024 && $PORT -le 65535 ]]; then
    echo "valid unprivileged port"
fi
```

---

## Loops

### `for` Loop — Iterate Over a List

```bash
#!/bin/bash

# Iterate over a list of values
for ENV in dev staging production; do
    echo "Deploying to $ENV"
done

# Iterate over files
for LOG_FILE in /var/log/*.log; do
    echo "Processing: $LOG_FILE"
    wc -l "$LOG_FILE"
done

# C-style numeric loop
for ((i=1; i<=10; i++)); do
    echo "Step $i"
done

# Range with seq
for i in $(seq 1 5); do
    echo "Item $i"
done

# Iterate over command output
for USER in $(cut -d':' -f1 /etc/passwd); do
    echo "User: $USER"
done
```

### `while` Loop — Loop While Condition Is True

```bash
#!/bin/bash

# Basic while loop
COUNT=0
while [ $COUNT -lt 5 ]; do
    echo "Count: $COUNT"
    COUNT=$((COUNT + 1))
done

# Read a file line by line (correct way)
while IFS= read -r LINE; do
    echo "Line: $LINE"
done < /etc/hosts

# Wait for a service to become available
MAX_ATTEMPTS=30
ATTEMPT=0
while ! curl -sf http://localhost:8080/health > /dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo "Service did not start within timeout" >&2
        exit 1
    fi
    echo "Waiting for service... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
done
echo "Service is up"

# Infinite loop with break
while true; do
    if some_condition; then
        break
    fi
    sleep 5
done
```

### `until` Loop — Loop Until Condition Is True

```bash
# Opposite of while — runs until the condition becomes true
RETRIES=0
until ping -c 1 db.example.com &>/dev/null; do
    RETRIES=$((RETRIES + 1))
    echo "Database not reachable, attempt $RETRIES"
    sleep 5
done
echo "Database is reachable"
```

### Loop Control — `break` and `continue`

```bash
for FILE in /var/log/*.log; do
    # Skip files smaller than 1 KB
    if [ ! -s "$FILE" ]; then
        continue
    fi

    # Stop processing after finding the first error file
    if grep -q "FATAL" "$FILE"; then
        echo "Found fatal error in: $FILE"
        break
    fi
done
```

---

## `case` — Multi-Branch Switch

`case` is cleaner than a long chain of `if/elif` when you need to match a variable against multiple values.

```bash
#!/bin/bash

ENVIRONMENT="$1"

case "$ENVIRONMENT" in
    dev|development)
        DB_HOST="localhost"
        LOG_LEVEL="debug"
        ;;
    staging)
        DB_HOST="staging-db.example.com"
        LOG_LEVEL="info"
        ;;
    prod|production)
        DB_HOST="prod-db.example.com"
        LOG_LEVEL="warn"
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT" >&2
        echo "Usage: $0 [dev|staging|prod]" >&2
        exit 1
        ;;
esac

echo "Connecting to $DB_HOST with log level $LOG_LEVEL"
```

```bash
# case with a user menu
echo "Choose an action:"
echo "  1) Start service"
echo "  2) Stop service"
echo "  3) Check status"
read -p "Enter choice: " CHOICE

case "$CHOICE" in
    1) sudo systemctl start myapp ;;
    2) sudo systemctl stop myapp ;;
    3) sudo systemctl status myapp ;;
    *) echo "Invalid choice" ;;
esac
```

---

## A Complete Example Script

Putting it all together — a deployment script:

```bash
#!/bin/bash
# deploy.sh — deploy a new version of the application

APP_NAME="myapp"
DEPLOY_DIR="/opt/${APP_NAME}"
VERSION="$1"

# Validate argument
if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>" >&2
    exit 1
fi

RELEASE_DIR="${DEPLOY_DIR}/${VERSION}"
CURRENT_LINK="${DEPLOY_DIR}/current"

echo "=== Deploying ${APP_NAME} version ${VERSION} ==="

# Check if version directory exists
if [ ! -d "$RELEASE_DIR" ]; then
    echo "Error: Release directory not found: $RELEASE_DIR" >&2
    exit 1
fi

# Check required files
for REQUIRED_FILE in server.js package.json; do
    if [ ! -f "${RELEASE_DIR}/${REQUIRED_FILE}" ]; then
        echo "Error: Required file missing: ${REQUIRED_FILE}" >&2
        exit 1
    fi
done

# Update symlink
echo "Updating symlink to ${VERSION}..."
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# Restart service
echo "Restarting service..."
sudo systemctl restart "$APP_NAME"

# Wait for it to become healthy
echo "Waiting for health check..."
ATTEMPTS=0
MAX_ATTEMPTS=15
while ! curl -sf "http://localhost:3000/health" > /dev/null; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
        echo "Health check failed after ${MAX_ATTEMPTS} attempts" >&2
        exit 1
    fi
    sleep 2
done

echo "=== Deployment complete: ${APP_NAME} ${VERSION} is live ==="
exit 0
```
