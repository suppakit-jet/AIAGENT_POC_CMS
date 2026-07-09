# Runbook: Troubleshooting Harness & Sensor Failures (`harness-failure.md`)

คู่มือแก้ไขปัญหาเมื่อเกณฑ์คุณภาพ (Quality Gates), Guardrails, หรือ Sensors ในระบบ Harness ทำงานล้มเหลวหรือตรวจพบข้อผิดพลาด

---

## 🟥 เมื่อ `m-cov.py` FAIL
- **สาเหตุที่เป็นไปได้:**
  - สัดส่วน Line Coverage หรือ Branch Coverage โดยรวมของโปรเจกต์ลดลงต่ำกว่าเกณฑ์ 98%
  - มีการเขียนฟีเจอร์หรือลอจิกเพิ่มเข้าไปในไฟล์โค้ดจริง (Production Code) โดยลืมเขียน Unit Test ครอบคลุมเคสหรือ Branch (เช่น `if/else`)
  - ไฟล์รายงานผล `cobertura.xml` ไม่ถูกสร้างหรือเป็นเวอร์ชันเก่า (ยังไม่ได้รันเทสต์เพื่ออัปเดตรายงาน)
- **วิธีดูว่าไฟล์ไหน Coverage ต่ำ:**
  - ดูจากผลลัพธ์ Terminal ตอนรัน Vitest ซึ่งจะแสดงตาราง Coverage เป็นเปอร์เซ็นต์แยกตามไฟล์ (คอลัมน์ `% Stmts`, `% Branch`, `% Funcs`, `% Lines`)
  - เปิดดูไฟล์รายงาน HTML ที่โฟลเดอร์ `backend/coverage/index.html` บนเบราว์เซอร์ เพื่อดูบรรทัดสีแดงที่ไม่ถูกเทสต์ครอบคลุม
- **วิธีแก้:**
  - เขียน Test Case ในไฟล์ `.spec.ts` เพิ่มเติม โดยเน้นทดสอบเงื่อนไข Edge Cases, ข้อยกเว้น (Exceptions), และ Branch ที่ตกหล่น
- **คำสั่งที่ใช้ตรวจ:**
  ```bash
  cd backend && npx vitest run --coverage
  python ../.harness/sensors/m-cov.py backend/coverage/cobertura.xml
  ```

---

## 🟧 เมื่อ `m-hex.py` FAIL
- **สาเหตุที่เป็นไปได้ (Import ผิด Layer):**
  - มีการละเมิดกฎ Hexagonal Architecture เช่น โค้ดในชั้น **Domain Layer** มีการ Import หรือเรียกใช้โมดูลจาก **Adapters Layer** (เช่น Prisma ORM, NestJS Framework, Express, HTTP Request)
  - มีการแอบเรียกใช้ External I/O ตรงๆ ใน Entities หรือ Use Cases
- **วิธีอ่าน Violation Output:**
  - สังเกตใน JSON Output ของเซนเซอร์ หาอาร์เรย์ `"violations_by_rule"` และ `"violations"`
  - ดูค่า `"from"` (ไฟล์ต้นทางที่ทำผิดกฎ) และ `"to"` (ไฟล์ปลายทางหรือแพ็กเกจที่ถูกอิมพอร์ตเข้ามาผิดชั้น) เช่น `Rule: M-HEX-01`
- **วิธีแก้:**
  - ห้ามอิมพอร์ต Adapter หรือ Framework เข้ามาใน Domain เด็ดขาด
  - ให้ทำการ **Inversion of Control (IoC)** โดยสร้างอินเทอร์เฟซตัวแทนเป็น **Port (Outbound Port)** ไว้ในชั้น Domain/Application แล้วให้ชั้น Adapters เป็นผู้ Implement Port นั้นแทน
- **คำสั่งที่ใช้ตรวจ:**
  ```bash
  python .harness/sensors/m-hex.py backend/dep-out.json
  # หรือรันผ่าน harness runner
  python .harness/harness-runner.py --only arch
  ```

---

## 🟨 เมื่อ `m-tdd.py` FAIL
- **สาเหตุที่เป็นไปได้:**
  - **Test-to-Code Ratio ต่ำกว่า 1.0:** ปริมาณบรรทัดโค้ดจริง (Production LOC) ที่เขียนเพิ่มมีมากกว่าบรรทัดโค้ดทดสอบ (Test LOC) บ่งบอกถึงการเขียนโค้ดเผื่อโดยไม่มี Spec
  - **PRs/Features without tests (`M-TDD-06`):** สร้างไฟล์โค้ดจริงขึ้นมาในระบบโดยไม่มีไฟล์ `.spec.ts` คู่ขนานในโมดูลนั้นๆ
