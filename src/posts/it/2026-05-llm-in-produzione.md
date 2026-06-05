---
title: "LLM in produzione: cosa ho imparato"
date: "2026-05-15"
tags: ["AI", "LLM", "Azure", "Cloud"]
excerpt: "Qualche riflessione pratica dopo aver portato pipeline basate su LLM in ambienti enterprise reali — dai problemi di latenza alla governance dei prompt."
---

## Intro

Negli ultimi mesi ho avuto modo di progettare e portare in produzione diverse pipeline basate su LLM per clienti enterprise. Quello che sembrava semplice sulla carta — *chiamo il modello, ottengo l'output, fatto* — si è rivelato molto più articolato nella pratica.

Alcune lezioni apprese, in ordine di dolore crescente.

## 1. Il prompt non è codice, ma va trattato come tale

Il primo errore che ho visto fare (e fatto) è trattare i prompt come stringhe hardcodate da aggiustare al volo. In produzione questo porta a:

- Output non deterministici difficili da testare
- Regressioni invisibili quando aggiorni il modello
- Nessuna tracciabilità di *cosa* stai mandando al modello

**Soluzione**: versionare i prompt come file, trattarli con una pipeline CI/CD, e loggare sempre input e output.

## 2. La latenza è il vero nemico

Un modello come GPT-4 può impiegare 10-30 secondi per una risposta complessa. In un flusso utente interattivo questo è inaccettabile.

Strategie che hanno funzionato:

- **Streaming**: mostra il testo mentre arriva, la latenza percepita crolla
- **Caching semantico**: se due prompt sono simili abbastanza, usa il risultato cached
- **Decomposizione**: spezza task lunghi in step paralleli dove possibile

## 3. La governance dei dati è un problema dal giorno uno

Mandare dati di produzione a un LLM esterno solleva immediatamente domande su GDPR, data residency, logging lato provider. Non è un problema da rimandare.

Su Azure AI Foundry ho apprezzato la possibilità di usare modelli in deployment privato con data residency EU e logging controllato. Non risolve tutto, ma riduce molto l'area di rischio.

## 4. L'output strutturato è il tuo migliore amico

Se devi fare qualcosa con l'output del modello (parsarlo, salvarlo, usarlo in downstream logic), **non affidarti al formato libero**. Usa function calling o JSON mode.

```python
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},
    messages=[...]
)
```

Il modello può comunque sbagliare, quindi valida sempre con Pydantic o uno schema.

## Conclusione

Portare LLM in produzione è un lavoro di ingegneria come un altro — richiede osservabilità, testing, governance e design attento. Il modello è solo un pezzo del sistema.
