---
title: "Deploying to a VPS with Nginx"
sidebar_label: "Deploy: VPS + Nginx"
description: Deploy your website to a Virtual Private Server - server setup, SSH, nginx configuration, HTTPS with Let's Encrypt, and basic security hardening.
slug: /javascript/beginners-guide/deploy-vps-nginx
tags: [javascript, beginners, deployment, nginx, vps]
keywords:
  - deploy website
  - vps hosting
  - nginx configuration
  - lets encrypt
  - ssh setup
sidebar_position: 12
---

# Deploying to a VPS with Nginx

You have a working website. Now let us put it on the internet. This chapter walks through the entire process: getting a
server, setting it up, configuring nginx to serve your files, and securing the site with HTTPS.

## What is a VPS?

A **Virtual Private Server** (VPS) is a virtual machine running in a data center. You get root access to a full Linux
server that runs 24/7. Unlike shared hosting, you control everything - the operating system, the software, the
firewall.

### Choosing a provider

Popular VPS providers:

| Provider            | Starting price | Notes                                   |
|---------------------|----------------|-----------------------------------------|
| **Hetzner**         | ~€4/month      | Excellent value, EU and US data centers |
| **DigitalOcean**    | $6/month       | Simple interface, good documentation    |
| **Linode (Akamai)** | $5/month       | Solid reliability, good support         |
| **Vultr**           | $6/month       | Many locations worldwide                |

For a simple static website, the cheapest plan from any provider is more than enough. This guide uses **Ubuntu 24.04 LTS**
as the operating system - choose it when creating your server.

### What you need before starting

1. A VPS running **Ubuntu 24.04 LTS** (or newer)
2. A **domain name** (optional but recommended - e.g., `yoursite.com`)
3. The **website files** from the previous chapter
4. A terminal on your local machine

## Step 1: initial server setup

When you create a VPS, the provider gives you the server's **IP address** and a **root password** (or lets you add an
SSH key).

### Connect to your server

```bash
ssh root@YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with the actual IP (e.g., `203.0.113.42`). On the first connection, you will be asked to
confirm the server's fingerprint - type `yes`.

### Update the system

```bash
apt update && apt upgrade -y
```

### Create a non-root user

Running as root is dangerous - a mistake can destroy the entire system. Create a regular user:

```bash
adduser deploy
```

You will be prompted to set a password and fill in optional details (you can skip the details by pressing Enter).

Grant the user sudo privileges:

```bash
usermod -aG sudo deploy
```

### Set up SSH key authentication

SSH keys are more secure than passwords. On your **local machine** (not the server), generate a key pair if you do not
already have one:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter to accept the default file location. Set a passphrase for extra security.

Copy the public key to the server:

```bash
ssh-copy-id deploy@YOUR_SERVER_IP
```

Test the connection:

```bash
ssh deploy@YOUR_SERVER_IP
```

You should log in without being asked for a password.

### Disable password authentication

Once SSH keys work, disable password login for security. On the server, create a hardening snippet:

```bash
sudo nano /etc/ssh/sshd_config.d/00-hardening.conf
```

For each setting, `sshd` uses the **first** value it reads, and files in `sshd_config.d/` are read in alphabetical order
before the rest of `sshd_config`. The `00-` prefix makes sure your settings win over files such as
`50-cloud-init.conf`, which many VPS images ship with `PasswordAuthentication yes`.

Add these lines:

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
```

Test the configuration and reload the SSH service:

```bash
sudo sshd -t
sudo systemctl reload ssh
sudo sshd -T | grep -Ei 'passwordauthentication|permitrootlogin'
```

The last command prints the effective settings -- both should say `no`.

**Warning:** Make sure your SSH key login works before doing this. If you lock yourself out, you will need to use the
provider's console access.

## Step 2: set up the firewall

Ubuntu comes with `ufw` (Uncomplicated Firewall):

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable the firewall
sudo ufw enable

