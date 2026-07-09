# 🎓 รายงานวิจัยและโครงการจบ: การพัฒนาระบบควบคุมวิศวกรรม (Harness Engineering Control Ecosystem) สำหรับควบคุมคุณภาพและสถาปัตยกรรมซอฟต์แวร์ในการพัฒนาซอฟต์แวร์ด้วย AI Agent
**กรณีศึกษา: ระบบบริหารจัดการเนื้อหา (Content Management System — CMS MVP)**

---

## 📋 บทคัดย่อ (Abstract)

ในปัจจุบัน การประยุกต์ใช้ **AI Coding Agent** (เช่น Large Language Model-based Agents) ในกระบวนการพัฒนาซอฟต์แวร์ช่วยเพิ่มความรวดเร็วและผลผลิตได้อย่างมีนัยสำคัญ อย่างไรก็ตาม ปัญหาหลักที่มักเกิดขึ้นจากการใช้ AI Agent โดยลำพังคือ การสร้างโค้ดที่ผิดเพี้ยนไปจากมาตรฐานสถาปัตยกรรมที่ตั้งไว้ (Architecture Erosion / Violations) การละเลยกระบวนการเขียนชุดทดสอบ (Skipping TDD & Low Test Coverage) และการสร้างหรืออ้างอิงข้อมูลที่ไม่มีจริง (Hallucination)

รายงานฉบับนี้จึงนำเสนอ **"การพัฒนาระบบควบคุมวิศวกรรม (Harness Engineering Control Ecosystem)"** ที่ออกแบบข้ามแพลตฟอร์ม (Universal Cross-Platform) โดยอ้างอิงและต่อยอดแนวคิด Harness Engineering ของ **Martin Fowler** เพื่อสร้างกรอบการควบคุมอัตโนมัติรอบตัว AI Agent ประกอบด้วย 3 ชั้นหลัก ได้แก่ **Context Layer (Feedforward)**, **Sensors Layer (Feedback via Unified JSON Schema)**, และ **Guardrails Layer (Enforcement)** พร้อมระบบตรวจวัดและยืนยันความถูกต้องของตัว Harness เอง (Self-Verification Suite)

ผลการทดลองนำระบบ Harness Engineering มาควบคุมการพัฒนาระบบ Backend CMS MVP (Hexagonal Architecture) พบว่า ระบบสามารถควบคุมให้ AI Agent พัฒนาโค้ดผ่าน **6 Quality Gates** ได้ครบถ้วน 100% โดยมี Test-to-Code Ratio สูงถึง **1.61**, อัตราการครอบคลุมของชุดทดสอบ (Unit Test Coverage) **100.0%** และไม่มีการละเมิดสถาปัตยกรรม Hexagonal เลยแม้แต่จุดเดียว (**0 Architecture Violations**)

---

## 1. บทนำและแนวคิดพื้นฐาน (Introduction & Core Concepts)

### 1.1 ความท้าทายของการพัฒนาซอฟต์แวร์ด้วย AI Agent
เมื่อ AI Agent เขียนโค้ดในโปรเจกต์ขนาดใหญ่ มักเกิดพฤติกรรมที่ไม่พึงประสงค์ 4 ประการ:
1. **Architectural Drift:** ปะปนชั้นโค้ด (Layer Mixing) เช่น นำ Framework Decorator เข้าไปไว้ใน Domain Entity หรือให้ Adapter โทรหากันเอง
2. **Testing Shortcuts:** เขียนโค้ดฟีเจอร์โดยไม่เขียน Test หรือเขียน Test ที่ไม่มี Assertions จริงจัง
3. **Context Loss:** ลืมข้อกำหนด Business Rules หรือ Functional Requirements เมื่อบทสนทนายาวขึ้น
4. **Silent Regression:** แก้ไขโค้ดส่วนหนึ่งแล้วไปทำลายความถูกต้องของอีกส่วนหนึ่งโดยไม่รู้ตัว

