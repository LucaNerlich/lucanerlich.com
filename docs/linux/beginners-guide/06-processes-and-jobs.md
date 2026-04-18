---
title: "Processes and Jobs"
sidebar_label: "Processes & Jobs"
description: Monitor, control, and manage Linux processes and system services using ps, top, kill, systemctl, and journalctl.
slug: /linux/beginners-guide/processes-and-jobs
tags: [linux, bash, shell, beginners]
keywords:
  - linux processes
  - ps top htop kill
  - systemctl journalctl
  - background jobs nohup
  - linux signals
sidebar_position: 6
---

# Processes and Jobs

Every program running on a Linux system is a process. Understanding how to view what is running, how to control processes, and how to manage background services is essential for maintaining a production server. This chapter covers process inspection, signals, background jobs, and the systemd service manager.

---

## Process Basics

When you run a command, the shell creates a new process. Each process has:
- A **PID** (Process ID) — unique integer identifier
- A **PPID** (Parent Process ID) — the PID of the process that created it
- An **owner** (the user who started it)
- CPU and memory usage statistics
- A **state** (running, sleeping, zombie, stopped)

The `init` or `systemd` process always has PID 1 and is the ancestor of all other processes.

---

## Viewing Processes — `ps`

`ps` (process status) shows a snapshot of current processes.

```bash
# Processes in the current shell session
ps

# All processes from all users, in BSD syntax (most common usage)
ps aux

# All processes, full format (includes PPID, start time)
ps -ef

# Sort by CPU usage
ps aux --sort=-%cpu | head 20

# Sort by memory usage
ps aux --sort=-%mem | head 20

# Show a specific process by name
ps aux | grep nginx

# Show process tree (parent-child relationships)
ps axjf

# Show threads
ps axms
```

### Understanding `ps aux` Output

```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
ubuntu    1234  0.0  0.1  14500  2048 pts/0    Ss   09:00   0:00 bash
ubuntu    5678  2.4  1.2 623456 24576 pts/0    Sl   09:15   0:42 java -jar app.jar
root      9012  0.0  0.0   5756   812 ?        Ss   Apr09   0:00 /usr/sbin/sshd
```

| Column | Meaning |
|---|---|
| `USER` | Process owner |
| `PID` | Process ID |
| `%CPU` | CPU usage percentage |
| `%MEM` | Memory usage percentage |
| `VSZ` | Virtual memory size (KB) |
| `RSS` | Resident Set Size — actual RAM used (KB) |
| `TTY` | Terminal (`?` means no terminal) |
| `STAT` | Process state (S=sleeping, R=running, Z=zombie, D=uninterruptible sleep) |
| `START` | Start time |
| `TIME` | Total CPU time consumed |
| `COMMAND` | Command and arguments |

---

## Interactive Process Monitor — `top` and `htop`

### `top`

`top` shows a continuously updated view of system resource usage.

```bash
top
```

Key bindings inside `top`:

| Key | Action |
|---|---|
| `q` | Quit |
| `k` | Kill a process (prompts for PID and signal) |
| `M` | Sort by memory |
| `P` | Sort by CPU (default) |
| `u` | Filter by user |
| `1` | Show individual CPU cores |
| `d` | Change update interval |
| `h` | Help |

### `htop`

`htop` is an improved, colour-coded `top` with mouse support. Install it first:

```bash
sudo apt install htop   # Ubuntu/Debian
sudo dnf install htop   # RHEL/Fedora
```

```bash
htop

# Filter by process name
htop -p $(pgrep java | tr '\n' ',')
```

`htop` shows a visual CPU/memory bar at the top and allows you to scroll, search (`/`), and kill processes with the function keys.

---

## Signals and `kill`

Signals are software interrupts sent to processes. Every process can define how it handles each signal (except SIGKILL and SIGSTOP, which cannot be caught or ignored).

### Common Signals

| Signal | Number | Default Action | When to Use |
|---|---|---|---|
| `SIGTERM` | 15 | Graceful termination | Ask a process to stop cleanly (default for `kill`) |
| `SIGKILL` | 9 | Immediate kill | Force-kill a process that won't stop |
| `SIGHUP` | 1 | Terminate (or reload config) | Reload config without restart (e.g., nginx, sshd) |
| `SIGINT` | 2 | Interrupt | Same as pressing Ctrl+C |
| `SIGSTOP` | 19 | Pause | Pause a process |
| `SIGCONT` | 18 | Continue | Resume a paused process |
| `SIGUSR1` | 10 | User-defined | Application-specific (e.g., log rotation trigger) |

### Sending Signals

```bash
# Send SIGTERM (graceful stop) — default
kill 1234

# Send SIGKILL (force kill)
kill -9 1234
kill -SIGKILL 1234

# Reload config (SIGHUP)
kill -HUP $(cat /var/run/nginx.pid)

# Kill by name (kills all processes matching the name)
killall nginx

# Kill all processes matching a pattern
pkill -f "java -jar myapp"

# Graceful killall
killall -s SIGTERM node

# Send signal to all processes of a user
pkill -u ubuntu
```

### Finding PIDs

```bash
# Get PID of a named process
pgrep nginx
# 1234
# 1235

# Get PID and process name
pgrep -a nginx

# More precise matching
pgrep -x nginx     # exact name match
pgrep -f "java.*myapp.jar"  # match against full command line

# Combine with kill
kill $(pgrep nginx)

# Or use pkill directly
pkill nginx
```

---

## Background Jobs

### Running in the Background — `&`

Append `&` to run a command in the background, immediately returning your shell prompt.

```bash
# Run in background
./long-running-script.sh &
# [1] 5678   (job number and PID)

# The script continues running; you get your prompt back
```

### Listing Jobs — `jobs`

