---
title: Build a Local LLM App
description: A hands-on guide to running a model locally with Ollama or LM Studio and talking to it from your own simple app -- with copy-paste code for a browser app, a Node.js CLI, and the OpenAI SDK.
tags: [ai, local-models, ollama, lmstudio, tutorial]
keywords:
    - ollama
    - lm studio
    - local llm api
    - openai compatible api
    - build local ai app
    - localhost llm
---

# Build a Local LLM App

This is the hands-on companion to [Cloud vs Local Models](./cloud-vs-local.md): run a model on your own
machine with **Ollama** or **LM Studio**, then talk to it from a tiny app you write yourself. No API keys,
no cloud, works offline.

## The key idea: one API, two servers

Both Ollama and LM Studio expose an **OpenAI-compatible HTTP API** on `localhost`. That means your app code
is identical for either one -- only the base URL, port, and model name change. Anything that can speak to the
OpenAI API can speak to a local model.

| | Ollama | LM Studio |
|---|---|---|
| Default base URL | `http://localhost:11434/v1` | `http://localhost:1234/v1` |
| Native API (also) | `http://localhost:11434/api/chat` | -- |
| API key | any non-empty string (ignored) | any non-empty string (ignored) |
| Interface | CLI-first | GUI-first (plus an `lms` CLI) |
| Get a model | `ollama pull <model>` | search & download in the app |

Pick whichever you prefer; the [app code below](#write-a-simple-app) works with both.

## Option A: Ollama

[Ollama](https://ollama.com/download) is the simplest way to run open-weights models from the terminal.

1. **Install** it from [ollama.com/download](https://ollama.com/download).
2. **Pull and run a model.** Start with a small one that fits your RAM/VRAM:

```bash
ollama pull llama3.2        # ~2 GB, a good small default
ollama run llama3.2         # interactive chat in the terminal
ollama list                 # see what you have installed
```

3. **The API is already running.** Whenever Ollama is running, its server listens on
   `http://localhost:11434`. To start it manually (e.g. on a headless box): `ollama serve`.
4. **Smoke-test it** with `curl` -- both the OpenAI-compatible and native endpoints work:

```bash
# OpenAI-compatible endpoint
curl http://localhost:11434/v1/chat/completions -H "Content-Type: application/json" -d '{
    "model": "llama3.2",
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
}'

# Ollama native endpoint
curl http://localhost:11434/api/chat -d '{
    "model": "llama3.2",
    "messages": [{"role": "user", "content": "Say hello in one sentence."}],
    "stream": false
}'
```

If you need to pick a model for your hardware, see
[quantization and open-weights models](./cloud-vs-local.md#local-model-usage) -- the rule is "largest model
that fits your VRAM".

## Option B: LM Studio

[LM Studio](https://lmstudio.ai) is a desktop GUI for discovering, downloading, and serving models.

1. **Download** it from [lmstudio.ai](https://lmstudio.ai).
2. **Find and download a model** in the app's search tab (it suggests quantizations that fit your machine).
3. **Start the local server.** Open the **Developer** / **Local Server** tab and start it. It defaults to
   `http://localhost:1234` and exposes the OpenAI-compatible API at `http://localhost:1234/v1`.
4. **Enable CORS** in the server settings if you plan to call it from a browser app.
5. **Smoke-test it** (use the exact model id shown in the server panel, or `GET /v1/models` to list them):

```bash
curl http://localhost:1234/v1/chat/completions -H "Content-Type: application/json" -d '{
    "model": "your-loaded-model-id",
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
}'
```

## Write a simple app

Three versions of the same thing, in increasing order of polish. They all hit the OpenAI-compatible
endpoint, so switching between Ollama and LM Studio is a one-line change.

### 1. A Node.js CLI (zero dependencies, streaming)

The most reliable starting point -- no CORS, no build step. Requires Node 18+ (built-in `fetch`). Save as
`chat.mjs` and run `node chat.mjs "your question"`.

```js
// chat.mjs -- a tiny streaming chat client for a local LLM.
// Ollama:   node chat.mjs "hello"
// LM Studio: LLM_BASE_URL=http://localhost:1234/v1 LLM_MODEL=your-model node chat.mjs "hello"

const BASE_URL = process.env.LLM_BASE_URL ?? 'http://localhost:11434/v1';
const MODEL = process.env.LLM_MODEL ?? 'llama3.2';
const prompt = process.argv.slice(2).join(' ') || 'Explain what a local LLM is in two sentences.';

const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
            {role: 'system', content: 'You are a concise, helpful assistant.'},
            {role: 'user', content: prompt},
        ],
    }),
});

if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${await res.text()}`);
}

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, {stream: true});
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;
        const token = JSON.parse(data).choices?.[0]?.delta?.content;
        if (token) process.stdout.write(token);
    }
}
process.stdout.write('\n');
```

The streaming response is server-sent events: each line is `data: {json}`, ending with `data: [DONE]`. We
buffer partial lines and pull `choices[0].delta.content` out of each chunk.

### 2. A single-file browser app (streaming)

Save as `index.html`. It is a complete, dependency-free chat UI. See the [CORS note](#cors-and-the-browser)
below before running it in a browser.

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Local LLM Chat</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
        #log { white-space: pre-wrap; border: 1px solid #ccc; border-radius: 8px; padding: 1rem; min-height: 8rem; }
        form { display: flex; gap: .5rem; margin-top: 1rem; }
        input { flex: 1; padding: .5rem; }
    </style>
</head>
<body>
    <h1>Local LLM Chat</h1>
    <div id="log"></div>
    <form id="form">
        <input id="input" autocomplete="off" placeholder="Ask something..." />
        <button>Send</button>
    </form>
    <script type="module">
        const BASE_URL = 'http://localhost:11434/v1'; // LM Studio: http://localhost:1234/v1
        const MODEL = 'llama3.2';                      // LM Studio: your loaded model id

        const log = document.getElementById('log');
        const form = document.getElementById('form');
        const input = document.getElementById('input');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const question = input.value.trim();
            if (!question) return;
            input.value = '';
            log.textContent += `\nYou: ${question}\nAI: `;

            const res = await fetch(`${BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    model: MODEL,
                    stream: true,
                    messages: [{role: 'user', content: question}],
                }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            for (;;) {
                const {done, value} = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {stream: true});
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data:')) continue;
                    const data = trimmed.slice(5).trim();
                    if (data === '[DONE]') continue;
                    const token = JSON.parse(data).choices?.[0]?.delta?.content;
                    if (token) log.textContent += token;
                }
            }
        });
    </script>
