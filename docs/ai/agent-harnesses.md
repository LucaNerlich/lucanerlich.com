---
title: AI Agent Harnesses
description: The AI coding-agent harnesses I run in the terminal -- opencode, pi, and herdr -- what a harness is, how they differ, and how I use them day to day.
tags: [ai, agents, cli, tooling, terminal]
keywords: [opencode, pi coding agent, herdr, ai agent, coding agent, harness, terminal, cli]
---

# AI agent harnesses

AI coding agents are converging on a common shape: a **harness** is the
program that wraps the model -- it runs the agent loop, gives the model tools
(shell, file edits, search), manages sessions and context, and renders the
terminal UI. For the underlying concepts (tool use, MCP, multi-agent
patterns), see the [AI Agents](./agents.md) guide; for running local
models instead of cloud providers, see [Local & Offline Copilot
Alternative](./local-llm-for-coding.md).

These are the three harnesses I currently run. Like the rest of my CLI
tooling, they can be installed and version-pinned with
[mise](../other/mise.md).

## opencode

[OpenCode](https://opencode.ai/v2/) ([GitHub](https://github.com/sst/opencode))
is an open-source terminal coding agent with a client-server architecture: a
background service owns sessions, providers, and tool execution, while the TUI,
scripts, and HTTP clients all attach to it.

- **V2 highlights:** client/server split with an [HTTP
  API](https://opencode.ai/v2/docs/api), background service that survives
  terminal restarts, 75+ providers, agents, commands, plugins, skills, and MCP
  support.
- **Install:** follow the [V2 docs](https://opencode.ai/v2/docs/); the V2 CLI
  binary is `opencode2` (or `mise use --global opencode`).
- **Usage:**
  - `opencode2` -- start the TUI in the current project
  - `opencode2 run "explain this repo"` -- one-shot print mode
  - `opencode2 service status` / `opencode2 service restart` -- manage the
    background service
  - Configuration lives in `~/.config/opencode/opencode.json` (global) and
    `opencode.json` per project; see the [config
    guide](https://opencode.ai/v2/docs/config).

No `.zshrc` additions required -- it is fully self-contained.

## pi

[pi](https://pi.dev) ([GitHub](https://github.com/earendil-works/pi)) is a
minimal agent harness by Mario Zechner. Its philosophy: ship a small, solid
core (agent loop, tools, sessions, provider auth) and let you **extend the
harness instead of adapting to it** -- with TypeScript extensions, skills,
prompt templates, and themes bundled as shareable packages.

- **Highlights:** no MCP, sub-agents, or plan mode built in -- you add exactly
  what you want; tree-structured sessions with compaction; 15+ providers;
  four runtime modes (interactive, print/JSON, RPC, SDK).
- **Install:**

  ```bash
  npm install -g @earendil-works/pi-coding-agent
  ```

- **Usage:**
  - `pi` -- interactive TUI in the current project
  - `pi "fix the failing test"` -- one-shot prompt
  - `/reload` -- pick up extension changes mid-session; ask pi to modify its
    own extensions and it will
  - Press `Enter` to steer the current run, `Alt+Enter` to queue a follow-up

## herdr

[herdr](https://herdr.dev) ([GitHub](https://github.com/herdrdev/herdr)) is an
agent-aware terminal multiplexer -- tmux rebuilt for running several AI coding
agents at once. A background server owns the terminals, so your agents keep
working when you close the lid, drop the network, or restart the machine.

- **Highlights:**
  - Every pane is classified as `working`, `blocked`, `idle`, or `done` --
    the sidebar tells you which agent is waiting for you instead of you
    polling panes
  - Runs Claude Code, Codex, Cursor, OpenCode, pi, Grok, and 20+ others out
    of the box -- it does not wrap or replace them, it owns their terminals
  - Mouse-first (click, drag, right-click to split) plus tmux-style `ctrl+b`
    prefix keys
  - A CLI and socket API let scripts and agents spawn panes, prompt each
    other, and wait until another agent is genuinely blocked
- **Install:** one binary for macOS, Linux, and Windows -- see the [quick
  start](https://herdr.dev/docs/quick-start/).
- **Usage:**
  - `herdr` -- start or reattach to your workspace
  - Start any supported agent (e.g. `claude`, `opencode2`, `pi`) in a pane;
    herdr detects it automatically
  - `ctrl+b q` -- detach; everything keeps running
  - `herdr` again -- reattach, sessions are restored
  - `herdr agent list` / `herdr agent explain` -- inspect what herdr sees
