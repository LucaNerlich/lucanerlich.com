---
title: AI Regulation for Builders
description: A practical, builder-focused snapshot of AI regulation, including the EU AI Act, GDPR interplay, NIST AI RMF, ISO/IEC 42001, and implementation checklists.
tags: [ai, regulation, compliance]
keywords:
    - ai regulation
    - eu ai act
    - gpai code of practice
    - nist ai rmf
    - iso 42001
---

# AI Regulation for Builders

:::note
This page is not legal advice.
It is an engineering snapshot as of September 2026.
AI law changes quickly; verify the cited primary sources and talk to counsel before relying on dates,
classifications, or obligations for a launch.
:::

Builders do not need to become lawyers, but they do need to know which facts lawyers and compliance teams
will ask for: what the system does, which data it uses, who is affected, how humans supervise it, and what
evidence exists when something goes wrong.

## EU AI Act snapshot

The EU AI Act is Regulation (EU) 2024/1689.
Use the consolidated text on EUR-Lex for legally binding wording, and the European Commission and AI Act
Service Desk pages for implementation guidance:

- EUR-Lex consolidated AI Act: <https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng>
- AI Act implementation timeline: <https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act>
- European Commission AI Act policy page: <https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai>

### Risk-based tiers

The Act uses a risk-based structure.
For builders, the first task is classification:

| Tier | What it means | Builder consequence |
|---|---|---|
| Prohibited risk | AI practices the Act bans, such as listed manipulative or abusive practices | Do not build or deploy |
| High-risk | Systems in listed sensitive uses or AI embedded in regulated products | Risk management, data governance, technical documentation, logging, human oversight, conformity duties |
| Limited / transparency risk | Systems such as chatbots or synthetic-content systems that can mislead people about AI involvement | Disclose AI interaction and label covered synthetic or manipulated content |
| Minimal risk | Systems outside the above categories | Few AI Act-specific duties, but other laws still apply |

Do not classify by model size alone.
Classify by use case, affected people, deployment context, and whether the system is a component of a
regulated product.

### Key application dates

The official timeline is staggered:

- **1 August 2024** - the AI Act entered into force.
- **2 February 2025** - prohibited-practice rules and AI literacy duties started applying.
- **2 August 2025** - general-purpose AI model obligations started applying for covered providers.
- **2 August 2026** - most remaining obligations started applying, including Article 50 transparency duties.
- **2 December 2027** - after the adopted AI Digital Omnibus amendment, obligations for many standalone
  high-risk systems listed in Annex III apply from this date.
- **2 August 2028** - after the same adopted amendment, obligations for high-risk AI embedded in Annex I
  regulated products apply from this date.

The Digital Omnibus point matters.
The Commission proposed AI Act timing amendments in November 2025.
As of this September 2026 snapshot, the high-risk timing changes above are not merely proposed; they were
adopted through Regulation (EU) 2026/1744 and reflected in the Commission's AI Omnibus materials:
<https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng> and
<https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force>.
Still, verify the latest consolidated text and Commission timeline before shipping.

### GPAI model obligations

General-purpose AI (GPAI) obligations apply to providers of covered models.
The Commission's GPAI pages describe documentation, downstream information, copyright-policy, and
training-content summary duties, with extra safety, incident, and cybersecurity duties for GPAI models with
systemic risk:
<https://digital-strategy.ec.europa.eu/en/factpages/general-purpose-ai-obligations-under-ai-act>.

The GPAI Code of Practice is a voluntary compliance tool published by the Commission to help providers show
how they meet the Act's GPAI obligations:
<https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai>.
Using the Code does not remove the need to classify your own role: provider, deployer, importer, distributor,
or product manufacturer.

### Article 50 transparency duties

Article 50 is the rule most product teams notice first.
It requires clear disclosure in covered cases, including:

- Informing people when they are directly interacting with an AI system, unless this is obvious from context.
- Marking AI-generated or manipulated output from covered systems in machine-readable ways where required.
- Disclosing deepfakes and certain AI-generated text published on matters of public interest.
- Informing people when covered emotion-recognition or biometric-categorisation systems are used.

The Commission's Article 50 guidance and transparency materials confirm the 2 August 2026 application date
for these transparency duties:
<https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations>.
For builders, this means UI copy, labels, metadata, logging, and content provenance are compliance features,
not last-minute text decorations.

## GDPR interplay

