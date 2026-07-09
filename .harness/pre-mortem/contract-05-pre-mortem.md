# Pre-Mortem Risk Analysis: Contract-05 (RegisterUser Adapter Layer)

> **วัตถุประสงค์:** วิเคราะห์ความเสี่ยงล่วงหน้าก่อนเริ่มพัฒนา Inbound HTTP Controller และ Outbound DB Repository เพื่อป้องกันความผิดพลาดทางสถาปัตยกรรมและรักษามาตรฐาน Quality Gates 100%

---

## 📋 ข้อมูลทั่วไป (Contract Metadata)
- **Contract ID:** `Contract-05`
- **Feature / Scope:** RegisterUser Adapter Layer (`auth.controller.ts` และ `prisma-user.repository.ts`)
- **Author / Agent:** Harness Engineering Agent
- **Date:** `2026-07-07`

---

## 🌩️ 1. What Could Go Wrong? (อะไรบ้างที่อาจผิดพลาด?)
- **[Arch Risk]:** NestJS decorators อาจหลุดเข้า Application/Domain layer เสี่ยงที่ NestJS Decorators (`@Controller`, `@Post`, `@Body`, `@Injectable`) หรือ Prisma types (`@prisma/client`) หลุดเข้าไปพัวพันหรือถูก import ในชั้น Application/Domain Layer ทำให้เซนเซอร์ `m-hex.py` ตรวจพบ Violation และ FAIL ทันที
- **[DB Risk]:** Prisma ต้องการ schema ก่อนใช้งาน หากพยายามเชื่อมต่อฐานข้อมูลจริงใน unit test โดยไม่จัดเตรียมสภาพแวดล้อมหรือใช้ Schema ที่ไม่ตรงกัน จะทำให้เทสต์ล้มเหลว
- **[DI Risk]:** NestJS DI config อาจ setup ผิด ชั้น Controller ต้องเรียกใช้ UseCase และ Repository ต้อง implement `IUserRepository` อาจเกิดปัญหา Dependency Injection ผิดพลาดใน NestJS (เช่น ลืมระบุ Injection Token หรือ Inject ไม่ตรง Interface) ทำให้รันเทสต์ไม่ผ่าน
- **[Coverage Risk]:** ลืมเขียน test exception paths หากเขียนเทสต์เฉพาะกรณีสร้าง User สำเร็จ (Success Path - HTTP 201) โดยลืมเขียนเทสต์ดักกรณีเกิด Error (เช่น อีเมลซ้ำ หรือ Validate ไม่ผ่าน) จะทำให้ Line/Branch Coverage ของระบบตกลงต่ำกว่า 98% (`m-cov.py` FAIL)

---

## 🛡️ 2. Mitigation Plan (แผนการรับมือและป้องกัน)
| ความเสี่ยง (Risk ID) | แผนป้องกันและลดความเสี่ยง (Mitigation Action) |
|---|---|
| **Arch Risk** | `m-hex.py` จะ block ทันที และ ห้ามแตะไฟล์ `domain/` `application/` ควบคุมขอบเขตไฟล์อย่างเข้มงวด ให้ NestJS และ Prisma อยู่เฉพาะในโฟลเดอร์ `adapters/in/http/` และ `adapters/out/persistence/` เท่านั้น |
| **DB Risk** | mock Prisma Client ใน unit test แทน DB จริง เพื่อให้ทดสอบ Unit ได้อย่างรวดเร็วและไม่อิงโครงสร้างพื้นฐานจริง |
| **DI Risk** | ใช้ NestJS Testing module ใน spec file โดยใน `auth.controller.spec.ts` และ `prisma-user.repository.spec.ts` จะตั้งค่า provider ร่วมกับ mock object |
| **Coverage Risk** | เขียน test ทั้ง success และ error case ทุก adapter ใน `.spec.ts` ทั้งสองไฟล์ เพื่อรับประกัน Coverage $\ge 98\%$ |

---

## 🎯 3. Success Criteria (เกณฑ์ความสำเร็จ)
- [x] 1. POST /auth/register ทำงานได้จริงผ่าน HTTP
- [x] 2. Prisma repository บันทึก user ลง DB ได้
- [x] 3. harness-runner.py PASS ทุก gate
