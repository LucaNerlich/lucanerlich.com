---
title: AI-Assisted Software Development
description: Using LLM coding agents inside an engineering workflow - the alignment-before-generation methodologies (SPDD, architect-as-orchestrator), architecture patterns that suit AI (deep modules, vertical slices), evidence on productivity, and the economics driving adoption.
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
productivity evidence, and economics.

## Methodology: align, then generate

### SPDD and the REASONS Canvas

**Structured-Prompt-Driven Development (SPDD)** (Thoughtworks) treats prompts as first-class delivery
artifacts - version-controlled, reviewed, reusable, improved over time. Its central artifact is the
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

The workflow enforces a key rule: **when reality diverges, fix the prompt first, then the code** - prompts
and code evolve together rather than drifting apart. SPDD requires three core skills: *abstraction first*
(design before you generate), *alignment* (lock intent before writing code), and *iterative review* (turn
output into a controlled loop). It fits scaled, standardized, or compliance-heavy delivery well, and one-off
scripts or exploratory spikes poorly.

### Architect as orchestrator

A complementary framing: the human architect runs the "Day Shift" (alignment, design, planning) so AI agents
can handle the "Night Shift" (implementation, testing) inside a defined sandbox. Its seven tips:

1. **[Deep modules](./glossary.md#deep-modules) over shallow ones** - simple interfaces, hidden complexity.
2. **[Vertical slices](./glossary.md#vertical-slices) (tracer bullets)** - implement across all layers in one pass.
3. **Smart Zone context** - a practitioner heuristic says many coding agents are most reliable in the first
   roughly 100k high-signal tokens, but the number varies by model, task, and context quality; the reason to
   care is the measured [context rot](./context-engineering.md#context-rot-the-constraint-behind-the-techniques)
   effect, where quality can degrade as context grows.
4. **Grilling protocol** - before any code, have the AI interview *you* about your design decisions.
5. **High ceilings via feedback loops** - AI quality is capped by your codebase's feedback loops; robust CI and tests are prerequisites for autonomy.
6. **Parallelize via DAG** - break work into a dependency graph and run agents in parallel on independent branches ([sub-agents](./context-engineering.md#long-horizon-techniques)).
7. **Separate review from implementation** - one model implements, context is cleared, a different model reviews.

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
- **Grilling protocol.** Inverting the conversation - AI asks, human answers - moves alignment work before
  commitments are made in code. It is cheaper to fix a misunderstanding in dialog than to refactor generated
  code.
- **Module boundaries as a context test.** If a task cannot be explained within a compact, high-signal
  context, that is a signal your abstractions may be too weak - a design smell surfaced by the tooling.

## What the evidence says about productivity

The honest answer is: AI coding tools help in some settings and hurt in others. Published studies measure
different populations, tasks, and workflows, so do not generalize one headline to every team.

- **Small, unfamiliar task, controlled setting:** Peng et al.'s GitHub/Microsoft experiment asked developers
  to implement an HTTP server in JavaScript. The Copilot group completed the task **55.8% faster** than the
  control group in the paper's main result. That is real evidence for a narrow task, not a blanket guarantee
  for large-codebase work.
- **Experienced maintainers, real repositories:** METR's 2025 randomized controlled trial studied
  experienced open-source developers on issues in their own repositories. With early-2025 AI tools allowed,
  tasks took about **19% longer**, while developers *perceived* themselves to be about **20% faster**. METR's
  2026 update reported that a larger follow-up had severe selection and measurement problems, so the team is
  changing the experimental design rather than treating the follow-up point estimates as definitive.
- **Organization-wide adoption:** DORA's 2025 *State of AI-assisted Software Development* report found
  widespread use and high self-reported productivity, but its central warning is that AI amplifies the
  surrounding system. Strong platforms, tests, review habits, and value-stream management help turn local
  speed into delivered value; weak systems can convert faster code production into instability.

Takeaway: expect the effect to depend on **task type**, **codebase familiarity**, **review discipline**,
**test quality**, and **workflow design**. Measure cycle time, defect rate, review churn, and incident load
in your own environment before making staffing or delivery promises.

## Economics

Specific ROI figures are usually organization-specific. Use them as a worksheet, not as universal facts. For
illustration, suppose an 8-person team costs EUR 87k per month fully loaded. If leadership expects generated
business value to be three to five times engineering cost, that team would need EUR 261k to EUR 435k per
month in attributable value. Change the salaries, overhead, target multiple, and attribution model and the
answer changes immediately.

The durable point is not the exact number. AI reduces the cost of producing plausible software artifacts, so
teams need better visibility into which work creates durable value, which work only creates code volume, and
which controls prevent cheap generation from becoming expensive maintenance.

## Verification sources

- [Peng et al., *The Impact of AI on Developer Productivity: Evidence from GitHub Copilot*](https://arxiv.org/abs/2302.06590) - controlled HTTP-server experiment and 55.8% speed result
- [METR, *Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity*](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) - 2025 RCT with experienced developers
- [METR, *We are Changing our Developer Productivity Experiment Design*](https://metr.org/blog/2026-02-24-uplift-update/) - 2026 follow-up and measurement caveats
- [DORA, *2025 State of AI-assisted Software Development*](https://cloud.google.com/resources/content/2025-dora-ai-assisted-software-development-report) - adoption, organizational-system findings, and AI capabilities model
- [Chroma, *Context Rot: How Increasing Input Tokens Impacts LLM Performance*](https://www.trychroma.com/research/context-rot) - empirical basis for caution around long contexts

## Relationship to the rest of this section

This topic overlaps with the rest of the AI section but is specifically about using LLMs *as engineers/agents*
in development workflows. It reuses the same building blocks:

- [Context & Prompt Engineering](./context-engineering.md) - the finite-attention constraint these methods design around
- [Agent Skills](./skills.md) - version-controlled workflow packages that encode repeatable agent rituals
- [AI Agents](./agents.md) - sub-agents, tool use, and the loops that do the implementation work
- [Evaluation & LLMOps](./evaluation-and-llmops.md) - the feedback loops (tests, CI, eval) that cap AI quality
- [Which Pattern When?](./which-pattern-when.md) - choose RAG, agents, skills, and related patterns for your goal
- [Debugging LLM Apps](./debugging-llm-apps.md) - production troubleshooting runbook

## See also

- [AI Agents](./agents.md) - the agents that perform the "Night Shift"
- [Agent Skills](./skills.md) - reusable workflows for deployment, review, and other agent rituals
- [Project Memory & Rules](./project-memory-and-rules.md) - AGENTS.md, CLAUDE.md, and Cursor rules
- [Context & Prompt Engineering](./context-engineering.md) - the Smart Zone heuristic and sub-agent patterns
- [Knowledge Management with LLMs](./knowledge-management.md) - schema files and project memory for agents
- [AI Glossary](./glossary.md) - SPDD, deep modules, vertical slices, and more
