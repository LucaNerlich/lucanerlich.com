---
title: "Deploying to a VPS with Nginx"
sidebar_label: "Deploy: VPS + Nginx"
description: Deploy your Java REST API to a VPS -- installing the JDK, running as a systemd service, configuring nginx as a reverse proxy, and HTTPS with Let's Encrypt.
slug: /java/beginners-guide/deploy-vps-nginx
tags: [java, beginners, deployment, nginx, vps]
keywords:
  - deploy java
  - java vps
  - systemd java
  - nginx reverse proxy
  - java production
sidebar_position: 12
---

# Deploying to a VPS with Nginx

You have a working REST API. Now let us put it on the internet. This chapter covers deploying your Java application to a VPS with nginx as a reverse proxy and HTTPS via Let's Encrypt.

The deployment architecture:

```text
Client (browser, curl, mobile app)
    │
    │  HTTPS (port 443)
    ▼
┌──────────┐
│  nginx   │  reverse proxy -- handles HTTPS, serves static files
└────┬─────┘
     │  HTTP (port 8080, localhost only)
     ▼
┌──────────┐
│ Java API │  your task-api.jar running as a systemd service
└──────────┘
```

Nginx handles the public-facing connection (HTTPS, compression, rate limiting). It forwards API requests to your Java process running on `localhost:8080`. This is called a **reverse proxy**.

## Prerequisites

Before starting, you need:

1. A **VPS** running Ubuntu 22.04 LTS (or newer) with SSH access
2. A **non-root user** with sudo privileges
3. A **firewall** configured to allow SSH, HTTP, and HTTPS
4. Your **task-api.jar** file from the previous chapter
5. Optionally, a **domain name** pointed to your server's IP

