# Universal Harness Engineering — Execution Workflow Specification

> **Specification Version:** 1.0.0  
> **Status:** Active Standard  
> **Applies To:** AI Agents, Developers, and Continuous Integration Pipelines  

---

## 1. Executive Summary

In a **Harness Engineering** ecosystem, software quality is not achieved by chance or post-development inspection. It is enforced deterministically through a structured **6-Stage Execution Workflow** regulated by automated sensors, guardrails, and quality gates.

Every task or ticket must progress sequentially through the 6 stages defined below.

---

## 2. The 6-Stage Lifecycle State Machine

```
[STAGE 1: INTAKE] 
       │
       ▼
[STAGE 2: PRE-MORTEM & CONTRACT]
       │
       ▼
[STAGE 3: TDD RED (FAILING TESTS)]
       │
       ▼
[STAGE 4: TDD GREEN & HEXAGONAL ARCHITECTURE]
       │
       ▼
[STAGE 5: UNIVERSAL GATES VERIFICATION]
       │
       ▼
[STAGE 6: HANDOFF & SYNCHRONIZATION]
```

---

### Stage 1: Task Intake & Specification Alignment
- **Objective:** Establish unambiguous traceability to Business Requirements (BR) and Functional Requirements (FR).
- **Actions:**
  1. Read the assigned Ticket from `.harness/tickets/ticket-*.json`.
  2. Verify mapping against `Docs/01-governance/02-Software-Requirements-Specification.md`.
  3. Load `.harness/context/acceptance-criteria.json` to inspect target criteria.

---

### Stage 2: Pre-mortem Risk Analysis & Contract Definition
- **Objective:** Define verifiable `Definition of Done (DoD)` and identify potential architectural or operational failures before writing code.
- **Actions:**
  1. Create or update `.harness/contracts/contract-XX.json`.
  2. Perform pre-mortem analysis in `.harness/pre-mortem/contract-XX-pre-mortem.md`.

---

### Stage 3: Test-Driven Development — Red Phase (TDD Red)
- **Objective:** Ensure automated regression protection exists before feature implementation begins.
- **Actions:**
  1. Write unit tests (`*.spec.ts`) reflecting the exact contract acceptance criteria.
  2. Verify tests fail as expected prior to writing business logic.
  3. Sensor `m-tdd.py` monitors Test-to-Code ratio ($\ge 1.0$).

---

### Stage 4: Implementation & Hexagonal Architecture Conformance (TDD Green)
- **Objective:** Implement business features strictly conforming to clean Ports & Adapters separation.
- **Actions:**
  1. Write pure Domain Entities / Use Cases inside `domain/` and `application/` without framework imports.
  2. Implement infrastructure integration inside `adapters/`.
  3. Sensor `m-hex.py` continuously scans for architectural erosion.
  4. Sensor `m-cov.py` verifies 100% line, branch, and function coverage.

---

### Stage 5: Universal Quality Gates Execution
- **Objective:** Validate system-wide integrity across all 6 Harness Quality Gates.
- **Actions:**
  1. Run `python3 .harness/harness-runner.py`.
  2. Confirm `ALL PASSED` (Exit Code 0):
     - Gate 1: Structure Inventory (`verify-harness.py`)
     - Gate 2: TypeScript Strict Typecheck (`tsc --noEmit`)
     - Gate 3: ESLint Standards
     - Gate 4: TDD Ratio (`m-tdd.py`)
     - Gate 5: 100% Coverage (`m-cov.py`)
     - Gate 6: 0 Hexagonal Violations (`m-hex.py`)

---

### Stage 6: Knowledge Handoff & Progress Synchronization
- **Objective:** Create an immutable trail of work and synchronize project status.
- **Actions:**
  1. Write Handoff report in `.harness/handoffs/handoff-XXX.md`.
  2. Update `.harness/progress.json` and `.harness/context/acceptance-criteria.json`.
  3. Commit and push cleanly via `.harness/guardrails/pre_commit.py`.
