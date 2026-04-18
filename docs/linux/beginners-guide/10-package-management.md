---
title: "Package Management"
sidebar_label: "Package Management"
description: Install, update, and remove software packages on Debian/Ubuntu with apt, RHEL/Fedora with dnf, and Alpine with apk.
slug: /linux/beginners-guide/package-management
tags: [linux, bash, shell, beginners]
keywords:
  - apt install ubuntu
  - dnf yum rhel
  - apk alpine linux
  - linux package manager
  - PPA ubuntu
sidebar_position: 10
---

# Package Management

Every Linux distribution includes a **package manager** — a tool that downloads, installs, updates, and removes software from a curated repository of pre-built packages. Package managers handle dependency resolution automatically: when you install `nginx`, it also installs every library nginx depends on.

The package manager you use depends entirely on the distribution you are running. As a developer working across different environments, you will encounter at least two of these.

---

## Debian / Ubuntu — `apt`

`apt` (Advanced Package Tool) is the package manager for Debian-based systems including Ubuntu, Linux Mint, and Raspberry Pi OS. It is the one you will use most often on cloud servers.

### Updating the Package Index

Before installing anything, update the local package list — this fetches the latest package metadata from the configured repositories:

```bash
sudo apt update
```

This does **not** install anything. It only refreshes the list of available packages and versions. Run this first, every time.

### Upgrading Installed Packages

```bash
# Upgrade all upgradable packages
sudo apt upgrade

# Non-interactive upgrade (no prompts — safe for scripts)
sudo apt upgrade -y

# Full upgrade: also handles packages that require removal to upgrade
sudo apt full-upgrade

# Upgrade a single package
sudo apt install --only-upgrade nginx

# Update then upgrade in one line (common pattern)
sudo apt update && sudo apt upgrade -y
```

### Installing Packages

```bash
# Install a package
sudo apt install nginx

# Install multiple packages
sudo apt install nginx postgresql nodejs npm

# Non-interactive install
sudo apt install -y nginx

# Install a specific version
sudo apt install nginx=1.24.0-1ubuntu1

# Install a local .deb file
sudo apt install ./mypackage_1.0.0_amd64.deb
```

### Removing Packages

```bash
# Remove a package (keeps config files)
sudo apt remove nginx

# Remove with config files (purge)
sudo apt purge nginx

# Remove automatically installed dependencies no longer needed
sudo apt autoremove

# Remove all of the above in one shot
sudo apt purge nginx && sudo apt autoremove

# Remove without prompts
sudo apt remove -y nginx
```

### Searching for Packages

```bash
# Search for packages by keyword
apt search nodejs

# Show info about a specific package
apt show nginx

# Check whether a package is installed
dpkg -l nginx
# or
apt list --installed | grep nginx

# List all installed packages
apt list --installed

# List installed packages with versions
dpkg -l | grep ^ii
```

### Package Information

```bash
# What files does a package install?
dpkg -L nginx

# Which package does a file belong to?
dpkg -S /usr/sbin/nginx
# nginx: /usr/sbin/nginx

# What are the dependencies of a package?
apt-cache depends nginx

# What packages depend on this one?
apt-cache rdepends nginx
```

### Cleaning Cache

```bash
# Remove downloaded package files from cache
sudo apt clean

# Remove only outdated cached packages
sudo apt autoclean

# Check how much space the cache is using
du -sh /var/cache/apt/archives/
```

### Non-Interactive Mode for Scripts

When using apt in scripts, set these environment variables to prevent interactive prompts:

```bash
export DEBIAN_FRONTEND=noninteractive
sudo apt update
sudo apt install -y nginx postgresql curl git
```

A complete setup script:

```bash
#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "Installing dependencies..."
sudo apt update
sudo apt install -y \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    postgresql \
    postgresql-contrib

echo "Done"
```

---

## Adding Repositories — PPAs

Ubuntu's default repositories do not always have the latest software versions. **PPAs** (Personal Package Archives) and third-party repositories provide more recent or specialised packages.

### Ubuntu PPAs

```bash
# Add a PPA (example: git-core PPA for the latest git)
sudo add-apt-repository ppa:git-core/ppa -y
sudo apt update
sudo apt install git

# Remove a PPA
sudo add-apt-repository --remove ppa:git-core/ppa
```

### Third-Party Repositories

Many vendors (Node.js, Nginx, Docker, PostgreSQL) maintain their own Debian/Ubuntu repositories with up-to-date packages:

```bash
# Example: Install Node.js 20 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

```bash
# Example: Install Docker from Docker's official repository
# 1. Install prerequisites
sudo apt install -y ca-certificates curl gnupg

# 2. Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Add the repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

Repository configurations are stored in:
- `/etc/apt/sources.list` — main sources file
- `/etc/apt/sources.list.d/*.list` — drop-in files (preferred for third-party repos)

---

## RHEL / Fedora / CentOS — `dnf` and `yum`

`dnf` (Dandified YUM) is the package manager for Red Hat-based systems. It replaced `yum` in Fedora 22 and RHEL 8. On older RHEL/CentOS 7 systems, use `yum` — the syntax is largely identical.

### Core Commands

