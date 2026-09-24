---
title: Fine-Tuning & Model Adaptation
description: How to choose between prompting, RAG, supervised fine-tuning, preference tuning, LoRA, QLoRA, distillation, and continued pretraining without using the wrong tool for knowledge injection.
tags: [ai, fine-tuning, model-adaptation, llmops]
keywords:
    - fine tuning
    - model adaptation
    - lora
    - qlora
    - supervised fine tuning
    - preference tuning
---

# Fine-Tuning & Model Adaptation

Fine-tuning changes model behavior by continuing training on task-specific data. It is powerful, expensive
relative to prompting, and easy to misuse. The first rule is: do not fine-tune just because the model needs
new facts. For changing knowledge, start with [RAG](./rag.md) and the existing
[RAG vs fine-tuning](./rag.md#rag-vs-fine-tuning) distinction: facts should usually live outside the model;
style and behavior may belong in the weights.

## The adaptation ladder

Use the cheapest reliable adaptation that passes your evals.

| Step | What changes | Best for | Stop if |
|---|---|---|---|
| Prompting | Instructions and examples in the request | Format, tone, one-off tasks | Evals pass with acceptable cost |
| [RAG](./rag.md) | Retrieved context at inference time | Fresh/private facts, citations, permissions | Retrieval and grounding are good enough |
| Fine-tuning | Some or all model weights | Stable behavior, style, task format, narrow skills | It beats prompting/RAG on held-out evals |
| Continued pretraining | Broad next-token training on domain corpus | Domain language before later instruction tuning | You have scale, data rights, and ML ops |

:::warning
Fine-tuning is usually the wrong tool for **knowledge injection**. It cannot cite sources, updates require
new training, and the model may still hallucinate. If the question is "how do I teach the model our docs?",
use [RAG](./rag.md) first.
:::

## What fine-tuning is good for

Fine-tuning is worth considering when the desired behavior is stable and repeated:

- **Format and style.** Short, consistent outputs; house tone; strict response templates.
- **Narrow classification or extraction.** Labels, fields, routing decisions, or entity extraction where the
  target schema is known.
- **Smaller or cheaper models.** Train a smaller model to imitate a larger prompt-heavy flow when evals prove
  quality holds.
- **Domain jargon and instruction-following.** Specialized terminology or repeated prompt-resistance that can
  be demonstrated with many high-quality examples.

It is often a bad fit for rapidly changing facts, broad reasoning improvements, low-data experiments, or tasks
where humans cannot agree on the correct answer.

## Decision table

| Situation | Better first move | Fine-tune only if |
|---|---|---|
| Answers must cite current documents | [RAG](./rag.md) | You also need a fixed answer style |
| Output must match a schema | Prompting + [structured outputs](./structured-outputs.md) | The model still breaks the contract on evals |
| Support bot uses internal policy | RAG + evals | The tone or triage labels remain inconsistent |
| High-volume classification | Prompt small model, measure | SFT improves quality or cost on held-out data |
| Need a smaller model | Distillation or SFT | Provider/model license allows it |
| Model lacks domain vocabulary | Few-shot examples, glossary in context | Jargon is stable and appears often |
| Need new general capability | Model selection, routing, or tool use | You have expert data and evaluation budget |

## Main training methods

### Supervised fine-tuning (SFT)

SFT trains on examples of the desired input and output. In chat models, examples are usually message lists
that are rendered through the model's chat template. Hugging Face TRL documents conversational SFT datasets
with a `messages` column, and the current `SFTTrainer` automatically applies the chat template for those
formats. Transformers documents that chat templates convert `{role, content}` messages into the control tokens
expected by the model.

Use SFT when you can write or curate excellent target answers. Bad labels teach bad behavior faster than they
add knowledge.

### Preference tuning: DPO and RLHF/PPO

Preference tuning uses comparisons, such as "chosen" vs "rejected" answers, when the desired answer is easier
to rank than to write. [Direct Preference Optimization](https://arxiv.org/abs/2305.18290) (DPO) optimizes a
policy directly from preference pairs without a separate reward-model-plus-RL loop. It is useful for tone,
summary focus, refusals, and other subjective preferences that still have a clear winner.

Classic RLHF often trains a reward model from human preferences and then optimizes the model with PPO; the
InstructGPT paper is the canonical example: [Training language models to follow instructions with human
feedback](https://arxiv.org/abs/2203.02155). PPO-style RLHF is more operationally complex than SFT or DPO
because the reward model, KL control, sampling loop, and policy updates all need monitoring.

### GRPO and RL with verifiable rewards

[DeepSeekMath](https://arxiv.org/abs/2402.03300) introduced Group Relative Policy Optimization (GRPO), a PPO
variant that estimates the baseline from a group of sampled responses instead of training a separate critic.
Later analyses of [reinforcement learning with verifiable rewards](https://arxiv.org/abs/2503.06639) describe
using binary or executable rewards, such as exact answer checks, unit tests, or format checks. This is strongest
when the reward is actually verifiable. If the reward is an uncalibrated judge prompt, you are back to the usual
LLM-as-judge risks.

## Parameter-efficient adaptation

### LoRA

[LoRA](https://huggingface.co/papers/2106.09685) freezes the base model and trains small low-rank matrices
inside selected layers. PEFT's LoRA docs describe the main knobs:

- `r` is the rank. Higher rank gives more trainable capacity and more memory cost.
- `lora_alpha` is the scaling factor for the adapter update.
- `target_modules` selects which modules receive adapters. PEFT documents `target_modules="all-linear"` as
  the QLoRA-style shortcut for all linear layers, while model-specific names such as `q_proj` and `v_proj`
  are common for attention-only LoRA.
- `lora_dropout` regularizes the adapter path.

LoRA adapters are small enough to store, version, swap, and sometimes serve per tenant. See
[Serving LLMs at Scale](./llm-serving.md) for multi-adapter serving considerations.

### QLoRA

[QLoRA](https://arxiv.org/abs/2305.14314) fine-tunes LoRA adapters while the base model is loaded in 4-bit
quantized form. The paper introduced 4-bit NormalFloat (NF4), double quantization, and paged optimizers to
reduce memory. In practice, QLoRA is a way to make SFT or preference tuning possible on smaller hardware; it
is not a different objective.

## Distillation

Distillation trains a smaller or cheaper **student** from outputs produced by a stronger **teacher**. It can
reduce cost and latency, but it is still model training: keep a held-out eval, check the teacher's errors, and
review the teacher provider's terms before using generated outputs as training data. Amazon Bedrock's model
customization docs list distillation as a managed teacher-to-student workflow.

## Data preparation

Good fine-tuning data is boring, consistent, and rights-cleared.

- Prefer a small set of excellent examples over a large noisy dump. The QLoRA paper explicitly found data
  quality more important than dataset size for its instruction-tuning study.
- Match the production input distribution: languages, length, missing fields, refusals, and edge cases.
- Use the model's chat template for chat SFT; do not hand-roll control tokens unless the model card says so.
- Split data into train, validation, and held-out test sets; deduplicate near-identical examples across splits.
- Preserve metadata: source, license, author, labeler, date, risk class, and reason for inclusion.
- Keep examples that should **not** be answered, especially for safety and privacy behavior.

Example JSONL chat-format line accepted by TRL's conversational SFT format:

```json
{"messages":[{"role":"system","content":"You are a concise support classifier."},{"role":"user","content":"The invoice total is wrong after my plan change."},{"role":"assistant","content":"{\"category\":\"billing\",\"priority\":\"normal\"}"}]}
```

## Minimal LoRA SFT with TRL and PEFT

This example uses the current TRL `SFTTrainer` / `SFTConfig` API, PEFT `LoraConfig`, `peft_config=`, and
`processing_class=` for the tokenizer. It is intentionally tiny; replace the toy examples with your curated
JSONL dataset before training anything real. `assistant_only_loss=True` needs a chat template with
`{% generation %}` markers; TRL patches known families such as Qwen3 automatically, but for other models
check the template first (see the [TRL SFT docs](https://huggingface.co/docs/trl/en/sft_trainer#train-on-assistant-messages-only)).

```python
from datasets import Dataset
from peft import LoraConfig
from transformers import AutoTokenizer
from trl import SFTConfig, SFTTrainer

model_id = "Qwen/Qwen3-0.6B"

examples = [
    {"messages": [
        {"role": "system", "content": "You classify support tickets as JSON."},
        {"role": "user", "content": "My invoice total is wrong after upgrading."},
        {"role": "assistant", "content": '{"category":"billing","priority":"normal"}'},
    ]},
    {"messages": [
        {"role": "system", "content": "You classify support tickets as JSON."},
        {"role": "user", "content": "I cannot sign in after resetting my password."},
        {"role": "assistant", "content": '{"category":"login","priority":"high"}'},
    ]},
]

dataset = Dataset.from_list(examples).train_test_split(test_size=0.5, seed=42)
tokenizer = AutoTokenizer.from_pretrained(model_id)

peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    target_modules="all-linear",
)

training_args = SFTConfig(
    output_dir="output/qwen3-lora-sft",
    max_steps=10,
    per_device_train_batch_size=1,
    learning_rate=1e-4,
    max_length=1024,
    assistant_only_loss=True,
    report_to="none",
)

trainer = SFTTrainer(
    model=model_id,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    processing_class=tokenizer,
    peft_config=peft_config,
)

trainer.train()
trainer.save_model("output/qwen3-lora-sft")
```

## Catastrophic forgetting and overfitting

Fine-tuning can degrade behavior the base model already had. Symptoms include worse general knowledge, weaker
safety behavior, brittle formatting outside the training distribution, and new hallucinations in adjacent tasks.
Mitigations: lower learning rate, fewer epochs, LoRA instead of full fine-tuning, mixed retention data,
regularization, early stopping, and held-out evals that cover both the new task and old must-not-break behavior.

## Hosted fine-tuning APIs verified for this update

Provider surfaces change quickly; re-check these docs before procurement or architecture decisions.

| Provider | Methods verified in docs | Important caveat |
|---|---|---|
| [OpenAI model optimization](https://developers.openai.com/api/docs/guides/model-optimization) | SFT, vision fine-tuning, DPO, RFT | The same docs say the fine-tuning platform is winding down and is no longer accessible to new users. |
| [Google Cloud Gemini tuning](https://cloud.google.com/vertex-ai/generative-ai/docs/models/tune-models) | Supervised fine-tuning, preference tuning, continuous tuning/checkpoints | Supported models vary by data type and region; use the linked model-specific pages. |
| [Amazon Bedrock model customization](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html) | Supervised fine-tuning, reinforcement fine-tuning, distillation | Availability depends on model, region, quotas, and pricing. |

## Evaluation before and after

Do not ship a fine-tune because the training loss went down. Measure the application behavior.

- Build the eval first; see [Evaluation and LLMOps](./evaluation-and-llmops.md).
- Keep train, validation, and held-out test data separate; see [Eval Datasets and Synthetic Data](./eval-datasets-and-synthetic-data.md).
- Compare the base model, prompted baseline, RAG baseline, and fine-tuned model under the same harness.
- Track task quality, schema validity, refusal behavior, latency, token cost, and regressions on unrelated tasks.
- Pin the base model, tokenizer, adapter, dataset version, and training config so results are reproducible.

## Licensing and model rights

Open weights are not the same as unrestricted rights. Before training or serving an adapted model, check:

- The base model license and acceptable-use policy.
- Whether commercial use, hosted serving, distillation, or adapter redistribution is allowed.
- Dataset copyright, privacy, consent, customer-data restrictions, and whether generated outputs may train another model.
- Whether publishing LoRA adapters leaks sensitive examples or memorized text.

## See also

- [RAG](./rag.md) - use retrieval for facts and citations
- [RAG vs fine-tuning](./rag.md#rag-vs-fine-tuning) - the core distinction
- [Evaluation and LLMOps](./evaluation-and-llmops.md) - evals, scorers, and monitoring
- [Eval Datasets and Synthetic Data](./eval-datasets-and-synthetic-data.md) - train/test splits and golden data
- [Serving LLMs at Scale](./llm-serving.md) - adapter serving and inference trade-offs
- [Choosing a Model & Reading Benchmarks](./model-selection.md) - choose a base model before tuning it
