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

An open standard for communication and interoperability between independent AI agent systems. Google
introduced A2A, and the project is now governed under the Linux Foundation; agents use Agent Cards and
tasks to collaborate without sharing internal state, tools, or memory. See
[MCP and A2A in Production](./mcp-and-a2a-in-production.md).

## Agent {#agent}

An [LLM](./llm.md) autonomously using tools in a loop: the model decides what to do next, your code runs
the chosen tool, the result is fed back, and the loop repeats. See [AI Agents](./agents.md).

## Agent Card {#agent-card}

A JSON metadata document published by an A2A server that describes the agent's identity, endpoint,
capabilities, skills, and authentication requirements. Clients use it for discovery before sending work to
that agent. See [MCP and A2A in Production](./mcp-and-a2a-in-production.md).

## Agent harness {#agent-harness}

The runtime scaffolding around a model: prompts, tools, permissions, memory, retries, traces, and
evaluation hooks. A harness turns raw model calls into repeatable agent behavior. See
[Agent Harnesses](./agent-harnesses.md).

## Agent skill {#agent-skill}

A portable, version-controlled workflow package (`SKILL.md` plus optional scripts and references) that
teaches a coding agent how to perform a specific task. Loaded on demand when the agent matches the skill's
description to the current task, unlike always-on rules or project memory files. See [Agent Skills](./skills.md).

## Agentic AI {#agentic-ai}

The umbrella label for systems where an LLM plans, decides, and acts via tools rather than producing a
single output. The same territory as "agents", framed as an architectural property you can add
incrementally. See [AI Agents](./agents.md).

## AGENTS.md / CLAUDE.md / GEMINI.md {#agents-md-claude-md-gemini-md}

Repository instruction files that tell coding agents project conventions, commands, and guardrails. Keep
`AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` factual, current, and free of secrets. See
[Project Memory and Rules](./project-memory-and-rules.md).

## allowed-tools {#allowed-tools}

A policy or configuration allowlist for which tools an agent may call. It enforces least privilege and
reduces blast radius, but every allowed tool still needs validation and logging. See
[Agent Skills](./skills.md).

## ANN (Approximate Nearest Neighbor) {#ann}

