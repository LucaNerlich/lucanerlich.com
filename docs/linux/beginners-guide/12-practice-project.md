---
title: "Practice Project — Deploy a Node.js App"
sidebar_label: "Practice Project"
description: End-to-end exercise provisioning a fresh Ubuntu VPS, securing it, deploying a Node.js app as a systemd service, and configuring log rotation.
slug: /linux/beginners-guide/practice-project
tags: [linux, bash, shell, beginners]
keywords:
  - ubuntu vps setup
  - ufw firewall
  - node.js systemd service
  - deploy node.js linux
  - server hardening
sidebar_position: 12
---

# Practice Project — Deploy a Node.js App

This chapter brings together everything covered in the guide into a single, end-to-end project. You will start from a fresh Ubuntu 22.04 LTS VPS, secure it, deploy a minimal Node.js application as a managed systemd service, and configure log rotation. Every step uses commands from the preceding chapters.

The goal is not just to follow instructions — it is to understand *why* each step is taken.

---

## What You Will Build

| Component | Detail |
|---|---|
| OS | Ubuntu 22.04 LTS |
| Non-root user | `deploy` with sudo access |
| SSH hardening | Key-only, root login disabled |
| Firewall | UFW allowing only SSH, HTTP, HTTPS |
| Application | Simple Node.js HTTP server |
| Service manager | systemd |
| Log rotation | logrotate, 30 days retention |

---

## Prerequisites

- A fresh Ubuntu 22.04 LTS VPS (from any cloud provider: AWS EC2, DigitalOcean, Hetzner, etc.)
- SSH access as root or an initial admin user
- Your local machine's SSH public key

---

## Phase 1: Initial Server Access

Connect to the fresh server:

```bash
# Connect as root (initial access with provider's key or password)
ssh root@YOUR_SERVER_IP
```

Once connected, check the OS and update:

```bash
# Confirm the OS
cat /etc/os-release

# Update package index and upgrade all packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl git vim ufw fail2ban
```

---

## Phase 2: Create a Non-Root User

Running everything as root is dangerous — a single mistake or compromised process can damage the entire system. Create a dedicated user.

```bash
# Create the deploy user with a home directory
useradd -m -s /bin/bash deploy

# Set a strong password (optional if using key-only auth)
passwd deploy

# Add to the sudo group
usermod -aG sudo deploy

# Verify the user was created
id deploy
# uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),27(sudo)

# Switch to the new user to test sudo works
su - deploy
sudo whoami   # should print "root"
exit
```

### Copy Your SSH Key to the New User

While still logged in as root:

```bash
# Create the .ssh directory for deploy
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Copy root's authorized_keys OR paste your public key directly
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
# OR
echo "ssh-ed25519 AAAAC3... your.email@example.com" \
  > /home/deploy/.ssh/authorized_keys

# Set correct ownership and permissions
chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

**Test the key before you lock yourself out:**

```bash
# In a NEW terminal (keep your root session open)
ssh deploy@YOUR_SERVER_IP
```

Only proceed if this works. If it does not, debug before continuing.

---

## Phase 3: Harden SSH

Edit the SSH daemon configuration to disable root login and password authentication:

```bash
# Back up the original config first
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Edit the config
sudo vim /etc/ssh/sshd_config
```

Find and update (or add) these lines:

```
# Disable root login
PermitRootLogin no

# Disable password authentication (key-only)
PasswordAuthentication no

# Disable empty passwords
PermitEmptyPasswords no

# Disable PAM challenge-response (another password vector)
ChallengeResponseAuthentication no

# Only allow specific users
AllowUsers deploy

# Use a non-standard port (optional — reduces noise in auth.log)
# Port 2222
```

Apply the changes:

```bash
# Validate the config before restarting (catches syntax errors)
sudo sshd -t
# If no output, the config is valid

# Restart SSH
sudo systemctl restart sshd

# Verify SSH is running
sudo systemctl status sshd
```

**Test again in a new terminal.** Confirm root login is rejected and deploy key login works.

---

## Phase 4: Configure the Firewall with UFW

`ufw` (Uncomplicated Firewall) provides a straightforward interface to `iptables`.

```bash
# Check current status
sudo ufw status

# Set default policies: deny everything incoming, allow everything outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (do this FIRST — before enabling, or you'll lock yourself out)
sudo ufw allow ssh
# Or if you changed the port:
# sudo ufw allow 2222/tcp

# Allow HTTP and HTTPS
sudo ufw allow http
sudo ufw allow https

# Enable the firewall
sudo ufw enable
# Confirm when prompted

# Verify rules
sudo ufw status verbose
```

Expected output:

```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

### Install fail2ban

`fail2ban` monitors log files and bans IP addresses that show brute-force patterns:

```bash
# fail2ban is already installed from Phase 1
sudo systemctl enable --now fail2ban

# Check it's watching SSH
sudo fail2ban-client status sshd

# View bans
sudo fail2ban-client status sshd | grep "Banned IP list"
```

