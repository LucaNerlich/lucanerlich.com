---
title: Large Language Models (LLMs)
description: What a large language model is, how it produces text token by token, how it is trained, and what it is and is not good at.
tags: [ai, llm, foundations]
keywords:
    - large language model
    - llm
    - transformer
    - tokens
    - foundation model
    - inference
---

# Large Language Models (LLMs)

A **large language model** is a neural network trained on huge amounts of text to predict the next
[token](./glossary.md#token) in a sequence. "Large" refers both to the parameter count (billions to
trillions of learned weights) and to the training corpus (often terabytes of text). Modern LLMs --
Claude, GPT, Gemini, Llama, Mistral, Qwen, DeepSeek - share the same recipe: a **transformer**
trained to predict the next token, then aligned via [post-training](#how-an-llm-is-built) to behave
like a useful assistant.

This page is the entry point for the AI section. From here, follow the links into
[Prompt Engineering Basics](./prompt-engineering.md), [Reasoning Models](./reasoning-models.md),
[Agents](./agents.md), [RAG](./rag.md), [Tooling](./tooling.md), and [Cloud vs Local Models](./cloud-vs-local.md),
or skim the [Glossary](./glossary.md).

## How an LLM produces text

Generation is a loop over a single operation: predict the next token.

```mermaid
flowchart LR
    input["Input text"] --> tok["Tokenize -> token IDs"]
    tok --> emb["Embed each token"]
    emb --> layers["Transformer layers (self-attention + feed-forward)"]
    layers --> logits["Project to vocabulary -> probabilities"]
    logits --> sample["Sample one token"]
    sample --> append["Append token"]
    append -->|repeat| layers
    append --> done["Stop at end-of-sequence or length limit"]
```

1. **Tokenize** the input into integer token IDs. Token boundaries are learned subword units, so they
   rarely match whole words.
2. **Embed** each token ID into a vector.
3. **Run through transformer layers.** Each layer applies self-attention (every token can look at every
   prior token in the [context window](./glossary.md#context-window)) followed by a feed-forward network.
4. **Project to probabilities** over the whole vocabulary.
5. **Sample one token** (controlled by [temperature](./glossary.md#temperature), top-p, etc.).
6. **Append and repeat** until an end-of-sequence token or a length limit.

This is *autoregressive* generation: the model has no plan for the whole answer; it produces one token,
then feeds the extended sequence back through the model. Production servers reuse cached attention state
instead of recomputing all prior tokens from scratch. Chat formats, tool use, and agents are all scaffolding
around this loop.

## Decoding and sampling controls

After the model produces probabilities for the next token, the serving API has to choose one. That choice is
called **decoding**. Common knobs include:

| Control | What it does | Use with care when |
|---|---|---|
| Greedy decoding | Always chooses the highest-probability next token | You need diversity or creative alternatives |
| `temperature` | Rescales probabilities before sampling; lower is more deterministic, higher is more random | The task needs exact formats or reproducibility |
| `top_k` | Samples only from the `k` most likely tokens | The provider or model does not expose it |
| `top_p` / nucleus | Samples from the smallest token set whose cumulative probability reaches `p` | Combining it with temperature makes behavior harder to reason about |
| `min_p` | Filters out tokens below a probability threshold relative to the most likely token | The API does not document the parameter |
| Repetition, frequency, or presence penalties | Discourage repeated tokens or topics in API-specific ways | Exact wording or code must not be distorted |
| Stop sequences | End generation when a configured string appears | The stop text can appear naturally in the answer |
| Max tokens | Cap generated tokens | [Reasoning models](./reasoning-models.md) may spend the cap on hidden thinking before visible text |

Not every model accepts every knob. In particular, current reasoning-model docs are moving some models away from
traditional sampling controls: OpenAI's GPT-6 migration guide says to remove `temperature`, `top_p`, and
logprob options when reasoning effort is not `none`; Google's Gemini 3.8 Flash migration guidance says
to remove `temperature`, `top_p`, and `top_k`; and Anthropic's newer thinking-model guidance moves control toward
thinking effort instead of manual sampling. Check the exact model documentation before copying parameters between
providers.

## How an LLM is built

Modern LLM development is often described in three broad stages, although labs draw the boundaries differently
and may call the middle phase continued pre-training, annealing, or mid-training.

1. **Pre-training** - self-supervised next-token prediction on a web-scale corpus. Produces a
   *base model* that is fluent but not yet helpful. This is the compute-dominant phase.
2. **Continued / mid-training** - additional next-token training on higher-quality or targeted data such as
   code, math, long-context, multilingual, or instruction-like corpora. This bridges broad pre-training and
   post-training, but it is not a universal public stage name.
3. **Post-training** - alignment to human preferences. Combines supervised fine-tuning (teaching the
   assistant format via chat templates) with preference learning (RLHF / DPO). Produces the
   *instruct / chat model* end users actually talk to.

Adapters can be layered on top without retraining the base: [PEFT](./glossary.md#peft),
[LoRA](./glossary.md#lora), and [QLoRA](./glossary.md#qlora). See
[Cloud vs Local Models](./cloud-vs-local.md) for running and adapting open-weights models yourself.

## What LLMs are good at

- Language understanding and generation across genres and styles.
- Translation, summarization, classification.
- Code generation, refactoring, and explanation.
- Multi-step reasoning when guided by [prompts](./prompt-engineering.md), [reasoning models](./reasoning-models.md),
  scratchpads, or [agents](./agents.md).
- *In-context learning*: adapting from examples in the prompt, with no retraining.

## What LLMs are not good at

| Weakness | Mitigation |
|---|---|
| Up-to-date facts (knowledge is frozen at training time) | [RAG](./rag.md) |
| Reliable arithmetic and counting | [Tool use](./agents.md) / code execution |
| Calibrated confidence ([hallucination](#hallucination)) | Retrieval grounding, citations, **guardrails**, review |
| Long-horizon planning without scaffolding | [Multi-agent patterns](./agents.md), structured workflows |
| Cost-stable inference at high throughput | Caching, smaller models on hot paths, batching |

## Hallucination

A **hallucination** is fluent, confident, *wrong* output - fabricated facts, invented citations,
made-up API parameters. It is not a bug to be patched away; it is a direct consequence of how LLMs
work. The model is trained to predict the most *probable-sounding* next token, not to be truthful, and
it has no built-in notion of fact versus fiction and no way to "look something up". When the true answer
is weakly represented in its weights, a confident fabrication is often more probable-sounding than
"I don't know".

The practical response is layered mitigation rather than a promise to eliminate it: grounding with
[RAG](./rag.md), [tool use](./agents.md) for authoritative data, required citations, evaluation that
scores groundedness, **guardrails**, and human review for sensitive outputs.

## Core terminology

| Term | Meaning |
|---|---|
| [Token](./glossary.md#token) | The atomic unit the model reads and writes; a learned subword |
| [Context window](./glossary.md#context-window) | The max tokens the model can attend to at once (thousands to millions) |
| [Parameters](./glossary.md#parameters) | The learned weights; size correlates with capability and cost |
| [Temperature](./glossary.md#temperature) | Sampling parameter for randomness; 0 = least random / greedy in most APIs |
| [Foundation model](./glossary.md#foundation-model) | A general pre-trained base not yet specialized for a use case |
| [Frontier model](./glossary.md#frontier-model) | The current capability ceiling - usually closed-source |
| [Open-weights model](./glossary.md#open-weights) | A model whose weights are downloadable and self-hostable |
| Instruct / chat model | A foundation model after post-training; the variant users talk to |

## Foundation models: rent, don't build

A **foundation model** is a large model trained on broad data that serves as a reusable base you adapt
to many tasks. LLMs are the best-known foundation models, but the category also includes image,
multimodal, and embedding models. The central economic fact of AI engineering: **you almost never train
a foundation model - you rent or adapt one.** Training one costs millions in compute; the value you add
is in the application layer. Reach for the cheapest adaptation that works, in this order:

1. **Prompting / context** - change behavior by changing the input. Free, instant.
2. **[RAG](./rag.md)** - inject your data at inference time for grounding and freshness.
3. **Fine-tuning / [LoRA](./glossary.md#lora)** - adjust weights for a domain or style when prompting
   and retrieval are not enough.
4. **Pre-training from scratch** - almost never the right call outside a major lab.

## The model landscape

- **Frontier closed models** - Claude (Anthropic), GPT (OpenAI), Gemini (Google).
- **Open-weights families** - Llama (Meta), Mistral, Qwen (Alibaba), DeepSeek, Phi (Microsoft).
- **Cloud-vendor families** - Amazon Nova / Titan (AWS).
- **Specialized** - embedding models, rerankers, and small instruction-tuned models for on-device use.

The production choice is rarely "best model" but "best model *for this task at this cost*": frontier
models for hard reasoning, mid-tier for high-volume tasks, small models for latency-sensitive or
on-device paths. See [Cloud vs Local Models](./cloud-vs-local.md) for where each kind runs.

## Where LLMs sit in a production stack

A useful LLM application is rarely just *the model*. It is the model plus:

- **Prompting / context engineering** - what you put into the context window.
- **[Retrieval (RAG)](./rag.md)** - external knowledge fetched at inference.
- **Fine-tuning / LoRA** - domain adaptation when prompting and retrieval are not enough.
- **[Agents](./agents.md) / multi-agent systems** - tool-use loops and coordination.
- **Guardrails** - safety and policy enforcement.
- **[LLMOps](./tooling.md)** - evaluation, monitoring, cost control, and versioning in production.

See [Cost, Latency & Model Routing](./cost-and-latency.md) for token economics and tier choice, and
[Structured Outputs](./structured-outputs.md) when your stack needs machine-parseable responses.

## See also

- [AI Agents](./agents.md) - wrapping LLMs in tool-use loops
- [Prompt Engineering Basics](./prompt-engineering.md) - writing instructions and output contracts
- [Reasoning Models & Test-Time Compute](./reasoning-models.md) - when to spend extra inference-time tokens
- [RAG](./rag.md) - augmenting an LLM with external knowledge
- [Cost, Latency & Model Routing](./cost-and-latency.md) - per-token cost and model tiers
- [AI in Products](./ai-in-products.md) - shipping LLM features to users
- [Tooling and Frameworks](./tooling.md) - the ecosystem around the model
- [Cloud vs Local Models](./cloud-vs-local.md) - where and how to run a model
- [AI Glossary](./glossary.md) - quick definitions of the terms above
- [Which Pattern When?](./which-pattern-when.md) - where LLMs fit in a larger architecture