### 1.2 แนวคิด Harness Engineering ตามปรัชญาของ Martin Fowler
Martin Fowler ได้เปรียบเทียบการพัฒนาซอฟต์แวร์ร่วมกับ AI เหมือนกับการขับเคลื่อนยานพาหนะประสิทธิภาพสูง ซึ่งจำเป็นต้องมี **"Harness" (ชุดยึดโยงและเซนเซอร์ควบคุม)** ที่คอยป้อนข้อมูลบริบทที่ถูกต้อง (Feedforward) คอยตรวจจับพฤติกรรม (Sensors Feedback) และมีด่านสกัดกั้นเมื่อระบบเบี่ยงเบนออกนอกเส้นทาง (Guardrails)

```
        ┌─────────────────────────────────────────────────────────┐
        │               HARNESS ENGINEERING ECOSYSTEM             │
        │                                                         │
        │  ┌───────────────────────────────────────────────────┐  │
        │  │ 1. CONTEXT LAYER (Feedforward / Source of Truth)  │  │
        │  │    • AGENTS.md • acceptance-criteria.json         │  │
        │  └─────────────────────────┬─────────────────────────┘  │
        │                            ▼ Feedforward Rules          │
        │                   [ AI CODING AGENT ]                   │
        │                            │ Writes Code                │
        │                            ▼                            │
        │  ┌───────────────────────────────────────────────────┐  │
        │  │ 2. SENSORS LAYER (Feedback / Computational Check) │  │
        │  │    • m-cov.py • m-hex.py • m-tdd.py               │  │
        │  └─────────────────────────┬─────────────────────────┘  │
        │                            ▼ Unified JSON Schema        │
        │  ┌───────────────────────────────────────────────────┐  │
        │  │ 3. GUARDRAILS LAYER (Enforcement / Hard Gates)    │  │
        │  │    • pre_commit.py • pre_push.py • CI Pipeline    │  │
        │  └───────────────────────────────────────────────────┘  │
        └─────────────────────────────────────────────────────────┘
```

---

## 2. สถาปัตยกรรมระบบ Harness Engineering (The 3-Layer Control Ecosystem)

ระบบ Harness ที่พัฒนาขึ้นในโครงการนี้ถูกแบ่งออกเป็น 3 เลเยอร์และส่วนศูนย์กลางการสั่งการ (Orchestration Engine) ดังนี้:

---

### 2.1 เลเยอร์ที่ 1: Context Layer (Feedforward & Governance)
ทำหน้าที่เป็น **"รัฐธรรมนูญ (Constitution)"** และแหล่งความรู้หลัก (Source of Truth) เพื่อส่งต่อข้อมูลเชิงรุก (Feedforward) ให้แก่ AI Agent ก่อนและระหว่างการเขียนโค้ด

#### 📄 `.harness/context/AGENTS.md`
- **หน้าที่:** เอกสารกำกับพฤติกรรมหลักของ AI Agent
- **โครงสร้างสำคัญ:**
  - **Execution Rules:** บังคับให้ Agent ดำเนินการผ่าน TDD Cycle (RED ➔ GREEN ➔ REFACTOR) ทุกครั้ง
  - **Hexagonal Constraints:** กฎเหล็กที่กำหนดให้ Domain Layer ห้ามพึ่งพา NestJS หรือ External Library ใด ๆ
  - **Harness Files Reference:** ตารางอ้างอิงไฟล์ทั้งหมดในระบบ Harness เพื่อให้ Agent ตระหนักถึงเซนเซอร์และการ์ดเรล

#### 📄 `.harness/context/acceptance-criteria.json`
- **หน้าที่:** แปลงเอกสาร Software Requirements Specification (SRS) ให้อยู่ในรูปแบบโครงสร้าง JSON ที่อ่านได้ทั้งมนุษย์และ AI
- **ความสำคัญ:** เชื่อมโยง Business Rules (`BR-01..08`) และ Functional Requirements (`FR-AUTH`, `FR-USER`, `FR-CONTENT`, `FR-MEDIA`, `FR-AUDIT`, `FR-PUBAPI`) เข้ากับ Ticket งาน พร้อมสถานะความพร้อม (`status: "done"`)

#### 📄 `.harness/context/knowledge_inventory.md` & `metrics_inventory.md`
- **หน้าที่:** สรุปรายการเอกสารทางเทคนิค และเกณฑ์ตัวชี้วัด (Quality Metrics Thresholds) ของระบบ เช่น อัตรา Coverage $\ge 98.0\%$, Architecture Violations $= 0$

