---
title: Prompt Engineering Basics
description: How to write prompts that give language models clear instructions, context, examples, output contracts, and measurable success criteria.
tags: [ai, prompt-engineering, llm]
keywords:
    - prompt engineering
    - prompt design
    - few-shot prompting
    - system prompt
    - prompt evaluation
---

# Prompt Engineering Basics

Prompt engineering is specification writing for a probabilistic system. A good prompt defines the task, supplies
the right context, constrains the output, and gives you a way to test whether the model did the work correctly.
This page is the foundation before [Context & Prompt Engineering](./context-engineering.md), which covers the
larger problem of assembling context across turns, tools, retrieval, memory, and agents.

The guidance here follows current provider docs from
[OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering),
[Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview), and
[Google Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies). Re-check the exact model docs before
shipping because prompting behavior changes between model families.

## Anatomy of a prompt

A production prompt is usually assembled from several pieces:

| Piece | Purpose | Common API shape |
|---|---|---|
| System or developer instruction | High-authority behavior, policy, style, and boundaries | OpenAI `instructions` or `developer` messages, Anthropic top-level `system`, Gemini `system_instruction` |
| User message | The current request or task | `user` message or `input` |
| Context | Facts, examples, retrieved passages, tool results, conversation state | Extra messages, documents, tool responses, or files |
| Output contract | Required format and validation rules | Natural-language rules, JSON schema, tool schema, or [structured outputs](./structured-outputs.md) |

Use high-authority instructions for durable behavior, not per-user facts. Put the user's actual request in the
user message. Keep data and instructions separated so the model can tell what to obey and what to read.

:::note
Provider names differ. The design idea is portable, but SDK fields are not: OpenAI documents `developer`
messages and `instructions`; Anthropic Messages uses top-level `system`; Gemini supports system instructions.
:::

## Start with success criteria

Anthropic's prompt-engineering overview starts with success criteria and empirical tests. Use the same workflow:

- What artifact, answer, or decision should the model produce?
- Which facts, policies, and constraints must it respect?
- What output shape will downstream code or humans consume?
- What result is unacceptable even if the prose sounds fluent?
- How will you test the prompt on realistic inputs?

If you cannot answer those questions, wording tweaks are guesswork.

## Give clear instructions and the why

Good prompts say what to do, why it matters, and how to know when it is done.

- Use direct verbs: `Classify`, `Extract`, `Rewrite`, `Compare`, `Summarize`.
- State scope: audience, allowed sources, time horizon, and rejection cases.
- Include completion criteria: fields, length, quality bar, and validation rules.
- Explain important constraints so the model knows which details are mission-critical.

Avoid relying on persona alone. `You are a senior engineer` is weaker than `Review the patch for production bugs
that could corrupt customer data; ignore style-only issues`.

## Give context, not a haystack

Context helps when it is relevant, current, and labeled. Too much context buries important facts and raises cost.
Put the highest-signal information near the task, and label sections when boundaries matter.

For example, put stable instructions first, place retrieved facts in a `<context>` block, and put the specific
request in a `<task>` block. The tag names are not special; the separation is what matters.

For long-lived agents, retrieval, compaction, and memory management belong in
[Context & Prompt Engineering](./context-engineering.md) rather than in one ever-growing prompt.

## Zero-shot, one-shot, and few-shot examples

Examples teach the model a pattern when prose instructions are not enough.

- **Zero-shot**: only the instruction. Best for simple or familiar tasks.
- **One-shot**: one input and ideal output. Useful for uncommon style or format.
- **Few-shot**: several examples. Useful for edge cases, labels, or subtle judgment calls.

Pitfalls: examples can over-anchor the model to copied facts, length, tone, or labels; examples that show only
positive cases can hide rejection behavior; stale examples can override newer rules. Keep examples diverse,
minimal, and representative, with at least one boundary case when mistakes are costly.

## Delimiters and XML tags

Delimiters make boundaries visible. Anthropic's current prompting docs still recommend XML-like tags for
separating instructions, examples, and source material. OpenAI and Google examples also emphasize clear input
structure, even when they do not require XML.

Use tags such as `<rules>`, `<examples>`, `<source>`, and `<task>` for sections the model must not confuse. Do
not invent a deep tag taxonomy. Tags help most when they clarify boundaries that matter.

## Ask for a specific output format

If humans will read the answer, request headings, bullets, or a concise rationale. If software will parse it,
prefer [Structured Outputs](./structured-outputs.md), tool schemas, or provider-native JSON schema support over
plain prose promises.

A format request should state the exact fields, allowed values, missing-data behavior, and whether extra text is
forbidden. For example: `Return exactly severity, summary, and evidence; severity must be low, medium, or high;
use null for unknown fields; output no prose outside the object`.

## Chain-of-thought prompting and reasoning models

Classic chain-of-thought prompting asks a model to write intermediate reasoning before the final answer. It can
help older or smaller models, but it can also create verbose output, leak sensitive reasoning, and give a false
sense of faithfulness.

