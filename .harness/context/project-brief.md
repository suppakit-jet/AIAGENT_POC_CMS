# Project Brief: Content Management System (CMS) MVP

## 📖 1. CMS MVP คืออะไร ทำอะไรได้บ้าง?
ระบบ **Headless Content Management System (CMS) — MVP** คือระบบจัดการเนื้อหาแบบไร้ส่วนแสดงผล (Headless) ที่เน้นให้บริการเนื้อหาผ่าน REST API เพื่อให้ระบบภายนอกนำไปแสดงผลได้อย่างอิสระ 

**ความสามารถหลัก (In-Scope Features):**
- **Content CRUD & Types:** จัดการสร้าง แก้ไข และลบเนื้อหา รองรับประเภท **Article (บทความ)** และ **Page (หน้าเว็บทั่วไป)** เท่านั้น
- **Draft → Review → Publish Workflow:** ระบบจัดการสถานะเนื้อหา บังคับให้ผ่านขั้นตอนร่าง ตรวจสอบ และเผยแพร่ตามลำดับ [BR-02]
- **RBAC Authentication & Security:** ระบบยืนยันตัวตนและจำกัดสิทธิ์ผู้ใช้ด้วย 3 Roles พื้นฐานอย่างเคร่งครัด ได้แก่ **Admin**, **Editor**, และ **Author** [BR-05/FR-USER-03] พร้อมบังคับรหัสผ่านยาวขั้นต่ำ 12 ตัวอักษรเข้ารหัสแบบ Argon2id/bcrypt [FR-AUTH-02/03]
- **Audit Logging:** ระบบบันทึกประวัติการกระทำทุกอย่าง (Create, Update, Delete) สำหรับตรวจสอบย้อนหลัง [BR-03]
- **Media Library:** ระบบจัดการอัปโหลดและเก็บรักษาสื่อรูปภาพ/ไฟล์ประกอบเนื้อหา

*(นอกขอบเขต MVP: ระบบหลายภาษา Multi-language, การเชื่อมต่อ CDN ภายนอก, และระบบวิเคราะห์ Analytics)*

---

## 🛠️ 2. Tech Stack
- **Backend (BE):** [NestJS](https://nestjs.com/) (TypeScript) + [Prisma ORM](https://www.prisma.io/) สำหรับติดต่อฐานข้อมูล
- **Frontend (FE):** [React](https://react.dev/) + [Vite](https://vitejs.dev/) (Fast & Lightweight Build Tool)
- **Quality & Harness Tools:** TypeScript (`tsc`), ESLint, Vitest, Stryker (Mutation Testing), Dependency-Cruiser (`ts-arch`), และ Python 3 (Universal Harness Runner)

---

## 🏛️ 3. สถาปัตยกรรม (Architecture)
- **Backend Architecture: Hexagonal Architecture (Ports & Adapters)**
  - แบ่งแยกชั้นตรรกะทางธุรกิจ (**Domain Layer**) ออกจากเทคโนโลยีภายนอกอย่างเด็ดขาด
  - **Domain Pure:** ห้ามมีการนำเข้า Framework, ORM, หรือ I/O ในชั้น Domain
  - ติดต่อสื่อสารระหว่างชั้นผ่าน **Inbound/Outbound Ports** (Interfaces) และ Implement ด้วย **Adapters**
- **Frontend Architecture: Reactive Architecture**
  - ออกแบบบนพื้นฐานของ Unidirectional Data Flow (ทิศทางข้อมูลทางเดียว) และ Streams เพื่อให้ UI ตอบสนองต่อการเปลี่ยนแปลงข้อมูลอย่างรวดเร็วและคาดเดาผลลัพธ์ได้ง่าย

---

## 🛡️ 4. Harness คืออะไรและทำไมถึงต้องมี?
**Engineering Harness** คือระบบโครงสร้างพื้นฐานด้านคุณภาพ (Quality Infrastructure) ที่ประกอบด้วย **Context**, **Sensors**, **Guardrails**, และ **Runners** ทำหน้าที่เสมือน "สายรัดนิรภัยและระบบนำทางอัตโนมัติ" ให้กับทีมพัฒนาและ AI Agents

**ทำไมถึงต้องมี Harness?**
1. **ป้องกันความเสื่อมถอยของโค้ด (Zero Regression):** บังคับใช้กฎทางสถาปัตยกรรม (เช่น ห้าม Domain Import DB Adapter) ผ่านเครื่องมือตรวจจับอัตโนมัติ
2. **การันตีคุณภาพระดับสูง (High Quality Gates):** บังคับ Test Coverage $\ge 98\%$ และ Test-to-Code Ratio $\ge 1.0$ ป้องกันการสร้างฟีเจอร์โดยไร้ Test
3. **การพัฒนาแบบคู่ขนานคน-AI (Human-AI Collaboration):** ช่วยให้ AI Agent ทำงานได้อย่างมั่นใจ โดยมีสายรัดตรวจสอบคอยเตือนและ Block ทันทีเมื่อทำผิดกฎ โดยไม่ต้องรอให้คนมาตรวจจับเองในภายหลัง

---

## 📂 5. ลิงก์ไปไฟล์สำคัญใน `.harness/`
- **[AGENTS.md](file:///d:/Home%20work%202/.harness/context/AGENTS.md):** คู่มือและกฎเหล็กประจำตัว Agent (Source of Truth)
- **[metrics_inventory.md](file:///d:/Home%20work%202/.harness/context/metrics_inventory.md):** ตารางรวมเกณฑ์ชี้วัดคุณภาพ (Metrics) และเกณฑ์ผ่าน (Thresholds)
- **[decision-log.md](file:///d:/Home%20work%202/.harness/context/decision-log.md):** บันทึกการตัดสินใจทางสถาปัตยกรรม (ADR Log)
- **[harness-runner.py](file:///d:/Home%20work%202/.harness/harness-runner.py):** Unified CLI Runner สำหรับรันตรวจสอบทุก Guardrails & Sensors ในคำสั่งเดียว (`python .harness/harness-runner.py`)
- **[test_harness.py](file:///d:/Home%20work%202/.harness/test_harness.py):** Automated Test Suite สำหรับตรวจสอบความถูกต้องของตัวระบบ Harness เอง
- **[pre_commit.py](file:///d:/Home%20work%202/.harness/guardrails/pre_commit.py) & [pre_push.py](file:///d:/Home%20work%202/.harness/guardrails/pre_push.py):** Git Guardrails ที่คอย Block การ Commit/Push ที่ไม่ผ่านเกณฑ์
