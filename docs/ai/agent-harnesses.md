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
  terminal restarts, a provider/model catalog from models.dev, agents,
  commands, plugins, skills, and MCP support.
- **Install:** follow the [V2 docs](https://opencode.ai/v2/docs/); the V2 CLI
  binary is `opencode` (or `mise use --global opencode`).
- **Usage:**
  - `opencode` -- start the TUI in the current project
  - `opencode run "explain this repo"` -- one-shot print mode
  - `opencode --standalone` -- run with a private server instead of the shared
    background service
  - Configuration lives in `~/.config/opencode/opencode.json(c)` (global),
    `opencode.json(c)`, or `.opencode/opencode.json(c)` per project; see the [config
    guide](https://opencode.ai/v2/docs/config).

No `.zshrc` additions required -- it is fully self-contained.

### Adding a local provider (LM Studio)

opencode has built-in LM Studio discovery. To point it at a local
[LM Studio](https://lmstudio.ai/) instance, add a provider override to
`~/.config/opencode/opencode.jsonc`:

```json title="~/.config/opencode/opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "providers": {
    "lmstudio": {
      "settings": {
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

- `settings` belongs directly under the provider id (`lmstudio`), as a sibling
  of `models` -- not nested inside `models`. Nesting provider settings inside
  `models` makes the schema validator treat them as model ids.
- If you pin a model under `models`, its key must match the model id LM Studio
  actually serves. Confirm with `curl http://127.0.0.1:1234/v1/models` -- a
  provider-prefixed alias like `lmstudio/qwen` will validate fine but fail at
  request time if LM Studio doesn't recognize that id.

### Adding a local provider (oMLX)

oMLX is a local inference server for Mac that exposes an OpenAI-compatible API
at `http://127.0.0.1:8000/v1` by default. The setup mirrors LM Studio, with one
important difference: **oMLX requires a real API key** -- Ollama/LM Studio
accept any non-empty string, oMLX answers `API key required` without one.

1. **Find your key** in `~/.omlx/settings.json` under `auth.api_key`
   (it starts with `sk-omlx-`).
2. **Confirm the served model id** (authenticated -- unauthenticated requests
   are rejected):

```bash
curl http://127.0.0.1:8000/v1/models -H "Authorization: Bearer <your-omlx-api-key>"
```

3. **Add the provider** to `~/.config/opencode/opencode.jsonc`:

```json title="~/.config/opencode/opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "providers": {
    "omlx-local": {
      "name": "oMLX (local)",
      "env": ["OMLX_API_KEY"],
      "package": "@opencode/ai/providers/openai-compatible",
      "settings": {
        "baseURL": "http://127.0.0.1:8000/v1"
      },
      "models": {
        "Qwen3.8-27B-4bit": {
          "name": "Qwen3.8-27B-4bit (local)",
          "limit": {
            "context": 262144,
            "output": 32768
          }
        }
      }
    }
  }
}
```

4. **Verify** by starting opencode and picking the provider via `/models`.

Gotchas learned the hard way:

- Put the key in an environment variable listed under `env`, for example
  `export OMLX_API_KEY=<your-omlx-api-key>` before starting opencode. A stored
  account for another provider does not authenticate this custom provider.
- If you set `limit`, it needs **both** `context` and `output` -- a lone
  `context` fails config validation and blocks `/models` entirely (the error
  names the missing `limit.output` key).
- As with LM Studio, the key under `models` must exactly match the `id` from
  `GET /v1/models`.

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
  npm install -g --ignore-scripts @earendil-works/pi-coding-agent
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
  - `pi --print "fix the failing test"` -- one-shot prompt
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

### Tokens/sec footer

There's no built-in setting for this -- `settings.json` has no
`showTokensPerSecond` toggle -- but it's exactly the documented extension
pattern (`ctx.ui.setFooter()`, same one used for the git-branch example in
pi's own docs). Drop this in `~/.pi/agent/extensions/tps-footer.ts` (global,
auto-discovered, hot-reloadable with `/reload`):

```typescript title="~/.pi/agent/extensions/tps-footer.ts"
import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI) {
  // message_start/message_end fire back-to-back once the response is
  // finalized -- they don't bracket the real streaming duration. Time
  // from the first streamed chunk (message_update) instead.
  let assistantPending = false;
  let firstTokenAt = 0;
  let lastTps: number | null = null;
  let requestRender: (() => void) | null = null;
  let enabled = false;

  pi.on("message_start", async (event) => {
    if (event.message.role === "assistant") {
      assistantPending = true;
      firstTokenAt = 0;
    }
  });

  pi.on("message_update", async (event) => {
    if (assistantPending && event.message.role === "assistant" && !firstTokenAt) {
      firstTokenAt = Date.now();
    }
  });

  pi.on("message_end", async (event) => {
    if (event.message.role !== "assistant") return;
    assistantPending = false;
    if (!firstTokenAt) return;
    const message = event.message as AssistantMessage;
    const outputTokens = message.usage?.output ?? 0;
    const elapsedSec = (Date.now() - firstTokenAt) / 1000;
    if (elapsedSec > 0 && outputTokens > 0) lastTps = outputTokens / elapsedSec;
    firstTokenAt = 0;
    requestRender?.();
  });

  pi.registerCommand("tps", {
    description: "Toggle tokens/sec footer",
    handler: async (_args, ctx) => {
      enabled = !enabled;
      if (enabled) {
        ctx.ui.setFooter((tui, theme, footerData) => {
          requestRender = () => tui.requestRender();
          const unsub = footerData.onBranchChange(() => tui.requestRender());
          return {
            dispose: () => { unsub(); requestRender = null; },
            invalidate() {},
            render(width: number): string[] {
              const tpsStr = lastTps != null ? `${lastTps.toFixed(1)} tok/s` : "-- tok/s";
              const left = theme.fg("dim", tpsStr);
              const right = theme.fg("dim", ctx.model?.id || "no-model");
              const pad = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));
              return [truncateToWidth(left + pad + right, width)];
            },
          };
        });
        ctx.ui.notify("tok/s footer enabled", "info");
      } else {
        ctx.ui.setFooter(undefined);
        ctx.ui.notify("Default footer restored", "info");
      }
    },
  });
}
```

Run `/tps` inside a session to toggle it on. Especially useful against a
local [LM Studio](#adding-a-local-provider-lm-studio) provider, where
throughput varies a lot by model size and quantization.

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
  - Start any supported agent (e.g. `claude`, `opencode`, `pi`) in a pane;
    herdr detects it automatically
  - `ctrl+b q` -- detach; everything keeps running
  - `herdr` again -- reattach, sessions are restored
  - `herdr agent list` / `herdr agent explain` -- inspect what herdr sees