```bash
# Update package index (implicit with most operations in dnf, but explicit is clearer)
sudo dnf check-update

# Upgrade all packages
sudo dnf upgrade

# Upgrade a specific package
sudo dnf upgrade nginx

# Install a package
sudo dnf install nginx

# Install multiple packages
sudo dnf install nginx postgresql nodejs npm git

# Non-interactive install
sudo dnf install -y nginx

# Remove a package
sudo dnf remove nginx

# Search for a package
dnf search nodejs

# Show package info
dnf info nginx

# List installed packages
dnf list installed

# List all available packages
dnf list available | grep nginx
```

### Groups

`dnf` supports installing predefined groups of related packages:

```bash
# List available groups
dnf group list

# Install a group
sudo dnf groupinstall "Development Tools"

# Remove a group
sudo dnf groupremove "Development Tools"
```

### Repository Management

```bash
# List enabled repositories
dnf repolist

# List all repositories (enabled and disabled)
dnf repolist all

# Enable a repository
sudo dnf config-manager --enable epel

# Add EPEL (Extra Packages for Enterprise Linux — essential for RHEL/CentOS)
sudo dnf install epel-release

# Add a third-party repo (example: nginx.org)
sudo dnf install https://nginx.org/packages/rhel/9/x86_64/RPMS/nginx-1.24.0-1.el9.ngx.x86_64.rpm
```

### yum vs dnf

If you are on an older RHEL 7 / CentOS 7 system:

```bash
# yum syntax is nearly identical
sudo yum update
sudo yum install nginx
sudo yum remove nginx
sudo yum search nodejs
yum list installed
```

You can generally substitute `yum` for `dnf` and the commands will work.

---

## Alpine Linux — `apk`

Alpine uses `apk` (Alpine Package Keeper). It is primarily encountered inside Docker containers.

```bash
# Update the package index
apk update

# Upgrade all packages
apk upgrade

# Install a package
apk add nginx

# Install multiple packages
apk add nginx curl git bash

# Install without caching (smaller Docker image — very common)
apk add --no-cache nginx curl git

# Remove a package
apk del nginx

# Search for a package
apk search nodejs

# Show package info
apk info nginx

# List installed packages
apk list --installed

# List all files installed by a package
apk info -L nginx
```

### Dockerfile Pattern with Alpine

```dockerfile
FROM alpine:3.19

RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    bash

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

The `--no-cache` flag skips writing to the local cache, keeping the image small. If you need to install multiple packages in a Dockerfile, chain them in a single `RUN` instruction to avoid intermediate layers.

---

## Package Manager Comparison

| Operation | apt (Debian/Ubuntu) | dnf (RHEL/Fedora) | apk (Alpine) |
|---|---|---|---|
| Update index | `apt update` | `dnf check-update` | `apk update` |
| Upgrade all | `apt upgrade` | `dnf upgrade` | `apk upgrade` |
| Install | `apt install pkg` | `dnf install pkg` | `apk add pkg` |
| Remove | `apt remove pkg` | `dnf remove pkg` | `apk del pkg` |
| Search | `apt search pkg` | `dnf search pkg` | `apk search pkg` |
| Package info | `apt show pkg` | `dnf info pkg` | `apk info pkg` |
| List installed | `apt list --installed` | `dnf list installed` | `apk list -I` |
| File to package | `dpkg -S /path/file` | `dnf provides /path/file` | `apk info --who-owns /path` |
| Files in package | `dpkg -L pkg` | `dnf repoquery -l pkg` | `apk info -L pkg` |
| Clean cache | `apt clean` | `dnf clean all` | `apk cache clean` |

---

## Installing Software Outside the Package Manager

Sometimes the version in the distribution's repository is too old, or the software is not packaged at all. Common alternatives:

### Compile from Source

```bash
# General pattern for software using autotools
./configure --prefix=/usr/local
make
sudo make install
```

### Install to `/usr/local/bin`

```bash
# Download a pre-compiled binary (e.g., Hugo static site generator)
curl -L https://github.com/gohugoio/hugo/releases/download/v0.124.0/hugo_0.124.0_linux-amd64.tar.gz \
  | sudo tar -xz -C /usr/local/bin hugo

# Verify
hugo version
```

### Snap and Flatpak

Available on Ubuntu and some other distributions:

```bash
# Snap (Ubuntu)
sudo snap install code --classic

# Flatpak (many distros)
flatpak install flathub com.spotify.Client
```

These sandboxed package formats are primarily useful on developer workstations, not production servers.

---

## Practical Patterns

### Idempotent Setup Script

```bash
#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

install_if_missing() {
    local PACKAGE="$1"
    if dpkg -l "$PACKAGE" 2>/dev/null | grep -q "^ii"; then
        echo "$PACKAGE is already installed"
    else
        echo "Installing $PACKAGE..."
        sudo apt install -y "$PACKAGE"
    fi
}

sudo apt update
for PKG in nginx postgresql-14 nodejs git curl jq; do
    install_if_missing "$PKG"
done
```

### Check Package Version in a Script

```bash
# Minimum Node.js version check
MIN_NODE_VERSION=18
CURRENT_VERSION=$(node --version | grep -oP '\d+' | head -1)

if [ "$CURRENT_VERSION" -lt "$MIN_NODE_VERSION" ]; then
    echo "Node.js $MIN_NODE_VERSION+ required, found $CURRENT_VERSION" >&2
    exit 1
fi
```
