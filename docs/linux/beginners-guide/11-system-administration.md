---
title: "System Administration"
sidebar_label: "System Administration"
description: Administer a Linux server — disk usage, cron jobs, log management, and environment variable configuration.
slug: /linux/beginners-guide/system-administration
tags: [linux, bash, shell, beginners]
keywords:
  - df du disk usage
  - crontab cron jobs
  - logrotate linux
  - environment variables linux
  - lsblk fdisk
sidebar_position: 11
---

# System Administration

Day-to-day server administration involves monitoring disk space, scheduling recurring tasks, managing logs, and configuring the environment for running applications. This chapter covers the practical administration commands you will use regularly when maintaining a production Linux server.

---

## Disk Usage

Disk-full situations are among the most common server emergencies. Monitoring disk usage proactively — and knowing how to find what is consuming space when things go wrong — is an essential skill.

### `df` — Disk Free (Filesystem Level)

`df` shows how much space is used and available on each mounted filesystem.

```bash
# Human-readable sizes
df -h

# Output on a typical cloud VM:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1        20G   14G  5.3G  73% /
# tmpfs           2.0G     0  2.0G   0% /dev/shm
# /dev/sdb1        50G  8.2G   39G  18% /data

# Show inode usage (important — you can run out of inodes with many small files)
df -i

# Show only real filesystems (exclude tmpfs, devtmpfs, etc.)
df -h --exclude-type=tmpfs --exclude-type=devtmpfs
```

A disk at over 90% use is a warning sign. At 100%, writes fail and services crash.

### `du` — Disk Usage (Directory Level)

When `df` shows a disk is full, use `du` to find where the space went.

```bash
# Show total size of current directory
du -sh .

# Show size of each item in the current directory
du -sh *

# Show size of all subdirectories under /var (sorted by size)
du -sh /var/*/ | sort -h

# Find the top 10 largest directories anywhere
du -h --max-depth=3 / 2>/dev/null | sort -h | tail 20

# Show individual files (not just directories)
du -ah /var/log/ | sort -h | tail 20

# Exclude certain paths
du -sh /var/log/* --exclude="*.gz"
```

### Finding Large Files

Combine `find` with `du` or use `find` alone:

```bash
# Find files larger than 500 MB
find / -type f -size +500M -exec ls -lh {} \; 2>/dev/null

# Find the 20 largest files in /var
find /var -type f -printf '%s %p\n' 2>/dev/null \
  | sort -rn \
  | head 20 \
  | awk '{printf "%.1f MB  %s\n", $1/1048576, $2}'

# Files larger than 100 MB in /var/log
find /var/log -type f -size +100M -ls 2>/dev/null
```

---

## Disk Partitions and Block Devices

### `lsblk` — List Block Devices

```bash
# Show all block devices in a tree
lsblk

# Sample output:
# NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
# sda      8:0    0   20G  0 disk
# ├─sda1   8:1    0   19G  0 part /
# └─sda2   8:2    0    1G  0 part [SWAP]
# sdb      8:16   0   50G  0 disk
# └─sdb1   8:17   0   50G  0 part /data

# Show filesystem type and UUID
lsblk -f

# Show sizes in bytes
lsblk -b
```

### `fdisk` — Partition Table Management

Use `fdisk` to view partition tables. Be cautious with modifications — mistakes destroy data.

```bash
# List all partition tables (safe, read-only)
sudo fdisk -l

# List for a specific disk
sudo fdisk -l /dev/sda

# Interactive partitioning (destructive if you write changes)
sudo fdisk /dev/sdb
# Inside fdisk:
# p — print partition table
# n — new partition
# d — delete partition
# w — write changes and exit (WARNING: this commits changes)
# q — quit without saving
```

### Mounting a New Disk

A common task when adding storage to a server:

```bash
# 1. Identify the new disk
lsblk

# 2. Create a partition
sudo fdisk /dev/sdb
# Create a new partition: n → p → 1 → Enter → Enter → w

# 3. Format the partition
sudo mkfs.ext4 /dev/sdb1

# 4. Create a mount point
sudo mkdir -p /data

# 5. Mount it
sudo mount /dev/sdb1 /data

# 6. Make it permanent — add to /etc/fstab
echo "UUID=$(blkid -s UUID -o value /dev/sdb1) /data ext4 defaults 0 2" \
  | sudo tee -a /etc/fstab

# 7. Verify fstab is correct before rebooting
sudo mount -a
```

---

## Scheduling Tasks — `cron`

`cron` is the standard Linux job scheduler. It runs commands at specified times automatically.

### `crontab` — Edit User Cron Jobs

