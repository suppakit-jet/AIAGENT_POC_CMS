# Metrics Inventory

## 2. TDD Development Discipline
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-TDD-01 | Test-to-code ratio (new code in a PR) | ≥ 1.0 (LOC tests / LOC production) | 05-METRICS §2.4 | Yes [Inferred] |
| M-TDD-02 | Diff coverage (new + changed lines) | ≥ 98% (≥ 100% for critical paths) | 05-METRICS §2.4 | Yes [Inferred] |
| M-TDD-03 | Mutation score on changed files | ≥ 80% | 05-METRICS §2.4 | Yes [Inferred] |
| M-TDD-04 | Average commit size | < 200 LOC | 05-METRICS §2.4 | No |
| M-TDD-05 | Time from red to green per cycle | < 10 minutes | 05-METRICS §2.4 | No |
| M-TDD-06 | PRs without tests | 0 | 05-METRICS §2.4 | Yes |
| M-TDD-07 | Tests added per bug fix | ≥ 1 | 05-METRICS §2.4 | Yes [Inferred] |

## 4. Architecture Metrics — Backend (Hexagonal)
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-HEX-01 | Domain layer imports from outside | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-HEX-02 | Application layer imports from `adapters/*` | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-HEX-03 | Adapters/in importing from adapters/out | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-HEX-04 | Modules importing internals of other modules | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-HEX-05 | Third-party type leakage | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-HEX-06 | Outbound port interfaces without in-memory fake | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-HEX-07 | Use cases without an integration test | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-HEX-08 | Domain entities exposing setters / mutating public fields | 0 | 05-METRICS §4.1 | Yes [Inferred] |
| M-DEP-01 | Circular dependencies (any direction) | 0 | 05-METRICS §4.2 | Yes [Inferred] |
| M-DEP-02 | Maximum module depth | ≤ 6 | 05-METRICS §4.2 | Yes [Inferred] |
| M-DEP-03 | Modules with > 8 outgoing dependencies | 0 | 05-METRICS §4.2 | Yes [Inferred] |
| M-COH-01 | LCOM4 per class | ≤ 1 | 05-METRICS §4.3 | Yes [Inferred] |
| M-COH-02 | Afferent coupling (Ca) per module | ≤ 10 | 05-METRICS §4.3 | Yes [Inferred] |
| M-COH-03 | Efferent coupling (Ce) per module | ≤ 12 | 05-METRICS §4.3 | Yes [Inferred] |
| M-COH-04 | Instability (I = Ce / (Ca + Ce)) | Domain: ≤ 0.2; Adapters: ≥ 0.7 | 05-METRICS §4.3 | Yes [Inferred] |
| M-COH-05 | Abstractness (A) of domain layer | ≥ 0.5 | 05-METRICS §4.3 | Yes [Inferred] |
| M-COH-06 | Distance from main sequence | ≤ 0.3 | 05-METRICS §4.3 | Yes [Inferred] |
| M-API-01 | Public exports from a module not used externally | 0 | 05-METRICS §4.4 | Yes [Inferred] |
| M-API-02 | Use cases with > 5 parameters | 0 | 05-METRICS §4.4 | Yes [Inferred] |
| M-API-03 | DTOs that mix request and response shapes | 0 | 05-METRICS §4.4 | Yes [Inferred] |
| M-API-04 | OpenAPI spec drift vs implementation | 0 | 05-METRICS §4.4 | Yes |

