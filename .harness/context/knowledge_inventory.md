# Knowledge Inventory

## docs/01-governance/01-Requirements-Specification.md
**Role:** Governance
**Direction:** Feedforward
**Type:** Declarative
**Summary:** Defines the business goals, target audience, and scope of the CMS MVP. It explains key features such as content management, role-based access, and the media library, including expectations for future phases.

## docs/01-governance/02-Software-Requirements-Specification.md
**Role:** Governance
**Direction:** Feedforward
**Type:** Declarative
**Summary:** Details the technical Functional and Non-functional Requirements (FRs and NFRs) acting as the technical contract. It clearly specifies system behaviors like authentication, the content lifecycle, and system constraints.

## docs/01-governance/05-METRICS.md
**Role:** Governance
**Direction:** Feedback
**Type:** Computable
**Summary:** Establishes the quality gates, code coverage targets (≥98%), and automated testing requirements. It serves as the measurable definition of "Done" for every code change.

## docs/02-architecture/03-DESIGN.md
**Role:** Architecture
**Direction:** Feedforward
**Type:** Declarative
**Summary:** Outlines the UI/UX design guidelines based on Material Design 3 (MD3) for the admin panel. It covers color palettes, typography, component behaviors, and accessibility standards to ensure a consistent user experience.

## docs/02-architecture/04-ARCH.md
**Role:** Architecture
**Direction:** Feedforward
**Type:** Declarative / Computable
**Summary:** Defines the system's structural architecture, utilizing Hexagonal Architecture (Ports & Adapters) for the backend and Reactive Architecture for the frontend. It specifies layer responsibilities and strict dependency rules.

## docs/02-architecture/07-OPS-ARCH.md
**Role:** Architecture
**Direction:** Feedforward
**Type:** Declarative
**Summary:** Specifies the operational architecture for deploying the CMS MVP on a single Linux VM using Docker and Docker Compose. It covers container topology, network security, configuration management via `.env` files, and backup/restore strategies.

## docs/03-workflow/06-TEST-STRATEGY.md
**Role:** Workflow
**Direction:** Feedforward
**Type:** Declarative
**Summary:** Defines the comprehensive testing strategy, enforcing Test-Driven Development (TDD) and detailing the test pyramid (Static, Unit, Integration, E2E). It clearly specifies what to test, how to test it, and the definition of a "good test".

## docs/03-workflow/08-GIT-WORKFLOW.md
**Role:** Workflow
**Direction:** Feedforward
**Type:** Declarative
**Summary:** Explains the Git branching strategy, combining Trunk-Based Development for daily work and Git Flow for releases. It also includes the Interest-Based Relational (IBR) approach for resolving technical and interpersonal conflicts.

## docs/03-workflow/09-ONBOARDING.md
**Role:** Workflow
**Direction:** Feedforward
**Type:** Declarative
**Summary:** A guide for new developers joining the team, featuring a 30/60/90-day plan, local development environment setup instructions, and guidance on submitting the first Pull Request. It summarizes concepts and frameworks from other documents to make them easy to understand.

## Domain Model Implementation Snapshot
**Role:** Architecture / Domain
**Direction:** Feedback
**Type:** Declarative
**Summary:** Tracks active Domain Entities implemented in `src/modules/auth/domain/entities`:
- `User`: Fields (`id`: string UUID, `email`: string, `password`: string hashed, `role`: Role enum, `status`: `'active' | 'deactivated'`). Includes complexity validation (minimum 12 characters, at least 1 letter and 1 digit).