---

### 2.2 เลเยอร์ที่ 2: Sensors Layer (Feedback & Automated Measurement)
เซนเซอร์คำนวณเชิงประจักษ์ (Computational Sensors) ที่คอยวิเคราะห์โค้ด โครงสร้าง และชุดทดสอบ แล้วส่งกลับผลลัพธ์เป็น **Unified JSON Schema** เพื่อให้ AI Agent สามารถทำ Self-Correction ได้อัตโนมัติ

#### 📄 `.harness/sensors/m-cov.py` (Line & Branch Coverage Sensor)
- **วัตถุประสงค์:** ตรวจวัดความครอบคลุมของการทดสอบ (Coverage Metric `M-COV-01`)
- **กลไกการทำงานเชิงลึก:**
  1. ทำการอ่านรายงาน `cobertura.xml` ที่สร้างจาก Vitest
  2. สกัดค่า `line-rate` ของทั้งโปรเจกต์และรายไฟล์ คำนวณเป็นเปอร์เซ็นต์ความครอบคลุม
  3. เปรียบเทียบกับ Threshold บังคับ ($\ge 98.0\%$)
  4. สร้างเอาต์พุตในรูปแบบ JSON:
     ```json
     {
       "metric_id": "M-COV-01",
       "name": "Overall Line Coverage",
       "value": 100.0,
       "threshold": 98.0,
       "status": "PASS"
     }
     ```

#### 📄 `.harness/sensors/m-hex.py` (Hexagonal Architecture Conformance Sensor)
- **วัตถุประสงค์:** ตรวจจับการละเมิดขอบเขตสถาปัตยกรรม Hexagonal (`M-HEX-01`)
- **กลไกการทำงานเชิงลึก:**
  1. สั่งรันเครื่องมือ `dependency-cruiser` เพื่อสร้าง Dependency Graph ในรูปแบบ JSON
  2. วิเคราะห์กฎความสัมพันธ์ระหว่าง Layer:
     - กฎที่ 1: `domain` ห้าม import จาก `adapters`, `application`, หรือ `nestjs`
     - กฎที่ 2: `application` ห้าม import จาก `adapters`
     - กฎที่ 3: `adapters` ฝั่ง Inbound ห้าม import จาก Outbound โดยตรง ต้องผ่าน Port ใน Application Layer เท่านั้น
  3. หากพบ Violation แม้แต่ 1 จุด ระบบจะรายงานสถานะ `FAIL` พร้อมระบุไฟล์และบรรทัดที่ละเมิด

#### 📄 `.harness/sensors/m-tdd.py` (Test-to-Code Ratio & TDD Discipline Sensor)
- **วัตถุประสงค์:** ประเมินวินัย TDD (`M-TDD-01`)
- **กลไกการทำงานเชิงลึก:**
  1. นับจำนวนบรรทัดของโค้ดจริง (Production Code `.ts`) และโค้ดเทสต์ (Test Code `.spec.ts`)
  2. คำนวณอัตราส่วน $\text{Ratio} = \frac{\text{Test Lines}}{\text{Production Lines}}$
  3. ตรวจสอบเกณฑ์ขั้นต่ำ ($\ge 1.0$) ซึ่งสะท้อนว่าโค้ดทุกบรรทัดมีชุดทดสอบที่ละเอียดและรัดกุมคอยกำกับ

---

### 2.3 เลเยอร์ที่ 3: Guardrails Layer (Enforcement & Hard Gates)
ด่านบังคับใช้กฎที่ทำงานเชื่อมโยงกับระบบควบคุมเวอร์ชัน (Git Hooks) และ CI Pipeline เพื่อสกัดกั้นโค้ดที่ไม่ได้มาตรฐานก่อนเข้าสู่คลังข้อมูลหลัก

#### 📄 `.harness/guardrails/pre_commit.py` (Shift-Left Quick Feedback Gate)
- **หน้าที่:** ทำงานอัตโนมัติก่อนคำสั่ง `git commit`
- **การทำงาน:** ทำการตรวจเช็คเร็ว (Quick Check) ด้าน Typecheck (`tsc`), Lint (`eslint`), และ Hexagonal Architecture (`m-hex.py`) หากพบข้อผิดพลาด จะหยุดกระบวนการ Commit ทันที

