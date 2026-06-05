---
title: "LLM in production: what I learned"
date: "2026-05-15"
tags: ["AI", "LLM", "Azure", "Cloud"]
excerpt: "Practical reflections after bringing LLM-based pipelines into real enterprise environments — from latency issues to prompt governance."
---

## Intro

Over the past few months I've had the opportunity to design and ship several LLM-based pipelines for enterprise clients. What seemed simple on paper — *call the model, get the output, done* — turned out to be far more nuanced in practice.

Some lessons learned, in increasing order of pain.

## 1. The prompt isn't code, but it should be treated as such

The first mistake I saw (and made) was treating prompts as hardcoded strings to be tweaked on the fly. In production this leads to:

- Non-deterministic output that's hard to test
- Silent regressions when you update the model
- No traceability of *what* you're actually sending to the model

**Solution**: version prompts as files, treat them with a CI/CD pipeline, and always log inputs and outputs.

## 2. Latency is the real enemy

A model like GPT-4 can take 10–30 seconds for a complex response. In an interactive user flow this is unacceptable.

Strategies that worked:

- **Streaming**: show text as it arrives, perceived latency drops dramatically
- **Semantic caching**: if two prompts are similar enough, use the cached result
- **Decomposition**: break long tasks into parallel steps where possible

## 3. Data governance is a day-one problem

Sending production data to an external LLM immediately raises questions about GDPR, data residency, and provider-side logging. This isn't something to defer.

With Azure AI Foundry I appreciated the ability to use models in private deployment with EU data residency and controlled logging. It doesn't solve everything, but it significantly reduces the risk surface.

## 4. Structured output is your best friend

If you need to do something with the model's output (parse it, save it, use it in downstream logic), **don't rely on free-form text**. Use function calling or JSON mode.

```python
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},
    messages=[...]
)
```

The model can still make mistakes, so always validate with Pydantic or a schema.

## Conclusion

Bringing LLMs to production is an engineering job like any other — it requires observability, testing, governance, and careful design. The model is just one piece of the system.
