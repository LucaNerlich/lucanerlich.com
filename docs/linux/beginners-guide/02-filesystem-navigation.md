---
title: "Filesystem Navigation"
sidebar_label: "Filesystem Navigation"
description: Navigate the Linux filesystem with pwd, ls, cd, and tree, and understand the standard directory hierarchy.
slug: /linux/beginners-guide/filesystem-navigation
tags: [linux, bash, shell, beginners]
keywords:
  - linux filesystem
  - pwd ls cd
  - linux directory structure
  - absolute relative path
  - /etc /var /usr /tmp /proc
sidebar_position: 2
---

# Filesystem Navigation

Before you can do anything useful on a Linux server, you need to know where you are, how to get somewhere else, and what the standard directory layout means. This chapter covers the essential navigation commands and gives you a map of the Linux filesystem hierarchy.

---

## Where Am I? — `pwd`

`pwd` (Print Working Directory) tells you your current location in the filesystem.

```bash
pwd
# /home/ubuntu
```

Always run `pwd` when you first connect to a server or open a new terminal — it grounds you before you start making changes.

---

## Listing Files — `ls`

`ls` lists the contents of a directory. On its own it shows files and directories in the current location.

```bash
# List current directory
ls

# List a specific directory
ls /etc

# List with details (permissions, owner, size, date)
ls -l

# List all files including hidden ones (starting with .)
ls -a

# Combine: long format + all files
ls -la

# Human-readable file sizes (KB, MB, GB instead of bytes)
ls -lh

# Sort by modification time, newest first
ls -lt

# Sort by modification time, oldest first (reverse)
ls -ltr

# List only directories
ls -d */
```

### Understanding `ls -la` Output

```
drwxr-xr-x  3 ubuntu ubuntu 4096 Apr 10 09:12 .
drwxr-xr-x 10 root   root   4096 Apr  9 14:33 ..
-rw-r--r--  1 ubuntu ubuntu  220 Apr  9 14:33 .bash_logout
-rw-r--r--  1 ubuntu ubuntu 3526 Apr  9 14:33 .bashrc
drwx------  2 ubuntu ubuntu 4096 Apr 10 09:12 .ssh
-rw-r--r--  1 ubuntu ubuntu  807 Apr  9 14:33 .profile
```

| Column | Meaning |
|---|---|
| `drwxr-xr-x` | File type + permissions (d = directory, - = file, l = symlink) |
| `3` | Number of hard links |
| `ubuntu` | Owner (user) |
| `ubuntu` | Owner (group) |
| `4096` | Size in bytes |
| `Apr 10 09:12` | Last modification time |
| `.ssh` | Name |

Permissions are covered in detail in Chapter 5.

---

## Changing Directory — `cd`

```bash
# Go to a specific directory
cd /var/log

# Go to your home directory (three equivalent ways)
cd
cd ~
cd $HOME

# Go up one level (parent directory)
cd ..

# Go up two levels
cd ../..

# Go to the previous directory (useful for toggling between two locations)
cd -

# Go into a directory relative to where you are
cd config
cd ../other-project
```

### Tab Completion

Press `Tab` to auto-complete directory and file names. If there are multiple matches, press `Tab` twice to see all options. This is one of the most important productivity habits to build.

```bash
cd /var/lo<Tab>   # completes to /var/log/
cd /var/log/ap<Tab>  # completes to /var/log/apache2/ (if it exists)
```

---

## Absolute vs Relative Paths

This is one of the most important concepts to internalise.

**Absolute path** — starts with `/`. It describes the full path from the root of the filesystem. It works regardless of your current directory.

```bash
cd /home/ubuntu/projects
ls /etc/nginx/nginx.conf
cat /var/log/syslog
```

**Relative path** — does not start with `/`. It is interpreted relative to your current working directory.

```bash
# If you are in /home/ubuntu:
cd projects          # same as cd /home/ubuntu/projects
ls .bashrc           # same as ls /home/ubuntu/.bashrc
cat ../other-user/file.txt  # ../  goes up one level first
```

**When to use which:**
- In scripts, prefer **absolute paths** for reliability. A script using `cd logs` will break if run from a different directory.
- Interactively, relative paths are faster to type.

---

## The Home Directory — `~`

Every user has a home directory. For `ubuntu` it is `/home/ubuntu`. For `root` it is `/root`.

The tilde `~` is a shell shorthand that always expands to your home directory:

```bash
echo ~
# /home/ubuntu

ls ~/projects
# equivalent to: ls /home/ubuntu/projects

~otheruser/file
# another user's home directory
```

---

## Visualising Directory Trees — `tree`

`tree` prints a recursive directory listing as a visual tree. It is not always installed by default.

```bash
# Install on Ubuntu/Debian
sudo apt install tree

# Show tree of current directory
tree

# Limit depth (2 levels)
tree -L 2

# Show hidden files
tree -a

# Show file sizes
tree -h

# Show only directories
tree -d

# Point at a specific path
tree /etc/nginx
```

Example output:

```
/etc/nginx
├── conf.d
│   └── default.conf
├── nginx.conf
├── sites-available
│   ├── default
│   └── myapp
└── sites-enabled
    └── myapp -> ../sites-available/myapp
```

---

## The Linux Filesystem Hierarchy