```bash
# Edit the cron table for the current user
crontab -e

# List current cron jobs
crontab -l

# Remove all cron jobs for the current user (careful)
crontab -r

# Edit cron jobs for a specific user (as root)
sudo crontab -u deploy -e
```

### Cron Syntax

Each cron entry has six fields:

```
┌───────────── minute        (0–59)
│ ┌─────────── hour          (0–23)
│ │ ┌───────── day of month  (1–31)
│ │ │ ┌─────── month         (1–12)
│ │ │ │ ┌───── day of week   (0–7, both 0 and 7 are Sunday)
│ │ │ │ │
* * * * * command to execute
```

### Common Patterns

```
# Every minute
* * * * * /opt/scripts/heartbeat.sh

# Every 5 minutes
*/5 * * * * /opt/scripts/check-health.sh

# Every hour (at minute 0)
0 * * * * /opt/scripts/cleanup.sh

# Every day at 2:30 AM
30 2 * * * /opt/scripts/backup.sh

# Every weekday at 8:00 AM
0 8 * * 1-5 /opt/scripts/report.sh

# Every Sunday at midnight
0 0 * * 0 /opt/scripts/weekly-report.sh

# First day of every month at 3:00 AM
0 3 1 * * /opt/scripts/monthly-cleanup.sh

# Every 15 minutes between 9 AM and 5 PM on weekdays
*/15 9-17 * * 1-5 /opt/scripts/sync.sh
```

### Cron Job Best Practices

```bash
# Always use absolute paths — cron runs with a minimal environment
0 2 * * * /opt/scripts/backup.sh > /var/log/backup.log 2>&1

# Redirect output — by default, cron emails output (often not set up)
*/5 * * * * /opt/scripts/monitor.sh >> /var/log/monitor.log 2>&1

# Discard output entirely (silent cron job)
0 * * * * /opt/scripts/cleanup.sh > /dev/null 2>&1

# Add a timestamp to logs
0 2 * * * echo "=== Backup started: $(date) ===" >> /var/log/backup.log && /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# Use flock to prevent overlapping runs (if the previous job is still running)
*/5 * * * * flock -n /tmp/monitor.lock /opt/scripts/monitor.sh >> /var/log/monitor.log 2>&1
```

### System-Wide Cron

In addition to per-user crontabs, you can add cron jobs to system directories:

```bash
# Predefined schedule directories (drop scripts here)
/etc/cron.hourly/
/etc/cron.daily/
/etc/cron.weekly/
/etc/cron.monthly/

# System-wide crontab (has an additional user field)
/etc/crontab

# Drop-in files for system cron jobs
/etc/cron.d/
```

Example `/etc/cron.d/myapp`:

```
# Run the cleanup as the deploy user
0 3 * * * deploy /opt/myapp/scripts/cleanup.sh >> /var/log/myapp/cleanup.log 2>&1
```

---

## Log Files

### Key Log Locations

```bash
# System logs
/var/log/syslog          # General system log (Debian/Ubuntu)
/var/log/messages        # General system log (RHEL/Fedora)
/var/log/auth.log        # Authentication events (Debian/Ubuntu)
/var/log/secure          # Authentication events (RHEL/Fedora)
/var/log/kern.log        # Kernel messages
/var/log/dmesg           # Boot kernel messages

# Service logs
/var/log/nginx/          # Nginx access and error logs
/var/log/apache2/        # Apache logs
/var/log/postgresql/     # PostgreSQL logs
/var/log/mysql/          # MySQL logs

# Application logs (typically)
/var/log/myapp/          # Your application's log directory
```

### Reading Logs

```bash
# View the last 100 lines of syslog
tail -n 100 /var/log/syslog

# Follow auth.log in real time
tail -f /var/log/auth.log

# Search for failed login attempts
grep "Failed password" /var/log/auth.log | tail -20

# View logs for a specific date range
grep "Apr 10" /var/log/syslog

# Count errors per hour (nginx example)
awk '{print substr($4, 2, 14)}' /var/log/nginx/access.log \
  | sort | uniq -c | sort -rn | head 24
```

---

## Log Rotation — `logrotate`

Without rotation, log files grow until they fill the disk. `logrotate` solves this by periodically compressing, renaming, and deleting old logs.

### How It Works

`logrotate` is typically run daily by a cron job in `/etc/cron.daily/logrotate`. It reads configuration files from `/etc/logrotate.conf` and `/etc/logrotate.d/`.

### Viewing Existing Config

```bash
# Default configuration
cat /etc/logrotate.conf

# Per-application configs
ls /etc/logrotate.d/
cat /etc/logrotate.d/nginx
```

### Writing a logrotate Config

Create `/etc/logrotate.d/myapp`:

