# Runbook: Standard TDD Cycle & Quality Gate Protocol (`tdd-cycle.md`)

คู่มือมาตรฐานการพัฒนาซอฟต์แวร์ด้วยแนวทาง **Test-Driven Development (TDD)** ของโปรเจกต์ CMS MVP สำหรับนักพัฒนาและ AI Agent ทุกตัวต้องปฏิบัติตามทีละขั้นอย่างเคร่งครัด **ห้ามข้ามขั้นตอน และต้องหยุดรอคำยืนยัน (Confirm) จากผู้ใช้เมื่อจบแต่ละขั้นเสมอ**

---

## 🚦 ขั้นที่ 0: ก่อนเริ่มงาน (Pre-work & Setup)
1. **อ่านคู่มือกลาง:** ตรวจสอบและอ่าน [`AGENTS.md`](file:///d:/Home%20work%202/.harness/context/AGENTS.md) เพื่อรับทราบกฎเหล็กและข้อจำกัดปัจจุบัน
2. **อ่าน Handoff ล่าสุด:** เข้าไปอ่านรายงานใน `.harness/handoffs/` เพื่อทำความเข้าใจบริบทและงานที่ค้างมาจากเซสชันก่อนหน้า
3. **สร้าง Contract ใหม่:** ทุกภารกิจต้องสร้างไฟล์ Contract ใหม่ใน `.harness/contracts/` (เช่น `contract-05.json`) เพื่อระบุ Scope, Inputs, Outputs และ Definition of Done ก่อนลงมือเขียนโค้ดเสมอ

---

## 🔴 ขั้นที่ 1: RED Phase (Write Failing Test)
1. **เขียนไฟล์ Test เท่านั้น:** สร้างหรือแก้ไขไฟล์ Test (เช่น `.spec.ts`) โดยอ้างอิงจาก Requirement และ Contract **ห้ามเขียน Implementation Code หรือสร้างไฟล์ Production Code ในขั้นตอนนี้เด็ดขาด**
2. **รันเทสต์ให้เห็น FAIL จริง:** รันคำสั่งทดสอบ (เช่น `npx vitest run ...`) เพื่อพิสูจน์ว่า Test ล้มเหลวเนื่องจากไม่มี Implementation ไม่ใช่ล้มเหลวเพราะ Syntax Error
3. **🛑 หยุดรอ Confirm:** แสดงผลลัพธ์ Terminal ที่ขึ้น **RED (FAIL)** ให้ผู้ใช้ดู และหยุดรอการยืนยันก่อนก้าวสู่ขั้นต่อไป

---

## 🟢 ขั้นที่ 2: GREEN Phase (Minimal Implementation)
1. **เขียน Implementation น้อยที่สุด:** สร้างหรือแก้ไขโค้ดจริง (Production Code) โดยเขียนลอจิกเท่าที่จำเป็นเพื่อให้ Test ที่เพิ่งเขียนไปผ่านเท่านั้น ห้ามคิดเผื่อหรือเขียนฟีเจอร์เกินกว่าที่ Test ระบุ
2. **รันเทสต์ให้เห็น PASS:** รันคำสั่งทดสอบเดิมอีกครั้ง เพื่อพิสูจน์ว่า Test ทั้งหมดเปลี่ยนเป็นสีเขียวแล้ว
3. **🛑 หยุดรอ Confirm:** แสดงผลลัพธ์ Terminal ที่ขึ้น **GREEN (PASS)** ให้ผู้ใช้ดู และหยุดรอการยืนยันก่อนก้าวสู่ขั้นต่อไป

---

## 🔵 ขั้นที่ 3: REFACTOR Phase (Clean & Improve Code)
1. **ปรับปรุงคุณภาพโค้ด:** จัดโครงสร้างโค้ดให้สะอาดและอ่านง่าย โดย **ห้ามเปลี่ยน Behavior (พฤติกรรมของระบบ) เด็ดขาด**
   - เพิ่ม JSDoc / Type Definitions ให้ชัดเจน
   - สกัด Magic Numbers หรือ Strings ออกไปเป็น Constants
   - ปรับปรุงข้อความ Error Messages ให้สื่อความหมายและมีมาตรฐาน
2. **ยืนยัน GREEN ยังอยู่:** รันเทสต์อีกครั้งหลัง Refactor เพื่อการันตีว่าโค้ดที่ปรับปรุงไม่ได้ทำลอจิกเดิมพัง

---

## 🛡️ ขั้นที่ 4: Sensor Checklist (Automated Quality Gate)
ก่อนปิดจบรอบการพัฒนา ต้องตรวจสอบเกณฑ์คุณภาพทั้งระบบผ่าน Unified CLI ของ Harness:
```bash
python .harness/harness-runner.py
```
**เกณฑ์ผ่าน (Definition of Done for Sensors):**
- ✅ **TypeScript Typecheck:** `0 errors`
- ✅ **ESLint:** `0 errors`
- ✅ **TDD Discipline (`m-tdd.py`):** Test-to-Code Ratio $\ge 1.0$ และ PRs without tests = `0`
- ✅ **Coverage Gate (`m-cov.py`):** $\ge 98\%$ Line & Branch Coverage
- ✅ **Hexagonal Architecture (`m-hex.py`):** `0 violations` (ห้ามมี Import ข้าม Layer ผิดกฎ)

---

## 🏁 ขั้นที่ 5: ปิด Cycle (Wrap up & Handoff)
1. **อัปเดต Contract:** เข้าไปติ๊กเครื่องหมาย `[x]` ใน Definition of Done ของ Contract ปัจจุบัน
2. **เพิ่ม Architecture Decision Log (ถ้ามี):** หากมีการตัดสินใจเชิงสถาปัตยกรรมใหม่ระหว่างรอบ ให้เพิ่ม Entry ใน `.harness/context/decision-log.md`
3. **สร้าง Handoff Document:** สรุปผลงาน, ลิงก์ไฟล์ที่สร้าง, และงานถัดไปลงใน `.harness/handoffs/handoff-XXX.md` เพื่อส่งต่อให้เซสชันถัดไป
