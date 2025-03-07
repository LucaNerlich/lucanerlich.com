# How do setup a local & offline GitHub Copilot alternative

## Ollama + Continue Dev

1. Install ollama
    - https://ollama.com/download
2. Install the continue.dev Plugin for JetBrains or VSCode
    - https://plugins.jetbrains.com/plugin/22707-continue
    - https://marketplace.visualstudio.com/items?itemName=Continue.continue
3. Optionally, use [OpenWebUI](https://docs.openwebui.com) via Docker as an Interface for Chatting

## Model Setup

1. Quick Tab Completion
    ```bash
    ollama pull qwen2.5-coder:1.5b
    ```
    - https://ollama.com/library/qwen2.5-coder
    - [Open Source](https://github.com/QwenLM/Qwen2.5-Coder?tab=readme-ov-file#readme)
2. Indexing and Codebase Search
    ```bash
    ollama pull nomic-embed-text
    ```
3. General Purpose Reasoning Model
    ```bash
    ollama pull phi4
    ```
   - https://ollama.com/library/phi4
   - [MIT License](https://ollama.com/library/phi4/blobs/fa8235e5b48f)
   - Alternatively use *Deepseek R1*
     - https://ollama.com/library/deepseek-r1
     - [MIt License](https://ollama.com/library/deepseek-r1:32b/blobs/6e4c38e1172f)
     - Choose the largest b-Parameter Model that will fit into your VRAM
     ```bash
     ollama pull deepseek-r1:32b
     ollama run deepseek-r1:32b
     ```
4. Reranking Model
   ```bash
   ollama pull linux6200/bge-reranker-v2-m3
   ```
   - https://docs.continue.dev/customize/model-roles/reranking
   - https://ollama.com/linux6200/bge-reranker-v2-m3
5. Update continue.dev `config.json` -> [see here](#suggested-continuedev-config)
6. Run ollama api locally
    ```bash
    ollama serve
    ```
    - https://ollama.com/library/nomic-embed-text
    - [Apache License](https://ollama.com/library/nomic-embed-text/blobs/c71d239df917)

## Usage

Use directly in your editor

![continue-in-editor.png](assets/continue-in-editor.png)

or via the chat-sidebar tab

![continue-chat-sidebar.png](assets/continue-chat-sidebar.png)

## Suggested continue.dev config

- Unix: `~/.continue/config.json`
- Windows: `%USERPROFILE%\.continue\config.json`

```json title="~/.continue/config.json"
{
    "models": [
        {
            "title": "PHi-4",
            "provider": "ollama",
            "model": "phi4",
            "systemMessage": "You are a helpful assistant supporting a software developer. Your tasks may involve explaining technical concepts, assisting with code, offering best practices, and solving programming-related issues across various languages and frameworks. Always provide clear, concise, and accurate answers. Always respond in English."
        },
        {
            "title": "Deepseek R1",
            "provider": "ollama",
            "model": "deepseek-r1:32b",
            "systemMessage": "You are a helpful assistant supporting a software developer. Your tasks may involve explaining technical concepts, assisting with code, offering best practices, and solving programming-related issues across various languages and frameworks. Always provide clear, concise, and accurate answers. Always respond in English."
        },
        {
            "title": "Mistral Small 3",
            "provider": "ollama",
            "model": "mistral-small:24b",
            "systemMessage": "You are a helpful assistant supporting a software developer. Your tasks may involve explaining technical concepts, assisting with code, offering best practices, and solving programming-related issues across various languages and frameworks. Always provide clear, concise, and accurate answers. Always respond in English."
        }
    ],
    "tabAutocompleteModel": {
        "title": "Qwen2.5-Coder",
        "provider": "ollama",
        "model": "qwen2.5-coder:1.5b"
    },
    "embeddingsProvider": {
        "title": "Nomic Embed Text",
        "provider": "ollama",
        "model": "nomic-embed-text"
    },
    "customCommands": [
        {
            "name": "test",
            "prompt": "{{{ input }}}\n\nWrite a comprehensive set of unit tests for the selected code. It should setup, run tests that check for correctness including important edge cases, and teardown. Ensure that the tests are complete and sophisticated. Give the tests just as chat output, don't edit any file.",
            "description": "Write unit tests for highlighted code"
        }
    ],
    "contextProviders": [
        {
            "name": "diff",
            "params": {}
        },
        {
            "name": "folder",
            "params": {}
        },
        {
            "name": "codebase",
            "params": {}
        },
        {
            "name": "file",
            "params": {}
        },
        {
            "name": "code",
            "params": {}
        },
        {
            "name": "currentFile",
            "params": {}
        },
        {
            "name": "terminal",
            "params": {}
        },
        {
            "name": "open",
            "params": {}
        },
        {
            "name": "web",
            "params": {}
        },
        {
            "name": "url",
            "params": {}
        },
        {
            "name": "repo-map",
            "params": {}
        },
        {
            "name": "os",
            "params": {}
        },
        {
            "name": "docs",
            "params": {}
        }
    ],
    "slashCommands": [
        {
            "name": "share",
            "description": "Export the current chat session to markdown"
        },
        {
            "name": "commit",
            "description": "Generate a git commit message"
        }
    ],
    "docs": [
        {
            "startUrl": "https://www.aem.live/docs",
            "title": "aem.live",
            "faviconUrl": "https://www.aem.live/favicon.ico"
        },
        {
            "startUrl": "https://experienceleague.adobe.com/de/docs/experience-manager-cloud-service",
            "title": "AEMaaCS",
            "faviconUrl": "https://experienceleague.adobe.com/favicon.ico"
        }
    ],
    "experimental": {
        "useChromiumForDocsCrawling": true
    }
}
```
