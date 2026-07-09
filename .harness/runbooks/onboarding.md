# Runbook: New Session Onboarding Guide (`new-session-onboarding.md`)

คู่มือสำหรับ AI Agent และนักพัฒนาที่เพิ่งเริ่มต้น Session การทำงานใหม่ในโปรเจกต์ CMS MVP ให้ปฏิบัติตามขั้นตอนด้านล่างนี้ทันที เพื่อทำความเข้าใจระบบ รักษาความต่อเนื่องของงาน และป้องกันไม่ให้เกิดความผิดพลาดในสถาปัตยกรรม

---

## 📖 1. ไฟล์ที่ต้องอ่านก่อนเริ่มงาน (Mandatory Reading List)
ก่อนลงมือเขียนโค้ดหรือทำการแก้ไขใดๆ **ต้องอ่านไฟล์สำคัญตามลำดับต่อไปนี้เสมอ:**
1. **[`AGENTS.md`](file:///d:/Home%20work%202/.harness/context/AGENTS.md):** อ่านกฎเหล็ก (Mandatory Rules), ขอบเขตโปรเจกต์ MVP, กฎข้อบังคับของ TDD และ Hexagonal Architecture
2. **[`project-brief.md`](file:///d:/Home%20work%202/.harness/context/project-brief.md):** อ่านสรุปภาพรวมระบบ, สถาปัตยกรรม NestJS + React, และความสำคัญของระบบ Harness
3. **[`metrics_inventory.md`](file:///d:/Home%20work%202/.harness/context/metrics_inventory.md):** ตรวจสอบเกณฑ์ Threshold (เช่น Coverage $\ge 98\%$, Test-to-Code Ratio $\ge 1.0$)
4. **[`decision-log.md`](file:///d:/Home%20work%202/.harness/context/decision-log.md):** อ่านบันทึกการตัดสินใจ (ADR Log) เพื่อไม่ให้เขียนโค้ดขัดแย้งกับสิ่งที่ตกลงไว้แล้ว เช่น การใช้ `User.create()`, Port Extraction, และ Python Cross-Platform

---

## 🔍 2. คำสั่งที่ต้องรันก่อนลงมือ (Pre-flight Checks)
เพื่อตรวจสอบสุขภาพของโปรเจกต์ว่าอยู่ในสถานะสีเขียว (Green) ก่อนที่เราจะเริ่มงานใหม่ ให้รันคำสั่งต่อไปนี้ใน Terminal:
1. **ติดตั้งและอัปเดต Git Hooks:**
   ```bash
   python .harness/guardrails/install_hooks.py
   ```
2. **ตรวจความสมบูรณ์ของระบบ Harness (Self-Test):**
   ```bash
   python .harness/test_harness.py
   ```
3. **รันตรวจคุณภาพทั้งโปรเจกต์ (Harness Runner):**
   ```bash
   python .harness/harness-runner.py --skip-cov
   ```
   *หมายเหตุ: หากพบว่ามีข้อผิดพลาดตั้งแต่ก่อนเริ่มงาน ให้แจ้งผู้ใช้ (User) ทันทีก่อนทำการปรับแก้*

---

## 📂 3. วิธีอ่าน Handoff Document
รายงาน Handoff คือเอกสารส่งต่อบริบทระหว่าง Session จัดเก็บอยู่ในโฟลเดอร์ `.harness/handoffs/` (เรียงตามลำดับหมายเลข เช่น `handoff-004.md`)
- **สิ่งที่ต้องค้นหาใน Handoff ล่าสุด:**
  1. **Executive Summary / Accomplishments:** ดูว่า Session ก่อนหน้าทำอะไรเสร็จไปแล้วบ้าง
  2. **Current Quality Metrics:** ตรวจสอบค่า Metric ล่าสุด (เช่น Test-to-Code ratio, Arch violations)
  3. **Next Steps (งานถัดไป):** ดูคำแนะนำที่เซสชันก่อนทิ้งไว้ให้ว่าเราควรเริ่มทำอะไรเป็นเป้าหมายต่อไป

---

## 📝 4. วิธีสร้าง Contract ใหม่
เมื่อรับคำสั่งจากผู้ใช้ ให้สร้างไฟล์ Contract ใหม่ก่อนลงมือทำเสมอ (เช่น `.harness/contracts/contract-05.json`):
1. **โครงสร้าง JSON มาตรฐาน:**
   ```json
   {
     "title": "Contract-XX: [ชื่อภารกิจ]",
     "phase": "BACKEND / FRONTEND / INFRA",
     "decision_maker": "Human approved / Agent proposed",
     "stage": "Backend Domain / Application / Adapters",
     "impact_level": "High / Medium / Low",
     "review_date": "หลังครบ 3 TDD cycles",
     "inputs": ["ไฟล์ที่ต้องใช้หรืออ่านอ้างอิง"],
     "outputs": ["ไฟล์ที่คาดว่าจะสร้างหรือแก้ไข"],
     "constraints": ["ข้อจำกัดทางเทคนิค หรือสถาปัตยกรรม"],
     "definition_of_done": [
       "[ ] 1. [RED] เขียน Test...",
       "[ ] 2. [GREEN] Implement...",
       "[ ] 3. [REFACTOR]...",
       "[ ] 4. รัน python .harness/harness-runner.py ผ่านครบ"
     ]
   }
   ```
2. นำเสนอ Contract ให้ผู้ใช้ตรวจสอบและอนุมัติ (Approve) ก่อนลงมือเขียนโค้ด Test ใน RED Phase

---

## ⚠️ 5. กฎที่ต้องปฏิบัติตาม (Core Behavioral Rules)
- 🚫 **ห้ามข้ามขั้นตอน TDD:** ต้องผ่าน RED → GREEN → REFACTOR โดยหยุดรอ Confirm จากผู้ใช้ทุกครั้งหลังจบแต่ละขั้น
- 🚫 **ห้ามเขียน Implementation ก่อนเขียน Test:** และห้ามสร้างโค้ดเผื่อนอกเหนือจากที่เทสต์ระบุ
- 🚫 **ห้าม Import ข้าม Layer ผิดกฎ Hexagonal Architecture:** Domain ห้ามมี I/O หรือ Framework ถ้าจำเป็นต้องติดต่อภายนอกให้ใช้ Outbound Port เสมอ
- 💻 **การรันบน Windows:** หากใช้ Terminal เรียกสคริปต์ `npm`, `npx` ในไพธอน จะต้องห่อหุ้มด้วย `cmd.exe /c` เสมอตามรูปแบบ Cross-platform
- 🛑 **เมื่อติดปัญหา:** หากเทสต์ไม่ผ่านหรือเกิด Error เกิน 1 ครั้ง ห้ามสุ่มแก้โค้ด ให้เข้าสู่กระบวนการ **5-Why Analysis** (อ้างอิง `.harness/runbooks/troubleshoot-issue.md`) ทันที