For current [reasoning models](./reasoning-models.md), do **not** force hidden chain-of-thought with phrases like
`show every step`. These models already spend internal or summarized reasoning tokens. Give them the goal,
constraints, tools, and success criteria. Ask for a short explanation, audit trail, or checklist only when the
reader needs it.

```text
Solve the bug. Use the shortest correct patch. After the patch, summarize the root cause and the validation
command in two bullets. Do not include private scratch work.
```

## Prefilling responses

Prefilling means giving the model the start of the assistant response so it continues from there. It used to be
common for forcing JSON or suppressing preambles, especially with older Claude models.

Use it cautiously in 2026:

- Anthropic documents assistant prefill for earlier Claude models, but Claude 4.6 and later models and Claude
  Mythos Preview reject prefilled last assistant turns with a 400 error. Use structured outputs or clearer system
  instructions instead.
- Gemini 3.8 Flash migration guidance says to remove prefilled model turns and use system instructions or output
  schemas instead.
- OpenAI's current Responses API examples emphasize `instructions`, message roles, tools, and structured outputs;
  do not assume assistant prefill is portable.

## Role prompting

Role prompting gives the model a lens for the task. It works best when paired with concrete duties.

`You are a security expert` is weaker than `Act as an application security reviewer. Identify only exploitable
issues in authentication, authorization, input validation, secret handling, and dependency usage. Cite exact
evidence and provide a minimal fix, or say when there is no evidence`.

## Prompt chaining

A prompt chain splits a task into smaller model calls. Use it when one giant prompt mixes incompatible work,
when intermediate validation matters, or when different model tiers should handle different subtasks.

Example chain: extract candidate facts, validate them against citations, draft from validated facts only, then run
an evaluator prompt for omissions and unsupported claims. Chains cost more calls, so use
[evaluation](./evaluation-and-llmops.md) to prove the quality gain justifies the latency and cost.

## Templates and versioning

Prompts are production artifacts. Store them where code review, tests, and rollback apply.

- Keep reusable templates in source control.
- Pin model versions or snapshots when the provider supports it.
- Version major prompt changes with the eval results that justified them.
- Keep variables typed: `{{customer_tier}}`, `{{policy_excerpt}}`, `{{ticket_text}}`.
- Log prompt template versions, not secrets or full sensitive payloads.

OpenAI's current documentation recommends storing prompts in application code; reusable prompt objects in the
OpenAI API are deprecated and scheduled for shutdown on 2026-11-30.

## Test prompts with evals

Manual prompt tinkering does not scale. Build a small eval set as soon as a prompt affects production behavior.
See [Evaluation and LLMOps](./evaluation-and-llmops.md) for the full workflow.

A practical eval set includes typical inputs, edge cases, adversarial inputs, expected outputs or grading
criteria, regression cases from real failures, and cost and latency measurements. Re-run evals when you change
the prompt, model, decoding parameters, tool schema, or retrieved context.

## Before and after example

Before:

```text
Summarize this ticket and tell me if it is important.
```

After:

```text
You are triaging customer support tickets for a SaaS incident queue.

Success criteria:
- Classify severity as "low", "medium", or "high".
- Use "high" only when the ticket indicates data loss, security impact, or a production outage.
- Quote the exact phrase that supports the severity.
- Return exactly three bullets: severity, evidence, next action.

<ticket>
{{ticket_text}}
</ticket>
```

The second prompt defines the audience, labels, threshold, evidence requirement, output shape, and input boundary.

## API example

This current OpenAI Python SDK pattern uses the Responses API, a high-priority instruction, a user input, and the
SDK convenience property for text output.

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-6-astra",
    instructions=(
        "You are a concise documentation assistant. "
        "Answer with exactly three bullet points and no preamble."
    ),
    input="Explain prompt engineering for a backend developer.",
)

print(response.output_text)
```

Use a model you have access to in your own account. For multi-turn state, follow the provider's conversation-state
instructions rather than assuming the SDK remembers earlier calls automatically.

## Anti-patterns

- **Vague instructions**: `Make this better` without audience, constraints, or quality bar.
- **Conflicting rules**: `Be brief` and `include every detail` with no priority order.
- **Negative-only instructions**: `Do not hallucinate` without saying what source to use or when to abstain.
- **ALL CAPS shouting**: newer models can over-trigger on aggressive `CRITICAL` or `MUST` language. Use normal,
  specific instructions unless a true policy boundary needs emphasis.
- **Hidden requirements**: relying on the model to infer business rules that are not in the prompt or tools.
- **Format by vibes**: asking for JSON in prose when a schema or structured output mode is available.
- **No evals**: changing prompts by taste instead of measuring behavior.

## See also

- [Large Language Models](./llm.md) - how models generate tokens
- [Reasoning Models & Test-Time Compute](./reasoning-models.md) - prompting models that think internally
- [Context & Prompt Engineering](./context-engineering.md) - managing the full context window
- [Structured Outputs](./structured-outputs.md) - schema-constrained responses
- [Evaluation and LLMOps](./evaluation-and-llmops.md) - testing prompts in production systems
- [Cost, Latency & Model Routing](./cost-and-latency.md) - measuring the cost of prompt choices
