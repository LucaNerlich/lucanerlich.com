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

### Adding a local provider (LM Studio)

opencode treats any OpenAI-compatible server as a custom provider. To wire up
a local [LM Studio](https://lmstudio.ai/) instance, add a provider entry to
`~/.config/opencode/opencode.json`:

```json title="~/.config/opencode/opencode.json"
{
  "provider": {
    "lmstudio": {
      "name": "LM Studio (local)",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:1234/v1"
      },
      "models": {
        "qwen/qwen3.8-27b": {
          "name": "Qwen 3.8 27B"
        }
      }
    }
  }
}
```

Two gotchas that produce confusing errors:

- `name` and `options` belong directly under the provider id (`lmstudio`), as
  siblings of `models` -- not nested inside `models`. Nesting them inside
  `models` makes the schema validator treat `"name"` as a model id whose
  value should be an object, failing with something like `Expected object,
  got "LM Studio (local)"`.
- The key under `models` must match the model id LM Studio actually serves.
  Confirm with `curl http://127.0.0.1:1234/v1/models` -- a provider-prefixed
  alias like `lmstudio/qwen` will validate fine but fail at request time if
  LM Studio doesn't recognize that id.

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
  # or, version-pinned with mise
  mise use --global pi
  ```

  If `pi` (or any mise-installed tool) reports `command not found`, mise
  itself isn't hooked into the shell yet. Confirm with `mise doctor` --
  `activated: no` / `shims_on_path: no` means the activation line is
  missing -- then add it:

  ```bash title="~/.zshrc - mise"
  eval "$(mise activate zsh)"
  ```

  See [Local Version Management with mise](../other/mise.md#install-and-activate)
  for the full setup and per-shell variants.

- **Usage:**
  - `pi` -- interactive TUI in the current project
  - `pi "fix the failing test"` -- one-shot prompt
  - `/reload` -- pick up extension changes mid-session; ask pi to modify its
    own extensions and it will
  - Press `Enter` to steer the current run, `Alt+Enter` to queue a follow-up

### Adding a local provider (LM Studio)

Custom OpenAI-compatible providers (Ollama, LM Studio, vLLM) go in
`~/.pi/agent/models.json`, which pi re-reads live -- no restart needed:

```json title="~/.pi/agent/models.json"
{
  "providers": {
    "lmstudio": {
      "api": "openai-completions",
      "baseUrl": "http://127.0.0.1:1234/v1",
      "apiKey": "lm-studio",
      "models": [
        {
          "id": "qwen/qwen3.8-27b",
          "name": "Qwen 3.8 27B (LM Studio)"
        }
      ]
    }
  }
}
```

- `baseUrl` needs the `/v1` suffix -- pi's OpenAI-compatible client expects
  it, unlike some other harnesses.
- The `id` must match exactly what LM Studio serves. Confirm with `curl
  http://127.0.0.1:1234/v1/models` -- LM Studio often prefixes ids with the
  publisher (e.g. `qwen/qwen3.8-27b`, not `qwen3.8-27b`).
- `apiKey` is optional for local servers but a harmless placeholder avoids
  clients that reject requests with no key at all.
- Switch to it with `/model` inside a session, or set it as the default in
  `~/.pi/agent/settings.json` (`defaultProvider` / `defaultModel`).

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