If you have not set up a VPS before, the initial server setup (creating a user, SSH keys, firewall) is covered in the [JavaScript guide's deployment chapter](/javascript/beginners-guide/deploy-vps-nginx). The steps are identical -- follow that guide through Step 2, then return here.

## Step 1: install Java on the server

SSH into your server:

```bash
ssh deploy@YOUR_SERVER_IP
```

Install the JDK:

```bash
sudo apt update
sudo apt install openjdk-21-jre-headless -y
```

We install `openjdk-21-jre-headless` (not the full JDK) -- the server only needs to **run** Java, not compile it. This is a smaller installation.

Verify:

```bash
java --version
```

Result:
```text
openjdk 21.0.2 2024-01-16
OpenJDK Runtime Environment (build 21.0.2+13-Ubuntu)
OpenJDK 64-Bit Server VM (build 21.0.2+13-Ubuntu, mixed mode, sharing)
```

## Step 2: upload your JAR

Create a directory for the application:

```bash
sudo mkdir -p /opt/task-api
sudo chown deploy:deploy /opt/task-api
```

From your **local machine**, upload the JAR:

```bash
rsync -avz task-api.jar deploy@YOUR_SERVER_IP:/opt/task-api/
```

Or with `scp`:

```bash
scp task-api.jar deploy@YOUR_SERVER_IP:/opt/task-api/
```

Verify on the server:

```bash
ls -la /opt/task-api/
```

Result:
```text
total 12
drwxr-xr-x 2 deploy deploy 4096 Jan 15 10:00 .
drwxr-xr-x 3 root   root   4096 Jan 15 09:55 ..
-rw-r--r-- 1 deploy deploy 5120 Jan 15 10:00 task-api.jar
```

### Test the JAR on the server

```bash
cd /opt/task-api
java -jar task-api.jar
```

Open another SSH session and test:

```bash
curl http://localhost:8080/api/health
```

Result:
```json
{"status":"ok"}
```

Stop the server with `Ctrl+C`. It works -- now let us run it properly as a service.

## Step 3: create a systemd service

A **systemd service** runs your Java process in the background, starts it on boot, and restarts it if it crashes.

Create the service file:

```bash
sudo nano /etc/systemd/system/task-api.service
```

Paste this configuration:

```ini
[Unit]
Description=Task Manager REST API
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/task-api
ExecStart=/usr/bin/java -jar /opt/task-api/task-api.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/task-api

# JVM settings
Environment="JAVA_OPTS=-Xms64m -Xmx256m"

[Install]
WantedBy=multi-user.target
```

Key settings:
- `User=deploy` -- runs as the deploy user, not root
- `Restart=on-failure` -- automatically restarts on crashes
- `WorkingDirectory` -- sets the working directory so `tasks.dat` is stored in `/opt/task-api/`
- `ReadWritePaths` -- allows writing only to the app directory (systemd security)
- `JAVA_OPTS` -- JVM memory settings (64MB initial, 256MB max -- more than enough for this app)

### Enable and start the service

```bash
# Reload systemd to pick up the new service file
sudo systemctl daemon-reload

# Enable the service (starts on boot)
sudo systemctl enable task-api

# Start the service now
sudo systemctl start task-api

# Check status
sudo systemctl status task-api
```

Result:
```text
● task-api.service - Task Manager REST API
     Loaded: loaded (/etc/systemd/system/task-api.service; enabled)
     Active: active (running) since Mon 2025-01-15 10:05:00 UTC
   Main PID: 12345 (java)
     Memory: 80.0M
        CPU: 2.5s
     CGroup: /system.slice/task-api.service
             └─12345 /usr/bin/java -jar /opt/task-api/task-api.jar
```

### Viewing logs

```bash
# Recent logs
sudo journalctl -u task-api -n 50

# Follow logs in real time
sudo journalctl -u task-api -f

# Logs since last boot
sudo journalctl -u task-api -b
```

### Service management commands

```bash
sudo systemctl start task-api    # start
sudo systemctl stop task-api     # stop
sudo systemctl restart task-api  # restart
sudo systemctl status task-api   # check status
```

## Step 4: install and configure nginx

```bash
sudo apt install nginx -y
```

Create the nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/task-api
```

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name YOUR_DOMAIN_OR_IP;

    # Proxy API requests to the Java application
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

Replace `YOUR_DOMAIN_OR_IP` with your domain or server IP.

### Enable the site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/task-api /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

Result:
```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

```bash
# Reload nginx
sudo systemctl reload nginx
```

### Test through nginx

```bash
curl http://YOUR_DOMAIN_OR_IP/api/health
```

Result:
```json
{"status":"ok"}
```

The request flows: client → nginx (port 80) → Java API (port 8080) → response back.

## Step 5: HTTPS with Let's Encrypt

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtain a certificate (requires a domain name):

```bash
sudo certbot --nginx -d yoursite.com
```

Certbot will:
1. Verify domain ownership
2. Obtain and install the certificate
3. Update nginx config for HTTPS
4. Set up HTTP → HTTPS redirect

Test:

```bash
curl https://yoursite.com/api/health
```

Result:
```json
{"status":"ok"}
```

### Automatic renewal

```bash
sudo certbot renew --dry-run
```

Certbot sets up a systemd timer for automatic renewal every 90 days.

## Step 6: restrict the Java server to localhost

Since nginx handles all public traffic, the Java server should only accept connections from `localhost`. Update `ApiServer.java`:

```java
// Bind to localhost only -- nginx will proxy public traffic
HttpServer server = HttpServer.create(
    new InetSocketAddress("127.0.0.1", 8080), 0
);
```

Rebuild, upload, and restart:

```bash
# On your local machine
javac *.java
jar cfm task-api.jar MANIFEST.MF *.class
rsync -avz task-api.jar deploy@YOUR_SERVER_IP:/opt/task-api/

# On the server
sudo systemctl restart task-api
```

Now port 8080 is not accessible from the outside -- only nginx can reach it.

## Deploying updates

Whenever you update your code:

```bash
# 1. Build locally
javac *.java
jar cfm task-api.jar MANIFEST.MF *.class

# 2. Upload
rsync -avz task-api.jar deploy@YOUR_SERVER_IP:/opt/task-api/

# 3. Restart the service
ssh deploy@YOUR_SERVER_IP "sudo systemctl restart task-api"
```

### Deploy script

Create `deploy.sh` on your local machine:

```bash
#!/bin/bash
set -euo pipefail

SERVER="deploy@YOUR_SERVER_IP"
REMOTE_PATH="/opt/task-api"

echo "Building..."
javac *.java
jar cfm task-api.jar MANIFEST.MF *.class

echo "Uploading..."
rsync -avz task-api.jar "$SERVER:$REMOTE_PATH/"

echo "Restarting service..."
ssh "$SERVER" "sudo systemctl restart task-api"

echo "Checking health..."
sleep 3
curl -sf https://yoursite.com/api/health && echo " -- OK" || echo " -- FAILED"

echo "Deployment complete!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

## Monitoring

### Check if the service is running

```bash
sudo systemctl status task-api
```

### View application logs

```bash
# Last 100 lines
sudo journalctl -u task-api -n 100

# Follow in real time
sudo journalctl -u task-api -f

# Errors only
sudo journalctl -u task-api -p err
```

### Check resource usage

```bash
# Memory and CPU
ps aux | grep java

# Detailed JVM info
jcmd $(pgrep -f task-api) VM.info
```

### Health check endpoint

The `/api/health` endpoint we built lets you verify the API is working. Monitoring services like UptimeRobot or Healthchecks.io can hit this endpoint periodically and alert you if it goes down.

## Security checklist

Review the full server hardening steps from the [JavaScript guide's deployment chapter](/javascript/beginners-guide/deploy-vps-nginx) -- the same steps apply here:

- [ ] Non-root user with sudo
- [ ] SSH key authentication (password auth disabled)
- [ ] Firewall (`ufw`) allowing only SSH, HTTP, HTTPS
- [ ] HTTPS with Let's Encrypt
- [ ] Automatic security updates (`unattended-upgrades`)
- [ ] Fail2Ban for brute-force protection
- [ ] Java server bound to `127.0.0.1` (not accessible publicly)
- [ ] systemd service with `NoNewPrivileges` and `ProtectSystem`

## Complete deployment summary

```text
Local machine                          VPS
┌─────────────┐                ┌──────────────────────────────┐
│ .java files │                │                              │
│      │      │                │   nginx (port 443/80)        │
│   javac     │                │      │                       │
│      │      │                │      ▼  proxy_pass           │
│  .class     │    rsync       │   java -jar task-api.jar     │
│      │      │ ──────────►    │      (port 8080, localhost)  │
│   jar cfm   │                │      │                       │
│      │      │                │   tasks.dat (persistence)    │
│ task-api.jar│                │                              │
└─────────────┘                └──────────────────────────────┘
```

## What comes next

You now have a Java REST API running in production. From here, you could:

- **Add a database** -- SQLite for simple apps, PostgreSQL for production
- **Use a framework** -- Spring Boot, Quarkus, or Micronaut for more features
- **Add authentication** -- JWT tokens or session-based auth
- **Containerize with Docker** -- consistent deployments across environments
- **Set up CI/CD** -- automatic builds and deploys on git push
- **Add logging** -- structured logging with SLF4J and Logback
- **Write tests** -- JUnit for unit tests, integration tests for API endpoints

## Summary

- Install `openjdk-21-jre-headless` on the server (runtime only, no compiler needed).
- **systemd** manages the Java process -- start on boot, restart on crash, centralized logging.
- **nginx** acts as a reverse proxy -- handles HTTPS, forwards requests to `localhost:8080`.
- **Let's Encrypt** provides free HTTPS certificates with automatic renewal.
- Bind the Java server to `127.0.0.1` so it is only reachable through nginx.
- Deploy with a simple `rsync` + `systemctl restart` workflow.
- Monitor with `journalctl` and a `/api/health` endpoint.

Congratulations -- you have gone from writing `System.out.println("Hello, world!")` to deploying a live REST API. The fundamentals you have learned (types, OOP, collections, error handling, file I/O, HTTP) are the foundation for everything else in Java development. Keep building.
