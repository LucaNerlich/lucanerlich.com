---
title: AI in Products
description: Product and UX patterns for shipping LLM features to users -- interaction models, streaming, trust, when not to use AI, and graceful degradation.
tags: [ai, product, ux, design]
keywords:
    - ai product design
    - llm ux
    - streaming ui
    - when not to use ai
    - graceful degradation
---

# AI in Products

Building with [LLMs](./llm.md) as an engineer is one skill; **shipping LLM features to users** is another.
Users do not care about [RAG](./rag.md) or [agents](./agents.md) -- they care whether the feature is fast,
trustworthy, and worth the occasional wrong answer. This page covers product and UX decisions for AI-powered
features, without diving into model internals.

## Interaction models

| Pattern | User experience | Best when | Risks |
|---|---|---|---|
| **Chat** | Open-ended dialogue | Exploration, support, copilot | Scope creep, long threads, unclear limits |
| **Inline / copilot** | AI inside an existing workflow (editor, form, dashboard) | Task-specific assist where context is already on screen | Interrupting flow; unclear what AI can see |
| **Background automation** | AI runs without real-time interaction (summaries, tagging, routing) | Batch work, notifications, prep for human review | Silent failures; users do not know AI was involved |
| **Generative fill** | One-shot: "draft this" or "complete this field" | Templates, emails, descriptions | Over-reliance; users stop editing |
| **Agent with approval** | AI proposes actions; user confirms before execution | Destructive or high-stakes ops | Friction if overused -- see [Human-in-the-Loop](./human-in-the-loop.md) |

Most successful products combine patterns: inline suggestions plus chat for follow-up, or background
classification plus a human queue for exceptions.

## Streaming and perceived performance

[LLM latency](./cost-and-latency.md) is often seconds. **Streaming** (showing tokens as they arrive) improves
perceived speed even when total time is unchanged.

Product guidelines:

- **Stream text** the user will read (answers, drafts). Do not stream internal chain-of-thought unless you
  intend to expose reasoning.
- **Show progress** for multi-step [agents](./agents.md) ("Searching…", "Running tests…") so silence is not
  mistaken for a hang.
- **Allow cancel** -- long runs need a stop button; partial results should be usable or clearly discarded.
- **Set expectations** -- "This usually takes 10–20 seconds" beats a blank spinner.

For background jobs, prefer email or in-app notification over blocking the UI.

## Trust, transparency, and control

Users trust AI features more when they understand boundaries:

- **Disclose AI involvement** where it affects decisions (support replies, content moderation, recommendations).
- **Show sources** when [RAG](./rag.md) or search grounds the answer -- citations beat "the AI said so."
- **Make undo easy** -- especially for generative edits; treat AI output as a draft, not a commit.
- **Offer escape hatches** -- "Talk to a human," "Use manual mode," "Turn off AI for this project."

Regulatory and contractual context for data sent to models is covered under [Privacy & Data Handling](./privacy-and-data.md).

## When not to use AI

AI is the wrong default when:

| Situation | Better approach |
|---|---|
| **Deterministic correctness required** | Rules, validators, traditional code (tax calc, ACL checks) |
| **Latency budget under ~200ms** | Cached lookups, heuristics, small local models only if proven fast enough |
| **Rare edge cases dominate** | Human process or explicit rule tables; LLMs miss long-tail cases |
| **Liability without review** | Human approval or non-AI fallback for legal/medical/financial claims |
| **Cost exceeds user value** | Simpler UX without AI; users will not pay (directly or indirectly) for the feature |
| **Training data is stale and no retrieval** | Fix data pipeline or add [RAG](./rag.md) before adding a model |

A useful product question: **"If the model were wrong 5% of the time, would this feature still be valuable
with recovery paths?"** If no, do not ship it as pure AI.

## Error states and failure UX

Models fail openly and silently:

- **API errors** -- rate limits, timeouts, provider outages. Show a clear message and retry; do not infinite-spin.
- **Refusals** -- policy blocks. Explain briefly and offer an alternative path.
- **Low-quality output** -- wrong but fluent. Confidence UI is hard; prefer validation + [structured outputs](./structured-outputs.md) for machine-checked fields.
- **Partial agent failure** -- one tool fails mid-loop. Surface what succeeded and what did not; do not pretend completion.

Design **graceful degradation**: if AI is unavailable, core product still works (manual mode, cached
answer, queued for later). Feature flags let you disable AI per tenant or region without redeploying.

## Measuring product success

Engineering [evals](./evaluation-and-llmops.md) ask "is the model good?" Product metrics ask "is the feature
good?"

Track both:

- **Task success rate** -- did the user accomplish their goal?
- **Edit distance** -- how much users change AI drafts before accepting
- **Override / thumbs-down rate** -- explicit dissatisfaction signals
- **Time to complete** -- AI should reduce work, not add review burden
- **Support tickets** -- spikes after launching an AI feature are a red flag

Run qualitative sessions early; users often want less AI surface area than engineers assume.

## Accessibility and inclusion

- Do not rely on color alone for AI-generated status (errors, confidence).
- Ensure streamed content works with screen readers (live regions, sensible updates).
- Provide non-AI paths for users who opt out or use assistive workflows that conflict with chat UIs.

## See also

- [Human-in-the-Loop](./human-in-the-loop.md) -- approval gates for high-stakes actions
- [Structured Outputs](./structured-outputs.md) -- reliable machine-parseable responses
- [Cost, Latency & Model Routing](./cost-and-latency.md) -- tier choice and streaming trade-offs
- [Privacy & Data Handling](./privacy-and-data.md) -- what user data may enter the model
- [AI Safety & Guardrails](./safety.md) -- content policy and abuse
- [AI Glossary](./glossary.md) -- graceful degradation and related terms