#### 📄 `.harness/guardrails/pre_push.py` (Comprehensive Hard Gate)
- **หน้าที่:** ด่านสุดท้ายก่อนส่งโค้ดขึ้นเซิร์ฟเวอร์ (`git push`)
- **การทำงาน:** บังคับรัน **Universal Harness Runner เต็มรูปแบบทั้ง 6 Gates** รวมถึง Unit Tests และ Coverage $\ge 98\%$ หากไม่ผ่าน จะบล็อกการ Push อย่างเด็ดขาด

#### 📄 `.harness/guardrails/install_hooks.py`
- **หน้าที่:** สคริปต์ติดตั้ง Git Hooks ข้ามแพลตฟอร์ม ทำให้ทีมพัฒนาและ AI Agent ได้รับการปกป้องภายใต้ Guardrails เดียวกันไม่ว่าจะใช้ระบบปฏิบัติการใด

---

## 3. ศูนย์กลางควบคุมและชุดตรวจสอบความถูกต้องของ Harness (Engine & Self-Verification)

เพื่อให้ระบบ Harness มีความน่าเชื่อถือสูงสุด จึงได้พัฒนา Orchestrator และระบบ Self-Test ขึ้นมาเป็นการเฉพาะ:

```
┌──────────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL HARNESS ENGINE                          │
│                   (.harness/harness-runner.py)                       │
│                                                                      │
│   Gate 1: verify-harness.py  ──►  Gate 2: TypeScript Typecheck       │
│                                           │                          │
│   Gate 4: m-tdd.py           ◄──  Gate 3: ESLint Code Linting        │
│          │                                                           │
│          ▼                                                           │
│   Gate 5: m-cov.py (100%)    ──►  Gate 6: m-hex.py (0 Violations)    │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.1 📄 `.harness/harness-runner.py` (Universal Cross-Platform Orchestrator)
- **บทบาท:** หัวใจสำคัญที่ควบคุมการประมวลผลของ Harness ทั้งหมด รองรับทั้ง Windows (cmd/PowerShell) และ Linux/macOS
- **ลำดับการตรวจสอบ 6 Quality Gates:**
  1. **Harness Integrity Check:** รัน `verify-harness.py` ตรวจความสมบูรณ์ของไฟล์ Harness ทั้ง 19 ไฟล์
  2. **TypeScript Typecheck:** รัน `tsc --noEmit` เพื่อรับประกันความถูกต้องของ Type System
  3. **Code Linting:** รัน `ESLint` เพื่อความสะอาดและมาตรฐานสไตล์โค้ด
  4. **TDD Discipline Gate:** รัน `m-tdd.py` ตรวจสอบ Test-to-Code Ratio
  5. **Unit Test & Coverage Gate:** รัน Vitest และ `m-cov.py` ตรวจสอบผลลัพธ์และ Coverage $\ge 98\%$
  6. **Hexagonal Architecture Gate:** รัน `m-hex.py` เพื่อยืนยันว่าไม่มี Architecture Violation

### 3.2 📄 `.harness/test_harness.py` (Automated Self-Verification Suite)
- **บทบาท:** **"ใครเป็นผู้ตรวจสอบผู้ตรวจสอบ? (Quis custodiet ipsos custodes?)"** สคริปต์นี้ถูกสร้างขึ้นเพื่อทดสอบว่าตัว Harness ทำงานได้อย่างถูกต้องจริง ไม่เกิด False Positive หรือ False Negative
- **การทำงาน:**
  1. **Negative Testing:** จำลองสร้างไฟล์โค้ดที่ละเมิดสถาปัตยกรรม (เช่น Domain import NestJS) แล้วตรวจสอบว่า `m-hex.py` แจ้ง `FAIL` ตามคาดหรือไม่

### 3.3 📄 `.harness/workflows/` (Universal 6-Stage Execution Workflow Specification)
- **บทบาท:** ควบคุมเส้นทางชีวิต (Lifecycle State Machine) ของการพัฒนาซอฟต์แวร์ร่วมกับ AI Agent และทีมพัฒนา โดยกำหนดไว้ 2 รูปแบบทั้ง Machine-Readable (`harness-workflow.json`) และ Human-Readable (`agent-execution-workflow.md`)
- **6 ขั้นตอนการทำงานที่เป็นมาตรฐานบังคับ (Deterministic 6-Stage Workflow):**
  1. **Stage 1 (Task Intake & Specification Alignment):** รับเข้างานจาก Ticket (`.harness/tickets/`) และตรวจสอบความสอดคล้องกับ Requirements (`Docs/01-governance/`)
  2. **Stage 2 (Pre-mortem Risk Analysis & Contract Definition):** สร้าง Contract กำหนด `Definition of Done (DoD)` และวิเคราะห์ความเสี่ยงก่อนเริ่มเขียนโค้ด
  3. **Stage 3 (Test-Driven Development — Red Phase):** สร้างไฟล์ Unit Test (`*.spec.ts`) ให้ Fail ตามสเปกก่อน โดยมี Sensor `m-tdd.py` คอยตรวจ Test-to-Code Ratio
  4. **Stage 4 (Implementation & Hexagonal Architecture Conformance — Green Phase):** เขียนโค้ดจริงใน Domain / Ports / Adapters ให้ผ่านเทสต์ทั้งหมด โดยมี Sensor `m-hex.py` ตรวจห้ามละเมิดสถาปัตยกรรม และ `m-cov.py` บังคับ Coverage 100%
  5. **Stage 5 (Universal Gate Verification):** รัน `python3 .harness/harness-runner.py` เพื่อตรวจสอบทั้ง 6 Quality Gates ต้องได้สถานะ `ALL PASSED`
  6. **Stage 6 (Knowledge Handoff & Synchronization):** บันทึกรายงาน Handoff อัปเดตสถานะ Ticket เป็น `DONE` และบันทึกผ่านระบบ Git Guardrails (`pre-commit` / `pre-push`)
  2. **Coverage Testing:** จำลองปรับลด Coverage แล้วตรวจสอบว่า `m-cov.py` สามารถสกัดกั้นการทำงานได้จริงหรือไม่

### 3.4 📄 `.harness/scripts/verify-harness.py` (Harness Structure Sensor)
- **บทบาท:** ตรวจสอบว่าไฟล์ในระบบ Harness ครบถ้วนทั้ง 19 ไฟล์ที่จำเป็น ไม่มีการลบหรือแก้ไขไฟล์สำคัญโดยไม่ได้ตั้งใจ

---

## 4. กรณีศึกษา: การประยุกต์ใช้กับระบบ CMS MVP Backend (Hexagonal Architecture)

ระบบ Harness Engineering ที่ออกแบบขึ้น ได้ถูกนำมาใช้ควบคุมการพัฒนา **CMS MVP Backend** ซึ่งแบ่งออกเป็น 4 โมดูลหลัก โดยทุกโมดูลต้องผ่านเกณฑ์ของ Harness 100%:

| โมดูล | องค์ประกอบใน Domain Layer (บริสุทธิ์ 100%) | การควบคุมโดย Harness Engineering |
| :--- | :--- | :--- |
| **Auth Module** | `User` Entity (UUID, Status, Password Complexity Rule) | `m-hex.py` ป้องกันไม่ให้ตรรกะ Hash หรือ JWT รั่วไหลเข้าสู่ Domain โดยบังคับผ่าน Port `IPasswordHasher` และ `ITokenGenerator` |
| **Content Module** | `Article` และ `Page` Entities, Lifecycle Workflow (`Draft` ➔ `Review` ➔ `Publish`) | `m-cov.py` บังคับให้เขียนชุดทดสอบคลุมทุก State Transition 100% ป้องกันบั๊กในวงจรชีวิตบทความ |
| **Audit Module** | `AuditLog` Entity (Append-only trail) | Guardrails ตรวจสอบไม่ให้มีเมธอด `update()` หรือ `delete()` ใน AuditLog Repository |
| **Media Module** | `Media` Entity (MIME Type, Magic Bytes, Responsive Variants) | `m-tdd.py` รับประกันว่าการตรวจสอบ Magic Bytes ทุกประเภทไฟล์มี Unit Test รองรับ |

---

## 5. ผลการทดลองและการประเมินประสิทธิภาพ (Experimental Evaluation)

จากการใช้คำสั่ง `python .harness/harness-runner.py` เพื่อตรวจสอบทั้งระบบ CMS MVP Backend ที่พัฒนาโดย AI Agent ภายใต้การกำกับดูแลของ Harness Ecosystem ได้ผลลัพธ์เชิงประจักษ์ดังนี้:

```
🚀 =========================================================
   UNIVERSAL ENGINEERING HARNESS RUNNER (Cross-Platform)   
   =========================================================