The default SSH jail bans IPs after 5 failed login attempts in 10 minutes for 10 minutes.

---

## Phase 5: Install Node.js

Install Node.js 20 LTS from the NodeSource repository:

```bash
# Download and run the setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

---

## Phase 6: Create the Application

Create a minimal but realistic Node.js HTTP server:

```bash
# Create the application directory
sudo mkdir -p /opt/myapp/releases/1.0.0
sudo chown -R deploy:deploy /opt/myapp

# Switch to deploy user
su - deploy

# Create the application
mkdir -p /opt/myapp/releases/1.0.0
cd /opt/myapp/releases/1.0.0
```

Create `package.json`:

```bash
cat > /opt/myapp/releases/1.0.0/package.json << 'EOF'
{
  "name": "myapp",
  "version": "1.0.0",
  "description": "Practice Node.js application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18"
  }
}
EOF
```

Create `server.js`:

```bash
cat > /opt/myapp/releases/1.0.0/server.js << 'EOF'
'use strict';

const http = require('http');
const os = require('os');

const PORT = parseInt(process.env.PORT || '3000', 10);
const STARTED_AT = new Date().toISOString();

const server = http.createServer((req, res) => {
    const timestamp = new Date().toISOString();

    if (req.url === '/health') {
        const response = {
            status: 'ok',
            hostname: os.hostname(),
            uptime: process.uptime(),
            startedAt: STARTED_AT,
            timestamp
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));
    } else {
        const response = {
            message: 'Hello from Linux guide practice project!',
            path: req.url,
            method: req.method,
            timestamp
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));
    }

    process.stdout.write(`${timestamp} ${req.method} ${req.url}\n`);
});