The efficiency primitive behind [vector databases](#vector-database): instead of comparing a query against
every stored vector, an ANN algorithm checks a carefully selected subset, trading a little accuracy for a
large speedup. See [RAG](./rag.md#vector-databases).

## Attention {#attention}

The core operation inside transformer layers. In decoder-only LLMs, each token computes how much to "attend
to" previous tokens in the [context window](#context-window), letting the model relate words across a
sequence.

## Autoregressive {#autoregressive}

A generation pattern where each output token is predicted from the tokens that came before it. Most chat
LLMs are decoder-only autoregressive transformers, so early mistakes can influence later tokens. See
[LLMs](./llm.md).

## Base model {#base-model}

A [foundation model](#foundation-model) before instruction [post-training](#post-training) - fluent but not
yet a helpful assistant. See
[LLMs](./llm.md#how-an-llm-is-built).

## Batch API {#batch-api}

A provider API for submitting many model requests to run asynchronously as a bulk job. It is useful when
each item does not need an immediate response, such as evaluations, embeddings, or offline classification.
See [Cost, Latency & Model Routing](./cost-and-latency.md).

## BCD (MDN Browser Compatibility Data) {#bcd}

Machine-readable browser and JavaScript runtime compatibility data maintained by MDN. Web tooling and
agents use BCD to check whether APIs, CSS, HTML, and other web features work across browsers. See
[MDN MCP Server](./mdn-mcp-server.md).

## Bi-encoder {#bi-encoder}

A retrieval architecture that encodes the query and each candidate separately into vectors, then compares
those vectors. It is fast enough for large indexes but less precise than a cross-encoder on subtle
relevance. See [Embeddings Deep Dive](./embeddings.md).

## BM25 {#bm25}

A strong keyword-search ranking algorithm based on term frequency, inverse document frequency, and document
length. It is still a baseline for RAG because exact words, IDs, and error strings often beat semantic
similarity alone. See [RAG](./rag.md).

## Chain-of-thought {#chain-of-thought}

Prompting or training a model to reason step by step in tokens before answering, trading latency for
accuracy on multi-step problems. See [LLMs](./llm.md#what-llms-are-good-at).

## Chunking {#chunking}

Splitting source documents into retrieval units, often with overlap or structure-aware boundaries. Bad
chunks cause missing context, duplicates, and lost-in-the-middle failures, so tune chunking with retrieval
evals. See [RAG](./rag.md).

## Constrained decoding / grammars (GBNF) {#constrained-decoding-grammars}

Restricting the model's next-token choices so the output must match a schema or grammar; GBNF is the
grammar format used by `llama.cpp`. This is more reliable than prompting alone for JSON or DSL output, but
you should still validate results. See [Structured Outputs](./structured-outputs.md).

## Context compaction {#context-compaction}

Summarizing a conversation that is nearing the context-window limit and reinitializing a fresh window with
the summary - the first lever for long-horizon coherence. See
[Context Engineering](./context-engineering.md#long-horizon-techniques).

## Context engineering {#context-engineering}

The discipline of curating what goes into the [context window](#context-window) across many turns --
compaction, structured notes, retrieval, and sub-agents. The agentic-era successor to prompt engineering.

## Context rot {#context-rot}

The empirical degradation of an LLM's recall as the context window fills - "lost in the middle". Larger
windows help with capacity but do not, by themselves, guarantee reliable use of every token. See
[Context Engineering](./context-engineering.md#context-rot-the-constraint-behind-the-techniques).

## Context window {#context-window}

The maximum number of [tokens](#token) a model can attend to at once (today: thousands to millions). All
input, retrieved context, and generated output must fit inside it. See [LLMs](./llm.md).

## Continuous batching {#continuous-batching}

An LLM serving scheduler that adds and removes requests from a GPU batch as sequences start and finish. It
keeps accelerators busy and improves throughput while still allowing streaming responses. See
[LLM Serving](./llm-serving.md).

## Cosine similarity {#cosine-similarity}

A common metric for comparing [embeddings](#embedding): the cosine of the angle between two vectors,
measuring similarity by vector direction rather than raw magnitude. See [RAG](./rag.md).

## Cross-encoder / reranker {#cross-encoder-reranker}

A model that reads the query and a candidate passage together, then outputs a relevance score. It is slower
than bi-encoder retrieval, so production RAG usually applies it only to the top candidates. See
[RAG](./rag.md).

## Data residency {#data-residency}

A requirement or guarantee about the country or region where data is stored and processed. For AI systems,
check logs, backups, subprocessors, support access, and model-processing locations, not only the endpoint
URL. See [Privacy and Data](./privacy-and-data.md).

## Deep modules {#deep-modules}

Modules with simple interfaces that hide significant internal complexity (Ousterhout). AI agents work best
inside such clear boundaries, because the interface is the contract. See
[AI-Assisted Software Development](./ai-assisted-development.md).

## Direct vs indirect prompt injection {#direct-vs-indirect-prompt-injection}

Direct prompt injection comes from a user message aimed at the model; indirect prompt injection comes from
untrusted content the agent reads, such as web pages, email, issues, or documents. Indirect attacks are
especially risky when the agent also has private data and external communication tools. See
[AI Safety & Guardrails](./safety.md).

## Distillation {#distillation}

Training a smaller or cheaper student model to imitate a larger teacher model's outputs or behavior. It
can reduce cost and latency, but the distilled model still needs task-specific evaluation and may inherit
teacher mistakes. See [Fine-Tuning](./fine-tuning.md).

## DPA (Data Processing Agreement) {#dpa}

A contract that defines how a processor handles personal data for a controller. For AI vendors, a DPA
should cover subprocessors, retention, transfers, security measures, deletion, and audit rights. See
[AI Regulation](./ai-regulation.md).

## DPO (Direct Preference Optimization) {#dpo}

A preference-training method that uses chosen/rejected response pairs to optimize behavior without training
a separate reward model. It is a simpler alternative to RLHF for many post-training workflows. See
[Fine-Tuning](./fine-tuning.md).

## Embedding {#embedding}

A dense numeric vector (typically 384--4096 dimensions) representing text, an image, or audio, chosen so
that semantically similar inputs land close together in vector space. The layer [RAG](./rag.md#embeddings-the-layer-rag-depends-on)
depends on.

## EU AI Act {#eu-ai-act}

The European Union's risk-based regulation for AI. It places different obligations on prohibited practices,
high-risk systems, transparency cases, and general-purpose AI models, so classify your role and use case
before launch. See [AI Regulation](./ai-regulation.md).

## FAISS (Facebook AI Similarity Search) {#faiss}

An open-source library from Meta for efficient similarity search over dense vectors. It supports exact
search and ANN indexes such as IVF, HNSW, and product quantization, so it is common in local RAG prototypes
and benchmarks. See [Embeddings Deep Dive](./embeddings.md).

## Fallback chain {#fallback-chain}

Trying a cheaper or faster [model](./llm.md) first and escalating to a higher tier only when validation fails,
confidence is low, or the user requests it. See [Cost, Latency & Model Routing](./cost-and-latency.md).

## Few-shot prompting {#few-shot-prompting}

Putting a few input/output examples in the prompt so the model infers the desired pattern. It is a
practical form of in-context learning, but examples consume context and must match production cases. See
[Context Engineering](./context-engineering.md).

## Fine-tuning {#fine-tuning}

Continued training of a pretrained model on task- or domain-specific data, baking behavior into the
weights. It is best for stable skills, tone, or formats; use RAG or tools for facts that change. See
[Fine-Tuning](./fine-tuning.md).

## Foundation model {#foundation-model}

A large model trained on broad data that serves as a reusable base you adapt to many tasks (via prompting,
RAG, or fine-tuning) rather than training per task. LLMs are the best-known foundation models. See
[LLMs](./llm.md#foundation-models-rent-dont-build).

## Frontier model {#frontier-model}

The current capability ceiling - the largest, most capable models (Claude, GPT, Gemini), usually
closed-weight and accessed via API. See [Cloud vs Local Models](./cloud-vs-local.md).

## Function calling {#function-calling}

The developer's name for [tool use](#tool-use): you expose functions with a schema, and the model emits a
structured request to call one. Your code executes it. See [Agents](./agents.md#tool-use-function-calling).

## GEO (Generative Engine Optimization) {#geo}

Making web content easy for AI answer engines and agents to understand, cite, and route to. The durable
version is accurate structure, clear sourcing, helpful summaries, and machine-readable entry points, not
gaming a model. See [AI Search and llms.txt](./ai-search-and-llms-txt.md).

## GGUF {#gguf}

A binary model file format for GGML and `llama.cpp`-compatible inference. It packages tensors and metadata
in one extensible, mmap-friendly file, often with quantized weights for local serving. See
[Local LLM Apps](./local-llm-app.md).

## Golden dataset {#golden-dataset}

A small, versioned set of representative inputs plus expected outputs or judgments. Use it to catch
regressions, calibrate judges, and compare prompts or models without mixing it into training data. See
[Eval Datasets and Synthetic Data](./eval-datasets-and-synthetic-data.md).

## GPT (Generative Pre-trained Transformer) {#gpt}

A decoder-only transformer trained to generate text by next-token prediction; also OpenAI's product line.
The architecture pattern underlying most modern [LLMs](./llm.md).

## Graceful degradation {#graceful-degradation}

Designing a product so core functionality still works when an [LLM](./llm.md) API fails, is disabled, or
returns low-quality output - manual mode, cached answers, or queued retry instead of a broken UX. See
[AI in Products](./ai-in-products.md).

## Greedy decoding {#greedy-decoding}

Choosing the highest-probability next token at every generation step. It is deterministic and simple, but
can get stuck in bland or locally optimal output. See [LLMs](./llm.md).

## Groundedness {#groundedness}

An evaluation metric (also "faithfulness") for whether an answer stuck to its retrieved sources rather than
[hallucinating](./llm.md#hallucination). See [Evaluation and LLMOps](./evaluation-and-llmops.md).

## Guardrails {#guardrails}

Input/output policy enforcement around an LLM: content filtering, PII redaction, claim verification, and
refusal paths. One of the layered mitigations for [hallucination](#hallucination) and misuse.

## halfvec (pgvector) {#halfvec}

A pgvector type that stores half-precision vector values instead of full 32-bit floats. It reduces storage
and can allow more dimensions per vector, with an accuracy trade-off you should measure. See
[Embeddings Deep Dive](./embeddings.md).

## Hallucination {#hallucination}

Fluent, confident, wrong output - fabricated facts, invented citations, made-up parameters. A structural
consequence of next-token prediction, contained (not eliminated) by RAG, tool use, evaluation, and
guardrails. See [LLMs](./llm.md#hallucination).

## Harness engineering {#harness-engineering}

Building the evaluation and execution scaffolding - datasets, runner, judges, traces, CI gates - that turns
a non-deterministic model into a testable, observable system. See
[Evaluation and LLMOps](./evaluation-and-llmops.md#harness-engineering).

## HNSW (Hierarchical Navigable Small World) {#hnsw}

A graph-based ANN index that searches through layered neighbor links to find close vectors quickly. It
often gives strong recall-speed trade-offs but uses more memory than simpler index types. See
[Embeddings Deep Dive](./embeddings.md).

## Human-in-the-loop {#human-in-the-loop}

Requiring human approval, review, or escalation before an [agent](./agents.md) or LLM feature takes
high-impact or irreversible action. Includes maker-checker and audit trails. See
[Human-in-the-Loop](./human-in-the-loop.md).

## Hybrid retrieval {#hybrid-retrieval}

Combining dense embedding search with sparse keyword search such as BM25 or SPLADE, then merging the
ranked lists, often with RRF. It is one of the highest-ROI fixes for weak RAG because exact terms and
semantic matches cover different failures. See [RAG](./rag.md).

## In-context learning {#in-context-learning}

A model adapting its behavior from instructions and examples inside the prompt, without updating weights.
Few-shot prompting is the everyday engineering version of this effect. See
[Context Engineering](./context-engineering.md).

## Inference {#inference}

Running a trained model to produce output, as opposed to training it. The per-request cost and latency
layer of any LLM application. See [LLMs](./llm.md).

## Instruct / chat model {#instruct-model}

A [foundation model](#foundation-model) after [post-training](#post-training) - the variant end users
actually talk to. See [LLMs](./llm.md#how-an-llm-is-built).

## IVF (Inverted File index) {#ivf}

A vector index that clusters embeddings into lists and searches only selected nearby lists for each query.
It speeds retrieval by scanning fewer vectors, trading some recall for lower latency and memory pressure.
See [Embeddings Deep Dive](./embeddings.md).

## Jailbreaking {#jailbreaking}

Crafting inputs that bypass an LLM's safety constraints to elicit forbidden output; closely related to prompt
injection. See [AI Safety & Guardrails](./safety.md#the-attack-surface-prompt-injection-and-jailbreaking).

## JSON mode {#json-mode}

An API mode that asks the model to produce syntactically valid JSON. It usually does not enforce your full
schema, so use JSON Schema or constrained decoding when keys, types, and enums matter. See
[Structured Outputs](./structured-outputs.md).

## JSON Schema {#json-schema}

A declarative language for describing and validating the structure and constraints of JSON data. LLM APIs
use it for structured outputs and tool arguments because it is machine-checkable. See
[Structured Outputs](./structured-outputs.md).

## Just-in-time context {#just-in-time-context}

A retrieval strategy where an agent keeps lightweight references (paths, queries, links) and loads data on
demand via tools, instead of pre-loading everything via embeddings. See
[Context Engineering](./context-engineering.md#long-horizon-techniques).

## KV cache {#kv-cache}

The stored attention keys and values for tokens the model has already processed. It avoids recomputing the
prompt during decoding, but it can dominate memory use for long contexts and many concurrent users. See
[LLM Serving](./llm-serving.md).

## Lethal trifecta {#lethal-trifecta}

The dangerous combination of private data access, untrusted content, and external communication in one
agent. If all three are present, indirect prompt injection can become data exfiltration, so break at least
one leg. See [AI Safety & Guardrails](./safety.md).

## Llama Guard {#llama-guard}

Meta's LLM-based safeguard model family for classifying prompts and responses against safety taxonomies.
Treat it as one moderation layer, not a complete security boundary. See [AI Safety & Guardrails](./safety.md).

## llama.cpp {#llama-cpp}

A C/C++ inference project built on GGML for running LLMs and VLMs locally or as a server across CPUs and
GPUs. It popularized GGUF files and grammar-constrained local generation. See
[Local LLM Apps](./local-llm-app.md).

## LLM (Large Language Model) {#llm}

A neural network trained on large text corpora to predict the next [token](#token); aligned via
post-training into a useful assistant. See [Large Language Models](./llm.md).

## LLM-as-judge {#llm-as-judge}

Using an LLM-as-a-judge to score another model's output against a rubric. It is useful for open-ended
responses, but calibrate it against human labels, track judge drift, and keep adversarial examples in the
eval set. See [Evaluation and LLMOps](./evaluation-and-llmops.md).

## LLMOps {#llmops}

The operational discipline of running LLM apps and agents in production: prompt and model versioning,
evaluation, cost/latency optimization, monitoring, and incident response. See [Tooling](./tooling.md#llmops-tying-it-together).

## llms.txt {#llms-txt}

A proposed Markdown file, usually at `/llms.txt`, that gives agents a concise overview of a site and links
to LLM-friendly detail pages. It complements search and sitemaps; it is not an access-control mechanism.
See [AI Search and llms.txt](./ai-search-and-llms-txt.md).

## LLM-wiki pattern {#llm-wiki}

A knowledge-management pattern where an LLM incrementally builds and maintains a structured, interlinked
Markdown wiki between you and raw sources - compiling synthesis once and keeping it current. See
[Knowledge Management](./knowledge-management.md).

## LM Studio {#lm-studio}

A desktop application and local runtime for downloading, chatting with, and serving open models on a
developer machine. It uses local backends such as MLX and `llama.cpp` and can expose local models through
developer-facing APIs. See [Local LLM Apps](./local-llm-app.md).

## Logits {#logits}

The raw model scores for each possible next token before softmax turns them into probabilities.
Temperature, sampling filters, and grammar masks operate on or around logits before a token is chosen. See
[LLMs](./llm.md).

## LoRA (Low-Rank Adaptation) {#lora}

A parameter-efficient fine-tuning method that freezes the base model and trains small low-rank adapter
matrices. It is cheap to store, can be merged or loaded dynamically, and is the basis for QLoRA. See
[Fine-Tuning](./fine-tuning.md).

## Lost-in-the-middle {#lost-in-the-middle}

A long-context failure mode where models use information near the beginning and end of the prompt better
than information in the middle. Mitigate it with retrieval, ordering, summaries, smaller chunks, and
task-specific evals. See [Context Engineering](./context-engineering.md).

## Matryoshka embeddings (MRL) {#matryoshka-embeddings}

Embeddings trained so shorter prefixes of the vector remain useful, like nested dolls. This lets you
truncate vectors at query or index time to trade retrieval quality for storage and speed. See
[Embeddings Deep Dive](./embeddings.md).

## MCP (Model Context Protocol) {#mcp}

An open standard from Anthropic - the "USB-C for AI" - that gives LLM apps a uniform way to discover and
invoke external tools and data, collapsing the N x M integration problem to N + M. See
[Agents](./agents.md#mcp-model-context-protocol).

## Memex {#memex}

Vannevar Bush's 1945 vision of a personal, curated knowledge store with associative trails - the conceptual
ancestor of the [LLM-wiki pattern](#llm-wiki). See [Knowledge Management](./knowledge-management.md).

## Mid-training {#mid-training}

A training stage between broad pre-training and final instruction/alignment post-training. It often uses
curated domain data, code, math, or long-context mixtures to shape capabilities before SFT or preference
tuning. See [LLMs](./llm.md).

## MLOps {#mlops}

Machine Learning Operations - DevOps applied to the full ML lifecycle (data, training, deployment,
monitoring). [LLMOps](#llmops) is its LLM-specific extension. See
[Evaluation and LLMOps](./evaluation-and-llmops.md#the-mlops-foundation-underneath).

## MLX {#mlx}

Apple's NumPy-like machine learning framework for efficient work on Apple silicon. Its unified memory model
lets CPU and GPU share arrays, which matters for local LLM performance on Macs. See
[Local LLM Apps](./local-llm-app.md).

## Model routing {#model-routing}

Sending each request to an appropriate model tier (frontier, mid, small/local) via classifiers, fallback
chains, or task-specific rules to balance quality, [cost, and latency](./cost-and-latency.md). See
[Model Selection](./model-selection.md).

## MoE (Mixture of Experts) {#moe}

A model architecture where a router activates only some expert layers for each token. MoE can increase
total parameter count without using every parameter on every token, but serving and load balancing become
more complex. See [LLMs](./llm.md).

## MRR (Mean Reciprocal Rank) {#mrr}

A ranking metric that averages `1 / rank` for the first relevant result. It rewards systems that put at
least one correct answer very near the top. See [Evaluation and LLMOps](./evaluation-and-llmops.md).

## MTEB (Massive Text Embedding Benchmark) {#mteb}

A benchmark suite and leaderboard for comparing embedding models across retrieval, classification,
clustering, reranking, and related tasks. Use it as a starting signal, then run your own domain evals. See
[Embeddings Deep Dive](./embeddings.md).

## Multi-agent system {#multi-agent}

A system where several specialized agents coordinate (orchestrator-worker, router, hierarchical,
critic-refiner, network) to exceed a single agent's capability or context. See
[Agents](./agents.md#multi-agent-patterns).

## Multimodal {#multimodal}

A model or application that can process more than text, such as images, audio, video, or documents.
Multimodal features expand usefulness but also change validation, latency, cost, and safety risks. See
[Multimodal and Voice](./multimodal-and-voice.md).

## nDCG (Normalized Discounted Cumulative Gain) {#ndcg}

A ranking metric that rewards relevant results near the top and supports graded relevance levels. It is
useful for RAG and search evals where some passages are better than others. See
[Evaluation and LLMOps](./evaluation-and-llmops.md).

## NDJSON (Newline-Delimited JSON) {#ndjson}

A streaming and file format where each line is one complete JSON value encoded as UTF-8. It is common for
logs, batch input files, and incremental data pipelines because readers can process line by line.

## NIST AI RMF (AI Risk Management Framework) {#nist-ai-rmf}

A voluntary NIST framework for managing AI risks to individuals, organizations, and society. It gives teams
a common vocabulary for mapping, measuring, managing, and governing AI risk. See
[AI Regulation](./ai-regulation.md).

## Ollama {#ollama}

A tool and service for running, managing, and serving open models locally or through hosted integrations.
It gives developers a simple model library, CLI, and local API for LLM workflows. See
[Local LLM Apps](./local-llm-app.md).

## OpenAI-compatible API {#openai-compatible-api}

An HTTP API surface that imitates OpenAI endpoints and schemas so clients can swap model backends with less
code. Compatibility is always partial in practice, so test streaming, tool calls, structured outputs, auth,
and errors. See [LLM Serving](./llm-serving.md).

## OpenTelemetry GenAI semantic conventions {#opentelemetry-genai-semantic-conventions}

OpenTelemetry naming conventions for traces, metrics, and events around generative AI systems. They
standardize telemetry for model calls, token counts, tools, MCP, and provider-specific behavior across
observability backends. See [Evaluation and LLMOps](./evaluation-and-llmops.md).

## Open-weights model {#open-weights}

A model whose weights are downloadable (Llama, Mistral, Qwen, DeepSeek, Gemma, Phi), so it can often be
self-hosted; fine-tuning and redistribution depend on the license. The basis for
[local model usage](./cloud-vs-local.md#local-model-usage).

## Orchestrator-worker {#orchestrator-worker}

The most common [multi-agent](#multi-agent) pattern: a central manager decomposes a task and delegates
subtasks to specialist workers. The orchestrator layer is the main defense against error amplification.
See [Agents](./agents.md#multi-agent-patterns).

## OWASP Top 10 for LLM Applications {#owasp-top-10-for-llm-applications}

A community-maintained list of common security risks in LLM applications, now part of the OWASP GenAI
Security Project. Use it as a threat-modeling checklist, not as proof that a system is secure. See
[AI Safety & Guardrails](./safety.md).

## PagedAttention {#pagedattention}

A vLLM serving technique that stores the KV cache in page-like blocks instead of requiring one contiguous
allocation per sequence. It reduces memory fragmentation and helps serve more concurrent requests. See
[LLM Serving](./llm-serving.md).

## Parameters {#parameters}

The learned weights of a model. Count (billions to trillions) correlates roughly with capability and cost.
See [LLMs](./llm.md).

## PEFT (Parameter-Efficient Fine-Tuning) {#peft}

The family of techniques (including [LoRA](#lora) and [QLoRA](#qlora)) that adapt a model by training a
small fraction of its parameters instead of all of them. See [Fine-Tuning](./fine-tuning.md).

## PII (Personally Identifiable Information) {#pii}

Data that identifies or can reasonably identify a person, such as names, emails, account IDs, precise
location, or combinations of attributes. Minimize, redact, encrypt, and contractually control PII before
sending it to model providers. See [Privacy and Data](./privacy-and-data.md).

## Post-training {#post-training}

The alignment stage that turns a [base model](#base-model) into a helpful assistant: supervised
fine-tuning plus preference optimization (RLHF / DPO). See [LLMs](./llm.md#how-an-llm-is-built).

## Prefill {#prefill}

The prompt-processing phase where the model ingests input tokens and builds the KV cache before generating
output. Long prompts make prefill slow and expensive; prefix caching and chunked prefill can help. See
[LLM Serving](./llm-serving.md).

## Pre-training {#pre-training}

The compute-dominant first stage: self-supervised next-token prediction on a web-scale corpus, producing a
fluent [base model](#base-model). See [LLMs](./llm.md#how-an-llm-is-built).

## Product quantization (PQ) {#product-quantization}

A vector-compression method that splits vectors into subvectors and quantizes each part separately. ANN
indexes use PQ to reduce memory and speed approximate distance estimates, with recall trade-offs to
measure. See [Embeddings Deep Dive](./embeddings.md).

## Prompt caching {#prompt-caching}

Reusing repeated prefix tokens or their KV cache across requests so the system avoids reprocessing
identical context. Provider prompt caching may reduce billing, while server-side prefix caching mainly
reduces latency and GPU work. See [Cost, Latency & Model Routing](./cost-and-latency.md).

## Prompt engineering {#prompt-engineering}

Shaping model behavior by changing the input text - instructions, examples, and formatting. The cheapest,
fastest adaptation lever before RAG or fine-tuning. See [Context Engineering](./context-engineering.md).

## Prompt Guard {#prompt-guard}

Meta's classifier model for detecting prompt injection and jailbreak-style inputs. It can help triage risky
content, but it should be layered with tool permissions, isolation, and output controls. See
[AI Safety & Guardrails](./safety.md).

## Prompt injection {#prompt-injection}

An attack that disguises malicious instructions as normal input to override an LLM application's intended
instructions. It can be direct from a user or indirect through retrieved content, and OWASP lists it as a
leading LLM application risk. See [AI Safety & Guardrails](./safety.md).

## QLoRA {#qlora}

A fine-tuning recipe that quantizes the frozen base model, commonly to 4-bit, and trains LoRA adapters on
top. It makes adapter training possible on smaller GPUs, but quality still depends on data and evaluation.
See [Fine-Tuning](./fine-tuning.md).

## Quantization {#quantization}

Replacing model weights with lower-precision approximations (e.g. 4-bit NF4) to cut memory use, usually
with a quality/latency trade-off that must be measured on the target task. What lets large models fit on
consumer GPUs. See [Cloud vs Local Models](./cloud-vs-local.md#quantization-and-qlora).

## RAG (Retrieval-Augmented Generation) {#rag}

Retrieving relevant information from an external source before generation and injecting it into the prompt,
so the model can ground its answer in supplied facts instead of relying only on weights. A primary mitigation
for factual hallucinations, but not a complete guarantee. See
[RAG](./rag.md).

## Rate limit {#rate-limit}

A provider or service constraint on requests, tokens, or concurrency over time. Production systems need
queues, retries with backoff, budgets, and fallbacks instead of treating rate-limit errors as random
failures. See [Cost, Latency & Model Routing](./cost-and-latency.md).

## Reasoning model {#reasoning-model}

A model trained or served to spend extra inference compute on multi-step tasks before answering. Evaluate
final answers, latency, and cost rather than trusting visible reasoning text as proof of correctness. See
[LLMs](./llm.md).

## Reasoning tokens / test-time compute {#reasoning-tokens-test-time-compute}

Extra inference tokens or compute a model spends while solving a problem before producing the final answer.
More test-time compute can improve hard-task accuracy, but it raises latency and cost and may be hidden
from the user-visible output. See [Cost, Latency & Model Routing](./cost-and-latency.md).

## Recall@k {#recall-at-k}

The fraction of queries where at least one relevant item appears in the top `k` results. In RAG, low
recall@k means the generator never sees the needed fact, no matter how good the model is. See
[RAG](./rag.md).

## Red-teaming {#red-teaming}

Continuously and adversarially probing a system to discover new failure modes, complementing static
benchmarks. See [AI Safety & Guardrails](./safety.md#red-teaming).

## Reranking {#reranking}

Re-scoring the top retrieved candidates, often with a cross-encoder, to improve relevance before
generation. It is usually more expensive than first-stage retrieval but can be a larger quality win than
changing the embedding model. See [RAG](./rag.md).

## RLHF (Reinforcement Learning from Human Feedback) {#rlhf}

A post-training method that learns preferences from human comparisons and optimizes model behavior against
a reward model. It helped make base models more useful assistants, but it is not a factuality guarantee.
See [Fine-Tuning](./fine-tuning.md).

## RRF (Reciprocal Rank Fusion) {#rrf}

A simple rank-fusion method that combines multiple ranked result lists by summing reciprocal ranks. It is
popular for hybrid search because it can merge BM25 and vector results without calibrating raw scores. See
[RAG](./rag.md).

## Semantic cache {#semantic-cache}

Caching [LLM](./llm.md) responses keyed by embedding similarity of the query - returning a stored answer when
a new question is close enough to a prior one. Requires TTL and invalidation when source data changes. See
[Cost, Latency & Model Routing](./cost-and-latency.md#caching-strategies).

## Semantic search {#semantic-search}

Searching by meaning rather than keyword match, using [embeddings](#embedding) and similarity. The
capability that powers retrieval in [RAG](./rag.md).

## SFT (Supervised Fine-Tuning) {#sft}

Continued training on input/output examples to teach a model a task, format, or style. It is usually the
first post-training step before preference optimization such as DPO or RLHF. See
[Fine-Tuning](./fine-tuning.md).

## ShieldGemma {#shieldgemma}

Google's Gemma-family safety classifier models for checking content against policy categories; ShieldGemma
2 focuses on image safety. Use them with explicit policy, logging, and human escalation for high-risk
cases. See [AI Safety & Guardrails](./safety.md).

## SPDD (REASONS Canvas) {#spdd}

Structured-Prompt-Driven Development - a methodology treating prompts as versioned, reviewed delivery
artifacts, structured by the seven-part REASONS Canvas. See
[AI-Assisted Software Development](./ai-assisted-development.md#methodology-align-then-generate).

## Speculative decoding {#speculative-decoding}

A serving optimization where a fast draft model proposes tokens and a larger model verifies them. When
proposals are accepted, users get lower latency without changing the final distribution in exact
implementations. See [LLM Serving](./llm-serving.md).

## Speech-to-speech {#speech-to-speech}

A voice AI flow that maps spoken input to spoken output, either through text stages or native audio models.
It adds latency, interruption handling, voice safety, consent, and privacy concerns beyond text chat. See
[Multimodal and Voice](./multimodal-and-voice.md).

## SPLADE {#splade}

A neural sparse retrieval method that expands text into weighted vocabulary terms. It keeps inverted-index
style search while capturing semantic signals beyond exact keyword overlap. See [RAG](./rag.md).

## SSE (Server-Sent Events) {#sse}

A web standard for one-way server-to-client event streams over HTTP using the `text/event-stream` media
type. LLM APIs often use SSE to stream generated tokens or events. See [LLM Serving](./llm-serving.md).

## Streamable HTTP {#streamable-http}

The MCP transport that uses a single HTTP endpoint for POST and GET JSON-RPC messages, optionally
streaming server messages with SSE. It replaced the older MCP HTTP+SSE transport in newer MCP protocol
versions. See [MCP and A2A in Production](./mcp-and-a2a-in-production.md).

## Structured note-taking {#structured-note-taking}

An agent writing to a persistent store outside the context window and reading it back - external memory that
conserves the attention budget. See [Context Engineering](./context-engineering.md#long-horizon-techniques).

## Structured output {#structured-output}

Constraining an [LLM](./llm.md) response to a machine-parseable schema (JSON Schema, tool arguments) with
validation and repair loops. See [Structured Outputs](./structured-outputs.md).

## Sub-agent architecture {#sub-agent}

A lead agent delegating focused subtasks to sub-agents that explore in clean context windows and return
distilled summaries. See [Context Engineering](./context-engineering.md#long-horizon-techniques).

## Synthetic data {#synthetic-data}

Data generated by models, simulations, or transformations rather than directly observed from production.
It can improve coverage and bootstrapping, but mark provenance and validate against real-world
distributions. See [Eval Datasets and Synthetic Data](./eval-datasets-and-synthetic-data.md).

## System prompt {#system-prompt}

Top-level developer or operator instructions that set model behavior, role, policy, and tool rules before
user content. Treat it as behavior configuration, not a secret or a security boundary. See
[Context Engineering](./context-engineering.md).

## Temperature {#temperature}

A sampling parameter controlling randomness during generation: lower values make the model choose
high-probability tokens more often; higher values produce more varied output. See
[LLMs](./llm.md#how-an-llm-produces-text).

## Throughput {#throughput}

How much work a serving system completes per time, often measured in tokens per second or requests per
second. Batching and efficient KV-cache management can improve throughput, sometimes at the cost of
per-request latency. See [LLM Serving](./llm-serving.md).

## Token {#token}

The atomic unit a model reads and writes - a learned subword, not a whole word. Text is split into tokens
before the model sees it. See [LLMs](./llm.md#how-an-llm-produces-text).

## Tokenizer {#tokenizer}

The model-specific vocabulary and algorithm that splits text into tokens and maps them to numeric IDs.
Tokenization affects context length, cost, latency, and even whether a string is easy for the model to
copy exactly. See [LLMs](./llm.md).

## Tool poisoning {#tool-poisoning}

An attack where a tool description, schema, output, package, or connector is manipulated so an agent uses
it unsafely. Pin trusted tools, review tool metadata, scope permissions, and treat tool output as untrusted
input. See [AI Safety & Guardrails](./safety.md).

## Tool use {#tool-use}

Letting an LLM act in the outside world by requesting calls to functions you define; your code executes
them and returns the result. The mechanism that turns a text generator into an [agent](./agents.md). See
[Agents](./agents.md#tool-use-function-calling).

## Top-k / top-p / min-p sampling {#top-k-top-p-min-p-sampling}

Sampling filters that limit candidate next tokens: top-k keeps the `k` highest-probability tokens, top-p
or nucleus sampling keeps the smallest set above cumulative probability `p`, and min-p keeps tokens above
a probability floor relative to the top token. They shape diversity after logits and temperature. See
[LLMs](./llm.md).

## TPOT / ITL (Time Per Output Token / Inter-Token Latency) {#tpot-itl}

The delay between streamed output tokens after the first token arrives. It determines how fast a response
appears to type and is driven mostly by decode speed, batching, and hardware. See
[LLM Serving](./llm-serving.md).

## Transformer {#transformer}

The neural-network architecture most modern LLMs use, built from stacked layers of self-attention and
feed-forward networks. See [LLMs](./llm.md).

## TTFT (Time to First Token) {#ttft}

The latency from request start until the first output token is available. Queueing, routing, network time,
and prefill all contribute, so optimize it separately from total response time. See
[LLM Serving](./llm-serving.md).

## VAD (Voice Activity Detection) {#vad}

Detecting when speech starts and stops in an audio stream. Voice agents use VAD for turn-taking, barge-in,
recording limits, and latency control. See [Multimodal and Voice](./multimodal-and-voice.md).

## Vector database {#vector-database}

A database, extension, or search engine that stores and searches high-dimensional [embeddings](#embedding)
by similarity (often via [ANN](#ann)) rather than exact match. Examples: Pinecone, pgvector, OpenSearch,
Weaviate, Milvus, Chroma. See [RAG](./rag.md#vector-databases).

## Vector quantization {#vector-quantization}

Compressing stored embedding vectors (for example with scalar, binary, or product quantization) to cut
storage and speed up search; distinct from model-weight [quantization](#quantization). For retrieval,
unbiased similarity preservation matters more than reconstruction accuracy. See
[Embeddings Deep Dive](./embeddings.md#dimensions-matryoshka-and-quantization).

## Vertical slices {#vertical-slices}

Implementing a feature across all layers in one pass ("tracer bullets") rather than horizontally per layer,
forcing integration to work. See [AI-Assisted Software Development](./ai-assisted-development.md).

## vLLM {#vllm}

A high-throughput inference and serving engine for open models, known for PagedAttention, continuous
batching, prefix caching, and an OpenAI-compatible server. It targets production GPU serving rather than
desktop chat alone. See [LLM Serving](./llm-serving.md).

## VLM (Vision-Language Model) {#vlm}

A multimodal model that connects images or video frames with text. VLMs power captioning, visual question
answering, screenshot understanding, and document-image analysis. See
[Multimodal and Voice](./multimodal-and-voice.md).

## VRAM / unified memory {#vram-unified-memory}

VRAM is GPU memory used for model weights, activations, and KV cache; unified memory lets CPU and GPU share
one memory pool, notably on Apple silicon. Capacity determines which local models and context lengths fit
before offload or slowdown. See [Local LLM Apps](./local-llm-app.md).

## Zero data retention {#zero-data-retention}

A vendor data-control mode where customer content is not retained for logs or application state, subject to
endpoint and contract limitations. Verify eligibility, exclusions, metadata handling, and whether abuse
monitoring or private safety processing still applies. See [Privacy and Data](./privacy-and-data.md).

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
