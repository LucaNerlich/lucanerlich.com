---
title: "Introduction to Linux"
sidebar_label: "Introduction"
description: What Linux is, an overview of common distributions, why developers use it, and how to connect to a remote server via SSH.
slug: /linux/beginners-guide/introduction
tags: [linux, bash, shell, beginners]
keywords:
  - linux introduction
  - linux distributions
  - ubuntu debian alpine arch
  - bash vs zsh
  - ssh connect
sidebar_position: 1
---

# Introduction to Linux

Linux powers the internet. The overwhelming majority of web servers, cloud VMs, Docker containers, CI/CD runners, and embedded devices run some flavour of Linux. As a developer you can work in Java or JavaScript on a Mac or Windows workstation for years and never notice — until the moment you need to deploy an application, debug a production issue at 2 AM, or inspect what a container is actually doing at runtime. At that point, not knowing Linux is a significant handicap.

This guide is written for developers with a Java, JavaScript, or AEM background who have limited Linux experience. It is not a "Linux internals" textbook. It is a structured, practical reference that takes you from "how do I list files?" to writing robust shell scripts, managing services, and securing a server.

---

## What Is Linux?

Linux is an **operating system kernel** — the core software that manages hardware resources (CPU, RAM, disk, network) and provides services to the programs running on top of it. Linus Torvalds wrote the first version in 1991 and released it under an open-source licence. Today it is developed by thousands of contributors from companies including Google, Red Hat, Intel, and Meta.

The kernel alone is not a usable system. Around it sits a collection of tools — a shell, package manager, init system, filesystem utilities — collectively called a **distribution** (distro). Distributions bundle the kernel with these components and make decisions about default software, update cadence, and target audience.

### The Unix Philosophy

Linux inherits its design from Unix, built around a few guiding principles:

- **Small tools that do one thing well.** `ls` lists files. `grep` searches text. `sort` sorts lines. These tools are combined with pipes.
- **Everything is a file.** Devices, processes, and network sockets are all represented as files in the filesystem.
- **Text is the universal interface.** Configuration files are plain text. Command output is plain text. This makes automation with scripts straightforward.

As a developer already familiar with composing functions and chaining operations, the Unix philosophy will feel natural.

---

## Distributions Overview

There is no single "Linux." You choose a distribution based on your use case. Here are the ones you will encounter most often as a developer.

| Distribution | Base | Package Manager | Primary Use Case |
|---|---|---|---|
| **Ubuntu** | Debian | `apt` | Developer workstations, cloud VMs, general servers |
| **Debian** | — | `apt` | Stable servers, infrastructure |
| **Alpine Linux** | — | `apk` | Docker base images (tiny footprint, ~5 MB) |
| **Arch Linux** | — | `pacman` | Developer desktops, bleeding-edge software |
| **RHEL / Rocky Linux** | Red Hat | `dnf` / `yum` | Enterprise servers, regulated environments |
| **Fedora** | Red Hat | `dnf` | Developer workstations (upstream of RHEL) |
| **Amazon Linux** | RHEL-based | `dnf` | AWS EC2 instances |

### Ubuntu and Debian

Ubuntu is built on top of Debian and is the most popular choice for developers and cloud VMs. It ships LTS (Long-Term Support) releases every two years, each supported for five years. Ubuntu 22.04 LTS ("Jammy") and 24.04 LTS ("Noble") are the versions you will encounter most on cloud providers.

Debian is Ubuntu's upstream. It prioritises stability over new features, making it popular for long-lived servers where you do not want surprises.

### Alpine Linux

Alpine is tiny by design. Its default Docker image is around 7 MB versus Ubuntu's ~29 MB. It uses `musl libc` instead of `glibc`, which occasionally causes compatibility issues with software that assumes glibc — important to know when building Docker images.

### Arch Linux

Arch is a rolling-release distro popular among developers who want full control and always-current software. It requires manual installation and configuration, which is an excellent way to learn Linux internals. Its package repository (AUR) is comprehensive.

### When Does This Matter?

In a professional context, the distro determines:
- Which **package manager** you use to install software (`apt` vs `dnf` vs `apk`)
- Which **init system** manages services (most modern distros use `systemd`)
- Which **default shell** greets you (most use bash)
- Which versions of software are available by default

The core shell commands — `ls`, `grep`, `awk`, `find`, `curl` — are essentially identical across all of them.

---

## The Terminal and the Shell

The **terminal** (or terminal emulator) is the application that displays text and accepts keyboard input. In a server context, your terminal client is usually an SSH client (your local machine) connecting to a terminal on the remote server.

The **shell** is the program running inside the terminal that interprets your commands. When you type `ls -la` and press Enter, the shell parses that text, looks up the `ls` binary, passes `-la` as arguments, and displays the output.

