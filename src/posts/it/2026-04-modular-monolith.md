---
title: "Modular Monolith: perché non tutto deve essere microservizi"
date: "2026-04-10"
tags: ["Architecture", "DDD", "SaaS", "Spring Boot"]
excerpt: "Quando il modular monolith è la scelta giusta, come strutturarlo con un approccio DDD-light, e come evitare di ricadere nello stesso big ball of mud che si voleva evitare."
---

## Il problema con i microservizi prematuri

Quando si inizia a progettare una nuova piattaforma, la tentazione di distribuire tutto in microservizi è forte. *Scalabilità, deployment indipendente, team autonomi* — i vantaggi sulla carta sono evidenti.

Il problema è che questi vantaggi si materializzano a una certa scala. Prima di quella soglia, stai solo pagando i costi senza i benefici: network overhead, distributed tracing, gestione di eventual consistency, deployment complessi.

## Il Modular Monolith come via di mezzo

Un **modular monolith** è un singolo deployment che internamente è strutturato in moduli con confini netti. Ogni modulo:

- Ha il proprio package/namespace
- Espone un'interfaccia pubblica (un'API interna) verso gli altri moduli
- Non accede direttamente al database degli altri moduli

In Spring Boot questo si traduce in qualcosa come:

```
src/
  users/
    UsersModule.java     ← punto di ingresso pubblico
    internal/
      UserRepository.java
      UserService.java
  bookings/
    BookingsModule.java
    internal/
      ...
  payments/
    PaymentsModule.java
    internal/
      ...
```

Il modulo `bookings` parla con `users` **solo** attraverso `UsersModule`, mai accedendo direttamente a `UserRepository`.

## DDD-light: bounded context senza l'overhead

Domain-Driven Design ha strumenti potenti — aggregates, value objects, domain events — ma applicarli tutti fin dall'inizio su un progetto giovane è sovra-ingegnerizzazione.

Quello che uso in pratica è un subset pragmatico:

1. **Bounded context espliciti**: ogni modulo corrisponde a un dominio preciso. Se non riesci a dare un nome chiaro al dominio, probabilmente stai mescolando responsabilità.

2. **Ubiquitous language**: i nomi nel codice rispecchiano il linguaggio del business. Un `Lesson` è una `Lesson`, non un `Session` né un `Appointment`.

3. **Anti-corruption layer**: quando integri sistemi esterni (Stripe, Azure, terze parti), mai esporre i loro modelli nel tuo dominio. Traduci sempre.

## Quando è il momento di estrarre un microservizio

Il bello del modular monolith è che i confini sono già disegnati. Quando un modulo cresce abbastanza da giustificare il deployment indipendente, l'estrazione è quasi meccanica:

- Sostituisci le chiamate interne con chiamate HTTP o messaggi asincroni
- Estrai il modulo in un progetto separato
- Il resto del sistema non cambia, perché stava già parlando solo attraverso l'interfaccia pubblica

## Conclusione

Il modular monolith non è un compromesso — è la scelta giusta per la maggior parte dei prodotti nelle fasi iniziali. Permette di muoversi velocemente, mantenere semplicità operativa, e costruire confini puliti che rendono l'evoluzione futura molto meno dolorosa.
