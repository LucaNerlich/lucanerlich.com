---
title: "File Management"
sidebar_label: "File Management"
description: Create, copy, move, delete, and find files and directories with touch, mkdir, cp, mv, rm, ln, and find.
slug: /linux/beginners-guide/file-management
tags: [linux, bash, shell, beginners]
keywords:
  - touch mkdir cp mv rm
  - linux find command
  - hard link soft link
  - linux file management
  - locate which whereis
sidebar_position: 3
---

# File Management

Understanding how to create, copy, move, delete, and search for files is foundational to everything you will do on a Linux system — from deploying configuration files to cleaning up a full disk in a production incident. This chapter covers every file management command you will need in day-to-day server work.

---

## Creating Files — `touch`

`touch` is primarily used to create an empty file or update the timestamp of an existing one.

```bash
# Create an empty file
touch notes.txt

# Create multiple files at once
touch index.html style.css app.js

# Update the timestamp of an existing file without changing its content
touch existing-file.log

# Create a file with a specific timestamp
touch -t 202401010900 report.txt
```

In scripts, `touch` is useful for creating lock files or marker files that signal state:

```bash
LOCK_FILE="/tmp/my-script.lock"
touch "$LOCK_FILE"
# ... run script ...
rm "$LOCK_FILE"
```

---

## Creating Directories — `mkdir`

```bash
# Create a single directory
mkdir logs

# Create nested directories in one command (-p = parents)
mkdir -p /opt/myapp/config/environments

# Without -p, this would fail if /opt/myapp/config/ doesn't exist
# With -p, it creates every missing component in the path

# Set permissions at creation time
mkdir -m 755 /opt/myapp/public

# Create multiple directories
mkdir -p logs/{debug,info,error}
# Creates: logs/debug/  logs/info/  logs/error/
```

The `-p` flag is essential in scripts because it makes the command idempotent — if the directory already exists, it succeeds silently instead of erroring out.

---

## Copying Files and Directories — `cp`

```bash
# Copy a file
cp source.txt destination.txt

# Copy a file into a directory
cp source.txt /opt/myapp/

# Copy and preserve metadata (permissions, timestamps, ownership)
cp -p source.txt destination.txt

# Copy a directory recursively
cp -r source-dir/ destination-dir/

# Recursive copy with preserved metadata (useful for backups)
cp -rp source-dir/ destination-dir/

# Show what is being copied (verbose)
cp -v source.txt destination.txt

# Interactive: ask before overwriting
cp -i source.txt existing-file.txt

# Do not overwrite if destination is newer
cp -u source.txt destination.txt
```

### Common Patterns

```bash
# Back up a config file before editing
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak

# Deploy a config file from your project
cp -p config/production.conf /etc/myapp/app.conf

# Copy all .conf files from a directory
cp /etc/nginx/conf.d/*.conf /tmp/nginx-backup/
```

---

## Moving and Renaming — `mv`

`mv` both moves and renames. There is no separate rename command.

```bash
# Rename a file
mv old-name.txt new-name.txt

# Move a file to another directory
mv report.txt /var/reports/

# Move and rename in one step
mv old-name.txt /var/reports/new-name.txt

# Move a directory
mv old-dir/ /opt/new-location/

# Move multiple files into a directory
mv *.log /var/log/myapp/

# Interactive: ask before overwriting
mv -i source.txt existing-destination.txt

# Do not overwrite existing files
mv -n source.txt destination.txt

# Verbose output
mv -v old.txt new.txt
```

---

## Deleting Files and Directories — `rm`

`rm` is permanent on Linux. There is no recycle bin. Be careful.

```bash
# Delete a file
rm file.txt

# Delete multiple files
rm file1.txt file2.txt file3.txt

# Delete with a pattern (be very careful)
rm *.log

# Interactive: ask before each deletion
rm -i file.txt

# Delete a directory and all its contents (recursive)
rm -r directory/

# Force deletion without prompts (suppresses errors for missing files)
rm -f file.txt

# Recursive + force (the "nuke" combination — use with extreme caution)
rm -rf directory/

# Remove an empty directory (safer alternative)
rmdir empty-directory/
```

### Safety Practices

