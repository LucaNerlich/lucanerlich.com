---
title: "Permissions and Ownership"
sidebar_label: "Permissions & Ownership"
description: Understand Linux file permissions, ownership, chmod, chown, umask, and sudo for secure server access control.
slug: /linux/beginners-guide/permissions-and-ownership
tags: [linux, bash, shell, beginners]
keywords:
  - linux permissions
  - chmod chown
  - rwx octal notation
  - sudo sudoers
  - umask setuid
sidebar_position: 5
---

# Permissions and Ownership

Linux has a fine-grained permission system that controls who can read, write, and execute every file and directory on the system. Understanding permissions is not optional — misconfigured permissions cause security vulnerabilities, service failures, and are a frequent source of "Permission denied" errors in production.

---

## The Permission Model

Every file and directory in Linux has:
- An **owner** (a user)
- An **owning group** (a group)
- A set of **permission bits** that define what the owner, the group, and everyone else can do

### Viewing Permissions

```bash
ls -la /opt/myapp/
# -rwxr-x--- 1 deploy www-data 8192 Apr 10 10:00 server
# drwxr-xr-x 3 deploy www-data 4096 Apr 10 10:00 config
# -rw-r--r-- 1 deploy www-data  512 Apr 10 10:00 README.md
```

The first column of `ls -la` is 10 characters long:

```
- r w x r - x - - -
│ │ │ │ │ │ │ │ │ │
│ ╰─────╯ ╰─────╯ ╰─────╯
│  owner   group   others
│
╰─ file type: - (file), d (directory), l (symlink), c (char device), b (block device)
```

### Permission Types

| Symbol | On a File | On a Directory |
|---|---|---|
| `r` (read) | Can read file contents | Can list directory contents (`ls`) |
| `w` (write) | Can modify file contents | Can create/delete files inside |
| `x` (execute) | Can run as a program | Can enter the directory (`cd`) |
| `-` | Permission denied | Permission denied |

A common confusion: **you need execute permission on a directory to `cd` into it or access files inside**, even if you have read permission.

### Who the Permissions Apply To

| Category | Meaning |
|---|---|
| **Owner** (user) | The user who owns the file |
| **Group** | Users who are members of the owning group |
| **Others** | Everyone else |

---

## Octal Notation

Each permission triplet (rwx) can be expressed as a 3-bit binary number, then converted to octal (0–7).

| Binary | Octal | Permissions |
|---|---|---|
| 000 | 0 | `---` |
| 001 | 1 | `--x` |
| 010 | 2 | `-w-` |
| 011 | 3 | `-wx` |
| 100 | 4 | `r--` |
| 101 | 5 | `r-x` |
| 110 | 6 | `rw-` |
| 111 | 7 | `rwx` |

A full permission set is three octal digits:

| Octal | Symbolic | Meaning |
|---|---|---|
| `755` | `rwxr-xr-x` | Owner: full. Group + others: read + execute. Common for executables. |
| `644` | `rw-r--r--` | Owner: read + write. Group + others: read only. Common for config files. |
| `600` | `rw-------` | Owner only. Common for private keys (`~/.ssh/id_ed25519`). |
| `700` | `rwx------` | Owner only, full. Common for private directories. |
| `777` | `rwxrwxrwx` | Everyone full access. Almost always wrong on a server. |
| `000` | `---------` | No permissions for anyone. |

---

## Changing Permissions — `chmod`

`chmod` (change mode) modifies the permission bits.

### Symbolic Mode

```bash
# Add execute for owner
chmod u+x script.sh

# Remove write for group and others
chmod go-w important.conf

# Set read+write for owner, read-only for everyone else
chmod u=rw,go=r config.txt

# Add execute for everyone
chmod a+x script.sh

# Remove all permissions for others
chmod o-rwx private.txt
```

| Symbol | Meaning |
|---|---|
| `u` | User (owner) |
| `g` | Group |
| `o` | Others |
| `a` | All (u+g+o) |
| `+` | Add permission |
| `-` | Remove permission |
| `=` | Set exactly |

### Octal Mode

```bash
# Set to rwxr-xr-x (755) — standard for executables/directories
chmod 755 script.sh
chmod 755 /opt/myapp/

# Set to rw-r--r-- (644) — standard for config/data files
chmod 644 app.conf

# Set to rw------- (600) — private files
chmod 600 ~/.ssh/id_ed25519

# Recursive: apply to directory and all contents
chmod -R 755 /opt/myapp/
chmod -R 644 /opt/myapp/config/

# Recursive with different permissions for files vs directories
# Set dirs to 755, files to 644
find /opt/myapp -type d -exec chmod 755 {} +
find /opt/myapp -type f -exec chmod 644 {} +
find /opt/myapp/bin -type f -exec chmod 755 {} +
```

---

## Changing Ownership — `chown` and `chgrp`

```bash
# Change owner
chown ubuntu file.txt

# Change owner and group
chown ubuntu:www-data file.txt

# Change only group (with chown)
chown :www-data file.txt

# Change only group (with chgrp)
chgrp www-data file.txt

# Recursive
chown -R deploy:deploy /opt/myapp/

# Change owner following symlinks (default behaviour)
# Use -h to change the symlink itself, not the target
chown -h ubuntu symlink.txt
```

### Common Deployment Pattern

When deploying a web application:

```bash
# App files owned by the deploy user
chown -R deploy:deploy /opt/myapp/

# Web server needs to read static files
chown -R deploy:www-data /opt/myapp/public/
chmod -R 750 /opt/myapp/
chmod -R 755 /opt/myapp/public/

# Logs writable by app, readable by ops
chown -R deploy:ops /var/log/myapp/
chmod -R 770 /var/log/myapp/
```

---

## Default Permissions — `umask`

When you create a new file or directory, Linux assigns default permissions. The `umask` (user file-creation mask) controls this by specifying which permission bits to remove from the defaults.

Base defaults before umask:
- Files: `666` (rw-rw-rw-)
- Directories: `777` (rwxrwxrwx)

The umask value is subtracted:

```bash
# View current umask
umask
# 0022

# With umask 022:
# Files:       666 - 022 = 644 (rw-r--r--)
# Directories: 777 - 022 = 755 (rwxr-xr-x)
```

| umask | New files | New directories |
|---|---|---|
| `022` | `644` | `755` |
| `027` | `640` | `750` |
| `077` | `600` | `700` |

```bash
# Set a stricter umask for a session
umask 027

# Set permanently in ~/.bashrc or ~/.zshrc
echo "umask 027" >> ~/.bashrc
```

For sensitive applications (private key storage, secrets directories), use umask `077` to ensure new files are accessible only to the owner.

---

## Special Permission Bits

Beyond the standard rwx bits, Linux has three special bits.

### Setuid (SUID) — 4000

When set on an executable, it runs with the **owner's permissions** regardless of who executes it.

```bash
# Classic example: /usr/bin/passwd
ls -la /usr/bin/passwd
# -rwsr-xr-x 1 root root 59976 ... /usr/bin/passwd

# The 's' in owner's execute position means SUID is set
# Regular users can run passwd, and it runs as root to modify /etc/shadow

# Set SUID (numeric)
chmod 4755 executable

# Set SUID (symbolic)
chmod u+s executable
```

SUID on scripts is generally ignored by the kernel. It only works reliably on compiled binaries.

### Setgid (SGID) — 2000

When set on an **executable**, it runs with the **group's permissions**. When set on a **directory**, new files created inside inherit the directory's group instead of the creator's primary group.

```bash
# Set SGID on a directory (useful for shared project directories)
chmod 2775 /opt/shared-project/
# Files created in here will be owned by the shared-project group

# Set SGID (numeric)
chmod 2755 executable

# Set SGID (symbolic)
chmod g+s directory/
```

### Sticky Bit — 1000

When set on a directory, only the **file's owner**, the **directory's owner**, or **root** can delete files inside it — even if other users have write access to the directory.

```bash
# /tmp always has sticky bit set
ls -ld /tmp
# drwxrwxrwt 20 root root 4096 Apr 10 /tmp
# The 't' at the end indicates sticky bit

# Set sticky bit
chmod 1777 /opt/shared-uploads/
chmod +t /opt/shared-uploads/
```

---

## Privilege Escalation — `sudo`

`sudo` (superuser do) allows a permitted user to run commands as root (or another user) without logging in as root.

```bash
# Run a command as root
sudo apt update

# Edit a root-owned file
sudo nano /etc/nginx/nginx.conf

# Run as a specific user
sudo -u postgres psql

# Open an interactive root shell
sudo -i

# Check which sudo commands you are allowed to run
sudo -l
```

### `/etc/sudoers` Basics

The sudoers file controls who can use sudo and what they can do. **Always edit it with `visudo`** — it validates syntax before saving, preventing you from locking yourself out.

```bash
sudo visudo
```

Sudoers syntax:

```
# Format: user host=(runas) command

# Allow ubuntu to run anything as root
ubuntu ALL=(ALL) ALL

# Allow ubuntu without a password prompt
ubuntu ALL=(ALL) NOPASSWD: ALL

# Allow a group to run specific commands
%ops ALL=(ALL) /bin/systemctl restart nginx, /bin/systemctl reload nginx

# Allow deploy user to run specific scripts
deploy ALL=(ALL) NOPASSWD: /opt/scripts/deploy.sh, /opt/scripts/rollback.sh
```

### Drop-In Sudoers Files

Rather than editing the main file, add files to `/etc/sudoers.d/`:

```bash
# Create a file for the deploy user
sudo visudo -f /etc/sudoers.d/deploy
```

```
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart myapp, /bin/systemctl status myapp
```

### `su` — Switch User

```bash
# Switch to root (requires root password)
su -

# Switch to another user
su - ubuntu

# The hyphen (-) starts a login shell (loads the user's environment)
# Without it, you switch user but keep the current environment
```

---

## Practical Security Checklist

After setting up a new server or deploying an application, verify these:

```bash
# SSH private keys: owner-only read
ls -la ~/.ssh/
# id_ed25519 should be 600, authorized_keys should be 600 or 644

# Config files: not world-writable
find /etc/myapp -type f -perm /002
# Should return nothing

# Find world-writable files (security risk)
find /opt/myapp -type f -perm /002

# Find SUID/SGID files (audit regularly)
find / -type f \( -perm /4000 -o -perm /2000 \) 2>/dev/null

# Application log directory: app writes, ops can read
ls -ld /var/log/myapp/
# drwxrwxr-x deploy ops — or drwxr-x--- deploy adm

# Web root: web server reads, not writes
ls -ld /var/www/html/
# drwxr-xr-x root root — nginx/apache serves as its own user
```