# Check status
sudo ufw status
```

Result:

```text
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
80/tcp (v6)                ALLOW       Anywhere (v6)
443/tcp (v6)               ALLOW       Anywhere (v6)
```

## Step 3: install nginx

```bash
sudo apt install nginx -y
```

Verify it is running:

```bash
sudo systemctl status nginx
```

Open your browser and navigate to `http://YOUR_SERVER_IP`. You should see the default nginx welcome page.

### How nginx works

Nginx is a **web server** - it listens for HTTP requests and serves files in response. For a static website, nginx
simply serves your HTML, CSS, and JavaScript files directly to the browser.

The configuration lives in `/etc/nginx/`. Key paths:

| Path                          | Purpose                                  |
|-------------------------------|------------------------------------------|
| `/etc/nginx/nginx.conf`       | Main configuration                       |
| `/etc/nginx/sites-available/` | Site configurations (available)          |
| `/etc/nginx/sites-enabled/`   | Site configurations (active - symlinks) |
| `/var/www/`                   | Convention for website files             |

## Step 4: upload your website files

Create a directory for your site on the server:

```bash
sudo mkdir -p /var/www/mysite
sudo chown deploy:deploy /var/www/mysite
```

From your **local machine**, upload the files using `rsync`:

```bash
rsync -avz --delete ./my-website/ deploy@YOUR_SERVER_IP:/var/www/mysite/
```

Breakdown:

- `-a` - archive mode (preserves permissions, timestamps)
- `-v` - verbose output
- `-z` - compress during transfer
- `--delete` - remove files on the server that no longer exist locally

Alternative using `scp`:

```bash
scp -r ./my-website/* deploy@YOUR_SERVER_IP:/var/www/mysite/
```

Verify the files are there:

```bash
ssh deploy@YOUR_SERVER_IP "ls -la /var/www/mysite/"
```

Result:

```text
total 24
drwxr-xr-x 5 deploy deploy 4096 Jan 15 10:00 .
drwxr-xr-x 3 root   root   4096 Jan 15 09:55 ..
drwxr-xr-x 2 deploy deploy 4096 Jan 15 10:00 css
drwxr-xr-x 2 deploy deploy 4096 Jan 15 10:00 data
-rw-r--r-- 1 deploy deploy 2048 Jan 15 10:00 index.html
drwxr-xr-x 2 deploy deploy 4096 Jan 15 10:00 js
-rw-r--r-- 1 deploy deploy 1536 Jan 15 10:00 projects.html
-rw-r--r-- 1 deploy deploy 1280 Jan 15 10:00 contact.html
```

## Step 5: configure nginx

Create a new site configuration:

```bash
sudo nano /etc/nginx/sites-available/mysite
```

Paste this configuration:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name YOUR_DOMAIN_OR_IP;

    root /var/www/mysite;
    index index.html;

    # Serve static files directly
    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Deny access to hidden files, but allow Let's Encrypt challenges
    location ~ /\.(?!well-known(?:/|$)) {
        deny all;
    }

    # Custom error pages (optional)
    error_page 404 /404.html;
}
```

Replace `YOUR_DOMAIN_OR_IP` with your domain (e.g., `yoursite.com`) or your server's IP address.

### Enable the site

```bash
# Create a symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/

# Remove the default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test the configuration
sudo nginx -t
```

Result:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Reload nginx:

```bash
sudo systemctl reload nginx
```

Open `http://YOUR_DOMAIN_OR_IP` in your browser. Your website is live.

## Step 6: set up a domain (optional)

If you have a domain name, point it to your server:

1. Go to your domain registrar's DNS settings
2. Add an **A record** pointing to your server's IP:

| Type | Name | Value          | TTL |
|------|------|----------------|-----|
| A    | @    | YOUR_SERVER_IP | 300 |
| A    | www  | YOUR_SERVER_IP | 300 |

DNS changes can take a few minutes to a few hours to propagate. You can check with:

```bash
dig +short yoursite.com
```

Once the domain resolves to your server IP, update the nginx config:

```nginx
server_name yoursite.com www.yoursite.com;
```

Reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Step 7: HTTPS with Let's Encrypt

**HTTPS is mandatory** for any website in production. Let's Encrypt provides free SSL certificates.

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain and install a certificate

```bash
sudo certbot --nginx -d yoursite.com -d www.yoursite.com
```

Certbot will:

1. Verify you own the domain
2. Obtain a certificate
3. Automatically update your nginx config to use HTTPS
4. Set up HTTP-to-HTTPS redirect

Follow the prompts - enter your email and agree to the terms.

If you manually enable HTTP/2 on a generated HTTPS server block with nginx 1.25.1 or newer, use a separate directive:

```nginx
listen 443 ssl;
listen [::]:443 ssl;
http2 on;
```

The older `listen 443 ssl http2;` syntax still works in many installations, but nginx now marks it as deprecated.

### Verify HTTPS

Open `https://yoursite.com` in your browser. You should see the lock icon.

### Automatic renewal

Let's Encrypt certificates expire every 90 days. Certbot sets up automatic renewal:

```bash
# Test the renewal process
sudo certbot renew --dry-run
```

If the dry run succeeds, renewals will happen automatically via a systemd timer.

Verify the timer is active:

```bash
sudo systemctl status certbot.timer
```

### Add HTTP Strict Transport Security

HTTP Strict Transport Security (HSTS) tells browsers to use HTTPS for future visits. Add it to the HTTPS `server`
block only after HTTPS works on every domain and subdomain that will receive the header. Start with a short `max-age`,
such as `300`, test carefully, and then increase it.

```nginx
add_header Strict-Transport-Security "max-age=300" always;
```

After you are confident, a long-lived production value is common:

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
```

`includeSubDomains` applies the rule to every subdomain. Only use it when all subdomains have working HTTPS. Browser
preload lists go even further: if you submit a domain for preload, browsers can enforce HTTPS before the first visit,
and mistakes can be painful to undo.

Nginx has one important inheritance gotcha: if you add any `add_header` directive inside a `location` block, that
location no longer inherits the `add_header` directives from the surrounding `server` block. Repeat all required
headers inside that location, or keep headers at one level.

### Add a starter Content Security Policy

The static site from [chapter 11](./11-project-build-a-website.md) loads local CSS and JavaScript files, fetches
`data/projects.json`, and uses a few inline `style=""` attributes. The core project does not need inline scripts. A
starter CSP that fits that project is:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests" always;
```

`connect-src 'self'` allows the `fetch("data/projects.json")` call. The `'unsafe-inline'` in `style-src` is there
because the chapter's HTML contains inline `style=""` attributes; JavaScript assignments such as `element.style.color`
are not the same thing. If you move those inline style attributes into `css/styles.css`, remove `'unsafe-inline'` from
`style-src`. Do not add `'unsafe-inline'` to `script-src`. If you used the optional `fetch()`-based component loader
from chapter 11, move its inline `<script>` block into an external file such as `js/layout.js`, otherwise this policy
blocks it. For more background, see [User Input Sanitization](../user-input-sanitization.md).

## Step 8: basic security hardening

### Automatic security updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Select "Yes" when asked to enable automatic updates.

### Fail2Ban - block brute-force attacks

```bash
sudo apt install fail2ban -y
```

Create a local configuration:

```bash
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
backend = systemd
```

Start and enable:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Change the SSH port (optional)

Changing the default SSH port (22) reduces automated login attempts:

```bash
sudo nano /etc/ssh/sshd_config.d/00-hardening.conf
```

Add a `Port` line (e.g., `Port 2222`):

```text
Port 2222
```

If you created the Fail2Ban jail above, update its SSH port too:

```ini
[sshd]
port = 2222
```

Test the SSH configuration, allow the new port, and apply the change. Ubuntu 24.04 starts SSH through systemd socket
activation, so the listening port is controlled by `ssh.socket` and a plain reload is not enough:

```bash
sudo ufw allow 2222/tcp
sudo sshd -t
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket
```

