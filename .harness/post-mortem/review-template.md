# Post-Mortem Analysis & Reflection Template (`review-template.md`)

> **วัตถุประสงค์:** ใช้บันทึกทบทวนหลังเสร็จสิ้นภารกิจหรือ Contract (Retrospective / Post-Mortem) เพื่อถอดบทเรียน ความสำเร็จ และปัญหาที่พบ นำไปปรับปรุงกระบวนการพัฒนาและระบบ Harness ในรอบถัดไป (Continuous Improvement)

---

## 📋 ข้อมูลทั่วไป (Contract Metadata)
- **Contract ID:** `Contract-XX`
- **Feature / Scope:** [ชื่อฟีเจอร์หรือโมดูลที่พัฒนาเสร็จสิ้น]
- **Author / Agent:** [ชื่อวิศวกร หรือรหัส Agent]
- **Completion Date:** `YYYY-MM-DD`
- **Final Metrics:**
  - Test-to-Code Ratio: `X.XX`
  - Total Coverage: `XX.XX%`
  - Arch Violations: `0`

---

## 🌟 1. What Went Well? (สิ่งที่ดีและประสบความสำเร็จ)
*อะไรที่ราบรื่น ทำงานได้ดี หรือเป็นเทคนิคที่ควรคงไว้ใช้ในงานหน้า?*
- ปฏิบัติตามวินัย TDD (Red-Green-Refactor) ได้ครบถ้วนโดยไม่มีการลัดขั้นตอน
- เซนเซอร์และ Git Hooks ช่วยจับข้อผิดพลาดเรื่อง Type และ Lint ได้ตั้งแต่ก่อน Commit ทำให้ CI/CD ไม่พัง
- การสกัด Outbound Port ทำให้โค้ดใน Domain Layer สะอาดบริสุทธิ์ 100% เทสต์ง่ายโดยไม่ต้องเชื่อมต่อฐานข้อมูลจริง

---

## 🌩️ 2. What Went Wrong? (ปัญหาและอุปสรรคที่พบ)
*ติดขัดตรงไหน หรือมีเหตุการณ์อะไรที่ทำให้งานล่าช้า? (ระบุตามความเป็นจริงเพื่อหาทางแก้ไข)*
- [ตัวอย่าง] ติดปัญหาเรื่อง Path หรือบรรทัดคำสั่งเมื่อรันบนระบบปฏิบัติการที่ต่างกัน (Windows vs macOS)
- [ตัวอย่าง] เขียน Test Case ไม่ครอบคลุม Branch Exception ในครั้งแรก ทำให้ Coverage ลดลงจนถูก `m-cov.py` Block ตอน push

---

## 🧠 3. Lessons Learned (บทเรียนที่ได้รับ)
*องค์ความรู้ใหม่ แนวทางแก้บั๊ก หรือข้อควรระวังที่ควรส่งต่อให้คนอื่นหรือ Agent ตัวถัดไป*
- **[Architectural Lesson]:** การทำ Inversion of Control ด้วย Ports & Adapters ช่วยลดความเชื่อมโยง (Coupling) ระหว่าง Business Logic กับ Framework ได้อย่างแท้จริง
- **[Harness Lesson]:** ควรใช้คำสั่งรันเทสต์ผ่าน Universal CLI Runner (`python .harness/harness-runner.py`) เสมอเพื่อความชัวร์ก่อนส่งมอบงาน

---

## 🛠️ 4. Action Items (สิ่งที่ต้องนำไปปรับปรุงต่อ)
*แผนปฏิบัติการเพื่ออัปเดตระบบ Harness, คู่มือ หรือ Runbook ให้ดีขึ้นในอนาคต*
| Action Item | ผู้รับผิดชอบ | เป้าหมาย / วันที่เสร็จ |
|---|---|---|
| นำบั๊กหรือข้อผิดพลาดที่น่าสนใจไปอัปเดตเพิ่มใน `.harness/runbooks/harness-failure.md` | Agent / Engineer | ภายในเซสชันถัดไป |
| อัปเดตบันทึกการตัดสินใจทางสถาปัตยกรรม (ADR) ลงใน `decision-log.md` หากมีลวดลายใหม่ | Lead Engineer | ก่อนเริ่ม Contract ใหม่ |