## 5. Architecture Metrics — Frontend (Reactive)
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-RX-01 | Components calling `fetch`/`axios` directly | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-RX-02 | Components calling `localStorage`/`sessionStorage` directly | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-RX-03 | Direct mutation of state | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-RX-04 | Presentational components using `useQuery`/`useMutation` | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-RX-05 | Presentational components reading from Zustand store | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-RX-06 | Features importing from sibling features | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-RX-07 | Components > 200 LOC | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-RX-08 | Components with > 6 useState calls | 0 | 05-METRICS §5.1 | Yes [Inferred] |
| M-STATE-01 | Global UI store slices > 200 LOC | 0 | 05-METRICS §5.2 | Yes [Inferred] |
| M-STATE-02 | Query keys not following `[feature, ...]` convention | 0 | 05-METRICS §5.2 | Yes [Inferred] |
| M-STATE-03 | Stale queries left without invalidation strategy | 0 | 05-METRICS §5.2 | Yes [Inferred] |
| M-STATE-04 | RxJS subscriptions without proper teardown | 0 | 05-METRICS §5.2 | Yes [Inferred] |
| M-BUN-01 | Initial JS bundle (gzipped) | ≤ 250 KB | 05-METRICS §5.3 | Yes [Inferred] |
| M-BUN-02 | Per-route bundle (gzipped) | ≤ 100 KB | 05-METRICS §5.3 | Yes [Inferred] |
| M-BUN-03 | CSS bundle (gzipped) | ≤ 50 KB | 05-METRICS §5.3 | Yes [Inferred] |
| M-BUN-04 | Largest Contentful Paint (LCP) | ≤ 2.5 s (P75) | 05-METRICS §5.3 | Yes [Inferred] |
| M-BUN-05 | First Input Delay (FID) / INP | ≤ 200 ms (P75) | 05-METRICS §5.3 | Yes [Inferred] |
| M-BUN-06 | Cumulative Layout Shift (CLS) | ≤ 0.1 | 05-METRICS §5.3 | Yes [Inferred] |
| M-BUN-07 | Lighthouse Performance score | ≥ 90 | 05-METRICS §5.3 | Yes [Inferred] |
| M-BUN-08 | Lighthouse Accessibility score | ≥ 95 | 05-METRICS §5.3 | Yes [Inferred] |
| M-CMP-01 | Maximum render tree depth | ≤ 15 | 05-METRICS §5.4 | Yes [Inferred] |
| M-CMP-02 | Components without `displayName` (production) | 0 | 05-METRICS §5.4 | Yes [Inferred] |
| M-CMP-03 | Inline anonymous functions passed as props | informational | 05-METRICS §5.4 | No |

## 6. Code Quality Metrics
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-CPX-01 | Cyclomatic complexity per function | ≤ 10 | 05-METRICS §6.1 | Yes [Inferred] |
| M-CPX-02 | Cognitive complexity per function | ≤ 15 | 05-METRICS §6.1 | Yes [Inferred] |
| M-CPX-03 | Maximum nesting depth | ≤ 4 | 05-METRICS §6.1 | Yes [Inferred] |
| M-CPX-04 | Function length (LOC, excluding comments/blank) | ≤ 50 | 05-METRICS §6.1 | Yes [Inferred] |
| M-CPX-05 | Function parameter count | ≤ 4 | 05-METRICS §6.1 | Yes [Inferred] |
| M-CPX-06 | Class length | ≤ 300 LOC | 05-METRICS §6.1 | Yes [Inferred] |
| M-CPX-07 | File length | ≤ 400 LOC | 05-METRICS §6.1 | Yes [Inferred] |
| M-DUP-01 | Code duplication ratio | ≤ 3% | 05-METRICS §6.2 | Yes [Inferred] |
| M-DUP-02 | Duplicate block size threshold | ≥ 50 tokens | 05-METRICS §6.2 | Yes [Inferred] |
| M-DUP-03 | Maximum duplicate block instances | ≤ 2 per duplicated block | 05-METRICS §6.2 | Yes [Inferred] |
| M-DEBT-01 | SonarQube technical debt ratio | ≤ 5% | 05-METRICS §6.3 | Yes [Inferred] |
| M-DEBT-02 | TODO/FIXME comments without linked issue | 0 | 05-METRICS §6.3 | Yes [Inferred] |
| M-DEBT-03 | Deprecated API usage | 0 | 05-METRICS §6.3 | Yes [Inferred] |
| M-DEBT-04 | `any` type usage in TypeScript | 0 | 05-METRICS §6.3 | Yes [Inferred] |
| M-DEBT-05 | `@ts-ignore` / `@ts-expect-error` without justification | 0 | 05-METRICS §6.3 | Yes [Inferred] |
| M-DEBT-06 | ESLint `disable` without justification comment | 0 | 05-METRICS §6.3 | Yes [Inferred] |
| M-TS-01 | `strict: true` in tsconfig | Required | 05-METRICS §6.4 | Yes |
| M-TS-02 | `noUncheckedIndexedAccess: true` | Required | 05-METRICS §6.4 | Yes |
| M-TS-03 | `exactOptionalPropertyTypes: true` | Required | 05-METRICS §6.4 | Yes |
| M-TS-04 | `noImplicitOverride: true` | Required | 05-METRICS §6.4 | Yes |
| M-TS-05 | TypeScript compile errors | 0 | 05-METRICS §6.4 | Yes |
| M-TS-06 | TypeScript warnings | 0 | 05-METRICS §6.4 | Yes |
| M-LINT-01 | ESLint errors | 0 | 05-METRICS §6.5 | Yes |
| M-LINT-02 | ESLint warnings (production code) | 0 | 05-METRICS §6.5 | Yes |
| M-LINT-03 | Prettier formatting violations | 0 | 05-METRICS §6.5 | Yes |

