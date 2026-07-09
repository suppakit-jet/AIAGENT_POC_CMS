# Handoff Report: Contract 004 (Universal Cross-Platform Harness)

## 📌 Executive Summary
เซสชันนี้ได้ทำการอัปเกรดระบบ Engineering Harness ของโปรเจกต์ CMS MVP จาก Bash Scripts เดิม ให้เป็น **Universal Cross-Platform Python Harness** เพื่อให้สามารถรันบน **Windows (Native)**, **macOS**, และ **Linux** ได้อย่างสมบูรณ์แบบ 100% โดยไม่พึ่งพาระบบจำลอง Shell และใช้เพียง Standard Library ของ Python

---

## 📂 ไฟล์ทั้งหมดที่สร้างและอัปเดตใน Session นี้
1. **Guardrails (Git Hooks & Installers):**
   - [`install_hooks.py`](file:///d:/Home%20work%202/.harness/guardrails/install_hooks.py): สคริปต์ติดตั้ง Git Hooks อัตโนมัติ (แทนที่สคริปต์ .sh)
   - [`pre_commit.py`](file:///d:/Home%20work%202/.harness/guardrails/pre_commit.py): Guardrail ตรวจ Typecheck, ESLint, และ Architecture ก่อน Commit
   - [`pre_push.py`](file:///d:/Home%20work%202/.harness/guardrails/pre_push.py): Guardrail ตรวจ Unit Test Coverage และ Architecture ก่อน Push
2. **Sensors (Quality Gate Checkers):**
   - [`m-tdd.py`](file:///d:/Home%20work%202/.harness/sensors/m-tdd.py): เซนเซอร์คำนวณ Test-to-Code Ratio ($\ge 1.0$) และห้ามมี Feature ที่ไร้ Test
   - [`m-cov.py`](file:///d:/Home%20work%202/.harness/sensors/m-cov.py): เซนเซอร์ตรวจ Unit Test Coverage จากไฟล์ `cobertura.xml` ($\ge 98\%$)
   - [`m-hex.py`](file:///d:/Home%20work%202/.harness/sensors/m-hex.py): เซนเซอร์ตรวจ Hexagonal Architecture (0 violations)
3. **Runners & Verification:**
   - [`harness-runner.py`](file:///d:/Home%20work%202/.harness/harness-runner.py): Unified CLI Runner สำหรับรันตรวจสอบทุก Guardrails & Sensors ในคำสั่งเดียว
   - [`test_harness.py`](file:///d:/Home%20work%202/.harness/test_harness.py): Automated Self-Verification Suite สำหรับทดสอบระบบ Harness ทั้งหมด (100% Pass Rate)
4. **Governance & Documentation:**
   - [`contract-04.json`](file:///d:/Home%20work%202/.harness/contracts/contract-04.json): บันทึก Contract 004 ที่เสร็จสมบูรณ์
   - [`decision-log.md`](file:///d:/Home%20work%202/.harness/context/decision-log.md): เพิ่ม ADR Entry `DL-003: Cross-platform Python Guardrails`
   - [`AGENTS.md`](file:///d:/Home%20work%202/.harness/context/AGENTS.md): อัปเดตคู่มือกลางเป็น Cross-platform Python ทั้งระบบ

---

## ⚙️ Cross-Platform Pattern ที่ใช้
1. **Windows Subprocess Wrapping (`cmd.exe /c`):**
   - เมื่อรัน Script Executables เช่น `npm`, `npx`, `pnpm` บน Windows ระบบจะห่อหุ้มด้วย `cmd.exe /c` อัตโนมัติในฟังก์ชัน `run_cmd()` เพื่อป้องกันความผิดพลาดในการเรียกใช้
   - ไม่ห่อหุ้ม Native Executables เช่น `python.exe` หรือ `git.exe` ด้วย `cmd` เพื่อป้องกันปัญหา Quotes Mismatch เมื่อเจอ Path ที่มี Space บน Windows
2. **Standard Python Library Only:**
   - หลีกเลี่ยงคำสั่งเฉพาะของ POSIX/Bash (เช่น `/tmp`, `/dev/null`, `jq`) และใช้โมดูลมาตรฐานของ Python แทน (`pathlib.Path`, `subprocess`, `tempfile`, `json`)
3. **UTF-8 Reconfiguration:**
   - ใช้ฟังก์ชัน `setup_utf8_output()` เพื่อปรับ `sys.stdout` และ `sys.stderr` เป็น UTF-8 ป้องกันปัญหา Encoding Crash บน Command Prompt ของ Windows
4. **Universal Git Hook Loader:**
   - Git Hooks ที่สร้าง (`.git/hooks/pre-commit`, `.git/hooks/pre-push`) เป็น Shell Script ขนาดเล็กที่สามารถตรวจจับหา `python3`, `python`, หรือ `py` ในเครื่อง เพื่อส่งต่อการรันไปยังตัวไฟล์ `.py` ได้ทุกแพลตฟอร์ม

---

## ⚡ คำสั่งสำคัญ (Key Command)
คำสั่งศูนย์รวมสำหรับตรวจสอบเกณฑ์คุณภาพ Engineering Harness ทุกข้อ (Typecheck + ESLint + TDD Discipline + Unit Test Coverage + Hexagonal Architecture):
```bash
python .harness/harness-runner.py
```
*โหมดทางเลือกสำหรับการรัน:*
- `python .harness/harness-runner.py --skip-cov` (รันเร็ว โดยข้ามเทสต์ coverage ที่ใช้เวลานาน)
- `python .harness/harness-runner.py --only tdd` (รันเฉพาะเซนเซอร์ TDD)
- `python .harness/harness-runner.py --json` (แสดงผลลัพธ์เป็น JSON สำหรับต่อเข้า CI/CD)

---

## 👉 งานถัดไป (Next Steps)
1. **เริ่มต้น Contract 005:** พร้อมก้าวสู่การพัฒนาโมดูลและ Business Features ถัดไปของระบบ CMS MVP ภายใต้การดูแลและจับผิดอัตโนมัติจาก Universal Harness รุ่นใหม่นี้
2. **ใช้งาน Harness ระหว่างพัฒนา:** รันคำสั่ง `python .harness/harness-runner.py --skip-cov` ก่อน Commit และ `python .harness/harness-runner.py` ก่อน Push เป็นประจำเพื่อรักษามาตรฐาน TDD และ Hexagonal Architecture ให้สะอาด 100% อยู่เสมอ
