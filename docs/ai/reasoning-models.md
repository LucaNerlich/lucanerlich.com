---
title: Reasoning Models & Test-Time Compute
description: How reasoning models spend extra inference-time tokens, how provider controls differ, and when the extra cost and latency are worth it.
tags: [ai, reasoning-models, llm]
keywords:
    - reasoning models
    - test time compute
    - thinking tokens
    - reasoning effort
    - chain of thought
---

# Reasoning Models & Test-Time Compute

A reasoning model is an [LLM](./llm.md) trained and served so it can spend extra inference-time work on hard
problems before giving the final answer. Providers use different names: OpenAI calls them reasoning models,
Anthropic calls the feature thinking, and Google Gemini documents a thinking process for Gemini 3 and 2.5.

The shared idea is **test-time compute**: instead of doing a fixed amount of work for every prompt, the model
can allocate more generated reasoning or thinking tokens to planning, checking, tool use, and recovery from
ambiguity. That can improve hard-task accuracy, but it also increases latency and output-token cost.

## What makes a model a reasoning model

Most modern chat models can reason to some degree. Reasoning models make that behavior a first-class product
feature:

- They are post-trained, often with reinforcement learning, to solve multi-step tasks and verify intermediate
  work more reliably.
- They generate internal, hidden, or summarized reasoning before the visible answer.
- They expose controls for how much effort to spend.
- They are usually best through APIs that preserve reasoning state across tools and turns.

Open-weight examples show the training pattern clearly. DeepSeek describes DeepSeek-R1-Zero as trained with
large-scale reinforcement learning without preliminary supervised fine-tuning, producing long reasoning
behaviors before answering. Qwen3 documents thinking and non-thinking modes. OpenAI's gpt-oss model cards
expose configurable reasoning effort for open-weight models.

## Test-time compute scaling

At inference time, a standard model samples visible output tokens. A reasoning model may first sample hidden or
summarized reasoning tokens, then produce visible output. More reasoning budget can help on tasks where the
model benefits from search, decomposition, verification, or tool planning.

Good fits include:

- Difficult coding and debugging tasks.
- Math, logic, data analysis, and scientific reasoning.
- Ambiguous planning where the model must compare alternatives.
- Long agent loops with tool calls and state transitions.
- High-stakes answers where a slower, checked response is acceptable.

Poor fits include:

- Simple extraction, classification, routing, and rewriting.
- High-volume low-margin tasks.
- UI interactions where latency matters more than marginal quality.
- Work that should be delegated to deterministic code or database queries.
- Any task where you have no eval proving the extra spend helps.

See [Cost, Latency & Model Routing](./cost-and-latency.md) before putting reasoning models on a hot path.

## Reasoning tokens are still tokens

Reasoning or thinking tokens may be hidden, summarized, encrypted, or omitted from the response. They still
matter operationally.

| Provider | Current behavior to plan for |
|---|---|
| OpenAI | Reasoning models use internal reasoning tokens before the response. They count in context and are billed as output tokens. `max_output_tokens` covers reasoning tokens plus visible output and formatting tokens. |
| Anthropic | Claude thinking tokens are billed as output tokens and count toward `max_tokens`. Thinking blocks may contain summaries rather than raw chain-of-thought. |
| Google Gemini | Gemini reports thought-token usage fields such as `thoughtsTokenCount` or `total_thought_tokens`; `max_output_tokens` includes thought tokens and can leave no room for visible output if set too low. |

The product lesson: hidden work is not free. Track reasoning-token usage separately from visible answer length
when you compare models.

## Provider controls

The parameter names are not portable.

### OpenAI

