# Pre-Mortem Risk Analysis Template (`risk-template.md`)

> **วัตถุประสงค์:** ใช้สำหรับจินตนาการและวิเคราะห์ความเสี่ยง "ล่วงหน้า" ก่อนเริ่มลงมือทำ Contract หรือ TDD Cycle ใหม่ เพื่อเตรียมแผนป้องกันและลดโอกาสเกิดข้อผิดพลาดทางสถาปัตยกรรม (Shift-Left Risk Management)

---

## 📋 ข้อมูลทั่วไป (Contract Metadata)
- **Contract ID:** `Contract-XX`
- **Feature / Scope:** [ชื่อฟีเจอร์หรือโมดูลที่กำลังจะพัฒนา]
- **Author / Agent:** [ชื่อวิศวกร หรือรหัส Agent]
- **Date:** `YYYY-MM-DD`

---

## 🌩️ 1. What Could Go Wrong? (อะไรบ้างที่อาจผิดพลาด?)
*ลองจินตนาการว่างานนี้ล้มเหลวไม่เป็นท่า อะไรคือสาเหตุที่เป็นไปได้บ้าง? (ให้ระบุเป็นข้อๆ ด้านเทคนิคและสถาปัตยกรรม)*
- **[Arch Risk]:** เสี่ยงต่อการนำเข้าโมดูลผิดชั้น เช่น เอา ORM/Database Adapter ไปเรียกใช้ใน Domain Entity ตรงๆ ทำให้ `m-hex.py` แจ้งเตือน Violation
- **[TDD Risk]:** เสี่ยงต่อการเขียนโค้ดเผื่อฟีเจอร์อนาคตมากเกินไป (Over-engineering) โดยไม่มี Test Case รองรับ ทำให้ Test-to-Code Ratio ต่ำกว่า 1.0 (`m-tdd.py` FAIL)
- **[Coverage Risk]:** เสี่ยงต่อการลืมเขียน Test ครอบคลุมเงื่อนไขข้อยกเว้น (Exception handling / Error paths) ทำให้ Line/Branch Coverage ของระบบตกลงต่ำกว่า 98% (`m-cov.py` FAIL)
- **[Platform Risk]:** เสี่ยงต่อปัญหาสคริปต์รันคำสั่งบน Windows ติดขัดเรื่องสิทธิ์หรือ Path spaces หากเรียก Subprocess โดยไม่ห่อหุ้มด้วย `cmd.exe /c`

---

## 🛡️ 2. Mitigation Plan (แผนการรับมือและป้องกัน)
*ระบุวิธีการป้องกันไม่ให้ความเสี่ยงในข้อที่ 1 เกิดขึ้นจริงระหว่างการพัฒนา*
| ความเสี่ยง (Risk ID) | แผนป้องกันและลดความเสี่ยง (Mitigation Action) |
|---|---|
| **Arch Risk** | ออกแบบโดยเขียน Outbound Port (Interface) ไว้ในชั้น Domain เสมอ ก่อนไปสร้าง Adapter มารับช่วงต่อ |
| **TDD Risk** | ปฏิบัติตาม TDD Discipline อย่างเคร่งครัด หยุดรอ Confirm ทุกครั้งที่จบ RED และ GREEN phase ห้ามเขียนโค้ดจริงเกินเทสต์ |
| **Coverage Risk** | รันเทสต์ด้วย `--coverage` เป็นประจำทุกครั้งหลัง Refactor เพื่อเช็คบรรทัดสีแดงก่อน Commit |
| **Platform Risk** | รัน `test_harness.py` และใช้ฟังก์ชันมาตรฐานจาก `harness-runner.py` ในการเรียก Subprocess เสมอ |

---

## 🎯 3. Success Criteria (เกณฑ์ความสำเร็จ)
*เกณฑ์ชี้วัดว่า Contract นี้เสร็จสมบูรณ์อย่างแท้จริง ไร้ความเสี่ยงตกค้าง*
- [ ] 1. ผ่านขั้นตอน TDD Red-Green-Refactor ครบถ้วนโดยมีคำอนุมัติจากผู้ใช้ในทุกขั้นตอน
- [ ] 2. รันคำสั่ง `python .harness/harness-runner.py` แล้วผ่านเกณฑ์ทั้งหมด (PASS 100%)
- [ ] 3. สัดส่วน Test-to-Code Ratio $\ge 1.0$ และ Test Coverage $\ge 98\%$
- [ ] 4. ไม่มี Architectural Violations ในรายงานผล (`violations_count = 0`)
- [ ] 5. อัปเดต Definition of Done ในไฟล์ Contract เรียบร้อยและพร้อมส่งมอบงาน