```bash
jobs
# [1]+  Running    ./long-running-script.sh &
# [2]-  Stopped    vim file.txt
```

### Foreground and Background — `fg` / `bg`

```bash
# Bring job 1 to the foreground
fg %1

# Send a foreground process to the background:
# 1. Press Ctrl+Z to suspend it
# 2. Then run:
bg %1   # resume it in the background

# Bring the most recent job to foreground
fg
```

### Surviving Disconnects — `nohup`

When you disconnect from SSH, all processes you started (including background jobs) receive `SIGHUP` and terminate. `nohup` prevents this.

```bash
# Run a command that survives disconnection
nohup ./deploy.sh &

# Output goes to nohup.out by default
nohup ./deploy.sh > /var/log/deploy.log 2>&1 &

# Get the PID
echo $!
# 5679
```

### `screen` and `tmux` — Terminal Multiplexers

For serious long-running tasks, terminal multiplexers are better than `nohup`:

```bash
# tmux — create a new session
tmux new -s deploy

# Detach from session (leaves it running): Ctrl+B, then D
# Reattach later:
tmux attach -t deploy

# List sessions
tmux ls
```

---

## Managing Services with `systemctl`

Modern Linux systems use **systemd** as their init system and service manager. `systemctl` is the command-line interface to systemd.

### Service Lifecycle

```bash
# Start a service
sudo systemctl start nginx

# Stop a service
sudo systemctl stop nginx

# Restart a service (stop then start)
sudo systemctl restart nginx

# Reload config without full restart (if the service supports it)
sudo systemctl reload nginx

# Restart if running, start if stopped
sudo systemctl reload-or-restart nginx

# Check service status
sudo systemctl status nginx

# Enable a service to start on boot
sudo systemctl enable nginx

# Disable autostart on boot
sudo systemctl disable nginx

# Enable and start in one command
sudo systemctl enable --now nginx

# Check if a service is running
systemctl is-active nginx     # prints "active" or "inactive"
systemctl is-enabled nginx    # prints "enabled" or "disabled"
```

### Status Output

```bash
systemctl status nginx
# ● nginx.service - A high performance web server and a reverse proxy server
#      Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
#      Active: active (running) since Fri 2026-04-10 09:00:00 UTC; 2h 15min ago
#        Docs: man:nginx(8)
#    Main PID: 1234 (nginx)
#       Tasks: 3 (limit: 4660)
#      Memory: 5.2M
#         CPU: 142ms
#      CGroup: /system.slice/nginx.service
#              ├─1234 nginx: master process /usr/sbin/nginx -g daemon off;
#              ├─1235 nginx: worker process
#              └─1236 nginx: worker process
#
# Apr 10 09:00:00 myserver systemd[1]: Started A high performance web server...
```

### Listing and Filtering Services

```bash
# List all active services
systemctl list-units --type=service

# List all services (including inactive)
systemctl list-units --type=service --all

# List services that failed
systemctl list-units --state=failed

# Show enabled/disabled state of all services
systemctl list-unit-files --type=service
```

### Writing a systemd Service Unit

Create `/etc/systemd/system/myapp.service`:

```ini
[Unit]
Description=My Node.js Application
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/myapp/current
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd to pick up the new unit file
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable --now myapp

# Verify it started
sudo systemctl status myapp
```

---

## Reading Logs with `journalctl`

`journalctl` queries the systemd journal — the centralized log storage for all services managed by systemd.

```bash
# All logs (newest at end)
journalctl

# Follow live log output (like tail -f)
journalctl -f

# Logs for a specific service
journalctl -u nginx

# Follow logs for a service
journalctl -u nginx -f

# Show logs from the current boot only
journalctl -b

# Show logs from the previous boot
journalctl -b -1

# Filter by priority (err, warning, info, debug)
journalctl -p err

# Show logs from the last hour
journalctl --since "1 hour ago"

# Show logs in a time range
journalctl --since "2026-04-10 09:00:00" --until "2026-04-10 10:00:00"

# Show last 100 lines
journalctl -n 100 -u myapp

# Output in JSON format (useful for log forwarding)
journalctl -u myapp -o json-pretty

# Filter by process ID
journalctl _PID=1234

# Disk usage of the journal
journalctl --disk-usage
```

### Combining journalctl with grep

```bash
# Find errors in the nginx journal from the last hour
journalctl -u nginx --since "1 hour ago" | grep -i error

# Watch for authentication failures in real time
journalctl -f | grep -i "authentication failure"
```

---

## Practical Scenarios

### Check What Is Using a Port

```bash
# Which process is listening on port 8080?
sudo ss -tlnp | grep :8080
# or
sudo lsof -i :8080
```

### Kill a Stuck Java Process Gracefully

```bash
# Find the PID
pgrep -f "java.*myapp.jar"
# 5678

# Try graceful stop first (SIGTERM)
kill 5678

# Wait a few seconds, check if it stopped
sleep 5
kill -0 5678 2>/dev/null && echo "still running" || echo "stopped"

# If still running, force kill
kill -9 5678
```

### Restart a Service After Config Change

```bash
# Validate nginx config before restarting
sudo nginx -t

# If valid, reload gracefully (zero downtime)
sudo systemctl reload nginx

# Or full restart if reload is not supported
sudo systemctl restart nginx
```

### Debug a Service That Won't Start

```bash
# Check the status with recent journal entries
sudo systemctl status myapp

# Show all journal entries for the service (most useful)
sudo journalctl -u myapp --no-pager

# Check if the binary is where the unit file expects it
which node
ls -la /opt/myapp/current/server.js

# Try running the ExecStart command manually as the service user
sudo -u deploy /usr/bin/node /opt/myapp/current/server.js
```