OpenAI's Responses API accepts a `reasoning` object for reasoning models. Current docs include values such as `none`, `minimal`, `low`,
`medium`, `high`, `xhigh`, and `max`, but not every model supports every value. OpenAI's
[GPT-6 migration guide](https://developers.openai.com/api/docs/guides/latest-model) also says to remove sampling
parameters such as `temperature`, `top_p`, and `top_logprobs` when reasoning effort is not `none`.

### Anthropic

Claude has two thinking-era control styles:

- **Adaptive thinking** on newer models, with `thinking: {"type": "adaptive"}` where needed and effort controlled
  through `output_config.effort` values such as `low`, `medium`, `high`, `xhigh`, and `max` on models that support
  them.
- **Manual extended thinking** on older supported models, with `thinking: {"type": "enabled", "budget_tokens": N}`.

Anthropic documents manual extended thinking as deprecated on Claude 4.6, rejected by Claude 4.7 and later, and
replaced by adaptive thinking where available. Re-check the per-model table before copying parameters.

### Google Gemini

Gemini has two families of controls:

- Gemini 3 thinking uses `thinkingConfig.thinkingLevel` or API-specific snake_case equivalents such as
  `thinking_level`. Gemini 3.8 Flash supports levels such as `low`, `medium`, and `high`; other Gemini 3 models
  can differ, and some docs also list `minimal`.
- Gemini 2.5 thinking uses `thinkingBudget` or `thinking_budget`. Ranges are model-specific. `-1` enables dynamic
  thinking, and `0` disables thinking only on models that support disabling it. Gemini 2.5 Pro cannot disable
  thinking.

Google's Gemini 3.8 Flash migration guidance also says to replace `thinking_budget` with `thinking_level` and
remove deprecated sampling parameters such as `temperature`, `top_p`, and `top_k`.

## Prompting differences

Do not prompt reasoning models as if they were older chain-of-thought demos.

Better prompts:

- State the goal and the success criteria.
- Provide the relevant context and tools.
- Ask for a concise final explanation, not raw scratch work.
- Let the model choose decomposition unless a workflow requires a fixed procedure.
- Use evals to tune effort levels rather than always choosing the maximum.

Avoid prompts like `Think step by step and show all hidden reasoning before answering`. Prefer task-focused
instructions such as `Find the smallest correct fix. Use tools when needed. In the final answer, include the root
cause, changed files, and validation result. Keep the explanation under five bullets`.

See [Prompt Engineering Basics](./prompt-engineering.md) for the general prompting foundation.

## Tool use and interleaved thinking

Reasoning models often shine in agent loops because they can think, call a tool, inspect the result, and think
again. Providers expose this differently:

- OpenAI Responses can return multiple output items, including tool calls and reasoning items. Use the Responses
  API for reasoning workloads and follow its reasoning-preservation guidance in multi-turn loops.
- Anthropic thinking can appear before and between tool calls. Thinking blocks include signatures and must be
  passed back unchanged when the conversation continues.
- Gemini's Interactions API surfaces thought steps chronologically alongside user inputs, function calls, and
  model output. Stateless Gemini tool loops must preserve thought signatures; stateful interactions can refer to
  earlier interactions.

The engineering rule is simple: preserve provider-owned reasoning artifacts exactly as documented. If you strip,
edit, or summarize them yourself, the next turn may be worse or rejected.

## Preserving reasoning across turns

Provider APIs are increasingly explicit that reasoning state is part of the conversation, even when it is hidden.

For OpenAI, use `previous_response_id`, conversations, or replay the complete `output` items for stateless calls.
OpenAI documents encrypted reasoning items in Responses output and a `reasoning.context` option on supported
models.

For Anthropic, keep thinking blocks and signatures unchanged when returning prior assistant turns. Anthropic's
troubleshooting docs state that modified thinking blocks can cause request errors.

For Gemini, keep thought signatures in stateless multi-turn interactions, or use stateful Interactions with a
`previous_interaction_id` when that fits your architecture.

Do not convert these artifacts into user-visible summaries unless the provider says that is safe.

## Evaluation and cost implications

Reasoning controls are knobs, not proof of quality. Evaluate them like any other model-routing decision:

- Compare `low`, `medium`, and higher effort on the same eval set.
- Measure answer quality, pass rate, latency, and total output tokens.
- Include tool-loop tasks if your product uses tools.
- Track truncation: too-small output caps can spend the budget on thinking and cut off the final answer.
- Route simple tasks to cheaper models when evals show no benefit from reasoning.

See [Evaluation and LLMOps](./evaluation-and-llmops.md) for eval design and
[Cost, Latency & Model Routing](./cost-and-latency.md) for token economics.

## Open-weight reasoning models

Open-weight reasoning models are useful for privacy, offline work, research, and cost control, but they still
need evals against your tasks.

- **DeepSeek-R1**: DeepSeek's public repository describes R1-Zero as reinforcement-learning-trained and R1 as
  adding cold-start and staged data to improve usability. DeepSeek also publishes usage recommendations for the
  R1 series.
- **Qwen3**: Qwen documents thinking and non-thinking modes. Some Qwen3 models can switch modes with settings
  such as `enable_thinking=False` or prompt controls like `/think` and `/no_think`; newer Qwen3 releases also
  split Instruct and Thinking variants.
- **gpt-oss**: OpenAI's Hugging Face model cards for `gpt-oss-120b` and `gpt-oss-20b` describe Apache 2.0
  open-weight models with configurable reasoning effort levels `low`, `medium`, and `high`.

Open weights can expose more visible reasoning than hosted APIs. Do not show raw chain-of-thought to end users
by default; use it for debugging, auditing, or research where appropriate.

## Faithfulness caveat

Visible reasoning is not guaranteed to be a faithful transcript of the computation that caused the answer.
Anthropic's research post [Reasoning models do not always say what they think](https://www.anthropic.com/research/reasoning-models-dont-say-think)
reports that chain-of-thought summaries can omit or misrepresent influential factors. Treat visible reasoning as
an explanation artifact, not perfect evidence of causality.

For production systems, prefer external checks: tests, tools, citations, validators, and human review for
sensitive decisions.

## API example

This OpenAI Python SDK example sets reasoning effort on the Responses API. Use a model available to your account
and re-check the effort values for that model.

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Find the bug in this function and return a minimal patch explanation:

def average(values):
    return sum(values) / len(values)
"""

response = client.responses.create(
    model="gpt-6-astra",
    reasoning={"effort": "low"},
    input=[{"role": "user", "content": prompt}],
)

print(response.output_text)
```

Raise effort only after evals show the additional reasoning tokens improve outcomes enough to justify cost and
latency.

## See also

- [Large Language Models](./llm.md) - transformer generation and sampling basics
- [Prompt Engineering Basics](./prompt-engineering.md) - writing instructions for model behavior
- [Cost, Latency & Model Routing](./cost-and-latency.md) - when reasoning cost is worth it
- [Evaluation and LLMOps](./evaluation-and-llmops.md) - measuring reasoning quality
- [LLM Serving at Scale](./llm-serving.md) - serving mechanics behind inference latency
- [Cloud vs Local Models](./cloud-vs-local.md) - choosing hosted or open-weight models
