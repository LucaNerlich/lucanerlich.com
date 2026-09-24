---
title: Choosing a Model & Reading Benchmarks
description: How to choose an LLM for a product task, read benchmarks without being fooled, build a small internal eval set, and manage model upgrades safely.
tags: [ai, model-selection, benchmarks, evaluation]
keywords:
    - model selection
    - llm benchmarks
    - benchmark contamination
    - model routing
    - ai evaluation
---

# Choosing a Model & Reading Benchmarks

There is no universal "best model." The right model is the one that meets your quality bar on your own evals,
within your latency, cost, privacy, licensing, and operations constraints. Public benchmarks are useful for
shortlisting; they are not a product acceptance test.

## Selection criteria

Score candidates against the whole production envelope, not only benchmark rank.

| Criterion | Questions to answer |
|---|---|
| Quality on **your** evals | Does it pass representative happy paths, edge cases, refusals, and regressions? |
| Latency | What are p50/p95 time to first token and total response time under realistic load? |
| Cost | What is cost per successful task, including retries, tools, RAG, and long outputs? |
| Context window | Does the model handle the real prompt length without losing relevant details? |
| Modality | Do you need text only, vision, audio, video, or document input? |
| Tool use | Does it call the right tool, with valid arguments, at the right time? |
| Structured output | Does it support schemas or JSON modes strongly enough for downstream code? |
| Data and privacy terms | Can you send this data to the provider, region, and retention policy? |
| API vs open-weight/local | Do you need managed reliability, local control, offline use, or custom serving? |
| Licensing | Are commercial use, redistribution, adapters, or distillation allowed? |
| Rate limits | Can the provider handle peak traffic and batch jobs? |
| Regional availability | Is the model available where your compliance and latency requirements need it? |
| Deprecation policy | Can you pin a snapshot, and how much notice do you get before retirement? |

## Start with a small internal eval set

Before reading leaderboards, write a small eval suite. Use
[Evaluation and LLMOps](./evaluation-and-llmops.md) for the harness and
[Eval Datasets and Synthetic Data](./eval-datasets-and-synthetic-data.md) for split hygiene.

A useful first set contains:

- Real or expert-written cases for each critical workflow.
- Expected output shape, required facts, and disallowed behavior.
- At least one case for each known failure mode.
- Metadata slices: language, customer tier, domain, risk, tool, and input length.
- A held-out subset that is not used for prompt or routing tweaks.

The eval does not need to be large at first. It needs to be representative enough to reject obviously wrong
models and stable enough to catch regressions during upgrades.

## Benchmark pitfalls

| Pitfall | Why it matters | Mitigation |
|---|---|---|
| Contamination | Benchmark examples may appear in training data | Prefer fresh/private evals and time-windowed benchmarks |
| Saturation | Top models cluster near the ceiling | Use harder subsets and task-specific evals |
| Benchmark vs product gap | A high score may not imply good UX or tool use | Replay realistic traces and measure outcomes |
| Harness sensitivity | Prompt, scoring, sampling, and parser choices can move scores | Read methodology and rerun important evals yourself |
| Vendor-reported numbers | Providers may report favorable settings | Prefer independent or reproducible results |
| Cherry-picking | One benchmark can be selected because it flatters a model | Use a balanced scorecard |
| Preference bias | Human preference arenas reward style as well as correctness | Pair with factual and task-outcome evals |

## Benchmark families

Use benchmark families as signals about capability type.

