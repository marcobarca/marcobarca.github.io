---
title: "ETL from scratch: syncing an ERP to a data warehouse"
date: "2026-06-03"
tags: ["Python", "PostgreSQL", "ETL", "Data Engineering"]
excerpt: "Nobody talks about boring data pipelines. But boring is exactly what you want when your client's BI reports depend on them running every night without fail."
---

Nobody talks about boring data pipelines. But boring is exactly what you want when your client's BI reports depend on them running every night without fail.

This project was an ETL pipeline to sync data from Zucchetti — a common Italian ERP — into a PostgreSQL data warehouse. Orders, invoices, delivery notes, credit notes, customer master data. The kind of data a company looks at every day to understand how the business is doing.

The requirements were simple on paper: run nightly, pull only what changed, load it into a dimensional model, never corrupt the database. That last part is where it gets interesting.

---

## Starting simple, staying simple

The stack is deliberately minimal: Python, psycopg2, requests, python-dotenv. No Airflow, no dbt, no Spark. Three external dependencies total. I've seen projects collapse under the weight of their own tooling, so I made a conscious choice to keep this one boring.

The architecture has five logical layers:

- **Staging** — temporary landing zone, wiped each run
- **Staging backup** — persistent ODS, accumulated delta history
- **DWH** — dimensional model (facts and dimensions)
- **DM** — optimised data mart for BI tools
- **ETL metadata** — run audit trail, watermarks

Each layer has a clear job. Stored procedures handle all the transformation logic between them, which means SQL people can maintain it without touching Python.

---

## The watermark problem

Incremental loading sounds straightforward until you think through failure modes.

The naive approach: store a timestamp, next run fetch everything newer than that timestamp. Works until the transformation step fails after the extraction has already completed. Now your extraction watermark is ahead of your transformation watermark. If you re-run, you skip extraction (watermark looks current) but the warehouse is still stale.

The solution is two watermarks instead of one:

```
extraction_watermark     ← max timestamp pulled from the API
transformation_watermark ← max timestamp loaded into DWH/DM
```

At startup the pipeline compares them. If extraction is ahead of transformation, it means a previous run extracted data but crashed before transforming it — so skip extraction entirely and retry transformation on what's already staged. Only when both are aligned does a new extraction happen.

The watermark update itself has a small but important detail: it's set to `max(cpupdtms) - 5 seconds` rather than the exact maximum. The five-second buffer accounts for race conditions in the ERP — records that were being written when the API call happened and whose timestamp might not yet be final.

---

## OAuth2 at 3am

Zucchetti's API uses OAuth2 tokens that expire after 60 minutes. A run that starts at 2am and takes two hours will hit an expired token halfway through.

The client wraps every API call with a check:

```python
TOKEN_TTL = 50 * 60  # 10-minute margin before actual expiry

def _ensure_token_valid(self):
    if time.time() >= self.expires_at:
        self._refresh_token()
```

If the token is stale, refresh it before proceeding. The caller never sees this happen. Token refresh retries up to three times with exponential backoff; API calls retry up to five times. The job has failed maybe twice in several months of nightly runs.

---

## A subtle deduplication bug

The Zucchetti API occasionally returns the same record twice in a single batch — likely a pagination edge case on their side. The fix is obvious: deduplicate in memory before inserting.

But the original implementation compared timestamps as strings:

```python
if row['cpupdtms'] > existing['cpupdtms']:  # wrong
```

String comparison of ISO timestamps is *usually* correct, but not always — and when it fails, PostgreSQL throws `ON CONFLICT DO UPDATE command cannot affect row a second time`, which crashes the entire transaction.

The fix is to always parse to `datetime` objects before comparing:

```python
def _parse_ts(val):
    if isinstance(val, datetime):
        return val
    return datetime.fromisoformat(str(val))
```

Small thing. The kind of bug that only shows up in production, at 3am, when you're not watching.

---

## One commit, everything or nothing

The part I'm most satisfied with is the transaction model. The entire pipeline — extraction, staging, transformation, watermark update, run metadata — happens inside a single database transaction. There's exactly one `conn.commit()` call, at the very end.

```python
try:
    run_documents(conn, run_id)
    run_masterdata(conn, run_id)
    run_dwh(conn, run_id)
    run_dimensions(conn, run_id)
    run_datamart(conn, run_id)
    align_watermarks(conn)
    conn.commit()
except Exception:
    conn.rollback()
    raise
```

If anything fails — network error, stored procedure exception, disk full — the rollback undoes everything. The warehouse stays in its last known good state. The only exception is `start_run()`, which commits immediately to create an audit record: that way you can see a run was attempted even if the process crashes before finishing.

---

## What I'd add next

The one missing piece is API pagination. Zucchetti caps responses at 500K records per call. For now, the pipeline logs a warning if a batch hits that limit — it hasn't happened yet, but it will eventually. Proper offset-based pagination would make the system genuinely unbounded.

I'd also add alerting. Right now, failures write to a log file and the `etl.ingestion_runs` table. That's fine if someone checks it, but a Slack message on failure would catch problems before the morning standup.

---

The pipeline has been running nightly for months. It's quiet, which is the goal. When data pipelines are doing their job, you don't think about them.
