---
title: Embeddings Deep Dive
description: How embedding models work, the 2026 model landscape, how to choose one, dimensions and Matryoshka, vector quantization, domain adaptation, hybrid retrieval, and the production pitfalls that quietly halve recall.
tags: [ai, embeddings, rag, vector-database, retrieval]
keywords:
    - embedding models
    - matryoshka representation learning
    - vector quantization
    - hybrid retrieval
    - reranking
    - mteb leaderboard
---

# Embeddings Deep Dive

This page goes one level below [RAG](./rag.md): how the embedding layer actually works in production, how to
choose and operate an embedding model, and the pitfalls that quietly degrade retrieval quality. If you only
need the basics, the [RAG page covers them](./rag.md#embeddings-the-layer-rag-depends-on); come here when you
are building or debugging a retrieval system.

## What an embedding is

An [embedding](./glossary.md#embedding) is a dense numeric vector (typically 384--4096 dimensions)
representing a piece of text, image, or audio, chosen so that semantically similar inputs land close
together in vector space.

- **Dense and semantic.** Unlike sparse one-hot or bag-of-words vectors (mostly zeros, no relationships),
  embeddings are mostly non-zero and meaningful. The classic illustration: `king - man + woman ~= queen`.
- **Static vs context-dependent.** Static embeddings (Word2Vec, GloVe) give a word the same vector
  everywhere. Modern transformer embeddings are contextual: "bank" gets different vectors in "river bank"
  versus "financial bank". Static word embeddings are obsolete for new applications; **sentence-level
  transformer embeddings are the 2026 default.**

## How embedding models are produced

A transformer encoder maps tokenized input through several attention layers and produces a fixed-size
vector per input - often the pooled average over tokens, or a dedicated summary token. The model is
trained with **contrastive objectives**: pairs known to be similar (question + answer, query +
click-through, sentence pairs) should produce close vectors; random pairs should be far apart. Hundreds of
millions of such pairs teach the model a useful geometry.

The two metrics that matter downstream:

- **[Cosine similarity](./glossary.md#cosine-similarity)** - the cosine of the angle between two vectors,
  measuring similarity regardless of length. The standard metric for text. If vectors are normalized to
  unit length, cosine and inner product rank identically (inner product is just faster); otherwise they are
  not interchangeable.
- **[Semantic search](./glossary.md#semantic-search)** - the capability embeddings unlock: a query for
  "what's happening with a fast animal?" can retrieve "the quick brown fox jumps over the lazy dog" with no
  shared keywords.

## The 2026 model landscape

A working snapshot - names and prices change, so check vendor pages before committing.

### Proprietary

| Model | Dimensions | Strengths | Watch out |
|---|---|---|---|
| OpenAI `text-embedding-3-small` | up to 1536 | Cheap, Matryoshka-truncatable, well-rounded | Closed; no fine-tune |
| OpenAI `text-embedding-3-large` | up to 3072 | Strongest OpenAI option; Matryoshka | Most expensive; closed |
| Cohere `embed-v4.0` | 256--1536 | Multimodal; long-context; input-type aware | Closed |
| Voyage `voyage-4` family | 256--2048 | Strong retrieval quality; long-context; domain variants (code, finance, law) | Smaller ecosystem |
| Google `gemini-embedding-2` | up to 3072 | Multimodal; strong multilingual; Gemini stack | Closed |

### Open-source (self-host or via a host)

| Model | Dimensions | Strengths | Watch out |
|---|---|---|---|
| BAAI `bge-m3` | 1024 | Multilingual; dense + sparse + multi-vector in one model | Heavier |
| BAAI `bge-small-en-v1.5` | 384 | Tiny, fast; common tutorial default | English-only; modest quality |
| Microsoft `e5-large-v2` | 1024 | Instruction-tuned ("query:" / "passage:" prefixes) | Prefix discipline matters |
| NVIDIA `nv-embed-v2` | 4096 | Historically top MTEB scores | Large; GPU recommended |
| `jina-embeddings-v3` | 1024 | Long-context (8k), task conditioning | Newer ecosystem |

The [MTEB](https://huggingface.co/spaces/mteb/leaderboard) (Massive Text Embedding Benchmark) leaderboard
is a useful *starting filter*, not truth: it aggregates many benchmark tasks, and your task may be nothing
like the average.

## Choosing a model

Pick along these axes, roughly in this order:

1. **Quality on your task.** Build a small (200--1000 row) eval set from real queries and judged-good
   documents, then measure retrieval recall@k per candidate. Do not trust MTEB blindly.
2. **Cost at scale.** Per-1M-token price x corpus size x refresh rate. Self-hosted open-source has very
   different economics from API pricing.
3. **Latency budget.** Every query is re-embedded, so query-embedding latency is part of every request's p99.
4. **Multilingual / domain.** Global users need multilingual models; finance/legal/code benefit from
   domain-specialized variants.
5. **Operability.** Managed API (low ops, vendor risk) vs self-hosted (control, GPU cost).
6. **Dimension flexibility.** Matryoshka-aware models let you store small and search smaller (see below).

A good 2026 default for English RAG: `text-embedding-3-small` (cheap, well-behaved) or `bge-small-en-v1.5`
(self-hostable). Upgrade only when eval shows the small model is the bottleneck.

## Dimensions, Matryoshka, and quantization

Higher dimensions are not always better - for a fixed model, more dimensions means better quality but more
storage and more ANN compute. Three production levers:

- **Matryoshka Representation Learning (MRL).** Models trained so the first N dimensions are themselves a
  usable embedding. Slice a 1536-dim vector to 256 dims for ~6x less storage and compute at modest quality
  cost. OpenAI `text-embedding-3` supports this via the `dimensions` parameter.
- **[Vector quantization](./glossary.md#vector-quantization).** Store vectors as `int8`, `binary`, or
  `halfvec` instead of `float32` for 2x--32x storage reduction with minimal recall loss. Note this
  compresses the *embedding vectors*, distinct from [model weight quantization](./cloud-vs-local.md#quantization-and-qlora).
  A subtle trap: quantizers optimized purely for reconstruction error (MSE) can bias inner-product
  estimates - for retrieval, what matters is *unbiased similarity preservation*, not reconstruction.
- **Product Quantization (PQ / OPQ).** The classical ANN compression family in FAISS, OpenSearch, and
  Milvus, used when partitioning a very large index matters more than per-vector precision.

Rule of thumb: start at `float32` and full dimension; once it works, quantize to `halfvec` for ~2x storage
reduction or `int8` for ~4x at a small recall hit.

## Domain adaptation

When an off-the-shelf model is not good enough on your data, in increasing order of effort:

1. **Instructions / prefixes.** Many models accept task instructions ("query:" / "passage:" or
   "Represent this query for retrieving supporting documents"). Free, often material.
2. **[Reranking](./glossary.md#reranking).** Run a cross-encoder reranker (Cohere `rerank-v4.0-pro`,
   `bge-reranker-large`) over the top ~50 candidates. Usually a bigger win than swapping the embedding model.
3. **Fine-tuning.** Train the embedding model on (query, positive doc) pairs with `sentence-transformers`
   and a contrastive loss. This can help when your eval set shows domain-specific misses, but the gain is
   workload-specific; require a before/after retrieval eval before taking on the operational cost.
4. **Train a new model.** Almost never the right call for application work.

## Hybrid retrieval

Dense embeddings miss exact-string queries ("error code ABC-1234"); keyword search misses paraphrases ("the
part that won't turn on" vs "ignition failure"). The 2026 answer is **[hybrid retrieval](./glossary.md#hybrid-retrieval)**:
embed the query for both dense (semantic) and sparse (BM25 / SPLADE) retrieval, then fuse with reciprocal
rank fusion or weighted scoring, and rerank on top. Hybrid is first-class in Pinecone, OpenSearch,
Weaviate, Qdrant, and Milvus. **If RAG quality is weak and you are embedding-only, add hybrid retrieval
before anything else** - it is often one of the highest-leverage fixes in enterprise deployments.

## Vector indexes and metadata filtering {#vector-indexes-and-filtering}

Vector indexes are not interchangeable. Use an exact scan as a correctness baseline, then choose an
[ANN](./glossary.md#ann) index for the latency/recall/storage trade-off you can operate. Primary references:
[FAISS index docs](https://github.com/facebookresearch/faiss/wiki/Faiss-indexes), the
[pgvector README](https://github.com/pgvector/pgvector/blob/master/README.md), and
[Microsoft DiskANN](https://www.microsoft.com/en-us/research/project/diskann/).

| Index family | How it works | Best fit | Trade-offs |
|---|---|---|---|
| Flat / exact | Compares the query with every vector | Small corpora, eval baselines, high-selectivity filters | Exact recall; O(N) scan cost |
| HNSW | Navigable graph; tune `M`, `ef_construction`, `ef_search` | Low-latency search with strong recall | Memory-heavy; slower builds; filtered queries need care |
| IVF | Clusters vectors into lists; tune `nlist` and `nprobe` | Large, mostly static corpora | Needs training data; recall drops if too few lists are probed |
| IVF-PQ / PQ | IVF plus product quantization of sub-vectors | Very large indexes with memory pressure | Lossy compression; more tuning and reranking needed |
| DiskANN | Graph search optimized around SSD-resident data | Datasets too large for RAM | Operationally more complex; availability depends on the database |

For pgvector cosine search, the HNSW syntax is:

```sql
CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops);
```

The same README documents `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, and `vector_l1_ops`.
HNSW build options include `m` and `ef_construction`; `hnsw.ef_search` is set at query or session time.
IVFFlat uses `WITH (lists = ...)` at index creation and `ivfflat.probes` at query or session time.
pgvector 0.8.0 also documents iterative scans (`hnsw.iterative_scan` and `ivfflat.iterative_scan`) so a
filtered ANN query can scan farther until enough post-filtered rows are found, subject to configured caps.

Metadata filtering is both a quality lever and a security boundary:

- **Pre-filter when possible.** Restrict by tenant, document ACL, language, source, or time range before ANN
  search, or partition the index by those boundaries. This preserves recall better for selective filters.
- **Post-filtering can silently lose recall.** If ANN first retrieves global neighbors and then applies
  `WHERE tenant_id = ...`, the relevant tenant-local neighbors may never be visited. Over-fetching,
  iterative scans, exact fallback, or per-tenant indexes can mitigate this.
- **Do not delegate permissions to the LLM.** Enforce tenant isolation and access control in the retrieval
  layer before any chunk enters the prompt. The model can summarize allowed context; it must not decide
  which private documents the user may see.

## Production pitfalls

- **Query/document asymmetry.** Many models (E5, BGE, Cohere v3/v4) need different prefixes or input-types for
  queries vs documents. Forgetting this can severely reduce recall.
- **Chunk-size mismatch.** Each model has a natural chunk size: short chunks may work well for small models,
  while long-context APIs such as `voyage-4` can accept tens of thousands of tokens. Benchmark instead of
  assuming one universal size.
- **Stale index.** Source content changes over time; re-embed changed documents and schedule periodic
  refreshes when freshness matters.
- **Model swap = full re-embed.** Changing embedding models means re-embedding the whole corpus. Treat the
  embedding model as a versioned artifact.
- **Cosine vs inner product.** Verify vectors are normalized before relying on inner product; otherwise use
  cosine.
- **Evaluating at the wrong stage.** Embedding recall alone is not the goal; score *end-to-end RAG answer
  quality* with a harness (see [Evaluation and LLMOps](./evaluation-and-llmops.md)).

## See also

- [RAG](./rag.md) - the canonical embedding-driven application
- [Tooling and Frameworks](./tooling.md) - vector databases, rerankers, and the broader stack
- [Evaluation and LLMOps](./evaluation-and-llmops.md) - measuring retrieval and answer quality
- [Knowledge Management with LLMs](./knowledge-management.md) - where embeddings sit among retrieval strategies
- [AI Glossary](./glossary.md) - embedding, cosine similarity, vector quantization, reranking, and more
