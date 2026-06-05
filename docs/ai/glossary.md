---
title: AI Glossary
description: Short, plain-English definitions of the core AI, LLM, agent, and RAG terms used across this section, with links to the deep-dive pages.
tags: [ai, glossary, reference]
keywords:
    - ai glossary
    - llm terminology
    - agent rag definitions
    - ai engineering terms
---

# AI Glossary

Short, plain-English definitions of the terms used across the [AI section](./llm.md). Where a concept has
a dedicated page, the term links to it. Terms are listed alphabetically.

## A2A (Agent2Agent) {#a2a}

An open standard from Google for communication between [agents](./agents.md) built on different frameworks
or by different vendors. Where MCP connects an agent to tools, A2A connects an agent to other agents, using
Agent Cards for capability discovery. See [Agents](./agents.md#a2a-agent2agent).

## Agent {#agent}

An [LLM](./llm.md) autonomously using tools in a loop: the model decides what to do next, your code runs
the chosen tool, the result is fed back, and the loop repeats. See [AI Agents](./agents.md).

## Agentic AI {#agentic-ai}

The umbrella label for systems where an LLM plans, decides, and acts via tools rather than producing a
single output. The same territory as "agents", framed as an architectural property you can add
incrementally. See [AI Agents](./agents.md).

## Agent skill {#agent-skill}

A portable, version-controlled workflow package (`SKILL.md` plus optional scripts and references) that
teaches a coding agent how to perform a specific task. Loaded on demand when the agent matches the skill's
description to the current task, unlike always-on rules or project memory files. See [Agent Skills](./skills.md).

## ANN (Approximate Nearest Neighbor) {#ann}

The efficiency primitive behind [vector databases](#vector-database): instead of comparing a query against
every stored vector, an ANN algorithm checks a carefully selected subset, trading a little accuracy for a
large speedup. See [RAG](./rag.md#vector-databases).

## Attention {#attention}

The core operation inside each transformer layer: every token computes how much to "attend to" every prior
token in the [context window](#context-window), letting the model relate words across a sequence.

## Base model {#base-model}

A [foundation model](#foundation-model) straight out of pre-training -- fluent but not yet a helpful
assistant. It becomes an instruct/chat model only after [post-training](#post-training). See
[LLMs](./llm.md#how-an-llm-is-built).

## Chain-of-thought {#chain-of-thought}

Prompting or training a model to reason step by step in tokens before answering, trading latency for
accuracy on multi-step problems. See [LLMs](./llm.md#what-llms-are-good-at).

## Context compaction {#context-compaction}

Summarizing a conversation that is nearing the context-window limit and reinitializing a fresh window with
the summary -- the first lever for long-horizon coherence. See
[Context Engineering](./context-engineering.md#long-horizon-techniques).

## Context engineering {#context-engineering}

The discipline of curating what goes into the [context window](#context-window) across many turns --
compaction, structured notes, retrieval, and sub-agents. The agentic-era successor to prompt engineering.

## Context rot {#context-rot}

The empirical degradation of an LLM's recall as the context window fills -- "lost in the middle". Caused by
O(n^2) attention and short-sequence-heavy training data; bigger windows do not fix it. See
[Context Engineering](./context-engineering.md#context-rot-the-constraint-behind-the-techniques).

## Context window {#context-window}

The maximum number of [tokens](#token) a model can attend to at once (today: thousands to millions). All
input, retrieved context, and generated output must fit inside it. See [LLMs](./llm.md).

## Cosine similarity {#cosine-similarity}

The dominant metric for comparing [embeddings](#embedding): the cosine of the angle between two vectors,
measuring how similar in meaning two pieces of text are regardless of length. See [RAG](./rag.md).

## Deep modules {#deep-modules}

Modules with simple interfaces that hide significant internal complexity (Ousterhout). AI agents work best
inside such clear boundaries, because the interface is the contract. See
[AI-Assisted Software Development](./ai-assisted-development.md).

## Embedding {#embedding}

A dense numeric vector (typically 384--4096 dimensions) representing text, an image, or audio, chosen so
that semantically similar inputs land close together in vector space. The layer [RAG](./rag.md#embeddings-the-layer-rag-depends-on)
depends on.

## Fine-tuning {#fine-tuning}

Continued training of a pretrained model on task- or domain-specific data, baking knowledge and behavior
into the weights. Best for style, tone, and format; use [RAG](#rag) for changing facts. See
[RAG vs fine-tuning](./rag.md#rag-vs-fine-tuning).

## Foundation model {#foundation-model}

A large model trained on broad data that serves as a reusable base you adapt to many tasks (via prompting,
RAG, or fine-tuning) rather than training per task. LLMs are the best-known foundation models. See
[LLMs](./llm.md#foundation-models-rent-dont-build).

## Frontier model {#frontier-model}

The current capability ceiling -- the largest, most capable models (Claude, GPT, Gemini), usually
closed-source and accessed via API. See [Cloud vs Local Models](./cloud-vs-local.md).

## Function calling {#function-calling}

The developer's name for [tool use](#tool-use): you expose functions with a schema, and the model emits a
structured request to call one. Your code executes it. See [Agents](./agents.md#tool-use-function-calling).

## GPT (Generative Pre-trained Transformer) {#gpt}

A decoder-only transformer trained to generate text by next-token prediction; also OpenAI's product line.
The architecture pattern underlying most modern [LLMs](./llm.md).

## Groundedness {#groundedness}

An evaluation metric (also "faithfulness") for whether an answer stuck to its retrieved sources rather than
[hallucinating](./llm.md#hallucination). See [Evaluation and LLMOps](./evaluation-and-llmops.md).

## Guardrails {#guardrails}

Input/output policy enforcement around an LLM: content filtering, PII redaction, claim verification, and
refusal paths. One of the layered mitigations for [hallucination](#hallucination) and misuse.

## Hallucination {#hallucination}

Fluent, confident, wrong output -- fabricated facts, invented citations, made-up parameters. A structural
consequence of next-token prediction, contained (not eliminated) by RAG, tool use, evaluation, and
guardrails. See [LLMs](./llm.md#hallucination).

## Harness engineering {#harness-engineering}

Building the evaluation and execution scaffolding -- datasets, runner, judges, traces, CI gates -- that turns
a non-deterministic model into a testable, observable system. See
[Evaluation and LLMOps](./evaluation-and-llmops.md#harness-engineering).

## Hybrid retrieval {#hybrid-retrieval}

Combining dense (semantic) [embedding](#embedding) search with sparse keyword search (BM25) and fusing the
results. The highest-ROI fix for weak [RAG](./rag.md#production-levers-in-order-of-roi).

## Inference {#inference}

Running a trained model to produce output, as opposed to training it. The per-request cost and latency
layer of any LLM application. See [LLMs](./llm.md).

## Instruct / chat model {#instruct-model}

A [foundation model](#foundation-model) after [post-training](#post-training) -- the variant end users
actually talk to. See [LLMs](./llm.md#how-an-llm-is-built).

## Jailbreaking {#jailbreaking}

Crafting inputs that bypass an LLM's safety constraints to elicit forbidden output; closely related to prompt
injection. See [AI Safety & Guardrails](./safety.md#the-attack-surface-prompt-injection-and-jailbreaking).

## Just-in-time context {#just-in-time-context}

A retrieval strategy where an agent keeps lightweight references (paths, queries, links) and loads data on
demand via tools, instead of pre-loading everything via embeddings. See
[Context Engineering](./context-engineering.md#long-horizon-techniques).

## LLM (Large Language Model) {#llm}

A neural network trained on large text corpora to predict the next [token](#token); aligned via
post-training into a useful assistant. See [Large Language Models](./llm.md).

## LLM-as-judge {#llm-as-judge}

Using a second LLM to score an output against a rubric -- necessary for open-ended responses, but it must be
calibrated against human judgment. See [Evaluation and LLMOps](./evaluation-and-llmops.md).

## LLM-wiki pattern {#llm-wiki}

A knowledge-management pattern where an LLM incrementally builds and maintains a structured, interlinked
Markdown wiki between you and raw sources -- compiling synthesis once and keeping it current. See
[Knowledge Management](./knowledge-management.md).

## LLMOps {#llmops}

The operational discipline of running LLM apps and agents in production: prompt and model versioning,
evaluation, cost/latency optimization, monitoring, and incident response. See [Tooling](./tooling.md#llmops-tying-it-together).

## llms.txt {#llms-txt}

A proposed standard for a curated, LLM-readable Markdown overview of a website, published at `/llms.txt`. See
[Knowledge Management](./knowledge-management.md).

## LoRA (Low-Rank Adaptation) {#lora}

A parameter-efficient fine-tuning method that injects small trainable matrices into a frozen model, so you
adapt under 1% of the parameters. The basis of [QLoRA](#qlora). See [RAG vs fine-tuning](./rag.md#rag-vs-fine-tuning).

## MCP (Model Context Protocol) {#mcp}

An open standard from Anthropic -- the "USB-C for AI" -- that gives LLM apps a uniform way to discover and
invoke external tools and data, collapsing the N x M integration problem to N + M. See
[Agents](./agents.md#mcp-model-context-protocol).

## Memex {#memex}

Vannevar Bush's 1945 vision of a personal, curated knowledge store with associative trails -- the conceptual
ancestor of the [LLM-wiki pattern](#llm-wiki). See [Knowledge Management](./knowledge-management.md).

## MLOps {#mlops}

Machine Learning Operations -- DevOps applied to the full ML lifecycle (data, training, deployment,
monitoring). [LLMOps](#llmops) is its LLM-specific extension. See
[Evaluation and LLMOps](./evaluation-and-llmops.md#the-mlops-foundation-underneath).

## Multi-agent system {#multi-agent}

A system where several specialized agents coordinate (orchestrator-worker, router, hierarchical,
critic-refiner, network) to exceed a single agent's capability or context. See
[Agents](./agents.md#multi-agent-patterns).

## Open-weights model {#open-weights}

A model whose weights are downloadable (Llama, Mistral, Qwen, DeepSeek, Gemma, Phi), so it can be
self-hosted and fine-tuned. The basis for [local model usage](./cloud-vs-local.md#local-model-usage).

## Orchestrator-worker {#orchestrator-worker}

The most common [multi-agent](#multi-agent) pattern: a central manager decomposes a task and delegates
subtasks to specialist workers. The orchestrator layer is the main defense against error amplification.
See [Agents](./agents.md#multi-agent-patterns).

## Parameters {#parameters}

The learned weights of a model. Count (billions to trillions) correlates roughly with capability and cost.
See [LLMs](./llm.md).

## PEFT (Parameter-Efficient Fine-Tuning) {#peft}

The family of techniques (including [LoRA](#lora) and [QLoRA](#qlora)) that adapt a model by training a
small fraction of its parameters instead of all of them. See [RAG vs fine-tuning](./rag.md#rag-vs-fine-tuning).

## Post-training {#post-training}

The alignment stage that turns a [base model](#base-model) into a helpful assistant: supervised
fine-tuning plus preference optimization (RLHF / DPO). See [LLMs](./llm.md#how-an-llm-is-built).

## Pre-training {#pre-training}

The compute-dominant first stage: self-supervised next-token prediction on a web-scale corpus, producing a
fluent [base model](#base-model). See [LLMs](./llm.md#how-an-llm-is-built).

## Prompt engineering {#prompt-engineering}

Shaping model behavior by changing the input text -- instructions, examples, and formatting. The cheapest,
fastest adaptation lever before RAG or fine-tuning.

## Prompt injection {#prompt-injection}

An attack that disguises malicious instructions as normal input to override an LLM's original instructions;
the OWASP #1 LLM risk, including indirect injection via retrieved data. See
[AI Safety & Guardrails](./safety.md#the-attack-surface-prompt-injection-and-jailbreaking).

## Quantization {#quantization}

Replacing model weights with lower-precision approximations (e.g. 4-bit NF4) to cut memory use, with
minimal quality loss for most tasks. What lets large models fit on consumer GPUs. See
[Cloud vs Local Models](./cloud-vs-local.md#quantization-and-qlora).

## QLoRA {#qlora}

Quantize the base model to 4-bit, freeze it, and train [LoRA](#lora) adapters on top -- the standard recipe
for fine-tuning a moderate-size LLM on a single consumer GPU. See
[Cloud vs Local Models](./cloud-vs-local.md#quantization-and-qlora).

## RAG (Retrieval-Augmented Generation) {#rag}

Retrieving relevant information from an external source before generation and injecting it into the prompt,
so the model summarizes facts instead of recalling them. The primary defense against hallucination. See
[RAG](./rag.md).

## Red-teaming {#red-teaming}

Continuously and adversarially probing a system to discover new failure modes, complementing static
benchmarks. See [AI Safety & Guardrails](./safety.md#red-teaming).

## Reranking {#reranking}

Re-scoring the top retrieved candidates with a cross-encoder model to improve relevance -- often a bigger
quality win than swapping the [embedding](#embedding) model. See [RAG](./rag.md#production-levers-in-order-of-roi).

## Semantic search {#semantic-search}

Searching by meaning rather than keyword match, using [embeddings](#embedding) and similarity. The
capability that powers retrieval in [RAG](./rag.md).

## SPDD (REASONS Canvas) {#spdd}

Structured-Prompt-Driven Development -- a methodology treating prompts as versioned, reviewed delivery
artifacts, structured by the seven-part REASONS Canvas. See
[AI-Assisted Software Development](./ai-assisted-development.md#methodology-align-then-generate).

## Structured note-taking {#structured-note-taking}

An agent writing to a persistent store outside the context window and reading it back -- external memory that
conserves the attention budget. See [Context Engineering](./context-engineering.md#long-horizon-techniques).

## Sub-agent architecture {#sub-agent}

A lead agent delegating focused subtasks to sub-agents that explore in clean context windows and return
distilled summaries. See [Context Engineering](./context-engineering.md#long-horizon-techniques).

## Temperature {#temperature}

A sampling parameter controlling randomness during generation: 0 is deterministic, higher values produce
more varied output. See [LLMs](./llm.md#how-an-llm-produces-text).

## Token {#token}

The atomic unit a model reads and writes -- a learned subword, not a whole word. Text is split into tokens
before the model sees it. See [LLMs](./llm.md#how-an-llm-produces-text).

## Tool use {#tool-use}

Letting an LLM act in the outside world by requesting calls to functions you define; your code executes
them and returns the result. The mechanism that turns a text generator into an [agent](./agents.md). See
[Agents](./agents.md#tool-use-function-calling).

## Transformer {#transformer}

The neural-network architecture every modern LLM uses, built from stacked layers of self-attention and
feed-forward networks. See [LLMs](./llm.md).

## Vector database {#vector-database}

A database specialized for storing and searching high-dimensional [embeddings](#embedding) by similarity
(via [ANN](#ann)) rather than exact match. Examples: Pinecone, pgvector, OpenSearch, Weaviate, Milvus,
Chroma. See [RAG](./rag.md#vector-databases).

## Vector quantization {#vector-quantization}

Compressing embedding vectors (e.g. to `int8` or binary) to cut storage and speed up search; distinct from
model-weight [quantization](#quantization). For retrieval, unbiased similarity preservation matters more than
reconstruction accuracy. See [Embeddings Deep Dive](./embeddings.md#dimensions-matryoshka-and-quantization).

## Vertical slices {#vertical-slices}

Implementing a feature across all layers in one pass ("tracer bullets") rather than horizontally per layer,
forcing integration to work. See [AI-Assisted Software Development](./ai-assisted-development.md).

## vLLM {#vllm}

A high-throughput inference engine for serving [open-weights models](#open-weights) on GPUs in production.
See [Cloud vs Local Models](./cloud-vs-local.md#local-model-usage).

## See also

- [Large Language Models](./llm.md)
- [AI Agents](./agents.md)
- [RAG](./rag.md)
- [Embeddings Deep Dive](./embeddings.md)
- [Context & Prompt Engineering](./context-engineering.md)
- [Tooling and Frameworks](./tooling.md)
- [Evaluation and LLMOps](./evaluation-and-llmops.md)
- [AI Safety & Guardrails](./safety.md)
- [Knowledge Management with LLMs](./knowledge-management.md)
- [AI-Assisted Software Development](./ai-assisted-development.md)
- [Cloud vs Local Models](./cloud-vs-local.md)