Unlike Windows, which has drive letters (`C:\`, `D:\`), Linux has a single unified filesystem tree rooted at `/`. Everything — local disks, network mounts, virtual filesystems — appears somewhere under `/`.

### Top-Level Directories

```
/
├── bin      → Essential command binaries (ls, cp, grep)
├── boot     → Bootloader and kernel files
├── dev      → Device files (disks, terminals, random)
├── etc      → System-wide configuration files
├── home     → Home directories for regular users
├── lib      → Shared libraries for binaries in /bin and /sbin
├── media    → Mount points for removable media
├── mnt      → Temporary mount points
├── opt      → Optional / third-party software
├── proc     → Virtual filesystem: process and kernel information
├── root     → Home directory for the root user
├── run      → Runtime data (PIDs, sockets) — cleared on boot
├── sbin     → System administration binaries
├── srv      → Data for services (web, FTP)
├── sys      → Virtual filesystem: hardware and kernel parameters
├── tmp      → Temporary files — cleared on reboot
├── usr      → User programs, libraries, documentation
└── var      → Variable data: logs, databases, mail, caches
```

### Directories You Will Work With Most

#### `/etc` — Configuration

All system-wide configuration lives here. It is entirely plain-text files and directories.

```bash
ls /etc

# Key files
/etc/hostname         # The machine's hostname
/etc/hosts            # Static hostname-to-IP mappings
/etc/fstab            # Filesystem mount configuration
/etc/passwd           # User account information
/etc/group            # Group definitions
/etc/sudoers          # sudo permissions
/etc/ssh/sshd_config  # SSH daemon configuration
/etc/crontab          # System-wide cron jobs

# Key directories
/etc/nginx/           # Nginx configuration
/etc/systemd/         # systemd service definitions
/etc/apt/             # apt package manager configuration
/etc/environment      # System-wide environment variables
```

Never delete files from `/etc` unless you know exactly what you are doing. Always make a backup before editing critical configuration files:

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

#### `/var` — Variable Data

Contains data that changes at runtime: logs, databases, package cache, mail spools.

```bash
/var/log/             # Log files — you will spend a lot of time here
/var/log/syslog       # General system log (Debian/Ubuntu)
/var/log/messages     # General system log (RHEL/Fedora)
/var/log/auth.log     # Authentication attempts
/var/log/nginx/       # Nginx access and error logs
/var/lib/             # Application state (databases, package lists)
/var/cache/apt/       # Downloaded package files
/var/run/             # Symlink to /run
```

#### `/usr` — User Programs

Despite the name, `/usr` is not user home directories — it is where installed programs and their data live.

```bash
/usr/bin/             # Programs installed for all users (node, java, python3)
/usr/sbin/            # System administration programs
/usr/lib/             # Libraries for programs in /usr/bin
/usr/local/           # Software compiled/installed manually (not via apt)
/usr/local/bin/       # Good place to put your own scripts
/usr/share/           # Architecture-independent data (man pages, icons)
```

When you install a package with `apt install nodejs`, the binary ends up in `/usr/bin/node` and libraries in `/usr/lib/nodejs`.

#### `/tmp` — Temporary Files

Any user can write to `/tmp`. Files here are deleted on reboot. Use it for scratch files in scripts.

```bash
# Create a temp file safely in scripts
TMPFILE=$(mktemp)
echo "data" > "$TMPFILE"
# ... process TMPFILE ...
rm "$TMPFILE"
```

#### `/proc` — Process and Kernel Information

`/proc` is a virtual filesystem — its contents are generated on-the-fly by the kernel. Reading a file here queries the kernel directly.

```bash
# Current kernel version
cat /proc/version

# CPU information
cat /proc/cpuinfo

# Memory information
cat /proc/meminfo

# Currently mounted filesystems
cat /proc/mounts

# Information about a specific process (PID 1 is init/systemd)
ls /proc/1/
cat /proc/1/cmdline

# System uptime in seconds
cat /proc/uptime

# Open file descriptors for the current shell
ls /proc/$$/fd
```

#### `/dev` — Devices

Physical and virtual devices appear as files here.

```bash
/dev/sda              # First SATA disk
/dev/sda1             # First partition of that disk
/dev/nvme0n1          # First NVMe disk (common on modern cloud VMs)
/dev/null             # The black hole — writing to it discards data
/dev/zero             # Produces infinite zeros when read
/dev/random           # Cryptographically secure random bytes
/dev/tty              # Current terminal
```

```bash
# Discard output by redirecting to /dev/null
command_with_noisy_output 2>/dev/null

# Create a file filled with zeros (useful for testing disk)
dd if=/dev/zero of=/tmp/testfile bs=1M count=100
```

---

## Practical Navigation Patterns

### Jumping to Frequently Used Directories

```bash
# bookmark approach using shell aliases (add to ~/.bashrc)
alias proj='cd ~/projects'
alias logs='cd /var/log'
alias nginx='cd /etc/nginx'
```

### Finding Where a Program Is Installed

```bash
# Show the full path of a command
which node
# /usr/bin/node

which java
# /usr/local/bin/java

# Show all matching locations and man page locations
whereis java
# java: /usr/bin/java /usr/share/man/man1/java.1.gz
```

### Checking Disk Space Before You Get Stuck

A full disk is a common server emergency. Make checking disk space a habit:

```bash
# Human-readable disk usage for all mounted filesystems
df -h

# Sample output
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1        20G   12G  7.1G  63% /
# tmpfs           2.0G     0  2.0G   0% /dev/shm
```

If `Use%` climbs above 90%, investigate with `du` (covered in Chapter 11).