Open a new terminal and test the new port before closing your existing SSH session:

```bash
ssh -p 2222 deploy@YOUR_SERVER_IP
```

After the new connection works, remove the old firewall rule and reload Fail2Ban:

```bash
sudo ufw delete allow OpenSSH
sudo fail2ban-client reload
```

## Deploying updates

Whenever you update your website locally, deploy the changes with a single command:

```bash
rsync -avz --delete ./my-website/ deploy@YOUR_SERVER_IP:/var/www/mysite/
```

No server restart needed - nginx serves files directly from disk.

### A simple deploy script

Create `deploy.sh` in your project root:

```bash
#!/bin/bash
set -euo pipefail

SERVER="deploy@YOUR_SERVER_IP"
REMOTE_PATH="/var/www/mysite"

echo "Deploying to $SERVER:$REMOTE_PATH..."

rsync -avz --delete \
    --exclude '.git' \
    --exclude 'deploy.sh' \
    --exclude '.DS_Store' \
    ./ "$SERVER:$REMOTE_PATH/"

echo "Deployment complete!"
```

Make it executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Verifying the deployment

After deploying, check these things:

1. **Site loads:** Open your domain in a browser - all pages should work.
2. **HTTPS works:** The lock icon should appear in the address bar.
3. **No mixed content:** Open the browser console and check for warnings about HTTP resources on an HTTPS page.
4. **Performance:** Open Chrome DevTools → Network tab, reload the page, and verify static assets have cache headers.
5. **Mobile:** Test on a phone or use the responsive mode in dev tools.

### Quick checks from the command line

```bash
# Check if the site responds
curl -I https://yoursite.com

# Check the SSL certificate
curl -vI https://yoursite.com 2>&1 | grep -i "subject\|expire"

# Check security headers
curl -I https://yoursite.com 2>&1 | grep -i "strict-transport-security\|content-security-policy\|x-frame\|x-content\|referrer"
```

## Complete server setup checklist

Here is everything we did, in order:

- [ ] Created a VPS with Ubuntu 24.04 LTS
- [ ] Updated the system (`apt update && apt upgrade`)
- [ ] Created a non-root user with sudo
- [ ] Set up SSH key authentication
- [ ] Disabled password authentication
- [ ] Configured the firewall with `ufw`
- [ ] Installed nginx
- [ ] Uploaded website files
- [ ] Created nginx site configuration
- [ ] Pointed the domain to the server (DNS)
- [ ] Installed HTTPS with Let's Encrypt
- [ ] Added HSTS and Content Security Policy headers
- [ ] Set up automatic security updates
- [ ] Installed Fail2Ban
- [ ] Created a deploy script

## What comes next

You now have a website live on the internet, served by nginx over HTTPS. The next chapter introduces **TypeScript** -
static types for JavaScript that catch bugs before they reach production.

Continue with: [TypeScript](./13-typescript.md)

After that, you could:

- **Add a CI/CD pipeline** - automatically deploy when you push to Git
- **Add a backend** - use Node.js with Express behind nginx as a reverse proxy
- **Add monitoring** - use tools like `htop`, `nginx` access logs, or services like UptimeRobot
- **Add a database** - SQLite for small projects, PostgreSQL for larger ones
- **Learn Docker** - containerize your application for easier deployment
- **Explore frameworks** - React, Vue, Svelte, or Next.js for more complex applications

## Summary

- A **VPS** gives you a full Linux server in the cloud.
- **SSH keys** are more secure than passwords - disable password authentication.
- **nginx** serves static files efficiently with caching and security headers.
- **Let's Encrypt** provides free HTTPS certificates with automatic renewal.
- **Fail2Ban** and **unattended-upgrades** protect against common threats.
- Deploy updates with a single `rsync` command.

Congratulations - you have gone from writing your first `console.log("Hello, world!")` to deploying a live website. The
fundamentals you have learned (variables, functions, arrays, objects, DOM, events, fetch, deployment) are the foundation
for everything else in web development. Keep building.