</body>
</html>
```

### 3. Using the official OpenAI SDK

If you already use the OpenAI SDK, just point it at the local base URL -- nothing else changes.

```js
import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1', // LM Studio: http://localhost:1234/v1
    apiKey: 'ollama',                      // any non-empty string; local servers ignore it
});

const completion = await client.chat.completions.create({
    model: 'llama3.2',
    messages: [{role: 'user', content: 'Give me one tip for running LLMs locally.'}],
});

console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

resp = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Give me one tip for running LLMs locally."}],
)
print(resp.choices[0].message.content)
```

## Tuning the behavior

- **System prompt** -- prepend a `{role: 'system', content: '...'}` message to set persona and rules.
- **Temperature** -- add `"temperature": 0.2` to the request body for more deterministic output (0) or more
  variety (higher). See [temperature](./glossary.md#temperature).
- **Swap the model** -- change one string. Pull another with `ollama pull <model>` or load another in
  LM Studio.
- **Streaming on/off** -- set `"stream": false` to get the whole response in one JSON object instead of
  token-by-token.

## CORS and the browser {#cors-and-the-browser}

The Node CLI talks to `localhost` directly, so it never hits CORS. A **browser** app served from a different
origin (or opened as a `file://`) makes a cross-origin request to the model server, which the browser blocks
unless the server allows it:

- **Ollama** -- set the `OLLAMA_ORIGINS` environment variable before starting it, e.g.
  `OLLAMA_ORIGINS='*' ollama serve` (or list specific origins). Restart Ollama after changing it.
- **LM Studio** -- toggle **CORS** on in the Local Server settings.

The cleanest setup is to serve the HTML from a tiny static server (for example `npx serve`) and allow that
exact origin, rather than opening the file directly.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `connection refused` / fetch fails | Server not running or wrong port | Start Ollama (`ollama serve`) or the LM Studio server; check `11434` vs `1234` |
| `model not found` / 404 | Model not pulled or wrong name | `ollama pull llama3.2`; in LM Studio use the exact loaded id; check `GET /v1/models` |
| CORS error in the browser console | Cross-origin request blocked | Set `OLLAMA_ORIGINS` / enable LM Studio CORS, or use the Node version |
| Very slow, or out of memory | Model too big for your VRAM | Pick a smaller or more quantized model (e.g. a 3B at Q4) |
| Empty or cut-off output | Streaming parse or length limit | Verify the SSE parsing loop; raise the max tokens |

## See also

- [Cloud vs Local Models](./cloud-vs-local.md) -- when to run locally vs in the cloud, and how to size a model
- [Local & offline Copilot alternative](../other/local-llm-for-coding.md) -- a local coding assistant (Ollama + Continue.dev)
- [Large Language Models](./llm.md) -- what the model is doing under the hood
- [RAG](./rag.md) -- add your own documents to a local app
- [AI Glossary](./glossary.md) -- open-weights, quantization, inference, and more