- **วิธีแก้:**
  - หยุดเขียนโค้ดจริงทันที กลับไปที่ขั้นตอน TDD RED Phase เขียนอธิบาย Specification ในไฟล์ `.spec.ts` ให้ยาวและละเอียดครอบคลุมพฤติกรรมทั้งหมดของโค้ดจริง
  - หากสร้างไฟล์ Helper หรือ Service ใหม่ ต้องสร้างไฟล์ `.spec.ts` คู่กันเสมอ
- **คำสั่งที่ใช้ตรวจ:**
  ```bash
  python .harness/sensors/m-tdd.py backend/src
  # หรือรันผ่าน harness runner
  python .harness/harness-runner.py --only tdd
  ```

---

## 🟪 เมื่อ `dependency-cruiser` Error
- **สาเหตุที่เป็นไปได้:**
  - เรียกใช้ชื่อคำสั่งไม่ถูกต้องระหว่าง `depcruise` (ชื่อย่อในบางเวอร์ชัน) กับ `dependency-cruiser` (ชื่อแพ็กเกจเต็ม)
  - หา Binary ไม่เจอ หรือเวอร์ชันไม่ตรงกันใน `node_modules`
  - ปัญหา Path ของไฟล์คอนฟิกบน Windows
- **วิธีแก้จากประสบการณ์จริงใน Project นี้:**
  - **คำสั่งที่ถูกต้องรับประกันผล:** จากประสบการณ์จริงในโปรเจกต์นี้ ห้ามใช้ `npx depcruise` เพราะอาจเกิดข้อผิดพลาดในการหา Binary บนบางสภาพแวดล้อม ให้ใช้คำสั่งเต็มผ่าน `npx dependency-cruiser` เสมอ:
    ```bash
    cd backend && npx dependency-cruiser src --include-only "^src" --output-type json > dep-out.json
    ```
  - บน Windows การรันสคริปต์ `npx` จะถูกห่อหุ้มด้วย `cmd.exe /c` เสมอในตัวรันของระบบ Harness เพื่อป้องกันความล้มเหลวในการรัน subprocess

---

## 🟦 เมื่อ `pre-commit` ไม่รัน
- **สาเหตุที่เป็นไปได้:**
  - สคริปต์ Git Hooks ยังไม่ถูกติดตั้งลงในโฟลเดอร์ `.git/hooks/`
  - โฟลเดอร์ที่รันคำสั่ง `git commit` ไม่ใช่ Root ของ Repository
  - สิทธิ์ในการรันไฟล์ (File Permissions) ไม่ถูกต้อง หรือ Git Hook Launcher หา Python binary (`python3`, `python`, `py`) ไม่เจอ
- **วิธีตรวจสอบและแก้ไข:**
  1. ตรวจสอบว่ามีไฟล์ `.git/hooks/pre-commit` อยู่จริงหรือไม่:
     ```bash
     ls -la .git/hooks/pre-commit
     ```
  2. รันสคริปต์ติดตั้ง Git Hooks ฉบับ Cross-platform ของโปรเจกต์ใหม่:
     ```bash
     python .harness/guardrails/install_hooks.py
     ```
  3. ทดลองรัน Hook โดยตรงเพื่อดู Error Log หากเกิดข้อผิดพลาด:
     ```bash
     sh .git/hooks/pre-commit
     ```

---

## ⬛ เมื่อ `harness-runner.py` Error
- **สาเหตุทั่วไป:**
  - สภาพแวดล้อม Python หรือ Node.js มีปัญหา (เช่น ยังไม่ได้รัน `npm install` ในโฟลเดอร์ `backend`)
  - โครงสร้างไฟล์ในโฟลเดอร์ `.harness/` สูญหาย หรือสคริปต์เซนเซอร์ตัวใดตัวหนึ่งเกิด Syntax Error หลังจากที่มีการแก้ไข
- **วิธี Debug ด้วย `--only` Flag:**
  - แทนที่จะรันทั้งหมดจนเดาไม่ถูกว่าจุดไหนพัง ให้ใช้ `--only` เพื่อแยกรันตรวจทีละเซนเซอร์:
    ```bash
    python .harness/harness-runner.py --only typecheck
    python .harness/harness-runner.py --only lint
    python .harness/harness-runner.py --only tdd
    python .harness/harness-runner.py --only arch
    ```
- **วิธีรัน `test_harness.py` เพื่อตรวจ Harness เอง:**
  - หากสงสัยว่าตัวระบบ Harness มีบั๊กหรือทำงานผิดเพี้ยน ให้รัน Automated Self-Verification Suite เพื่อตรวจสอบความถูกต้องของ Guardrails และ Sensors ทุกตัว:
    ```bash
    python .harness/test_harness.py
    ```
  - หากระบบ Harness สมบูรณ์ จะต้องได้ผลลัพธ์ `Ran 9 tests ... OK` 100%
