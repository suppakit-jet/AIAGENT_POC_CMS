# Architecture Decision Log

## 2026-06-29 — User Entity Static Factory Method
**Status:** Accepted
**Context:** ในการสร้าง User Entity มี Invariants (เงื่อนไขทางธุรกิจ) ที่ต้องบังคับใช้ให้ถูกต้องเสมอ เช่น ความยาวรหัสผ่านขั้นต่ำและ Role ที่ถูกต้อง รวมทั้งจำเป็นต้องมีการ Hash รหัสผ่านซึ่งเป็นกระบวนการแบบ Asynchronous
**Decision:** เลือกใช้ Static Factory Method (`User.create()`) แบบ `async` เพื่อสร้าง Entity แทนการใช้ `new` โดยตรง และปิด Constructor ให้เป็น `private`
**Criteria:** 
- 1) ต้องรับประกัน Invariants (ความถูกต้อง) ของออบเจกต์ได้ 100% ตั้งแต่ตอนเกิด
- 2) รองรับ Asynchronous logic (เช่นการ Hash รหัสผ่าน) ในระดับ Domain ได้อย่างปลอดภัย
**Alternatives:** 
- ปล่อยให้ Use Case เป็นคน Hash รหัสผ่านแล้วส่งเข้ามาตรงๆ (ข้อเสีย: Domain หลุดจากการควบคุม Invariant ตัวเอง)
- ใช้ `new User()` แล้วมี Method ย่อยให้เรียก Hash แยกต่างหาก (ข้อเสีย: ออบเจกต์อาจอยู่ในสถานะที่ไม่สมบูรณ์ หรือลืมเรียก)
**Consequences:** 
- รับประกันว่าออบเจกต์ `User` จะอยู่ในสถานะที่ Valid สมบูรณ์ 100% ทันทีที่ถูกสร้าง
- จำเป็นต้อง Inject `IPasswordHasher` (Port) เข้ามาใน Factory Method เพื่อใช้ในระดับ Domain

## 2026-06-29 — IPasswordHasher Extract เป็น Outbound Port
**Status:** Accepted
**Context:** `IPasswordHasher` เป็นอินเทอร์เฟซตัวแทนของระบบภายนอกที่มีการคำนวณหรือ I/O ซึ่งเดิมทีถูกเขียนรวมไว้ในไฟล์ `user.entity.ts` ของ Domain Layer
**Decision:** สกัด `IPasswordHasher` ออกจากไฟล์ Entity และย้ายออกไปจัดเก็บเป็น Outbound Port ภายใต้ `application/ports/out/password-hasher.interface.ts`
**Criteria:**
- 1) รักษากฎ Domain Purity ของ Hexagonal Architecture (Domain ห้ามมี I/O หรือผูกมัดกับ External Library)
- 2) ต้องสลับไปใช้วิธี Hash แบบอื่น (เช่น Bcrypt) ได้ง่ายในอนาคตโดยไม่กระทบ Business Logic
**Alternatives:** เก็บอินเทอร์เฟซไว้ที่ `domain/entities` เหมือนเดิมเพื่อความสะดวกในการอิมพอร์ต (ข้อเสีย: ทำลายแนวคิด Port & Adapter ที่ควรแบ่งแยกสิ่งที่ติดต่อกับภายนอกออกไปให้ชัดเจน)
**Consequences:** 
- ช่วยรักษาความบริสุทธิ์ของ Domain Layer (Domain Purity) ให้อย่างสมบูรณ์ตามหลัก Hexagonal
- โครงสร้างของ Ports ถูกแบ่งสัดส่วนชัดเจนว่านี่คือส่วนเชื่อมต่อขาออก (Outbound Port)
- ส่งผลให้ต้องอัปเดตอิมพอร์ตใน Entity และ Use Case ให้เรียกผ่านโฟลเดอร์ Ports

## DL-003: Cross-platform Python Guardrails
**Status:** Implemented
**Stage:** Harness Infrastructure
**Decision Maker:** Human approved / Agent proposed
**Decision:** เปลี่ยนจาก bash → Python เพื่อรองรับ Windows
**Impact Level:** High
**Review Date:** หลังครบ 3 TDD cycles
**Context:** ทีมพัฒนาใช้งานระบบปฏิบัติการที่หลากหลาย (Windows และ macOS) ทำให้สคริปต์ Guardrails เดิมที่เป็น Bash (`.sh`) เกิดปัญหา Path และคำสั่งบน Shell ไม่ตรงกัน
**Criteria:**
- 1) ต้องทำงานได้เหมือนกัน 100% ทั้งบน Windows (PowerShell/CMD/Git Bash) และ macOS/Linux (Zsh/Bash)
- 2) ห้ามพึ่งพา Bash-only utilities ที่ไม่มีบน Windows
**Alternatives:** ใช้ WSL หรือ Git Bash บังคับบน Windows (ข้อเสีย: ตั้งค่ายุ่งยาก และเกิดปัญหา Path ใน subprocess ของ Node/npm)
**Consequences:**
- ระบบ Harness มี Portability สูงสุด รันเทสต์และ Guardrail ผ่านทุก OS โดยไม่ต้องตั้งค่าพิเศษ
- ตัดความซ้ำซ้อนของสคริปต์ `.sh` เดิมทิ้ง เหลือเพียงมาตรฐาน Python ตัวเดียว

## 2026-07-07 — DL-004: Feature-Centric Contract Workflow (1 Contract ต่อ 1 Feature)
**Status:** Accepted
**Stage:** Full-Stack Development Workflow
**Decision Maker:** Human approved / Agent proposed
**Context:** ในช่วงเริ่มต้นของโปรเจกต์ (Contract 01-05) มีการแยก Contract ตามช่วงของ TDD Phase หรือตาม Layer ของ Hexagonal Architecture แยกย่อย (เช่น RED phase แยกจาก GREEN/REFACTOR) ซึ่งทำให้เกิดโอเวอร์เฮดในการจัดการ Contract และ Handoff จำนวนมาก
**Decision:** ตั้งแต่ Contract-06 เป็นต้นไป เปลี่ยนรูปแบบเป็น "1 Contract ต่อ 1 Feature" โดยครอบคลุมตั้งแต่ Domain Layer, Application Layer (UseCase), จนถึง Adapter Layer และดำเนินการตามวงจร TDD (RED -> GREEN -> REFACTOR) ทุก Layer ภายใต้ Contract เดียวกัน
**Criteria:**
- 1) ลดขั้นตอนเอกสารที่ซ้ำซ้อน ทำให้การพัฒนา Feature หนึ่งๆ มีความต่อเนื่อง (End-to-End Flow)
- 2) ยังคงรักษาการควบคุมคุณภาพด้วย TDD cycle และ Guardrails อย่างเคร่งครัด โดยหยุดรอยืนยันระหว่าง RED และ GREEN/REFACTOR ภายใน Contract เดียว
**Consequences:**
- เอกสาร Contract จะมี scope ของไฟล์ใน `inputs` และ `outputs` ที่ครอบคลุมทั้ง 3 Layers (Domain, UseCase, Adapter)
- ช่วยให้ Agent และ Developer เห็นภาพรวมของ Feature ได้ชัดเจนยิ่งขึ้นในที่เดียว

