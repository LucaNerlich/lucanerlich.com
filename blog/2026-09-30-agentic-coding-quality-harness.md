---
title: Agentic coding quality harness -- from ticket to merge
description: How to wrap a coding agent in guides and sensors from ticket to merge -- and how to score each run so you can compare models on fulfillment, regressions, and cost.
authors: luca
tags: [ai, agents, harness, quality, ci, evaluation]
image: https://lucanerlich.com/images/avatar-ai.jpg
---

Coding agents write faster than most review queues can absorb. The useful response is not more
supervision of every token -- it is an **outer quality harness**: instructions that steer the agent
before it acts, and checks that let it self-correct before a human has to look.

<!-- truncate -->

This is a walkthrough of that harness along a normal delivery path -- ticket, alignment, implement,
local checks, pull request, CI, human review, merge -- and a **run record** you can keep on every
ticket so models are comparable on fulfillment, regressions, and cost. The long-form methodology
lives in [AI-Assisted Software Development](/ai/ai-assisted-development/). The mental model here
follows Birgitta Böckeler's [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)
(April 2026): feedforward *guides* plus feedback *sensors*, each either computational or inferential.

## Two harnesses, one word

"Harness" already means two different things on this site, and mixing them up makes the rest of the
conversation mushy.

| Layer | What it is | Where it lives here |
|-------|------------|---------------------|
| **Inner / runtime** | The program around the model: agent loop, tools, sessions, TUI | [AI Agent Harnesses](/ai/agent-harnesses/) -- opencode, pi, herdr |
| **Outer / quality** | Repo-specific guides and sensors that raise the odds of a good change | This post -- plus [project memory](/ai/project-memory-and-rules/), [skills](/ai/skills/), tests, CI |

Agent = model + inner harness. Trust at merge time comes from the outer one. The inner harness
gives the model a shell and a file editor. The outer harness tells it how *this* repo is allowed
to change, and proves whether the change is still healthy.

