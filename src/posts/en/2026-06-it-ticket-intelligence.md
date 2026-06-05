---
title: "Building an AI clustering pipeline for enterprise IT support"
date: "2026-06-05"
tags: ["AI", "Azure", "Python", "NLP", "Data Engineering"]
excerpt: "How I designed an end-to-end pipeline to cluster half a million ServiceNow tickets using Azure OpenAI, HDBSCAN, and semantic embeddings — and what I learned along the way."
---

## The problem

A large multinational had accumulated close to half a million IT support tickets in a single year — incidents, service desk interactions, service tasks — all managed through ServiceNow. The data was there, but nobody could extract signal from the noise.

The question was direct: *what are people actually asking for, and what's breaking most often?*

Manual analysis at that scale is impossible. The answer was a fully automated pipeline capable of ingesting raw ticket data, cleaning and normalising it with an LLM, clustering it semantically, and surfacing results in interactive HTML reports for operations managers.

---

## Architecture at a glance

The system runs three parallel pipelines — incidents (INC), interactions (INT), service tasks (TASK) — which then converge in a fourth global pipeline that reasons across all entity types.

```
ServiceNow CSV/XLSX
        │
  0_raw → 1_preprocessed → 2_filtered → 3_normalized
        │                               │
        │                          Azure OpenAI
        │                      (structured rewrite)
        │
  5_topics → 6_subclusters → 7_clustered
        │         │
  Azure embeddings   HDBSCAN auto-tune
  + UMAP-15D         + LLM labeling
        │
  8_unified → 9_global (INC + INT + TASK merged)
        │
  reports/report.html (interactive)
```

The staging-directory model (numbered `0_` through `9_`) was a deliberate choice: every intermediate artefact is a plain CSV or JSON. This made debugging vastly easier — when something goes wrong at step 5, you can inspect `5_topics/` directly without replaying the entire pipeline from scratch.

---

## The hard parts

### 1. LLM normalisation with two-layer caching

Raw ticket text is noisy. Work notes include timestamps, bot-generated prefixes, stack traces, and hex dumps. A short description like `[1748392810.12] issue, affected user: jsmith` tells you nothing.

The normalisation step rewrites each ticket into a structured format — Title, Problem, Resolution — using an Azure OpenAI call with a domain-specific prompt stored as a Markdown file. Externalising prompts was a key decision: no Python changes needed to tune LLM behaviour.

The challenge was cost and latency. With ~500K tickets, a naive implementation would make ~500K API calls on every run. The cache has two keys:

- **Number** → used when re-processing the same record
- **MD5(short_desc + description)** → transparent deduplication across tickets with identical content

This reduced API calls by over 70% on incremental runs.

### 2. Auto-tuned HDBSCAN with a composite score

Clustering IT tickets is hard because the optimal granularity shifts with dataset size and domain. `min_cluster_size = 20` might be perfect for 2K tickets and useless for 20K.

I built a grid search over 18 candidates (`[10, 15, 20, ..., 500]`) scored with a composite function:

```
score = 0.50 × silhouette
      + 0.25 × (1 / (1 + davies_bouldin))
      − 0.10 × noise_pct
      − 0.10 × log1p(avg_cluster_size)     ← fragmentation
      − 0.05 × largest_cluster_pct
      − 0.20 × max(0, clusters/target − 1) ← over-clustering
```

Candidates are disqualified if noise exceeds 25% or cluster count falls outside `[5, 120]`. If all candidates fail, the system falls back to `min_cluster_size = 40` and proceeds.

The embedding space is UMAP-reduced to 15 dimensions for clustering, and separately to 2D for interactive scatter visualisations. Reducing to 15D rather than 2D before HDBSCAN preserves enough geometric structure to get meaningful clusters while staying fast.

### 3. Three-phase LLM labeling with semantic deduplication

Generating cluster labels with an LLM is straightforward. Generating *distinct, meaningful* labels at scale is not.

Phase 1 generates an initial label per cluster using TF-IDF keywords and representative samples. Phase 2 batches clusters by keyword similarity and labels them together, passing `forbidden_labels` to prevent exact duplicates. Phase 3 detects near-duplicate labels by embedding them and computing cosine similarity — any pair above 0.80 gets re-labelled with mutual context, up to five iterations.

The label cache uses `SHA256(sample_texts + keywords + forbidden_labels)` as key, so re-runs with unchanged clusters skip the LLM entirely.

### 4. Hierarchical sub-clustering with collision-free IDs

Large, incoherent clusters get split. The sub-clustering pass takes each candidate cluster, runs its own HDBSCAN locally on the parent's UMAP-15 vectors, and applies quality gates: at least two sub-clusters must survive, each with positive coherence.

The ID scheme was a small but important detail. Child IDs are assigned as:

```python
global_id = (parent_id + 1) * 1000 + local_id
# parent=7, local=0 → 8000
```

This makes it trivially reversible (`parent = id // 1000 − 1`) and guarantees no collisions across unlimited passes.

### 5. Semantic fusion of incidents and interactions

A phone call to the service desk often follows an open incident. Analysing them separately loses the cross-channel context.

The global pipeline builds an *artifact pool*: for each incident with validated linked interactions (extracted from free text via regex, then validated against the INC dataset), a merged artefact concatenates the normalised INC text with all normalised INT transcripts. Clustering this pool surfaces topics that span both channels — something a flat table join would never reveal.

### 6. Thread-safe dual-endpoint Azure routing

Azure OpenAI rate limits are per-deployment, not per-account. Running two deployments and round-robining between them effectively doubles throughput. The router:

- Maintains a shared cursor per call type (chat / embedding) protected by a `threading.Lock`
- Parses `"retry after X seconds"` from rate-limit errors for precise backoff
- Falls back transparently to the second endpoint on any transient failure

For embedding specifically, if both Azure endpoints are unreachable the system falls back to a local `sentence-transformers` model (`paraphrase-multilingual-MiniLM-L12-v2`), normalises the output to L2, and continues. Development offline became a first-class scenario.

---

## What I'd do differently

**Start with the report.** The hardest conversations with stakeholders were about *what the output should look like*, not about the model or the algorithm. I should have built a static HTML mock of the final report on day one and aligned on it before writing any pipeline code.

**Log coherence scores from the start.** I added coherence tracking mid-project. Having it from run zero would have made it much easier to catch clustering regressions when I changed the embedding config.

**Smoke tests save hours.** The `smoke_test.py` script — which runs the full pipeline on a 200-record subsample in an isolated directory — was added late. Every time I changed normalisation logic, running the full pipeline to check the effect cost 20+ minutes. With the smoke test it was under two.

---

## Results

The pipeline processes the full ticket history overnight, producing:

- A unified interactive HTML report with UMAP scatter plots, per-cluster record tables, and macro-theme grouping
- A business metrics Excel with LLM-assessed closing note quality, self-service candidacy, and routing accuracy per cluster
- A Knowledge Base article draft for each service task cluster, ready for human review

The operations team went from "we can't see any patterns" to having a weekly report that surfaces the top recurring issues, which service groups are generating the most noise, and where automation would have the highest impact.
