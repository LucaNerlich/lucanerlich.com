---
title: "Networking"
sidebar_label: "Networking"
description: Diagnose and work with Linux networking using ip, curl, wget, ss, dig, SSH config, scp, and rsync.
slug: /linux/beginners-guide/networking
tags: [linux, bash, shell, beginners]
keywords:
  - linux networking
  - curl wget
  - ssh config scp rsync
  - dig nslookup dns
  - ip addr ss netstat
sidebar_position: 9
---

# Networking

As a developer working on Linux servers, you will regularly need to inspect network interfaces, test HTTP endpoints, diagnose DNS issues, transfer files securely, and configure SSH access. This chapter covers the networking commands you will reach for most often.

---

## Viewing Network Interfaces — `ip`

The `ip` command is the modern replacement for the deprecated `ifconfig`.

```bash
# Show all network interfaces and their IP addresses
ip addr
ip addr show

# Show a specific interface
ip addr show eth0

# Short output
ip a

# Show routing table
ip route
ip r

# Show link-layer (MAC address) info
ip link show

# Add a temporary IP address to an interface
sudo ip addr add 192.168.1.100/24 dev eth0

# Bring an interface up or down
sudo ip link set eth0 up
sudo ip link set eth0 down
```

### Typical Output on a Cloud VM

```
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:ab:cd:ef brd ff:ff:ff:ff:ff:ff
    inet 203.0.113.42/24 brd 203.0.113.255 scope global dynamic eth0
       valid_lft 3456sec preferred_lft 3456sec
    inet6 fe80::5054:ff:feab:cdef/64 scope link
```

The `inet` line shows the IPv4 address (`203.0.113.42`) and subnet mask (`/24`).

---

## Connectivity Test — `ping`

```bash
# Basic ping (runs until Ctrl+C)
ping google.com

# Send exactly 4 packets
ping -c 4 google.com

# Ping with a 1-second interval
ping -i 1 google.com

# Ping a specific interface
ping -I eth0 google.com

# Check if a host is reachable (useful in scripts)
if ping -c 1 -W 2 db.example.com &>/dev/null; then
    echo "Database host is reachable"
else
    echo "Cannot reach database host"
fi
```

---

## HTTP Requests — `curl`

`curl` is the Swiss Army knife of HTTP. It can make any type of request, follow redirects, handle cookies, set headers, upload files, and more.

### Basic Requests

```bash
# GET request (print response body)
curl https://api.example.com/users

# Follow redirects (-L)
curl -L http://example.com

# Show response headers only (-I = HEAD request)
curl -I https://api.example.com/health

# Show both headers and body (-i)
curl -i https://api.example.com/users/1

# Verbose output — shows request + response headers (debugging)
curl -v https://api.example.com/users
```

### POST and Other Methods

```bash
# POST with JSON body
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# POST with a form body
curl -X POST https://api.example.com/login \
  -d "username=admin&password=secret"

# PUT request
curl -X PUT https://api.example.com/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Updated"}'

# DELETE request
curl -X DELETE https://api.example.com/users/1

# PATCH request
curl -X PATCH https://api.example.com/users/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

### Headers and Authentication

```bash
# Set a custom header
curl -H "Authorization: Bearer your-token-here" https://api.example.com/data
curl -H "X-Api-Key: abc123" https://api.example.com/data

# Multiple headers
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     https://api.example.com/users

# Basic authentication
curl -u username:password https://api.example.com/protected

# Bearer token from an environment variable
curl -H "Authorization: Bearer $API_TOKEN" https://api.example.com/data
```

### Downloading Files

```bash
# Save to a file (-o = specify filename)
curl -o nginx.tar.gz https://nginx.org/download/nginx-1.24.0.tar.gz

# Save with the remote filename (-O)
curl -O https://nginx.org/download/nginx-1.24.0.tar.gz

# Download with progress bar
curl -L --progress-bar -o node.tar.gz https://nodejs.org/dist/v20.12.0/node-v20.12.0-linux-x64.tar.gz

# Resume an interrupted download
curl -C - -O https://example.com/large-file.zip
```

### Useful Options

```bash
# Fail silently on HTTP errors (exit code non-zero for 4xx/5xx)
curl --fail https://api.example.com/data

# Set connection and max time limits
curl --connect-timeout 5 --max-time 30 https://api.example.com/data

# Skip SSL certificate verification (ONLY for dev/testing)
curl -k https://localhost:8443/api

# Output just the HTTP status code
curl -o /dev/null -s -w "%{http_code}" https://api.example.com/health