| Benchmark | What it measures | Read with caution because |
|---|---|---|
| [MMLU-Pro](https://arxiv.org/abs/2406.01574) | Broad multitask knowledge and reasoning, designed to be harder and less saturated than MMLU | It is still multiple-choice and not your product task |
| [GPQA Diamond](https://github.com/idavidrein/gpqa) | Graduate-level, Google-proof science questions written and checked by domain experts | It emphasizes hard expert Q&A, not workflows or formatting |
| [SWE-bench Verified](https://github.com/SWE-bench/SWE-bench) | Real GitHub issue resolution with a subset confirmed solvable by software engineers | Agent scaffolding, tools, and time budget affect results heavily |
| [Humanity's Last Exam](https://github.com/centerforaisafety/hle) | Broad, closed-ended academic questions across many subjects and modalities | It is intentionally difficult and not a general product-quality score |
| [LiveBench](https://github.com/LiveBench/LiveBench) | Monthly refreshed, objectively graded tasks designed to limit contamination | Release version and public/private question status matter |
| [LiveCodeBench](https://github.com/LiveCodeBench/LiveCodeBench) | Continuously updated coding tasks from contest platforms, with pass@k scoring | Competitive-programming success may not transfer to repo work |
| [tau-bench](https://arxiv.org/abs/2406.12045) | Tool-agent-user interaction in realistic domains | Results depend on agent loop design, not just the base model |
| [MTEB](https://github.com/embeddings-benchmark/mteb) | Embedding and retrieval model quality across tasks such as retrieval, classification, clustering, and similarity | Embedding choice still needs your corpus and queries |

## Preference leaderboards

[LMArena](https://lmarena.ai/) is useful because it captures human pairwise preferences at scale, but it is
not a clean measure of factual correctness or enterprise utility. The NeurIPS 2025 paper
[The Leaderboard Illusion](https://papers.neurips.cc/paper_files/paper/2025/hash/70a93f260a51123b3c0e33ecd1b4de97-Abstract-Datasets_and_Benchmarks_Track.html)
criticizes Arena-style ranking for private variant testing, selective disclosure, different sampling rates,
data-access asymmetry, and overfitting to arena-specific dynamics. Treat preference leaderboards as one input,
not as a procurement answer.

## Independent aggregators

Aggregators can save time because they normalize many public results in one place. They still inherit the
limitations of the underlying benchmarks.

- [Artificial Analysis](https://artificialanalysis.ai/) publishes model comparisons and an Intelligence Index
  with documented methodology.
- [Epoch AI benchmarks](https://epoch.ai/benchmarks) separates evaluations it administered from externally
  sourced results and warns about contamination, leakage, and sensitivity to settings.

Use aggregators to shortlist candidates. Use your evals to decide.

## Scoring matrix template

Copy this into your design doc and fill it with measured values, not vibes.

| Weight | Criterion | Model A | Model B | Model C | Evidence |
|---:|---|---:|---:|---:|---|
| 30% | Task eval pass rate |  |  |  | Internal eval run ID |
| 15% | P95 latency |  |  |  | Load test trace |
| 15% | Cost per successful task |  |  |  | Token and tool cost report |
| 10% | Structured output validity |  |  |  | Schema scorer |
| 10% | Tool-call reliability |  |  |  | Agent trace eval |
| 10% | Data/privacy fit |  |  |  | Legal/security review |
| 5% | Regional availability |  |  |  | Provider docs |
| 5% | Licensing and exit path |  |  |  | License review |

Keep a written threshold: for example, "must pass all blocking safety cases, improve the held-out eval, and
stay inside the agreed p95 latency budget." Choose the threshold for your product before comparing models.

## Routing and cascades

One model rarely serves every request well. Common patterns:

- **Small-to-large cascade.** Start with a cheap model and escalate uncertain or failed cases.
- **Task router.** Send extraction, coding, search, and long-context work to different models.
- **Modality router.** Use separate models for text, image, audio, or document-heavy inputs.
- **Safety router.** Escalate high-risk cases to stricter prompts, stronger models, or human review.

See [Cost, Latency & Model Routing](./cost-and-latency.md) before building a router. Routing adds its own
failure modes: bad confidence estimates, inconsistent style, harder debugging, and more provider dependencies.

## Version pinning and upgrades

Model names are product dependencies. Treat them like code dependencies.

- Pin explicit model snapshots when the provider supports them.
- Record model ID, tokenizer behavior, system prompt, tools, retrieval index, and structured-output schema.
- Track deprecation dates and migration windows.
- Re-run evals before switching snapshots, even within the same model family.
- Run shadow traffic or canary deployments for high-impact workflows.
- Keep rollback instructions for prompts, model IDs, adapters, and routing rules.

## Reading a benchmark report

Ask these questions before trusting a result:

1. Was the benchmark public before the model's training cutoff?
2. Is the result vendor-reported, leaderboard-submitted, or independently reproduced?
3. Are prompts, sampling parameters, tool budgets, and parsing rules published?
4. Does the metric reward the behavior your product needs?
5. Are failures inspected, or only aggregate scores shown?
6. Is the benchmark saturated or frequently refreshed?
7. Does the score include refusal, safety, latency, and cost constraints?

If the answer is unclear, treat the benchmark as a weak prior and fall back to internal evals.

## See also

- [Evaluation and LLMOps](./evaluation-and-llmops.md) - build the harness before choosing
- [Eval Datasets and Synthetic Data](./eval-datasets-and-synthetic-data.md) - curate your internal eval set
- [Cost, Latency & Model Routing](./cost-and-latency.md) - cascades, routing, and token economics
- [Serving LLMs at Scale](./llm-serving.md) - serving constraints for open-weight models
- [Fine-Tuning & Model Adaptation](./fine-tuning.md) - adapt a chosen base model
- [RAG](./rag.md) - retrieval may matter more than model choice for knowledge tasks
- [Structured Outputs](./structured-outputs.md) - model support for machine-readable responses
