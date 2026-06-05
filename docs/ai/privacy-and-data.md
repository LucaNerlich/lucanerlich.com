---
title: Privacy & Data Handling
description: Practical guidance for builders on PII in prompts, retention and residency, logging risks, and minimization patterns when shipping LLM features.
tags: [ai, privacy, data-protection, compliance]
keywords:
    - llm privacy
    - pii prompts
    - data residency ai
    - prompt logging
    - gdpr llm
---

# Privacy & Data Handling

[safety.md](./safety.md) covers attacks and guardrails; this page covers **data stewardship** -- what you
send to [LLM](./llm.md) providers, what you log, where it is processed, and how to minimize exposure when
shipping features to users. This is not legal advice; it is engineering hygiene that aligns with common
privacy expectations (including GDPR-style requirements many European teams operate under).

## The basic risk model

When you call a cloud model, you typically send:

- User prompts and conversation history
- Retrieved documents ([RAG](./rag.md))
- Tool outputs (database rows, API responses, file contents)
- System prompts that may embed internal instructions

That payload may contain **personally identifiable information (PII)**, credentials, trade secrets, or
regulated health/financial data. It transits to a **third-party processor** (or your own [self-hosted](./cloud-vs-local.md)
environment), may be **logged** by SDKs and observability tools, and may be **retained** per provider policy
unless you contract otherwise.

Assume: **if it went into the prompt, someone could log it.** Design accordingly.

## Data minimization

Send the smallest context that still works:

| Practice | Why |
|---|---|
| **Redact before send** | Strip emails, phone numbers, national IDs, tokens from prompts and retrieved chunks |
| **Retrieve narrow slices** | [RAG](./rag.md) should return paragraphs, not whole documents with unrelated PII |
| **Scope agent tools** | Tools should return fields the task needs, not full table dumps |
| **Separate system secrets** | Never put API keys or passwords in prompts; inject via secure server-side config |
| **Use local models for sensitive paths** | When data must not leave the network, route to [local / self-hosted](./cloud-vs-local.md) tiers |

Minimization pairs with [structured outputs](./structured-outputs.md) -- extract only required fields
server-side instead of pasting raw user uploads into the model.

## Residency and subprocessors

Cloud [LLM](./llm.md) APIs process data in provider regions you do not always control. Questions to answer
before launch:

- **Where does inference run?** (region, sovereign cloud options)
- **Are prompts used for training?** Most enterprise tiers opt out by default; verify contract and settings
- **Who are subprocessors?** Provider, hosting, observability vendor, vector DB host
- **Can you pin region?** Some platforms offer EU-only or customer-VPC deployment

[Local models](./local-llm-app.md) remove the third-party inference step but shift responsibility to your
infra and backups.

## Logging and observability

[LLMOps](./evaluation-and-llmops.md) tools often log full prompts and completions for debugging. That is
valuable and risky:

- **Treat production logs like a database of user content** -- access control, retention limits, encryption at rest
- **Avoid logging secrets** -- scrub Authorization headers, connection strings, session tokens in middleware
- **Sample or hash** in high-volume paths; full trace only for opted-in debug sessions
- **Separate dev and prod** -- never replay production prompts into shared staging without redaction

If users can paste anything into chat, your logs are a liability without retention policy and deletion on
account erasure requests.

## User-facing transparency

Align with [AI in Products](./ai-in-products.md):

- Disclose when content is processed by external AI services
- Document what is sent (files, message history, metadata)
- Offer opt-out or manual mode where feasible
- Honor deletion: if a user deletes data in your app, remove associated vectors, logs, and cached completions

## Patterns by scenario

### Customer support copilot

Retrieve ticket + recent messages; redact payment details; do not attach full CRM export. Prefer ticket ID
lookups via tool over bulk paste.

### Code assistants

Source code may contain secrets. Use secret scanners in CI; warn users not to paste production credentials;
[project memory](./project-memory-and-rules.md) should not embed live keys.

### Document Q&A

Chunk and index with access control at retrieval time -- the model should only see chunks the user is
allowed to read. Log document IDs, not full text, where possible.

### Agents with broad tools

Each tool is a data exfiltration surface. Least-privilege tool design overlaps with [AI Safety](./safety.md)
and privacy: narrow queries, row-level filters, audit what the agent fetched.

## Enterprise checklist (engineering)

Before production:

- [ ] Data flow diagram: user → your backend → model provider → observability
- [ ] Classification: which fields are PII/sensitive and where they appear in prompts
- [ ] Retention: logs, vector store, conversation history -- TTL and deletion hooks
- [ ] Contract: training opt-out, region, DPA/subprocessor list
- [ ] Redaction layer on ingest and on log write
- [ ] Incident plan: leaked prompt in ticket, accidental log export

## See also

- [AI Safety & Guardrails](./safety.md) -- prompt injection and tool abuse (security, not privacy policy)
- [Cloud vs Local Models](./cloud-vs-local.md) -- keeping inference on-prem
- [Knowledge Management with LLMs](./knowledge-management.md) -- where synthesized data lives
- [AI in Products](./ai-in-products.md) -- transparency and user trust
- [RAG](./rag.md) -- retrieval access control
- [AI Glossary](./glossary.md) -- PII minimization and related terms
