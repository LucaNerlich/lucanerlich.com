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
            "prompt": "{{{ input }}}\n\nWrite a comprehensive set of unit tests for the provided code. Ensure to include setup, execution of correctness checks with important edge cases, and teardown. Present the tests as plain text output.",
            "description": "Generate unit tests for the highlighted code."
        },
        {
            "name": "refactor",
            "prompt": "{{{ input }}}\n\nRefactor the provided code to improve its structure and readability without altering its functionality. Include a detailed explanation of your changes and reasoning.",
            "description": "Improve the code's structure for better readability."
        },
        {
            "name": "optimize",
            "prompt": "{{{ input }}}\n\nOptimize the provided code for performance while maintaining its current behavior. Describe any trade-offs involved in your optimization process.",
            "description": "Enhance code performance with a detailed explanation of changes and trade-offs."
        },
        {
            "name": "explain",
            "prompt": "{{{ input }}}\n\nExplain the logic and functionality of the provided code. Discuss any potential inefficiencies or unnecessary computations that could be improved for better performance.",
            "description": "Analyze and explain the code's functionality and potential improvements."
        },
        {
            "name": "document",
            "prompt": "{{{ input }}}\n\nWrite language-specific documentation for the provided function. Use appropriate formats like Javadoc for Java or JSDoc for JavaScript. Ensure clarity and conciseness in your explanation.",
            "description": "Create clear and concise function documentation using the correct language format."
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
        },
        {
            "startUrl": "https://lucanerlich.com",
            "title": "lucanerlich",
            "faviconUrl": ""
        },
        {
            "startUrl": "https://react.dev/",
            "title": "react",
            "faviconUrl": ""
        },
        {
            "startUrl": "https://www.typescriptlang.org/",
            "title": "typescript",
            "faviconUrl": ""
        },
        {
            "startUrl": "https://react-spectrum.adobe.com/index.html",
            "title": "react spectrum",
            "faviconUrl": ""
        }
    ],
    "experimental": {
        "useChromiumForDocsCrawling": true
    }
}
```