# Follow redirects and fail on error (common in scripts)
curl -Lsf --fail https://api.example.com/status
```

### Health Check in a Script

```bash
check_service_health() {
    local URL="$1"
    local HTTP_CODE

    HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 5 "$URL")

    if [ "$HTTP_CODE" = "200" ]; then
        echo "Healthy ($HTTP_CODE)"
        return 0
    else
        echo "Unhealthy (HTTP $HTTP_CODE)" >&2
        return 1
    fi
}

check_service_health "http://localhost:3000/health"
```

---

## Downloading Files — `wget`

`wget` is simpler than `curl` for downloading files:

```bash
# Download a file
wget https://example.com/file.zip

# Download to a specific filename
wget -O myfile.zip https://example.com/file.zip

# Download in background
wget -b https://example.com/large-file.iso

# Mirror a website
wget -r -l 2 https://example.com

# Retry on failure (5 retries)
wget --tries=5 https://example.com/file.zip

# Continue an interrupted download
wget -c https://example.com/large-file.iso
```

---

## Port and Socket Inspection — `ss`

`ss` (socket statistics) replaces the older `netstat` command.

```bash
# Show all listening TCP sockets with PID
sudo ss -tlnp

# Show all listening UDP sockets
sudo ss -ulnp

# Show all sockets (TCP + UDP, listening + connected)
sudo ss -tulnp

# Filter by port
sudo ss -tlnp | grep :8080
sudo ss -tlnp | grep :443

# Show established connections
ss -t state established

# Show connections to a specific remote host
ss -t dst 203.0.113.0/24
```

### Output Interpretation

```
Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port   Process
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*           users:(("sshd",pid=1234,fd=3))
tcp    LISTEN  0       511     0.0.0.0:80            0.0.0.0:*           users:(("nginx",pid=5678,fd=6))
tcp    LISTEN  0       511     0.0.0.0:443           0.0.0.0:*           users:(("nginx",pid=5678,fd=7))
tcp    LISTEN  0       128     127.0.0.1:3000        0.0.0.0:*           users:(("node",pid=9012,fd=22))
```

- `0.0.0.0:22` — listening on all interfaces on port 22 (SSH)
- `127.0.0.1:3000` — listening on localhost only on port 3000 (app, not public-facing)

---

## Port Scanning — `nmap`

`nmap` scans a host or network for open ports. Use it to verify firewall rules and check what services are exposed.

```bash
# Install
sudo apt install nmap

# Scan a host's most common 1000 ports
nmap 203.0.113.42

# Scan specific ports
nmap -p 22,80,443,3000 203.0.113.42

# Scan a port range
nmap -p 1-1024 203.0.113.42

# Detect service versions
nmap -sV 203.0.113.42

# Scan for UDP ports (slower)
sudo nmap -sU -p 53,123 203.0.113.42

# Scan your own server (check what's exposed)
nmap localhost
```

---

## DNS Resolution — `dig` and `nslookup`

### `dig`

`dig` (Domain Information Groper) queries DNS servers and shows detailed results.

```bash
# Look up the A record (IPv4 address) for a domain
dig api.example.com

# Look up only the answer section (+short)
dig +short api.example.com

# Look up an MX record (mail servers)
dig MX example.com

# Look up TXT records (SPF, DKIM, etc.)
dig TXT example.com

# Look up CNAME record
dig CNAME www.example.com

# Reverse DNS lookup (IP → hostname)
dig -x 203.0.113.42

# Query a specific DNS server (bypass system resolver)
dig @8.8.8.8 example.com

# Trace the full DNS resolution chain
dig +trace example.com
```

### `nslookup`

```bash
# Basic lookup
nslookup example.com

# Query a specific server
nslookup example.com 8.8.8.8

# Reverse lookup
nslookup 203.0.113.42
```

### The `/etc/hosts` File

`/etc/hosts` provides static hostname-to-IP mappings that take precedence over DNS. It is consulted before any DNS query.

```bash
cat /etc/hosts
# 127.0.0.1     localhost
# 127.0.1.1     myserver
# 203.0.113.10  db.example.com     db

# Add an entry (useful for local development or overriding DNS)
echo "203.0.113.50  staging-api.example.com" | sudo tee -a /etc/hosts
```

---

## SSH Configuration — `~/.ssh/config`

Rather than typing long `ssh` commands, define aliases in `~/.ssh/config`:

```
# ~/.ssh/config

# Default settings for all hosts
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes

# Production server
Host prod
    HostName 203.0.113.42
    User deploy
    IdentityFile ~/.ssh/prod_key
    Port 22

# Staging server via a jump host (bastion)
Host staging
    HostName 10.0.1.50
    User ubuntu
    IdentityFile ~/.ssh/staging_key
    ProxyJump bastion

