---
title: "Piattaforma SaaS per Survey"
tags: ["Azure Functions", "LangChain", "RAG", "Azure Speech", "Azure AI Foundry"]
period: "Lug 2024 — In corso"
company: "NPO Torino s.r.l."
companyUrl: "https://www.nposervices.com/"
---

- Architettura serverless event-driven (Azure Functions, Azure Communication Services) che orchestra le chiamate in uscita end-to-end senza intervento umano
- Pipeline di trascrizione con Azure Speech che alimenta un layer di generazione report AI costruito con LangChain e Azure AI Foundry
- Agente conversazionale RAG (Azure Cognitive Search + embedding semantici) che consente agli stakeholder di interrogare i report in linguaggio naturale
- Supporto multilingue nativo con Azure Translator e TTS neurale; isolamento multi-tenant con Azure Entra ID; deploy con CI/CD su Azure Pipelines