┌─────────────────────────────────────────────────────────────┐
│ 🏁 SUMMARY REPORT                                           │
├─────────────────────────────────────────────────────────────┤
│ ✅ harness structure         | Status: PASS   | Time:  0.07s │
│ ✅ typecheck                 | Status: PASS   | Time:   2.7s │
│ ✅ lint                      | Status: PASS   | Time:  4.39s │
│ ✅ tdd discipline            | Status: PASS   | Time:  0.09s │
│ ✅ coverage gate (100.0%)    | Status: PASS   | Time:  5.04s │
│ ✅ architecture gate         | Status: PASS   | Time:  5.35s │
├─────────────────────────────────────────────────────────────┤
│ FINAL RESULT: 🎉 ALL PASSED                 | Total: 17.65s │
└─────────────────────────────────────────────────────────────┘
```

### วิเคราะห์ผลลัพธ์ตามตัวชี้วัด (Metric Analysis):
1. **ความสมบูรณ์ของสถาปัตยกรรม (Architecture Conformance):** พบข้อผิดพลาด **0 Violations** ยืนยันว่า AI Agent สามารถเขียนโค้ดตามรูปแบบ Hexagonal Architecture ได้อย่างถูกต้องแม่นยำเมื่อมี Sensor `m-hex.py` คอยตรวจสอบ
2. **ความครอบคลุมของการทดสอบ (Coverage Integrity):** บรรลุความครอบคลุม **100.0%** ครบทั้ง 26 ไฟล์เทสต์ (117 Test Cases) เหนือกว่าเกณฑ์เป้าหมาย 98.0%
3. **สัดส่วนโค้ดทดสอบต่อโค้ดจริง (Test-to-Code Ratio):** ได้ค่า **1.61** ซึ่งแสดงให้เห็นว่าระบบมีโค้ดทดสอบที่หนาแน่นและรัดกุมกว่าโค้ดฟีเจอร์จริงถึง 1.6 เท่า

---

## 6. สรุปผลและข้อเสนอแนะสำหรับการวิจัยต่อยอด (Conclusion & Future Work)

### 6.1 สรุปผลการศึกษา
รายงานวิจัยและโครงการจบนี้นำเสนอให้เห็นว่า **Harness Engineering** ไม่ใช่เพียงเครื่องมือทดสอบซอฟต์แวร์ทั่วไป แต่เป็น **"ระบบนิเวศทางวิศวกรรม (Engineering Control Ecosystem)"** ที่จำเป็นอย่างยิ่งในยุคของการพัฒนาซอฟต์แวร์ร่วมกับ AI Agent การผสานกันของ **Context Layer**, **Sensors Layer**, และ **Guardrails Layer** ช่วยกำจัดจุดอ่อนของ AI (เช่น Hallucination และ Architecture Erosion) และยกระดับคุณภาพของซอฟต์แวร์ให้อยู่ในเกณฑ์สูงสุดได้อย่างเป็นรูปธรรม

### 6.2 ข้อเสนอแนะสำหรับการวิจัยต่อยอด
- **Mutation Testing Sensor (`M-TDD-03`):** พัฒนาเซนเซอร์ร่วมกับ Stryker เพื่อประเมินความแข็งแกร่งของ Test Assertions
- **LLM-as-a-Judge Inferential Sensor:** ประยุกต์ใช้โมเดล AI ขนาดเล็กในเซนเซอร์เพื่อวิเคราะห์คุณภาพการตั้งชื่อและความสละสลวยของโค้ด (Code Readability & Cohesion)
