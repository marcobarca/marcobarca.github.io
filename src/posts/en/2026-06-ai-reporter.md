---
title: "Building an AI-powered automated phone survey platform"
date: "2026-06-04"
tags: ["AI", "Azure", "Node.js", "LLM", "Telephony"]
excerpt: "How I built an end-to-end serverless platform that runs outbound phone surveys, transcribes calls with custom vocabularies, and generates structured reports using Azure OpenAI — fully automated."
---

## The problem

Collecting structured feedback over the phone at scale is deceptively hard. A human agent handles ambiguity naturally — they re-ask, adapt, take notes. Automating that requires solving a chain of distinct problems: making the call, navigating a dynamic conversation, capturing audio reliably, transcribing domain-specific speech, and turning unstructured transcript text into a usable report.

The goal was a platform where you configure a survey once and the rest — calling, listening, transcribing, reporting — happens without any human in the loop.

---

## Architecture

The system runs entirely on Azure Functions, event-driven from end to end.

```
Scheduler / HTTP trigger
        │
  ACS Call Automation  ←→  ACSCallbacks (webhook)
        │                        │
   Audio Recording             Survey State Machine
        │                        │
  Blob Storage              DB (InterviewResult)
        │
  Queue: transcription
        │
  TranscriptionService (Azure Speech SDK)
        │
  Queue: reports
        │
  GenerateReportWithGPT (LangChain + Azure OpenAI)
        │
  DownloadReport (HTTP) → DOCX / XLSX / RTF
```

Each step is decoupled via Azure Storage Queues. If transcription takes 30 seconds or 3 minutes, the report generation step doesn't care — it just waits for its queue message. This made the system resilient to variable-length audio and API latency spikes without any retry logic at the orchestration level.

---

## The hard parts

### 1. Stateful phone conversations over webhooks

Azure Communication Services (ACS) Call Automation works by sending webhook events for everything that happens on a call: connected, speech recognised, DTMF pressed, recording complete. There's no persistent connection — each event is a new HTTP request.

The challenge is keeping survey state across those events. The solution was serialising the full `SurveyEngineService` state into ACS's `operationContext` field, which gets echoed back in every event. No external state store needed.

The state machine itself handles two question types:

- **Branch** — multiple choice, navigates to a different next question based on the answer (DTMF or speech)
- **Sequential** — free-form response, always proceeds to the next question in order

```javascript
answerQuestion(responseLabel, responseText) {
  const selected = currentQuestion.responses.find(r => r.label === responseLabel);
  this.state.currentQuestionId = selected.nextQuestionId; // conditional jump
}
```

Survey completion is a null check: when `currentQuestionId` is null, the engine plays a closing message and hangs up.

### 2. Custom vocabulary transcription without hitting WebSocket limits

Domain-specific phone surveys need domain-specific transcription. A survey about machinery parts won't transcribe "conveyor belt" reliably without hints. Azure Speech SDK supports phrase lists, but loading thousands of phrases naively crashes the WebSocket connection (131 KB limit).

The solution was incremental batch loading: split the vocabulary into chunks of 500 phrases and apply them at 800 ms intervals during active recognition.

```javascript
const batches = chunkPhrasesByCount(phrases, 500);

batchInterval = setInterval(() => {
  if (batchIndex < batches.length) {
    const grammar = PhraseListGrammar.fromRecognizer(recognizer);
    for (const phrase of batches[batchIndex]) {
      grammar.addPhrase(phrase);
    }
    batchIndex++;
  }
}, 800);
```

A sentinel phrase at the end of the list confirms that all batches have been applied before the recognizer is considered ready. This let us load vocabularies of 10K+ terms reliably.

The audio pipeline itself converts the MP3 recording from ACS to WAV PCM at 16 kHz mono via FFmpeg — the exact format the Speech SDK requires — as a stream, without writing an intermediate file to disk.

### 3. Structured report generation with LangChain and Zod

The transcript from a call is a raw stream of recognised text. The report generation step turns it into a structured HTML document — sections, tables, summaries — using a prompt stored in the database (configurable per tenant and survey group).

Relying on the LLM to always return valid JSON without enforcement is a liability in production. The implementation uses LangChain's function calling binding with a Zod schema:

```javascript
const bound = chat.bind({
  functions: [{ name: 'output_formatter', parameters: zodToJsonSchema(ReportSchema) }],
  function_call: { name: 'output_formatter' },
});

const pipeline = template.pipe(bound).pipe(new JsonOutputFunctionsParser());
const result = await pipeline.invoke({ inputText: transcript });
const parsed = ReportSchema.parse(result); // throws if invalid
```

If parsing fails, the job fails hard and re-queues — no silently malformed reports.

### 4. Multi-language surveys with versioned translation caching

The survey master is always in Italian. For other languages, translations are generated on demand via Azure Translator and cached in the database with the master's version number. On the next run, the version is checked: if the master hasn't changed, the cached translation is used directly; if it has, the translation is regenerated.

Prompt translations are handled differently. Azure Translator doesn't preserve HTML structure reliably, so prompts — which contain formatting — are translated via GPT with an explicit instruction to keep the markup intact. These translations are also cached with version tracking.

The result: adding a new language requires no code changes. Add the language record to the database, and the next call in that language will trigger on-demand translation and cache it automatically.

### 5. Dynamic field extraction from generated reports

For inbound calls (where the caller's identity isn't known upfront), the platform needs to extract structured fields — like customer name or account number — from the generated report HTML. These fields vary by survey and client.

Instead of hard-coding extractors, the system builds a Zod schema dynamically from a configurable field list and passes it to a generic GPT extraction call:

```javascript
const shape = {};
for (const field of fields) shape[field] = z.string().optional().default('');
const DynamicSchema = z.object(shape);

const extracted = await AIService.extractJson(prompt, DynamicSchema, reportHtml);
```

The same extraction infrastructure works for any field list, with no changes to the function code.

### 6. Multi-tenant isolation without a framework

The platform serves multiple tenants from a single deployment. Every Sequelize model has a `MSTenantId` column, and `DBService` validates the tenant on every operation — no query touches rows from another tenant regardless of what parameters it receives. 

The atomic prompt activation pattern is worth calling out: setting a prompt as active for a survey group disables all others in the same group within a single transaction, so there's never a window where zero or two prompts are active simultaneously.

---

## What I'd do differently

**Event sourcing over status columns.** The `InterviewResult` table tracks progress via a `Status` enum (`Scheduled → CallInProgress → ReportGenerationInProgress → Completed`). It works, but debugging a failed run means reconstructing what happened from column timestamps. An append-only event log would make the history legible without digging through application logs.

**Separate the state machine from the webhook handler.** `ACSCallbacks.js` grew to 35 KB because it handles both ACS event parsing and survey engine logic. Splitting them into a pure state machine and a thin adapter would have made unit testing the conversation logic straightforward — no need to mock webhook payloads.

**Observability from day one.** Application Insights was added late. Adding structured logging with correlation IDs (call ID through the entire pipeline) from the first commit would have saved hours during incident investigation.

---

## Results

The platform handles the full survey lifecycle without human intervention: it places the call, conducts the conversation, transcribes with domain accuracy using tenant-specific vocabularies, generates a formatted report, and makes it available for download in DOCX, XLSX, or RTF within minutes of the call ending.

End-to-end latency from call completion to downloadable report is typically under three minutes. The queue-driven architecture means that burst load — a batch of 100 scheduled calls — doesn't degrade report quality, it just lengthens the queue.