```
/var/log/myapp/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 deploy adm
    sharedscripts
    postrotate
        systemctl reload myapp 2>/dev/null || true
    endscript
}
```

| Directive | Meaning |
|---|---|
| `daily` | Rotate every day (`weekly`, `monthly` also valid) |
| `rotate 30` | Keep 30 rotated files before deleting |
| `compress` | gzip the rotated file |
| `delaycompress` | Compress on the next rotation (not immediately — useful for services that keep file handles) |
| `missingok` | Don't error if the log file is missing |
| `notifempty` | Skip rotation if the file is empty |
| `create 0640 deploy adm` | Create the new log file with these permissions |
| `postrotate` | Shell commands to run after rotation (signal the app to reopen log files) |

### Testing logrotate

```bash
# Dry run: show what would happen without doing it
sudo logrotate -d /etc/logrotate.d/myapp

# Force rotation now (even if it's not time)
sudo logrotate -f /etc/logrotate.d/myapp

# Check the logrotate status file
cat /var/lib/logrotate/status | grep myapp
```

---

## Environment Variables

Environment variables configure the runtime environment for processes: database connection strings, API keys, port numbers, feature flags, and more.

### Viewing and Setting Variables

```bash
# List all environment variables
env
printenv

# Show a specific variable
echo $HOME
echo $PATH
printenv NODE_ENV

# Set a variable for the current session only
export PORT=3000
export NODE_ENV=production

# Unset a variable
unset PORT

# Set for a single command only
NODE_ENV=production node server.js
```

### Making Variables Permanent

There are several places to define environment variables, depending on scope:

| File | Scope | When Loaded |
|---|---|---|
| `~/.bashrc` | Current user, non-login shells | Each new terminal |
| `~/.bash_profile` / `~/.profile` | Current user, login shells | SSH login, `su -` |
| `~/.zshrc` | Current user (Zsh) | Each new Zsh terminal |
| `/etc/environment` | System-wide, all users | At login |
| `/etc/profile` | System-wide, login shells | At login |
| `/etc/profile.d/*.sh` | System-wide (drop-in) | At login |

```bash
# Add to ~/.bashrc (persistent for your user, non-login shells)
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bashrc

# Apply immediately without logging out
source ~/.bashrc

# System-wide variable (visible to all users)
echo 'NODE_ENV=production' | sudo tee -a /etc/environment

# Drop-in file for system-wide PATH addition
echo 'export PATH="/usr/local/myapp/bin:$PATH"' | sudo tee /etc/profile.d/myapp.sh
sudo chmod 644 /etc/profile.d/myapp.sh
```

### Environment Variables for Services

When running applications as systemd services, do **not** rely on `.bashrc` — systemd does not load it. Set environment variables in the service unit file:

```ini
[Service]
# Inline variables
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=LOG_LEVEL=info

# Or load from a file (one KEY=value per line)
EnvironmentFile=/etc/myapp/environment
```

`/etc/myapp/environment`:
```
NODE_ENV=production
PORT=3000
DB_HOST=db.example.com
DB_PASSWORD=hunter2
LOG_LEVEL=warn
```

```bash
# Protect the secrets file
sudo chown root:deploy /etc/myapp/environment
sudo chmod 640 /etc/myapp/environment
```

### PATH Management

`$PATH` is a colon-separated list of directories where the shell looks for executables.

```bash
# View current PATH
echo $PATH
# /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Add a directory to the beginning of PATH (takes priority)
export PATH="/usr/local/myapp/bin:$PATH"

# Add to the end (lower priority)
export PATH="$PATH:/usr/local/myapp/bin"

# Make permanent by adding to ~/.bashrc
echo 'export PATH="/usr/local/go/bin:$PATH"' >> ~/.bashrc
```

---

## Quick System Health Overview

A useful set of commands to run when you first connect to a server to assess its health:

```bash
#!/bin/bash
# system-health.sh — quick server health overview

echo "=== $(hostname) — $(date) ==="
echo ""

echo "--- Uptime & Load ---"
uptime

echo ""
echo "--- Memory ---"
free -h

echo ""
echo "--- Disk Usage ---"
df -h --exclude-type=tmpfs --exclude-type=devtmpfs

echo ""
echo "--- Top CPU Processes ---"
ps aux --sort=-%cpu | head -6

echo ""
echo "--- Top Memory Processes ---"
ps aux --sort=-%mem | head -6

echo ""
echo "--- Failed Services ---"
systemctl list-units --state=failed --no-legend

echo ""
echo "--- Recent Errors (syslog) ---"
grep -i "error\|critical\|emerg" /var/log/syslog 2>/dev/null | tail -5
```