AI Act compliance does not replace GDPR compliance.
If the system processes personal data, you still need the GDPR basics:

- **Lawful basis** for processing personal data.
- **Purpose limitation and data minimization** for prompts, retrieved context, logs, and vectors.
- **Data subject rights** such as access, deletion, correction, and objection where applicable.
- **DPIA** when processing is likely to create high risk, especially with new technologies or large-scale
  sensitive processing.
- **Article 22 analysis** when decisions are based solely on automated processing and produce legal or
  similarly significant effects.
- **Processor contracts and DPAs** for model, hosting, analytics, observability, and support vendors.

The official GDPR text is Regulation (EU) 2016/679:
<https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng>.
For engineering patterns, see [Privacy & Data Handling](./privacy-and-data.md).

## NIST AI RMF and Generative AI Profile

The NIST AI Risk Management Framework is voluntary guidance, not a law, but it gives builders a useful
operating model.
The four core functions are:

- **Govern** - policies, accountability, roles, inventory, and risk culture.
- **Map** - system context, intended use, affected people, data, and risk assumptions.
- **Measure** - tests, evals, monitoring, and evidence for trustworthiness.
- **Manage** - prioritize, mitigate, accept, transfer, or escalate risk.

Primary sources:

- NIST AI RMF 1.0, NIST AI 100-1: <https://doi.org/10.6028/NIST.AI.100-1>
- NIST Generative AI Profile, NIST AI 600-1: <https://doi.org/10.6028/NIST.AI.600-1>

The Generative AI Profile extends the RMF for generative AI risks such as confabulation, data privacy,
information integrity, information security, harmful bias, intellectual property, and value-chain risk.
Use it to turn broad safety concerns into evals, controls, and incident-response tasks.

## ISO/IEC 42001

ISO/IEC 42001:2023 is the international management-system standard for organizations that develop, provide,
or use AI systems.
The official ISO page describes it as specifying requirements for establishing, implementing, maintaining,
and continually improving an AI management system:
<https://www.iso.org/standard/42001>.

For builders, ISO/IEC 42001 is useful vocabulary for operational evidence:
policy, roles, risk assessment, impact assessment, supplier controls, monitoring, audit, and continual
improvement.
It is not a substitute for product-specific legal analysis, but it can organize the work.

## United States snapshot

US AI regulation is a patchwork of federal agency actions, state laws, sector rules, procurement rules, and
executive-branch priorities that change frequently.
Avoid writing one generic "US compliant" claim into product docs.
Instead, map each system to the states, sectors, users, and decisions it affects.

Colorado is a good example of the moving state-law landscape: the Colorado Attorney General maintains an
official AI rulemaking page for the state's anti-discrimination in AI law:
<https://coag.gov/ai/>.
Treat such official regulator pages as fresher sources than vendor checklists.

## Practical builder checklist

Before launch, assemble evidence for the system rather than a slide deck after the fact:

- [ ] Inventory every AI system, model, tool, retrieval index, and vendor.
- [ ] Classify the use case under the EU AI Act and any relevant local law.
- [ ] Document whether you are provider, deployer, importer, distributor, or product manufacturer.
- [ ] Record data sources, licenses, retention, and whether personal data is processed.
- [ ] Add user-facing transparency notices for AI interaction and synthetic content.
- [ ] Define human oversight for high-impact recommendations or actions.
- [ ] Log prompts, outputs, tool calls, model versions, and human overrides with retention limits.
- [ ] Put DPAs and subprocessor reviews in place for vendors.
- [ ] Run privacy, safety, security, and bias evals before release.
- [ ] Maintain an incident process for harmful output, data leakage, deepfakes, and model or vendor changes.
- [ ] Version prompts, eval datasets, policies, and model choices together.
- [ ] Recheck dates and regulator guidance before expanding to a new geography or sector.

## See also

- [Privacy & Data Handling](./privacy-and-data.md) - PII, lawful basis, DPAs, retention, and deletion
- [AI Safety & Guardrails](./safety.md) - red-teaming, guardrails, and defense in depth
- [Human-in-the-Loop](./human-in-the-loop.md) - oversight, approval, audit, and escalation patterns
- [Evaluation and LLMOps](./evaluation-and-llmops.md) - eval evidence, traces, and operational monitoring
- [Eval Datasets & Synthetic Data](./eval-datasets-and-synthetic-data.md) - datasets that support governance checks