```bash
# DANGER: this deletes everything in /
# A missing space can be catastrophic:
rm -rf /opt/myapp        # safe — specific path
rm -rf / opt/myapp       # CATASTROPHIC — deletes root filesystem

# Always double-check with echo first
echo rm -rf /opt/myapp/logs/
# When output looks right, remove the echo and run for real

# Use a variable and check it is not empty
TARGET="/opt/myapp/cache"
if [ -n "$TARGET" ]; then
    rm -rf "$TARGET"
fi

# Consider using trash-cli on workstations
# sudo apt install trash-cli
# trash file.txt   (sends to trash instead of permanent delete)
```

---

## Links — `ln`

Linux supports two types of links: **hard links** and **soft (symbolic) links**.

### Hard Links

A hard link is another directory entry pointing to the same underlying data (inode) on disk. Both the original name and the hard link are equally valid paths to the same file.

```bash
# Create a hard link
ln original.txt hardlink.txt

# Both point to the same inode
ls -li original.txt hardlink.txt
# 1234567 -rw-r--r-- 2 ubuntu ubuntu 42 Apr 10 original.txt
# 1234567 -rw-r--r-- 2 ubuntu ubuntu 42 Apr 10 hardlink.txt
# (same inode number, link count = 2)
```

Key properties:
- Hard links cannot span filesystems (both files must be on the same disk/partition)
- Hard links cannot point to directories (with rare exceptions)
- Deleting the "original" does not delete the data — it just removes one directory entry. The data persists until all hard links are removed.

### Soft (Symbolic) Links

A symbolic link (symlink) is a file that contains a path to another file or directory. It is similar to a shortcut in Windows.

```bash
# Create a symbolic link: ln -s TARGET LINK_NAME
ln -s /opt/myapp/current/bin/start.sh /usr/local/bin/myapp-start

# Create a symlink to a directory
ln -s /opt/myapp/current /opt/myapp/latest

# Force creation (overwrite existing symlink)
ln -sf /opt/myapp/v1.2.0 /opt/myapp/current

# List symlinks (shown with ->)
ls -la /usr/local/bin/
# lrwxrwxrwx 1 root root 31 Apr 10 myapp-start -> /opt/myapp/current/bin/start.sh

# Find all symlinks in a directory
find /etc -type l
```

### Hard vs Soft Links

| Property | Hard Link | Soft Link (Symlink) |
|---|---|---|
| Spans filesystems | No | Yes |
| Can link to directories | No (generally) | Yes |
| Survives target deletion | Yes (data persists) | No (becomes broken) |
| Shows as `l` in `ls -l` | No | Yes |
| Common use case | Backup, inode sharing | Version management, PATH shortcuts |

### Common Symlink Pattern: Version Management

When deploying applications, symlinks give you instant rollback:

```bash
# Deploy a new version
cp -r myapp-v1.2.0/ /opt/myapp/v1.2.0/

# Point 'current' to the new version
ln -sf /opt/myapp/v1.2.0 /opt/myapp/current

# Your service config points to /opt/myapp/current/
# To rollback, just update the symlink:
ln -sf /opt/myapp/v1.1.9 /opt/myapp/current
```

---

## Finding Files — `find`

`find` is one of the most powerful commands in Linux. It traverses a directory tree and returns files matching your criteria.

### Basic Syntax

```bash
find [path] [expression]
```

### Find by Name

```bash
# Find files named exactly "app.conf"
find /etc -name "app.conf"

# Case-insensitive name search
find /var -iname "*.log"

# Wildcard: all .jar files
find /opt -name "*.jar"

# Find files matching multiple patterns
find /opt -name "*.jar" -o -name "*.war"
```

### Find by Type

```bash
# Only files
find /tmp -type f

# Only directories
find /opt -type d

# Only symbolic links
find /usr/bin -type l

# Only files larger than 0 bytes (not empty)
find /var/log -type f -size +0c
```

### Find by Size

```bash
# Files larger than 100 MB
find /var -type f -size +100M

# Files smaller than 1 KB
find /tmp -type f -size -1k

# Files exactly 512 bytes
find /tmp -type f -size 512c
```