### Bash

**Bash** (Bourne Again SHell) is the default shell on most Linux distributions. It has been the standard since the late 1980s and is what you should write scripts in unless you have a specific reason not to. Shell scripts starting with `#!/bin/bash` are virtually guaranteed to run on any Linux server.

```bash
# Check your current shell
echo $SHELL

# Check the bash version
bash --version
```

### Zsh

**Zsh** is bash-compatible with quality-of-life improvements: better tab completion, spelling correction, and a richer plugin ecosystem. The [Oh My Zsh](https://ohmyz.sh/) framework makes it easy to configure. macOS has shipped Zsh as its default shell since Catalina.

Zsh is excellent for interactive use. For scripts, stick to bash unless your team has standardised on Zsh.

### Fish

**Fish** (Friendly Interactive SHell) is a modern shell focused on user experience: autosuggestions based on history, syntax highlighting in real time, and a web-based configuration UI. Fish is deliberately not POSIX-compliant, which means bash scripts do not run inside fish without modification. Great for interactive use on a developer workstation, not appropriate for scripts.

### Choosing a Shell

| Shell | Best For | POSIX-Compatible | Script Portability |
|---|---|---|---|
| bash | Everything | Yes | High |
| zsh | Interactive use | Mostly | High (with caveats) |
| fish | Interactive use | No | Low |

**Rule of thumb:** Use whatever shell you like interactively. Always write scripts with `#!/bin/bash` as the shebang line.

---

## Connecting via SSH

SSH (Secure Shell) is the protocol for securely connecting to a remote Linux server. You will use it constantly.

### Basic SSH Connection

```bash
# Basic connection (prompts for password)
ssh username@hostname

# Connect to a specific port (default is 22)
ssh -p 2222 username@hostname

# Connect using a specific private key file
ssh -i ~/.ssh/my_key.pem username@hostname

# Run a single command on the remote server without opening an interactive session
ssh username@hostname "df -h"
```

### Generating an SSH Key Pair

Password authentication is convenient but less secure. Key-based authentication is the standard for servers.

```bash
# Generate an ED25519 key (modern, recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Or RSA 4096-bit if you need compatibility with older systems
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# The command creates two files:
# ~/.ssh/id_ed25519      (private key — keep this secret)
# ~/.ssh/id_ed25519.pub  (public key — copy this to servers)
```

### Copying Your Public Key to a Server

```bash
# The easiest way — appends your public key to ~/.ssh/authorized_keys on the server
ssh-copy-id username@hostname

# Manual alternative if ssh-copy-id is not available
cat ~/.ssh/id_ed25519.pub | ssh username@hostname "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### SSH Config File

Instead of typing long `ssh` commands repeatedly, you can define aliases in `~/.ssh/config`:

```
Host myserver
    HostName 203.0.113.42
    User deploy
    IdentityFile ~/.ssh/id_ed25519
    Port 22

Host staging
    HostName staging.example.com
    User ubuntu
    IdentityFile ~/.ssh/staging_key.pem
```

After saving that file, `ssh myserver` is equivalent to the full command. Chapter 9 covers SSH configuration in more depth.

---

## Your First Commands

Before diving into the full guide, here are five commands that will orient you on any system:

```bash
# Who am I?
whoami

# What machine am I on?
hostname

# What directory am I in?
pwd

# What is the OS?
cat /etc/os-release

# How long has the system been running?
uptime
```

Run these on any server you connect to and you immediately know your username, the machine's hostname, your current location in the filesystem, the Linux distribution, and whether the system recently rebooted.

---

## Guide Structure

This guide is organised into chapters that build on each other:

1. **Introduction** (this chapter) — What Linux is and how to connect
2. **Filesystem Navigation** — Moving around directories and understanding the Linux filesystem layout
3. **File Management** — Creating, copying, moving, deleting, and finding files
4. **Text Processing** — Reading and transforming text with grep, sed, awk, and pipes
5. **Permissions and Ownership** — Understanding and controlling who can do what
6. **Processes and Jobs** — Running, monitoring, and managing processes and services
7. **Shell Scripting Basics** — Variables, conditionals, and loops
8. **Functions and Script Patterns** — Reusable code, error handling, and script structure
9. **Networking** — curl, dig, SSH, rsync, and network diagnostics
10. **Package Management** — Installing software on Debian, RHEL, and Alpine systems
11. **System Administration** — Disk, cron, logs, and environment configuration
12. **Practice Project** — End-to-end: provision, secure, and deploy a Node.js app

Work through the chapters in order on a fresh Ubuntu VM or VPS — actually typing commands and observing the output is far more effective than reading passively.
