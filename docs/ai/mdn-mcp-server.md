---
title: MDN MCP Server
description: Connect AI tools and IDEs to MDN's live documentation and browser compatibility data via the official MDN MCP server.
tags: [ai, mcp, mdn, browser-compatibility, tooling]
keywords:
    - mdn mcp
    - browser compatibility ai
    - model context protocol mdn
    - mcp server setup
    - claude code mcp
---

# MDN MCP Server

MDN publishes an official [MCP](./agents.md#mcp-model-context-protocol) server at `https://mcp.mdn.mozilla.net/` that gives any MCP-compatible client direct access to MDN's documentation and browser compatibility data. Instead of relying on a model's training-data snapshot, your agent or IDE pulls live, authoritative web platform information at inference time.

The server is **experimental** but publicly available with no authentication required.

## Why it matters

AI tools trained on a fixed dataset go stale. Browser compatibility tables shift with every release cycle, and new web platform APIs land constantly. Without a live source, a model can confidently recommend a CSS property or JS API that has poor support on a browser your users actually run.

The MDN MCP server solves this by giving your tools a real-time lookup channel:

- **Browser support data** grounded in BCD (Browser Compatibility Data), the same dataset powering caniuse
- **Up-to-date documentation** — spec changes, deprecations, and new APIs appear as MDN publishes them
- **Faster answers** — structured MCP responses are roughly 2× faster than the model reasoning from memory alone

## Setup

The server uses HTTP transport. Add it once; any MCP client that supports remote HTTP servers can use the same URL.

### Claude Code

```bash
claude mcp add --transport http mdn https://mcp.mdn.mozilla.net/
```

This stores the server in your Claude Code config. Confirm it's active with `claude mcp list`.

### VS Code (GitHub Copilot / MCP extension)

Add to `.vscode/mcp.json` in your project, or to your user `settings.json`:

```json
{
    "servers": {
        "mdn": {
            "type": "http",
            "url": "https://mcp.mdn.mozilla.net/"
        }
    }
}
```

See the [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for the full settings path.

### Cursor

Add to `.cursor/mcp.json`:

```json
{
    "mcpServers": {
        "mdn": {
            "url": "https://mcp.mdn.mozilla.net/"
        }
    }
}
```

See the [Cursor MCP docs](https://docs.cursor.com/context/mcp) for project vs global scope.

### Zed

Add to your Zed settings under `context_servers`:

```json
{
    "context_servers": {
        "mdn": {
            "source": {
                "type": "url",
                "url": "https://mcp.mdn.mozilla.net/"
            }
        }
    }
}
```

See the [Zed MCP docs](https://zed.dev/docs/ai/mcp) for details.

### Claude Desktop

Add to your Claude Desktop config file (`claude_desktop_config.json`):

```json
{
    "mcpServers": {
        "mdn": {
            "type": "http",
            "url": "https://mcp.mdn.mozilla.net/"
        }
    }
}
```

See the [Claude Desktop connector docs](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities) for the config file location.

## What the server exposes

The MDN MCP server is a read-only data source — it does not execute code or modify anything. Tools exposed typically include:

- **Browser compatibility lookup** — given a feature name, returns a BCD-backed support table across browsers and versions
- **MDN documentation fetch** — returns structured content from a specific MDN page
- **Feature search** — find MDN pages and API entries by keyword

The exact tool list evolves as MDN expands the server; check the [mdn/mcp repository](https://github.com/mdn/mcp) for the current spec.

## Privacy

Queries sent to the MDN MCP server are processed by Mozilla's infrastructure. Review MDN's data retention and privacy notes at `https://developer.mozilla.org/en-US/mcp#privacy_and_data_retention` before using it in contexts where query confidentiality matters (e.g. internal codebases with proprietary feature names).

## See also

- [AI Agents](./agents.md#mcp-model-context-protocol) - how MCP works and the N+M problem it solves
- [Tooling and Frameworks](./tooling.md#connectivity-protocols) - MCP, A2A, and the broader connectivity stack
- [AI-Assisted Development](./ai-assisted-development.md) - practical patterns for using AI tools in a dev workflow
