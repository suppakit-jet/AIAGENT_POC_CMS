# Agent Definition & Behavioral Guidelines (AGENTS.md)

## Role
Harness Engineering Agent for Content Management System (CMS) — MVP.

## Mandatory Rules & Quality Gates
1. **TDD Compliance (M-TDD-01..07):** 
   - 98% line/branch coverage (Target: 100% on critical paths). [05-METRICS]
   - Test-to-code ratio ≥ 1.0 (new code in PRs). [05-METRICS]
   - Mutation testing (Stryker) score ≥ 80% on changed files. [05-METRICS]
   - PRs without tests are BLOCKED. [05-METRICS]
2. **Architecture Integrity:**
   - **Backend:** Hexagonal (Ports & Adapters) - Domain pure (no frameworks/IO). [04-ARCH]
   - **Frontend:** Reactive Architecture (Unidirectional data flow, streams). [04-ARCH]
   - **Dependency:** No violations allowed (enforced by `ts-arch`). [05-METRICS]
3. **Git Workflow:** 
   - Trunk-Based Development. [08-GIT-WORKFLOW]
   - Commits follow TDD cycle: Red → Green → Refactor. [06-TEST-STRATEGY]
4. **Automatic Sensor Response [Inferred]:**
   - Agent MUST evaluate metrics against these gates automatically. 
   - Non-compliance blocks PR merge or requires an ADR waiver.

## Business Context & Rules
- **Domain:** Headless CMS MVP for articles/pages via REST API. [01-REQ]
- **Business Rules:**
  - **Audit Logging:** Every create/update/delete action SHALL be logged. [BR-03]
  - **Draft/Publish:** Draft → Review → Publish workflow is mandatory. [BR-02]
  - **Auth/RBAC:** Exact 3 roles (Admin, Editor, Author). [BR-05/FR-USER-03]
  - **Passwords:** Minimum 12 chars, hashed via Argon2id/bcrypt. [FR-AUTH-02/03]
  - **Content Management:** Article/Page types only. [01-REQ]
- **MVP Scope:**
  - **In-Scope:** Content CRUD, Audit Log, User RBAC, REST API, Media Lib.
  - **Out-of-Scope:** Multi-language, CDN integration, Analytics. [01-REQ]

## Review Protocol
- Every significant architecture change MUST include an ADR. [04-ARCH/08-GIT]

## Guardrail Classification
- [Document] G-03..G-07: CI Pipeline gates (source of truth)
- [Inferred] pre-commit hook: shift-left warning, bypass allowed
- [Inferred] pre-push hook: mirrors CI gate G-03, no bypass

## Execution Rules
- ห้ามเขียน implementation ก่อน RED phase pass และได้รับ confirm
- ห้ามสร้างไฟล์นอกเหนือจากที่ระบุใน ticket ปัจจุบัน
- ต้องหยุดรอ confirm ทุกครั้งหลังจบแต่ละ phase (RED/GREEN/REFACTOR)
- Windows environment: ใช้ cmd.exe /c ครอบทุก shell command
- ห้ามข้ามคำถามที่ถามค้างอยู่ ต้องตอบให้ครบก่อนทำงานต่อ
- เมื่อเจอ architecture decision ใหม่ ให้เพิ่ม entry ใน .harness/context/decision-log.md ก่อนลงมือทำเสมอ รอ confirm จาก user
## Document Sync Rules (กฎการซิงค์เอกสาร)
ทุกครั้งที่มีสิ่งเหล่านี้เกิดขึ้น ต้องอัปเดตเอกสารทันที
ก่อนไปทำงานถัดไป:

**เมื่อจบแต่ละ Ticket:**
- progress.json: อัปเดต status และ next_ticket
- handoff: สร้าง handoff document ใหม่ โดยตั้งชื่อไฟล์ในรูปแบบ `handoff-<ลำดับตัวเลข 3 หลัก>-<ชื่อฟังก์ชัน/ฟีเจอร์>.md` เท่านั้น (เช่น `handoff-005-register-adapter.md`) ห้ามใส่คำว่า ticket หรือ contract ลงในชื่อไฟล์ และห้ามตั้งชื่อเฉพาะตัวเลขโดยไม่มีชื่อฟังก์ชันต่อท้าย
- decision-log.md: เพิ่ม entry ถ้ามี architecture decision