server.listen(PORT, () => {
    process.stdout.write(`Server listening on port ${PORT}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    process.stdout.write('SIGTERM received, shutting down gracefully\n');
    server.close(() => {
        process.stdout.write('Server closed\n');
        process.exit(0);
    });
});
EOF
```

Create the symlink pointing to the current version:

```bash
ln -sfn /opt/myapp/releases/1.0.0 /opt/myapp/current

# Verify the symlink
ls -la /opt/myapp/
# lrwxrwxrwx 1 deploy deploy   28 Apr 10 current -> /opt/myapp/releases/1.0.0
# drwxr-xr-x 2 deploy deploy 4096 Apr 10 releases

# Test the app manually
node /opt/myapp/current/server.js &
curl http://localhost:3000/health
kill %1
```

---

## Phase 7: Create a systemd Service

Create the service unit file:

```bash
sudo tee /etc/systemd/system/myapp.service > /dev/null << 'EOF'
[Unit]
Description=My Node.js Practice Application
Documentation=https://lucanerlich.com/linux
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/myapp/current
ExecStart=/usr/bin/node server.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5s
StartLimitInterval=60s
StartLimitBurst=3

# Output handling
StandardOutput=append:/var/log/myapp/app.log
StandardError=append:/var/log/myapp/error.log

# Environment
Environment=NODE_ENV=production
Environment=PORT=3000

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/log/myapp

[Install]
WantedBy=multi-user.target
EOF
```

Create the log directory and set permissions:

```bash
sudo mkdir -p /var/log/myapp
sudo chown deploy:deploy /var/log/myapp
sudo chmod 755 /var/log/myapp
```

Enable and start the service:

```bash
# Reload systemd to pick up the new unit file
sudo systemctl daemon-reload

# Enable (start on boot) and start now
sudo systemctl enable --now myapp

# Check status
sudo systemctl status myapp
```

You should see:

```
● myapp.service - My Node.js Practice Application
     Loaded: loaded (/etc/systemd/system/myapp.service; enabled)
     Active: active (running) since Fri 2026-04-10 10:00:00 UTC; 3s ago
   Main PID: 12345 (node)
```

Test the running service:

```bash
# Local test
curl http://localhost:3000/health
curl http://localhost:3000/api/users

# View logs
tail -f /var/log/myapp/app.log

# Check journald logs too
sudo journalctl -u myapp -f
```

---

## Phase 8: Configure Log Rotation

Create a logrotate configuration for the application:

```bash
sudo tee /etc/logrotate.d/myapp > /dev/null << 'EOF'
/var/log/myapp/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 deploy deploy
    sharedscripts
    postrotate
        # Signal the service to reopen log file handles
        systemctl kill -s USR1 myapp.service 2>/dev/null || true
    endscript
}
EOF
```

Test the logrotate config:

```bash
# Dry run
sudo logrotate -d /etc/logrotate.d/myapp

# Force rotation to verify it works
sudo logrotate -f /etc/logrotate.d/myapp

# Verify the rotated file exists
ls -lh /var/log/myapp/
```

---

## Phase 9: Write a Deployment Script

This script simulates deploying a new version without downtime:

```bash
sudo tee /opt/myapp/deploy.sh > /dev/null << 'SCRIPT'
#!/bin/bash
# deploy.sh — deploy a new version of myapp
set -euo pipefail

readonly APP_DIR="/opt/myapp"
readonly APP_NAME="myapp"
readonly VERSION="${1:-}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die() { echo "[ERROR] $*" >&2; exit 1; }

[ -n "$VERSION" ] || die "Usage: $0 <version>"

RELEASE_DIR="${APP_DIR}/releases/${VERSION}"
CURRENT_LINK="${APP_DIR}/current"
PREVIOUS_VERSION=$(readlink "$CURRENT_LINK" | xargs basename)

log "Deploying version ${VERSION} (replacing ${PREVIOUS_VERSION})"

# Verify the release exists
[ -d "$RELEASE_DIR" ] || die "Release not found: $RELEASE_DIR"
[ -f "${RELEASE_DIR}/server.js" ] || die "server.js missing in release"

# Rollback function
rollback() {
    log "Rolling back to ${PREVIOUS_VERSION}..."
    ln -sfn "${APP_DIR}/releases/${PREVIOUS_VERSION}" "$CURRENT_LINK"
    sudo systemctl restart "$APP_NAME"
    die "Deployment of ${VERSION} failed — rolled back to ${PREVIOUS_VERSION}"
}
trap rollback ERR

# Update symlink
log "Updating symlink to ${VERSION}..."
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# Restart service
log "Restarting ${APP_NAME}..."
sudo systemctl restart "$APP_NAME"

# Health check with retries
log "Running health check..."
ATTEMPTS=0
until curl -sf "http://localhost:3000/health" > /dev/null; do
    ATTEMPTS=$((ATTEMPTS + 1))
    [ $ATTEMPTS -ge 15 ] && exit 1
    log "Waiting for service... (${ATTEMPTS}/15)"
    sleep 2
done

# Deployment succeeded — deactivate rollback trap
trap - ERR

log "Successfully deployed ${VERSION}"
SCRIPT

sudo chmod +x /opt/myapp/deploy.sh
sudo chown deploy:deploy /opt/myapp/deploy.sh
```

Give the deploy user permission to restart the service without a password:

```bash
sudo tee /etc/sudoers.d/myapp > /dev/null << 'EOF'
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart myapp, \
                           /bin/systemctl reload myapp, \
                           /bin/systemctl status myapp
EOF
sudo chmod 440 /etc/sudoers.d/myapp
```

---

## Phase 10: Verify Everything Works

Run this final verification checklist:

```bash
# 1. Service is running
sudo systemctl status myapp
echo "Service status: $?"

# 2. Application responds
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:3000/health)
[ "$HTTP_CODE" = "200" ] && echo "Health check: PASS" || echo "Health check: FAIL ($HTTP_CODE)"

# 3. Firewall is active with correct rules
sudo ufw status

# 4. SSH root login is disabled
grep "^PermitRootLogin" /etc/ssh/sshd_config

# 5. fail2ban is running
sudo systemctl is-active fail2ban

# 6. Logs are being written
ls -lh /var/log/myapp/

# 7. Logrotate config is valid
sudo logrotate -d /etc/logrotate.d/myapp 2>&1 | head -5

# 8. Service starts on boot (simulate with list-unit-files)
systemctl is-enabled myapp

echo ""
echo "=== Server Summary ==="
echo "Hostname: $(hostname)"
echo "IP:       $(ip addr show eth0 | grep 'inet ' | awk '{print $2}')"
echo "Node:     $(node --version)"
echo "Service:  $(systemctl is-active myapp)"
echo "Firewall: $(sudo ufw status | head -1)"
```

---

## What You Have Built

By completing this project you have:

1. **Created a non-root deployment user** with least-privilege sudo rules
2. **Hardened SSH** — key-only authentication, root login disabled
3. **Configured UFW firewall** — deny-by-default, only SSH/HTTP/HTTPS allowed
4. **Protected against brute force** with fail2ban
5. **Installed and managed a Node.js app** under the deploy user
6. **Defined a systemd service** with automatic restart and security restrictions
7. **Configured log rotation** to keep 30 days of compressed logs
8. **Written a deployment script** with automatic rollback on failure

These patterns apply to any application stack — Java, Python, Ruby, or Go. The OS-level concerns (user, SSH, firewall, service, logs) are identical regardless of what the application is written in.

---

## Next Steps

- Set up **Nginx as a reverse proxy** in front of the Node.js process (port 80/443 → port 3000)
- Obtain a **TLS certificate** with `certbot` and the nginx plugin
- Configure **automated deployments** from a CI/CD pipeline via SSH
- Set up **monitoring** with a tool like Prometheus + Grafana or a hosted solution
- Explore **Docker** to containerise the application (see the Docker guide in this documentation)
