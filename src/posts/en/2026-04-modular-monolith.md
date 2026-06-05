---
title: "Modular Monolith: why not everything needs to be microservices"
date: "2026-04-10"
tags: ["Architecture", "DDD", "SaaS", "Spring Boot"]
excerpt: "When the modular monolith is the right choice, how to structure it with a DDD-light approach, and how to avoid falling back into the same big ball of mud you were trying to escape."
---

## The problem with premature microservices

When starting to design a new platform, the temptation to distribute everything into microservices is strong. *Scalability, independent deployments, autonomous teams* — the benefits on paper are obvious.

The problem is that these benefits materialise at a certain scale. Before that threshold, you're just paying the costs without the benefits: network overhead, distributed tracing, eventual consistency management, complex deployments.

## The Modular Monolith as a middle ground

A **modular monolith** is a single deployment that is internally structured into modules with clear boundaries. Each module:

- Has its own package/namespace
- Exposes a public interface (an internal API) to other modules
- Does not directly access other modules' databases

In Spring Boot this translates to something like:

```
src/
  users/
    UsersModule.java     ← public entry point
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

The `bookings` module talks to `users` **only** through `UsersModule`, never accessing `UserRepository` directly.

## DDD-light: bounded contexts without the overhead

Domain-Driven Design has powerful tools — aggregates, value objects, domain events — but applying them all from the start on a young project is over-engineering.

What I use in practice is a pragmatic subset:

1. **Explicit bounded contexts**: each module corresponds to a precise domain. If you can't give the domain a clear name, you're probably mixing responsibilities.

2. **Ubiquitous language**: names in the code mirror the business language. A `Lesson` is a `Lesson`, not a `Session` or an `Appointment`.

3. **Anti-corruption layer**: when integrating external systems (Stripe, Azure, third parties), never expose their models in your domain. Always translate.

## When it's time to extract a microservice

The beauty of the modular monolith is that the boundaries are already drawn. When a module grows large enough to justify independent deployment, extraction is almost mechanical:

- Replace internal calls with HTTP calls or asynchronous messages
- Extract the module into a separate project
- The rest of the system doesn't change, because it was already talking only through the public interface

## Conclusion

The modular monolith isn't a compromise — it's the right choice for most products in the early stages. It lets you move fast, maintain operational simplicity, and build clean boundaries that make future evolution far less painful.