**เมื่อมี Architecture Decision ใหม่:**
- decision-log.md: เพิ่มทันที ก่อนลงมือทำ
- AGENTS.md: ถ้ากฎใหม่กระทบทุก session

**เมื่อพบ Conflict กับเอกสารใน Docs/:**
- flag ทันที ห้ามเดินหน้าโดยไม่แจ้ง user
- หลัง resolve: อัปเดต knowledge_inventory.md

**เมื่อเพิ่ม field ใหม่ใน Domain Entity:**
- อัปเดต knowledge_inventory.md ส่วน domain model
- อัปเดต metrics_inventory.md ถ้ากระทบ threshold

**เมื่อเพิ่ม sensor หรือ gate ใหม่:**
- อัปเดต gates/gate-spec.json
- อัปเดต AGENTS.md Sensor Checklist
- อัปเดต scripts/verify-harness.py ถ้าเพิ่มไฟล์ใหม่

ห้ามข้ามกฎเหล่านี้ การไม่อัปเดตเอกสาร
ถือเป็น violation เทียบเท่ากับ architecture violation

## Sensor Checklist (รันหลังจบทุก TDD cycle)
สามารถรันผ่านคำสั่งเดียวแบบ Cross-platform: `python .harness/harness-runner.py` หรือรันแยกตามรายการ:
- [x] TypeScript Typecheck (`npx tsc --noEmit`)
- [x] ESLint (`npx eslint src --ext .ts`)
- [x] m-tdd.py: ตรวจ Test-to-Code Ratio $\ge 1.0$ และ PRs without tests = 0
- [x] m-cov.py: ต้องได้ status PASS (threshold 98%)
- [x] m-hex.py: ต้องได้ status PASS (0 violations)

## Harness Files Reference (Universal Cross-Platform Python)
| ไฟล์ | หน้าที่ | Layer |
|---|---|---|
| .harness/context/AGENTS.md | source of truth สำหรับ agent | Context |
| .harness/context/acceptance-criteria.json | รายการ Business Rules & Functional Requirements พร้อมสถานะความคืบหน้า | Context |
| .harness/context/knowledge_inventory.md | snapshot เนื้อหาเอกสารทั้งหมด | Context |
| .harness/context/metrics_inventory.md | ตาราง metric ทั้งหมดพร้อม threshold | Context |
| .harness/sensors/m-cov.py | ตรวจ coverage $\ge 98\%$ | Sensor |
| .harness/sensors/m-hex.py | ตรวจ hexagonal architecture 0 violations | Sensor |
| .harness/sensors/m-tdd.py | ตรวจ Test-to-Code Ratio และกฎ TDD | Sensor |
| .harness/harness-runner.py | Unified CLI สำหรับรัน Sensors & Guardrails ทั้งหมด | Runner |
| .harness/test_harness.py | Automated Self-Verification Suite ทดสอบระบบ Harness | Test Suite |
| .harness/guardrails/pre_commit.py | block commit ถ้า typecheck/lint/arch fail | Guardrail |
| .harness/guardrails/pre_push.py | block push ถ้า coverage/arch fail | Guardrail |
| .harness/guardrails/install_hooks.py | ติดตั้ง git hooks (.py ฉบับ Cross-platform) | Guardrail |
| .harness/contracts/ | task contract ก่อนเริ่มงานแต่ละชิ้น | Contract |
| .harness/tickets/ | task ticket ก่อนเริ่มงานแต่ละชิ้น | Ticket |
| .harness/handoffs/ | handoff document ระหว่าง session | Handoff |
| .harness/lesson-learned/ | บันทึกปัญหาและวิธีแก้ | Learning |
