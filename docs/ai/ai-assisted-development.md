---
title: AI-Assisted Software Development
description: Using LLM coding agents inside an engineering workflow -- the alignment-before-generation methodologies (SPDD, architect-as-orchestrator), architecture patterns that suit AI (deep modules, vertical slices), and the economics driving adoption.
tags: [ai, ai-assisted-development, agents, methodology]
keywords:
    - ai assisted development
    - spec driven development
    - spdd reasons canvas
    - architect as orchestrator
    - deep modules
    - vertical slices
---

# AI-Assisted Software Development

Using LLM-powered coding assistants and agents *as engineers* inside a software workflow is a distinct
discipline from building LLM-powered products. The recurring thesis across the methodologies below is
**alignment before generation**: AI used as a "specs-to-code compiler" produces slop, so the human's job
shifts to defining clear boundaries the AI can operate within. This page covers methodology, architecture,
and economics.

## Methodology: align, then generate

### SPDD and the REASONS Canvas

**Structured-Prompt-Driven Development (SPDD)** (Thoughtworks) treats prompts as first-class delivery
artifacts -- version-controlled, reviewed, reusable, improved over time. Its central artifact is the
**[REASONS Canvas](./glossary.md#spdd)**, a seven-part structure that carries a prompt from intent through
design to governance:

| Letter | Part | Captures |
|---|---|---|
| R | Requirements | The problem and the definition of done |
| E | Entities | Domain entities and relationships |
| A | Approach | The strategy for meeting the requirements |
| S | Structure | Where the change fits; components and dependencies |
| O | Operations | Concrete, testable implementation steps |
| N | Norms | Cross-cutting engineering norms (naming, observability) |
| S | Safeguards | Non-negotiable boundaries (invariants, perf, security) |

The workflow enforces a key rule: **when reality diverges, fix the prompt first, then the code** -- prompts
and code evolve together rather than drifting apart. SPDD requires three core skills: *abstraction first*
(design before you generate), *alignment* (lock intent before writing code), and *iterative review* (turn
output into a controlled loop). It fits scaled, standardized, or compliance-heavy delivery well, and one-off
scripts or exploratory spikes poorly.

### Architect as orchestrator

A complementary framing: the human architect runs the "Day Shift" (alignment, design, planning) so AI agents
can handle the "Night Shift" (implementation, testing) inside a defined sandbox. Its seven tips:

1. **[Deep modules](./glossary.md#deep-modules) over shallow ones** -- simple interfaces, hidden complexity.
2. **[Vertical slices](./glossary.md#vertical-slices) (tracer bullets)** -- implement across all layers in one pass.
3. **Smart Zone context** -- keep tasks within ~100k tokens; if a task does not fit, the module boundaries are too blurry ([context rot](./context-engineering.md#context-rot-the-constraint-behind-the-techniques)).
4. **Grilling protocol** -- before any code, have the AI interview *you* about your design decisions.
5. **High ceilings via feedback loops** -- AI quality is capped by your codebase's feedback loops; robust CI and tests are prerequisites for autonomy.
6. **Parallelize via DAG** -- break work into a dependency graph and run agents in parallel on independent branches ([sub-agents](./context-engineering.md#long-horizon-techniques)).
7. **Separate review from implementation** -- one model implements, context is cleared, a different model reviews.

Both methodologies share the finite-attention thesis of [context engineering](./context-engineering.md):
align early, keep tasks inside the model's productive window, and isolate phases to avoid context pollution.

## Architecture patterns that suit AI

- **[Deep modules](./glossary.md#deep-modules).** Modules with simple interfaces hiding significant internal
  complexity (from Ousterhout's *A Philosophy of Software Design*). AI agents work best inside clear
  boundaries: with a deep module, the agent can change internal logic without breaking the system because the
  interface is the contract. Shallow modules force the agent to reason about cross-module effects across more
  surface area than its context can hold.
- **[Vertical slices](./glossary.md#vertical-slices) (tracer bullets).** Implement a feature across all
  layers in one pass rather than horizontally per layer, which forces integration to actually work.
- **Grilling protocol.** Inverting the conversation -- AI asks, human answers -- moves alignment work before
  commitments are made in code. It is cheaper to fix a misunderstanding in dialog than to refactor generated
  code.
- **Module boundaries as a context test.** If a task is too big to fit the model's Smart Zone, that is a
  signal your abstractions are too weak -- a design smell surfaced by the tooling.

## Economics

Most engineering organizations lack visibility into what their teams cost or what they must generate to be
viable. A representative figure from the source material: an 8-person Western-European team costs roughly
EUR 87k/month and needs EUR 260k--435k/month in generated value (a 3--5x viability threshold). The
cheap-capital era (2011--2022) made this financial discipline economically unnecessary; LLM disruption makes
it urgent again, as the cost of building functional approximations of complex software collapses. Large
engineering organizations are revealed to be both an asset and a liability -- the cheap-capital era masked the
liability side.

## Relationship to the rest of this section

This topic overlaps with the rest of the AI section but is specifically about using LLMs *as engineers/agents*
in development workflows. It reuses the same building blocks:

- [Context & Prompt Engineering](./context-engineering.md) -- the finite-attention constraint these methods design around
- [Agent Skills](./skills.md) -- version-controlled workflow packages that encode repeatable agent rituals
- [AI Agents](./agents.md) -- sub-agents, tool use, and the loops that do the implementation work
- [Evaluation & LLMOps](./evaluation-and-llmops.md) -- the feedback loops (tests, CI, eval) that cap AI quality
- [Which Pattern When?](./which-pattern-when.md) -- choose RAG, agents, skills, and related patterns for your goal
- [Debugging LLM Apps](./debugging-llm-apps.md) -- production troubleshooting runbook

## See also

- [AI Agents](./agents.md) -- the agents that perform the "Night Shift"
- [Agent Skills](./skills.md) -- reusable workflows for deployment, review, and other agent rituals
- [Project Memory & Rules](./project-memory-and-rules.md) -- AGENTS.md, CLAUDE.md, and Cursor rules
- [Context & Prompt Engineering](./context-engineering.md) -- the Smart Zone and sub-agent patterns
- [Knowledge Management with LLMs](./knowledge-management.md) -- schema files and project memory for agents
- [AI Glossary](./glossary.md) -- SPDD, deep modules, vertical slices, and more