Size units: `c` (bytes), `k` (kilobytes), `M` (megabytes), `G` (gigabytes).

### Find by Modification Time

```bash
# Modified in the last 24 hours
find /var/log -type f -mtime -1

# Modified more than 30 days ago
find /var/log -type f -mtime +30

# Modified more than 7 days ago (in minutes: 7*24*60 = 10080)
find /tmp -type f -mmin +10080

# Modified in the last 60 minutes
find /var/log -type f -mmin -60
```

### Find by Owner and Permissions

```bash
# Files owned by a specific user
find /home -user ubuntu

# Files with specific permissions
find /etc -type f -perm 644

# Files with SUID bit set (security audit)
find / -type f -perm /4000 2>/dev/null

# Files writable by group or other (security audit)
find /etc -type f -perm /022
```

### Executing Commands on Found Files

```bash
# Delete all .tmp files in /tmp older than 7 days
find /tmp -name "*.tmp" -mtime +7 -delete

# Delete using -exec (the {} is replaced by each found file, \; ends the command)
find /tmp -name "*.tmp" -mtime +7 -exec rm {} \;

# More efficient: use + instead of \; to pass multiple files at once
find /tmp -name "*.tmp" -mtime +7 -exec rm {} +

# Print file sizes for all .log files
find /var/log -name "*.log" -exec ls -lh {} \;

# Change permissions on all .sh files
find /opt/scripts -name "*.sh" -exec chmod 755 {} +

# Search for text inside found files
find /opt/myapp -name "*.conf" -exec grep -l "database.host" {} \;
```

### Combining Conditions

```bash
# Files that are older than 30 days AND larger than 10 MB
find /var/log -type f -mtime +30 -size +10M

# Files modified today in /var/log, but not in the archive subdirectory
find /var/log -type f -mtime -1 -not -path "*/archive/*"

# All .log files except those named debug.log
find /var/log -name "*.log" ! -name "debug.log"
```

---

## Finding Files by Name — `locate`

`locate` is much faster than `find` because it searches a pre-built database rather than the live filesystem. The trade-off is that the database is updated periodically (usually nightly), so very recently created files may not appear.

```bash
# Install on Ubuntu/Debian
sudo apt install mlocate

# Update the database manually
sudo updatedb

# Find all files matching a pattern
locate nginx.conf

# Case-insensitive search
locate -i README

# Limit results
locate -l 10 "*.jar"

# Count matches only
locate -c "*.conf"
```

Use `locate` for quick lookups of established files. Use `find` when you need real-time accuracy or complex criteria.

---

## Finding Commands — `which` and `whereis`

```bash
# Find the full path of a command (searches $PATH)
which java
# /usr/bin/java

which node
# /usr/local/bin/node

# Returns nothing if the command is not found
which nonexistent-command
# (empty output, exit code 1)

# Find binary, source, and man page locations
whereis java
# java: /usr/bin/java /usr/share/man/man1/java.1.gz

whereis nginx
# nginx: /usr/sbin/nginx /etc/nginx /usr/share/man/man8/nginx.8.gz
```

`which` is useful in scripts to check whether a dependency is installed:

```bash
if ! which docker &>/dev/null; then
    echo "Error: Docker is not installed or not in PATH" >&2
    exit 1
fi
```

---

## Practical Scenarios

### Clean Up Old Log Files

```bash
# Find and delete log files older than 90 days
find /var/log/myapp -name "*.log" -type f -mtime +90 -delete

# Preview first (remove -delete to see what would be deleted)
find /var/log/myapp -name "*.log" -type f -mtime +90
```

### Find Large Files Consuming Disk Space

```bash
# Find the 10 largest files under /var
find /var -type f -printf '%s %p\n' 2>/dev/null | sort -rn | head -10
```

### Bulk Rename Files

```bash
# Rename all .txt files to .md using find + mv (no external tools needed)
find . -name "*.txt" -type f | while read file; do
    mv "$file" "${file%.txt}.md"
done
```

### Verify Deployment: Find Recently Modified Config Files

```bash
# Files changed in the last 10 minutes (useful after a deployment)
find /etc/myapp /opt/myapp -type f -mmin -10
```
