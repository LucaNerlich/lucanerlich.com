---
title: "Introduction to Software Testing"
sidebar_label: "Introduction"
description: Why testing matters, the testing pyramid, cost of bugs, coverage as a metric, and a tooling overview for JavaScript/TypeScript and Java projects.
slug: /testing/beginners-guide/introduction
tags: [testing, beginners, jest, junit, vitest, playwright]
keywords:
  - software testing introduction
  - testing pyramid
  - unit testing
  - integration testing
  - end to end testing
  - jest vitest junit
sidebar_position: 1
---

# Introduction to Software Testing

Every developer has been there: you ship a change, it looks fine locally, and three hours later a bug report lands in your inbox. The feature that broke had nothing to do with what you changed — or so you thought. Automated tests exist to catch exactly these moments before they become incidents.

This guide takes a practical approach to testing across two ecosystems: **JavaScript/TypeScript** (using Jest and Vitest) and **Java** (using JUnit 5). Each chapter builds on the previous one, moving from isolated unit tests through integration testing, mocking, TDD, and finally CI pipeline integration.

## Why Testing Matters

Shipping software without tests is like driving without a seatbelt: fine until it is not. The arguments for testing are well-documented, but the ones that tend to resonate most with developers are:

**Catch regressions automatically.** Once you write a test for a bug, that bug can never silently return. The test suite becomes a growing safety net.

**Refactor with confidence.** When you restructure code, a passing test suite tells you the behaviour is unchanged. Without tests, every refactor is a gamble.

**Tests are documentation.** A well-named test tells you exactly what a function is supposed to do, with a concrete input and expected output. This is often clearer than a comment.

**Reduce manual QA cycles.** Automated tests run in seconds. Manually re-testing an entire feature after every change is unsustainable as a codebase grows.

**Lower long-term cost.** Studies from IBM and others consistently show that bugs found in production cost 10-100x more to fix than bugs found during development. The earlier a bug is caught, the cheaper it is.

## The Testing Pyramid

The testing pyramid is a mental model for thinking about the *mix* of tests you should have. The bottom of the pyramid is cheap and fast; the top is slow and expensive.

```text
          /\
         /  \
        / E2E\         ← few, slow, full stack
       /------\
      /        \
     / Integration\    ← some, medium speed
    /              \
   /----------------\
  /   Unit Tests     \  ← many, fast, isolated
 /____________________\
```

### Unit Tests

A unit test exercises a single function, method, or class in complete isolation. External dependencies — databases, HTTP services, file systems — are replaced with fakes or mocks. Unit tests are the majority of your test suite because they are:

- Fast (milliseconds each)
- Deterministic (no network flakiness)
- Easy to pinpoint when they fail

### Integration Tests

Integration tests verify that two or more components work correctly together. A typical example: a service class that calls a repository, which talks to a real (or in-memory) database. These tests are slower and more complex to set up but catch a class of bugs that unit tests miss — mismatched contracts between components.

### End-to-End (E2E) Tests

E2E tests drive the entire application stack from the outside, usually through a browser or HTTP client. They are the most faithful representation of real user behaviour but also the most brittle and expensive to run. Tools like Playwright and Cypress sit here.

### The Right Mix

A healthy project typically has something like this ratio:

| Layer | Proportion | Typical count on a medium project |
|---|---|---|
| Unit | 70–80 % | 500–2000 |
| Integration | 15–25 % | 50–200 |
| E2E | 5–10 % | 10–50 |

These are guidelines, not rules. A microservice with no UI may have no E2E tests at all. A content site with complex rendering may invert the ratio.

## The Cost of Bugs Over Time

The cost to fix a defect grows dramatically the later it is found. The rough multipliers that practitioners cite:

| Stage found | Relative cost |
|---|---|
| During coding (dev catches it) | 1× |
| In code review | 2–5× |
| In QA / testing phase | 10–20× |
| In production | 50–100× |

These numbers vary by project, but the direction is universal. Automated tests move bug discovery as early as possible.

## Test Coverage as a Metric

**Code coverage** measures the percentage of your production code that is executed by your test suite. The common metrics:

- **Line coverage** — what percentage of lines were hit at least once
- **Branch coverage** — what percentage of conditional branches (if/else, switch arms) were taken
- **Function coverage** — what percentage of functions were called
- **Statement coverage** — similar to line coverage but counts individual statements

Coverage is a useful signal but not a goal in itself. 100% line coverage does not mean your code is correct — it means every line ran. A test that calls a function but makes no assertions will cover it without verifying anything.

A practical target:
- **< 50%** — risky; likely missing large sections of logic
- **50–70%** — survivable for legacy code, but aim higher for new code
- **70–85%** — solid for most production services
- **> 90%** — appropriate for libraries and critical path code, but beware diminishing returns

## Tooling Overview

This guide uses the following tools. You do not need to install them all now — each chapter covers setup in context.

### JavaScript / TypeScript

| Tool | Purpose | Notes |
|---|---|---|
| **Jest** | Test runner + assertion library | Most widely used; built-in mocking |
| **Vitest** | Test runner + assertion library | Vite-native, Jest-compatible API, faster HMR |
| **React Testing Library** | Component testing | Tests user behaviour, not implementation |
| **Playwright** | E2E browser testing | Cross-browser, built-in tracing |
| **Istanbul / c8** | Coverage | Bundled with Jest; c8 used with Vitest |

### Java

| Tool | Purpose | Notes |
|---|---|---|
| **JUnit 5** | Test framework | Current standard; replaces JUnit 4 |
| **Mockito** | Mocking library | De-facto standard for Java mocking |
| **AssertJ** | Fluent assertions | More readable than JUnit's `Assertions` |
| **Spring Boot Test** | Integration testing | `@SpringBootTest`, `MockMvc` |
| **Testcontainers** | Docker-based integration testing | Real databases in tests |
| **JaCoCo** | Coverage | Maven/Gradle plugin |

## How to Use This Guide

The chapters are designed to be read in order, but each one is self-contained enough to use as a reference. The guide is structured in two parallel tracks that converge on shared concepts:

1. Chapters 2–5 cover unit testing and mocking in both JavaScript and Java separately.
2. Chapter 6 covers integration testing for both ecosystems together.
3. Chapters 7–12 cover higher-level concerns (TDD, React, E2E, coverage, CI) that apply to both.

Code examples are complete and runnable. Each chapter states the dependencies you need to add.

Let's start with unit tests.