## 7. Test Quality Metrics
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-TEST-01 | Unit test execution time | ≤ 60 s (total) | 05-METRICS §7.1 | Yes [Inferred] |
| M-TEST-02 | Integration test execution time | ≤ 5 min (total) | 05-METRICS §7.1 | Yes [Inferred] |
| M-TEST-03 | E2E test execution time | ≤ 15 min (total) | 05-METRICS §7.1 | Yes [Inferred] |
| M-TEST-04 | Flaky test rate | ≤ 0.5% | 05-METRICS §7.1 | Yes [Inferred] |
| M-TEST-05 | Tests skipped (`xit`, `it.skip`, `describe.skip`) | 0 | 05-METRICS §7.1 | Yes [Inferred] |
| M-TEST-06 | Mutation score — overall | ≥ 80% | 05-METRICS §7.1 | Yes |
| M-TEST-07 | Mutation score — critical paths | ≥ 90% | 05-METRICS §7.1 | Yes |
| M-TEST-08 | Tests asserting only on existence | informational | 05-METRICS §7.1 | No |
| M-TQ-01 | Test files following AAA pattern | ≥ 95% | 05-METRICS §7.2 | Yes [Inferred] |
| M-TQ-02 | Test names starting with "should..." | informational | 05-METRICS §7.2 | No |
| M-TQ-03 | Tests with multiple unrelated assertions | 0 | 05-METRICS §7.2 | Yes [Inferred] |
| M-TQ-04 | Tests sharing mutable state between cases | 0 | 05-METRICS §7.2 | Yes [Inferred] |
| M-TQ-05 | Tests longer than 30 LOC | informational | 05-METRICS §7.2 | No |
| M-TQ-06 | Tests using real network / DB outside integration | 0 | 05-METRICS §7.2 | Yes [Inferred] |
| M-PYR-01 | Unit test count / total test count | ≥ 70% | 05-METRICS §7.3 | Yes [Inferred] |
| M-PYR-02 | E2E test count / total test count | ≤ 10% | 05-METRICS §7.3 | Yes [Inferred] |
| M-PYR-03 | Tests at the wrong layer | informational | 05-METRICS §7.3 | No |

## 8. Security & Dependency Metrics
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-SEC-01 | Critical CVEs in production dependencies | 0 | 05-METRICS §8.1 | Yes |
| M-SEC-02 | High-severity CVEs in production dependencies | 0 | 05-METRICS §8.1 | Yes |
| M-SEC-03 | Medium-severity CVEs | ≤ 5 | 05-METRICS §8.1 | Yes [Inferred] |
| M-SEC-04 | Low-severity CVEs | informational | 05-METRICS §8.1 | No |
| M-SEC-05 | CVEs in dev dependencies (critical/high) | 0 | 05-METRICS §8.1 | Yes [Inferred] |
| M-SEC-06 | Time to patch critical CVE | ≤ 24 hours | 05-METRICS §8.1 | Yes [Inferred] |
| M-SEC-07 | Time to patch high CVE | ≤ 7 days | 05-METRICS §8.1 | Yes [Inferred] |
| M-SAST-01 | Critical / high SAST findings | 0 | 05-METRICS §8.2 | Yes |
| M-SAST-02 | Hardcoded secrets detected (gitleaks) | 0 | 05-METRICS §8.2 | Yes |
| M-SAST-03 | OWASP Top 10 categories covered by SAST rules | All 10 | 05-METRICS §8.2 | Yes [Inferred] |
| M-SAST-04 | New SAST findings introduced by PR | 0 | 05-METRICS §8.2 | Yes [Inferred] |
| M-LIC-01 | GPL / AGPL / proprietary licenses in prod deps | 0 | 05-METRICS §8.3 | Yes |
| M-LIC-02 | Unrecognized / unknown licenses | 0 | 05-METRICS §8.3 | Yes |
| M-LIC-03 | Allowed licenses | MIT, Apache-2.0, BSD-2/3, ISC, MPL-2.0 | 05-METRICS §8.3 | Yes [Inferred] |
| M-INF-01 | Container base image CVEs (critical/high) | 0 | 05-METRICS §8.4 | Yes [Inferred] |
| M-INF-02 | Container runs as non-root | Required | 05-METRICS §8.4 | Yes |
| M-INF-03 | Container image size | ≤ 300 MB | 05-METRICS §8.4 | Yes [Inferred] |
| M-INF-04 | Terraform plan with policy violations | 0 | 05-METRICS §8.4 | Yes [Inferred] |
| M-INF-05 | Secrets in IaC / config files | 0 | 05-METRICS §8.4 | Yes [Inferred] |