# Bastion/jump host
Host bastion
    HostName bastion.example.com
    User ec2-user
    IdentityFile ~/.ssh/bastion_key

# SSH tunnel: forward local port 5432 to remote PostgreSQL
Host db-tunnel
    HostName prod-db.example.com
    User tunnel
    IdentityFile ~/.ssh/tunnel_key
    LocalForward 5432 localhost:5432
```

```bash
# Now you can connect with:
ssh prod
ssh staging
ssh -N db-tunnel  # Establish the tunnel (no shell)
```

### Useful SSH Options

```bash
# Enable compression (useful over slow connections)
ssh -C ubuntu@myserver

# Disable strict host key checking (ONLY in automation)
ssh -o StrictHostKeyChecking=no ubuntu@myserver

# Forward the SSH agent (so you can SSH from the server to other servers)
ssh -A ubuntu@myserver

# Port forwarding: access remote port 8080 as local port 8080
ssh -L 8080:localhost:8080 ubuntu@myserver

# Reverse tunnel: expose local port 3000 via the remote server's port 9000
ssh -R 9000:localhost:3000 ubuntu@myserver
```

---

## Copying Files Over SSH — `scp`

```bash
# Copy a local file to a remote server
scp local-file.txt ubuntu@myserver:/opt/myapp/

# Copy a remote file to local
scp ubuntu@myserver:/var/log/app.log ./local-copy.log

# Copy a directory recursively
scp -r ./dist/ ubuntu@myserver:/opt/myapp/public/

# Use a specific key
scp -i ~/.ssh/prod_key local-file.txt deploy@203.0.113.42:/opt/myapp/

# Specify port
scp -P 2222 file.txt ubuntu@myserver:/tmp/

# Using SSH config aliases
scp file.txt prod:/opt/myapp/
```

---

## Efficient File Sync — `rsync`

`rsync` is more powerful than `scp` for copying and synchronising directories. It only transfers files that have changed, making it much faster for incremental updates.

```bash
# Sync local directory to remote (create mirror)
rsync -av ./dist/ ubuntu@myserver:/opt/myapp/public/

# Options explained:
# -a  archive mode: recursive + preserve permissions, timestamps, symlinks
# -v  verbose

# Dry run: show what would be transferred without doing it
rsync -av --dry-run ./dist/ ubuntu@myserver:/opt/myapp/public/

# Delete files on the remote that don't exist locally
rsync -av --delete ./dist/ ubuntu@myserver:/opt/myapp/public/

# Exclude specific files or directories
rsync -av --exclude='*.log' --exclude='.git/' ./src/ ubuntu@myserver:/opt/myapp/src/

# Use SSH with a specific key
rsync -av -e "ssh -i ~/.ssh/prod_key" ./dist/ deploy@203.0.113.42:/opt/myapp/public/

# Show progress for large transfers
rsync -av --progress ./large-file.tar.gz ubuntu@myserver:/tmp/

# Sync remote back to local (backup)
rsync -av ubuntu@myserver:/opt/myapp/data/ ./local-backup/

# Bandwidth limit (in KB/s) — useful on production servers
rsync -av --bwlimit=5000 ./dist/ ubuntu@myserver:/opt/myapp/public/
```

### Deployment Pattern with rsync

```bash
#!/bin/bash
# Fast deployment using rsync
deploy_to_server() {
    local HOST="$1"
    local VERSION="$2"
    local LOCAL_BUILD="./dist"
    local REMOTE_PATH="/opt/myapp/releases/$VERSION"

    echo "Syncing $VERSION to $HOST..."
    rsync -av --delete \
        --exclude='*.map' \
        --exclude='.git/' \
        -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no" \
        "$LOCAL_BUILD/" \
        "deploy@${HOST}:${REMOTE_PATH}/"

    echo "Updating symlink..."
    ssh -i ~/.ssh/deploy_key "deploy@${HOST}" \
        "ln -sfn $REMOTE_PATH /opt/myapp/current && sudo systemctl reload myapp"
}

deploy_to_server "prod.example.com" "1.2.3"
```

---

## Practical Network Debugging Workflow

When a service is not reachable, work through this checklist:

```bash
# 1. Is the process running and listening?
sudo ss -tlnp | grep :3000

# 2. Is it reachable locally?
curl -sf http://localhost:3000/health

# 3. Is the firewall allowing the port?
sudo ufw status
# or
sudo iptables -L -n | grep 3000

# 4. Can you reach it from outside?
# (from your local machine)
curl https://myserver.example.com/health

# 5. Is DNS resolving correctly?
dig +short myserver.example.com

# 6. Is the port open from outside?
nmap -p 3000 myserver.example.com

# 7. Are there errors in the service logs?
journalctl -u myapp -n 50
```