[Harness engineering](/ai/evaluation-and-llmops/#harness-engineering) in the LLMOps sense is the
sibling idea for *product* LLM apps (datasets, judges, traces). Same word, different bounded
context. Here the system under test is the codebase the agent is editing.

## Guides and sensors

A quality harness does two jobs, and you need both:

- **Guides (feedforward)** -- anticipate failure and steer *before* the agent writes. `AGENTS.md`,
  Cursor rules, skills, a ticket with a real definition of done.
- **Sensors (feedback)** -- observe *after* the agent acts and feed a signal it can use to
  self-correct. Typecheck, tests, linters, `pnpm build`, an LLM reviewer with a cleared context.

Run only guides and the agent never finds out the rule did not stick. Run only sensors and it
repeats the same mistake until the loop burns tokens. Böckeler's useful extra split is *how* those
controls run:

| | Computational (CPU, deterministic) | Inferential (model, semantic) |
|---|---|---|
| **Guide** | Codemods, OpenRewrite, typed APIs, service templates | `AGENTS.md`, skills, review rituals |
| **Sensor** | Lint, tests, types, ArchUnit, broken-link build | LLM-as-judge review, "does this match the ticket?" |

Computational sensors are cheap enough to run on every edit. Inferential sensors are slower and
non-deterministic -- use them where structure cannot see meaning, and do not pretend they replace
a test suite.

```mermaid
flowchart TB
    ticket["Ticket + DoD"] --> guides["Guides"]
    guides --> agent["Agent implements"]
    agent --> sensors["Sensors"]
    sensors -->|fail| agent
    sensors -->|pass| pr["PR + CI"]
    pr --> human["Human review"]
    human --> merge["Merge"]
```

Shift the cheap checks as far left as they still run in seconds. Keep the expensive ones for the
pipeline and for the human, who still owns intent.

## Ticket

The ticket is the first guide. If it is a vibe ("make search better"), the agent will invent
behavior, then invent tests that agree with the invention. That is a green build of the wrong
product.

Write the ticket the way you would brief a capable new teammate:

- Problem and non-goals
- Definition of done (observable, not "looks good")
- Surfaces that must keep working (other routes, APIs, docs)
- Constraints the agent cannot see: security, performance, "we do not touch X"
- How to verify -- commands, not adjectives

This is the Requirements / Safeguards pair from [SPDD](/ai/ai-assisted-development/#spdd-and-the-reasons-canvas)
without forcing a seven-box canvas onto every chore. For a one-line typo fix, a sentence is enough.
For a behavior change, the ticket *is* the spec. When reality diverges later, fix the ticket (or
the skill) first, then the code.

## Alignment, before generation

The [architect-as-orchestrator](/ai/ai-assisted-development/#architect-as-orchestrator) split still
holds: humans do the day shift (intent, design, boundaries), agents do the night shift inside a
sandbox. Two cheap rituals before any file edit:

1. **Grill the ticket.** Ask the agent to interview *you* about edge cases, existing modules, and
   what "done" looks like. Misunderstandings are cheaper in dialogue than in a 400-line diff.
2. **Load the standing guides.** [Project memory](/ai/project-memory-and-rules/) (`AGENTS.md`) for
   always-on facts; [skills](/ai/skills/) for multi-step rituals (review, release, "add a blog
   post"). Keep memory short. Long procedures belong in a skill so they do not rot in every
   session's context window.

This site is a small worked example. `AGENTS.md` tells every agent: pnpm not npm, Node 22, four-space
indent, `pnpm build` is the test, trailing slashes on links, edit `sidebar-order.ts` to reorder
docs. Security rules in `.cursor/rules/` stay always-on. That is feedforward you only write once.

If the change cannot be explained in a compact, high-signal brief, that is often a design smell --
the module is too shallow, the slice too wide, or the ticket is still a wish. See
[context engineering](/ai/context-engineering/) for why stuffing more files into context does not
fix that.

## Implementation

Let the agent work in a branch, with the repo's normal tools, not a parallel universe of "AI
commits." Vertical slices beat layer-by-layer generation: one path through UI, API, and data that
actually runs is worth more than three incomplete layers.

Give the agent the computational sensors as tools it is expected to run, not as a surprise at
review:

```bash
pnpm build          # this repo: broken links, anchors, and markdown images throw
vale docs/path.md   # prose, when the change is a doc or blog post
```

In an application repo the equivalent is `lint`, `typecheck`, and the fast test suite -- the same
commands a human would run. Put those commands in `AGENTS.md` so the agent does not guess `npm test`
in a pnpm house.

[Git hooks](/git/beginners-guide/hooks-and-automation/) are sensors that fire even when the agent
(or a tired human) skips the script: format and unit tests on pre-commit, the slower suite on
pre-push. Agents will retry a failing hook if the error message is written for them -- include the
fix hint in the linter output, not only "error on line 12."

## Pull request

Open the PR when local sensors are green, not as a request for the reviewer to become the test
runner. The PR description should restate the ticket's definition of done and the commands that
already passed. That is another guide: the next model (or human) should not have to reconstruct
intent from the diff alone.

Then run an **inferential sensor with a cleared context**. One model implements; a different model
(or a fresh session) reviews against the ticket, the standing rules, and the diff. Shared context
pollutes review -- the implementer already "knows" why the shortcut was fine. This is the
maker-checker split from [Human-in-the-Loop](/ai/human-in-the-loop/#maker-checker). The checker
can be a second agent, a ruleset, or a person. Agreement is not a merge button; disagreement is a
signal.

Keep computational checks in the PR too. GitHub Actions on this repo runs `pnpm install --frozen-lockfile`
and `pnpm build` on every pull request to `main`. That is the same sensor the agent already ran,
repeated where it cannot be skipped. Application repos add coverage thresholds, dependency audit,
and architecture tests here -- see [test coverage as a CI gate](/testing/beginners-guide/test-coverage/).

## Merge

Merge stays a human decision for anything that changes behavior. The harness's job is to make that
decision small: style, types, broken links, and "the tests the agent wrote are green" should already
be settled. What is left is the residue sensors still miss:

- **Misdiagnosis** -- the agent fixed a symptom the ticket never named
- **Overengineering** -- extra modules, flags, and helpers nobody asked for
- **Wrong product** -- tests encode the implementation, not the intended behavior
- **Organizational fit** -- the technically correct change is not what this team is doing this week

Böckeler is blunt about this: maintainability harnesses (lint, structure, duplication) are the easy
layer. Architecture fitness functions are doable when you already have module boundaries.
**Behavior** -- does the system do what we meant? -- still needs a specification plus tests you
trust, plus a human who can tell those tests from a hall of mirrors. Approved fixtures help where
the domain has golden inputs. They are not a wholesale replacement for reading the diff.

Workflow-wise this is still [GitHub Flow](/git/beginners-guide/workflows/): short-lived branch,
review, merge to a deployable `main`. The harness does not need a new branching model. It needs
the existing model to refuse work that has not passed the left-shifted sensors.

## The steering loop

The harness is not a one-time config file. When the same failure shows up twice -- wrong package
manager, missed trailing slash, a security rule the agent walked around -- encode it:

1. Computational sensor if you can (build, lint, test, ArchUnit)
2. Guide if the check is semantic or procedural (skill, rule, ticket template)
3. Human checkpoint only if the action is irreversible or the signal is still too weak

Agents are good at drafting those controls. Use them to write the ArchUnit test or the skill, then
keep the control in git so the next session inherits it. That is how `AGENTS.md` on this site grew:
each repeated agent mistake became a sentence, then a check.

Two failure modes to watch as the harness grows:

- **Contradictory guides** -- a skill says "always add tests," a rule says "this folder has no test
  framework." The agent will pick one at random and spend your tokens.
- **Silent sensors** -- a check that never fires may mean high quality, or it may mean the check
  cannot see the bug. Treat a quiet sensor as something to probe, not as proof.

## Score the run: result vs ask, regressions, cost

Guides and sensors raise the odds of a good change. They do not, by themselves, tell you whether
model A is cheaper than model B for *your* tickets. For that you need a **run record**: one JSON
object per attempt, same schema every time, appended to a JSONL log. The log is the dataset;
[eval-driven development](/ai/evaluation-and-llmops/#eval-driven-development) applies, with the
codebase as the system under test.

Do not collapse this into one "agent IQ" number. Keep three families of scores, and only then
derive efficiency from the ones that succeeded.

| Family | Question | Gate |
|--------|----------|------|
| **Fulfillment F** | Did the change do what the ticket asked? | Soft -- report `0..1` |
| **Regression G** | Did existing checks stay green? | Hard -- `0` or `1` |
| **Scope leak L** | How much of the diff was off-ticket? | Warn -- `0..1`, higher is worse |
| **Cost** | Tokens, USD, wall time, human minutes | Never a gate by itself |

**Success** `S = 1` only when `F == 1` and `G == 1`. Efficiency rankings use successful runs as the
denominator. A cheap model that never finishes looks efficient if you average USD over all attempts
and ignore outcomes -- that ranking is wrong. Measure [cost per successful outcome](/ai/cost-and-latency/),
and still report wasted spend on failures (all-in USD divided by successes).

```mermaid
flowchart TB
    dod["Frozen DoD checklist"] --> attempt["Agent attempt"]
    base["Baseline sensors at git SHA"] --> attempt
    attempt --> F["F: DoD items passed"]
    attempt --> G["G: existing checks still green"]
    attempt --> C["Cost vector"]
    F --> S{"F = 1 and G = 1?"}
    G --> S
    S -->|yes| ok["Success -- count for efficiency"]
    S -->|no| fail["Attempt only -- count wasted spend"]
    ok --> log["Append JSONL run record"]
    fail --> log
```

### Freeze the ask before the agent starts

Fulfillment is result vs ask. If the ask is a paragraph of vibes, you are scoring the model's
fanfiction against your later memory of what you wanted. Freeze a checklist of **binary, observable**
DoD items, hash it, and refuse to edit it mid-run. Mid-run edits are a new ticket.

Good items are commands or diffs, not adjectives:

- "GET `/orders/:id` returns 404 for unknown ids" -- you can curl it
- "No files outside `src/orders/` and `tests/orders/`" -- you can diff it
- "Existing `pnpm test` failures stay at zero" -- you can subtract two JUnit summaries

Bad items: "code is clean", "UX feels better", "reasonable coverage". Those belong in human review,
or in an anchored [LLM-as-judge](/ai/evaluation-and-llmops/#llm-as-judge-bias-checks) rubric after
you have written what a `1` looks like.

Give each item a scorer kind so the same ticket can be re-run against another model without
reinventing the grade:

| `scorer` | How it passes | Use for |
|----------|---------------|---------|
| `command` | Exit code 0 (build, test, curl, Vale) | Behavior you can execute |
| `path_exists` | Path is present after the run | New files, pages, endpoints on disk |
| `diff_allowlist` | Every touched path matches a glob | Scope / non-goals |
| `judge` | Independent model, binary, cleared context | Semantics with no cheap oracle |
| `human` | Reviewer 0/1 | Gold labels on the comparison set |

Computational scorers first. Judge only where a command cannot see meaning. Human labels on a sample
of the ticket corpus so you can measure judge-human agreement instead of trusting the judge.

### Freeze the baseline so regressions are not a vibe

Agent-written tests are not a regression suite. They often encode the implementation. Before the
agent touches a file, run the **existing** sensors on `git_sha_before` and store the counts. After
the attempt, run the same commands on the same existing tests -- not the tests the agent added.

On this site that sensor is `pnpm build` (broken links, anchors, markdown images). In an app repo it
is the already-green unit/integration suite, typecheck, and lint. Subtract:

- `new_failures_in_existing_checks` -- existing tests/build that went red
- `G = 0` if that number is greater than zero, else `G = 1`

Then measure scope separately, so a green suite that rewrites half the tree still shows up:

```text
L = leaked_loc / max(changed_loc, 1)
```

`leaked_loc` is insertions+deletions in paths outside the ticket's allowlist. `L = 0` means the
diff stayed in bounds. High `L` with `G = 1` is the usual overengineering signature: nothing broke,
nothing was asked for.

Optional extras when the repo already has them -- they are still computational sensors, not a new
religion: [coverage delta](/testing/beginners-guide/test-coverage/) on *existing* code, mutation
score on existing tests, contract tests, screenshot diffs. New coverage on new files does not prove
the ask; it proves the agent wrote tests.

### The run record

One object per attempt. Pin model **and** the published token prices you used that day, because
prices move. Record the full before/after commit SHAs and hashes of the frozen DoD, harness revision,
and every guide or skill loaded. Those are part of the system under test -- swapping Cursor rules
mid-corpus is a different experiment.

```json
{
  "schema": "agent-run-record/v1",
  "ticket_id": "blog-quality-harness",
  "ticket_class": "docs",
  "git_sha_before": "<full commit SHA>",
  "git_sha_after": "<full commit SHA>",
  "attempt": 1,
  "model": {
    "id": "composer-placeholder",
    "provider": "cursor",
    "input_usd_per_mtok": 3.0,
    "output_usd_per_mtok": 15.0
  },
  "harness": {
    "name": "cursor-cloud",
    "revision": "<harness version or commit>",
    "guides": [
      {
        "path": "AGENTS.md",
        "sha256": "<SHA-256>"
      }
    ],
    "skills": []
  },
  "ask": {
    "dod_sha256": "<SHA-256 of frozen DoD>",
    "dod": [
      {
        "id": "file",
        "statement": "Post exists under blog/ with title and description",
        "scorer": "path_exists",
        "passed": true
      },
      {
        "id": "build",
        "statement": "pnpm build succeeds",
        "scorer": "command",
        "passed": true
      },
      {
        "id": "scope",
        "statement": "Diff stays under blog/ unless a redirect is required",
        "scorer": "diff_allowlist",
        "passed": true
      }
    ]
  },
  "regression": {
    "new_failures_in_existing_checks": 0,
    "allowlist": ["blog/"],
    "files_touched": ["blog/2026-09-30-agentic-coding-quality-harness.md"],
    "changed_loc": 225,
    "leaked_loc": 0
  },
  "cost": {
    "input_tokens": 180000,
    "output_tokens": 22000,
    "usd": 0.87,
    "wall_s": 2400,
    "tool_calls": 85,
    "self_repair_loops": 2,
    "human_min": 25
  },
  "review": {
    "human_rewrite_loc": 40,
    "review_comments": 1
  }
}
```

Derived scores (keep them out of the raw log so you can change a formula without rewriting history):

```text
F              = passed_dod / n_dod
G              = 1 if new_failures_in_existing_checks == 0 else 0
L              = leaked_loc / max(changed_loc, 1)
S              = 1 if F == 1 and G == 1 else 0
rewrite_ratio  = human_rewrite_loc / max(changed_loc, 1)
```

`human_min` and `rewrite_ratio` are the hidden cost. A model that is cheap in tokens and expensive
in reviewer time is not cheap. METR's experienced-developer study is the cautionary tale: perceived
speed and calendar speed are not the same thing -- see the [productivity evidence](/ai/ai-assisted-development/#what-the-evidence-says-about-productivity).

### Score a record

Stdlib-only. Point it at one JSON file per attempt or a JSONL/NDJSON corpus.

```python
import json
from pathlib import Path
from statistics import median


def score(run: dict) -> dict:
    dod = run["ask"]["dod"]
    n = len(dod) or 1
    f = sum(1 for item in dod if item["passed"]) / n
    g = 0 if run["regression"]["new_failures_in_existing_checks"] else 1
    loc = max(run["regression"]["changed_loc"], 1)
    leak = run["regression"]["leaked_loc"] / loc
    success = f == 1 and g == 1
    cost = run["cost"]
    return {
        "ticket_id": run["ticket_id"],
        "ticket_class": run["ticket_class"],
        "model": run["model"]["id"],
        "F": round(f, 4),
        "G": g,
        "L": round(leak, 4),
        "S": int(success),
        "usd": cost["usd"],
        "tokens": cost["input_tokens"] + cost["output_tokens"],
        "wall_s": cost["wall_s"],
        "human_min": cost["human_min"],
        "rewrite_ratio": round(run["review"]["human_rewrite_loc"] / loc, 4),
    }


def leaderboard(paths: list[Path]) -> list[dict]:
    runs = []
    for path in paths:
        text = path.read_text()
        if path.suffix.lower() in {".jsonl", ".ndjson"}:
            runs.extend(json.loads(line) for line in text.splitlines() if line.strip())
        else:
            runs.append(json.loads(text))
    rows = [score(run) for run in runs]
    out = []
    groups = sorted({(row["model"], row["ticket_class"]) for row in rows})
    for model, ticket_class in groups:
        rs = [
            row for row in rows
            if row["model"] == model and row["ticket_class"] == ticket_class
        ]
        wins = [row for row in rs if row["S"]]
        n = len(rs)
        n_ok = len(wins)
        spent = sum(row["usd"] for row in rs)
        out.append({
            "model": model,
            "ticket_class": ticket_class,
            "attempts": n,
            "success_rate": round(sum(row["S"] for row in rs) / n, 4),
            "median_F": round(median(row["F"] for row in rs), 4),
            "G_rate": round(sum(row["G"] for row in rs) / n, 4),
            "median_L": round(median(row["L"] for row in rs), 4),
            "usd_per_success_all_in": round(spent / n_ok, 4) if n_ok else None,
            "median_usd_success": (
                round(median(row["usd"] for row in wins), 4)
                if wins else None
            ),
            "median_human_min_success": (
                round(median(row["human_min"] for row in wins), 4)
                if wins else None
            ),
        })
    return out
```

`usd_per_success_all_in` is the number I actually use to compare models: **every** dollar spent on
that model in that ticket class, divided by successes. Failed attempts count as waste.
`median_usd_success` is the typical cost when it works -- useful, but it hides a model that fails
often.

Two rules so the board stays honest:

1. **Do not rank on cost until `S` is in the picture.** Filter or split; do not average USD across
   failures and call it efficiency.
2. **Stratify by `ticket_class`.** A 2-minute typo fix and a feature slice are not one distribution.
   Docs, bug, feature, refactor is enough. A global median will crown whatever model you pointed at
   the easy pile.

### Compare models on a frozen ticket set

This is a tiny private [golden dataset](/ai/eval-datasets-and-synthetic-data/), not SWE-bench. You
already have the cases: last month's tickets.

1. Pick 10 to 30 closed tickets. Freeze each as `git_sha_before`, a DoD file, and an allowlist.
2. Stratify the set. Re-run the *same* tickets against each candidate model.
3. Do not change `AGENTS.md`, skills, or sensors between models. Those are harness, not model.
4. Repeat each ticket-model pair at least three times. Agents are [non-deterministic](/ai/evaluation-and-llmops/);
   one lucky run is an anecdote. Report median and success rate, not the best attempt.
5. Use a different model (or a human) as judge than the one that implemented. Same-model judges
   prefer themselves.

Hypothetical board, same five `docs` tickets, three attempts each -- numbers are illustrative:

| Model | Success rate | Median F | G rate | All-in USD / success | Median human min / success |
|-------|--------------|----------|--------|----------------------|----------------------------|
| Frontier-A | 0.80 | 1.00 | 0.93 | 2.40 | 18 |
| Mid-B | 0.47 | 0.67 | 0.87 | 1.10 | 35 |
| Local-C | 0.20 | 0.33 | 0.80 | 0.05 | 50 |

Mid-B is "cheaper per successful run" only if you ignore the failures. All-in, Frontier-A may still
win: fewer retries, less reviewer time. Local-C is almost free in tokens and expensive in humans.
That is the comparison I want the log to make visible -- not a single composite that hides the
trade-off.

Collecting the cheap fields does not need a platform:

```bash
git rev-parse HEAD > /tmp/sha_before
# run existing sensors, store the summary
pnpm build; echo $? > /tmp/baseline_exit

# ... agent attempt ...

git diff --numstat "$(cat /tmp/sha_before)"
git diff --name-only "$(cat /tmp/sha_before)"
pnpm build; echo $? > /tmp/after_exit
```

Token counts come from the session (provider usage, or the harness footer). USD is
`input_tokens / 1e6 * input_usd_per_mtok + output_tokens / 1e6 * output_usd_per_mtok` -- record the
rates on the run, do not look them up later. Human minutes are a timer, not a guess the next day.

When a DoD item has no command, run the judge against the frozen statement, the diff, and the
sensor logs -- not against the implementer's chain of thought. Calibrate that judge on a handful of
human-labeled tickets before you use it to rank models. The [bias checks](/ai/evaluation-and-llmops/#llm-as-judge-bias-checks)
apply: verbosity bias will crown the model that writes more files.

### What still stays qualitative

The record will not catch misdiagnosis ("fixed the wrong bug"), political fit, or a spec that was
wrong. Those stay on the human at merge. The point of the numbers is to stop arguing from one
memorable session, and to stop picking models on list price.

## A starter kit

You do not need a platform. You need a small, coherent set:

| Stage | Put this in place |
|-------|-------------------|
| Standing guides | `AGENTS.md` with install/build/test commands and hard boundaries |
| On-demand guides | One or two [skills](/ai/skills/) for review and "how we add a page" |
| Cheap sensors | Format, types, unit tests, or this site's `pnpm build` |
| Shared sensors | [Hooks](/git/beginners-guide/hooks-and-automation/) + CI repeating the cheap set |
| Semantic sensors | Fresh-context review agent against the ticket |
| Run record | Frozen DoD + JSONL of F, G, L, tokens, USD, human minutes |
| Human | Merge authority, plus anything destructive or unspecified |

Not every codebase is equally harnessable. Typed languages, clear modules, and boring frameworks
give you sensors for free. A tangled legacy app is where you need the harness most and can build
it least -- start with the slice you are actually changing, not a fantasy of full architecture
fitness on day one.

## See also

- [AI-Assisted Software Development](/ai/ai-assisted-development/) -- SPDD, architect-as-orchestrator, evidence
- [AI Agent Harnesses](/ai/agent-harnesses/) -- the inner runtime (opencode, pi, herdr)
- [Project Memory & Rules](/ai/project-memory-and-rules/) -- `AGENTS.md`, Cursor rules, Copilot instructions
- [Agent Skills](/ai/skills/) -- on-demand workflows
- [Evaluation & LLMOps](/ai/evaluation-and-llmops/) -- eval harnesses, judges, non-determinism
- [Eval Datasets & Synthetic Data](/ai/eval-datasets-and-synthetic-data/) -- freeze a ticket corpus
- [Cost, Latency & Model Routing](/ai/cost-and-latency/) -- cost per successful outcome
- [Human-in-the-Loop](/ai/human-in-the-loop/) -- maker-checker and merge authority
- [Birgitta Böckeler, Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)