## 9. Performance & Reliability Metrics
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-PERF-01 | Public API P95 latency (cached) | ≤ 200 ms | 05-METRICS §9.1 | Yes [Inferred] |
| M-PERF-02 | Public API P95 latency (uncached) | ≤ 600 ms | 05-METRICS §9.1 | Yes [Inferred] |
| M-PERF-03 | Admin API mutation P95 latency | ≤ 800 ms | 05-METRICS §9.1 | Yes [Inferred] |
| M-PERF-04 | Database query P95 latency | ≤ 100 ms | 05-METRICS §9.1 | Yes [Inferred] |
| M-PERF-05 | Slow queries (> 1 s) per 1M requests | < 10 | 05-METRICS §9.1 | Yes [Inferred] |
| M-PERF-06 | API error rate (5xx) per 1M requests | < 100 | 05-METRICS §9.1 | Yes [Inferred] |
| M-PERF-07 | Memory usage per replica | ≤ 512 MB | 05-METRICS §9.1 | Yes [Inferred] |
| M-PERF-08 | CPU usage per replica (steady state) | ≤ 50% | 05-METRICS §9.1 | Yes [Inferred] |
| M-REL-01 | Production uptime (rolling 30 days) | ≥ 99.5% | 05-METRICS §9.2 | Yes [Inferred] |
| M-REL-02 | Successful deploy rate | ≥ 95% | 05-METRICS §9.2 | Yes [Inferred] |
| M-REL-03 | Mean time to recovery (MTTR) | ≤ 4 hours | 05-METRICS §9.2 | Yes [Inferred] |
| M-REL-04 | Change failure rate | ≤ 15% | 05-METRICS §9.2 | Yes [Inferred] |
| M-REL-05 | Backup success rate | 100% | 05-METRICS §9.2 | Yes [Inferred] |
| M-REL-06 | Successful restore drill (quarterly) | Required | 05-METRICS §9.2 | Yes |
| M-LOAD-01 | Sustained RPS on public API without degradation | ≥ 200 RPS | 05-METRICS §9.3 | Yes [Inferred] |
| M-LOAD-02 | P99 latency under sustained load | ≤ 1 s | 05-METRICS §9.3 | Yes [Inferred] |
| M-LOAD-03 | Error rate under sustained load | ≤ 0.1% | 05-METRICS §9.3 | Yes [Inferred] |
| M-LOAD-04 | Load tests run | Weekly (staging) | 05-METRICS §9.3 | Yes [Inferred] |

## 10. Process & Delivery Metrics
| Metric ID | What it measures | Threshold | Source | Blocking? |
|---|---|---|---|---|
| M-PR-01 | PR size (LOC changed) | ≤ 400 (median) | 05-METRICS §10.1 | Yes [Inferred] |
| M-PR-02 | PR review turnaround time | ≤ 1 business day | 05-METRICS §10.1 | Yes [Inferred] |
| M-PR-03 | PRs merged without review | 0 | 05-METRICS §10.1 | Yes |
| M-PR-04 | PRs merged with failing CI | 0 | 05-METRICS §10.1 | Yes |
| M-PR-05 | Required approvers | ≥ 1 | 05-METRICS §10.1 | Yes |
| M-PR-06 | PRs with conventional commit titles | 100% | 05-METRICS §10.1 | Yes |
| M-DORA-01 | Deployment frequency | ≥ Daily | 05-METRICS §10.2 | Yes [Inferred] |
| M-DORA-02 | Lead time for changes | ≤ 1 day | 05-METRICS §10.2 | Yes [Inferred] |
| M-DORA-03 | Change failure rate | ≤ 15% | 05-METRICS §10.2 | Yes [Inferred] |
| M-DORA-04 | Mean time to restore | ≤ 1 hour | 05-METRICS §10.2 | Yes [Inferred] |
| M-DOC-01 | Public API endpoints documented in OpenAPI | 100% | 05-METRICS §10.3 | Yes [Inferred] |
| M-DOC-02 | Architecture Decision Records (ADRs) | ≥ 1 per quarter | 05-METRICS §10.3 | Yes [Inferred] |
| M-DOC-03 | README + CONTRIBUTING + RUNBOOK present | Required | 05-METRICS §10.3 | Yes |
| M-DOC-04 | Onboarding doc out of date (> 90 days) | 0 | 05-METRICS §10.3 | Yes [Inferred] |
