# Handoff-001: Auth Module - RED Phase Completed

## สรุปสถานะปัจจุบัน (Current Status)
เรากำลังอยู่ในวัฏจักร TDD ของการพัฒระบบ Auth Module โดยในขณะนี้เราทำการเขียน Test ของฝั่ง **RED Phase** เสร็จสมบูรณ์แล้ว พร้อมที่จะส่งมอบงานให้ทำต่อในขั้นตอนถัดไป

## สิ่งที่ทำสำเร็จแล้ว (Completed)
- เขียน Test File สำหรับ `UserEntity` ครบทั้ง 3 Test cases:
  1. `should create a valid user` (เช็คความยาวรหัสผ่าน, บทบาทหน้าที่ และรูปแบบ Argon2id hash)
  2. `should throw when password is less than 12 chars` (Negative Case)
  3. `should throw when role is invalid` (Negative Case)
- รัน Vitest และได้รับการยืนยันว่าผลการทดสอบแสดงเป็น **FAIL (RED)** เรียบร้อยแล้ว เนื่องจากยังไม่มีไฟล์ Implementation

## ตำแหน่งของไฟล์ (File Locations)
- **Test File ที่อัปเดตล่าสุด:** `backend/src/modules/auth/domain/entities/user.entity.spec.ts`

## งานถัดไปที่ต้องทำ (Next Task: GREEN Phase)
เป้าหมายต่อไปคือการเขียนโค้ด Implementation เบื้องต้นเพื่อทำให้ Test ทั้ง 3 ข้อรันผ่านให้ได้ (เปลี่ยนไฟจาก RED เป็น GREEN)
- **ไฟล์ที่ต้องสร้าง:** `backend/src/modules/auth/domain/entities/user.entity.ts`

## Business Rules & Constraints ที่ต้องปฏิบัติตาม
1. **Password Length:** รหัสผ่านต้องมีความยาวไม่น้อยกว่า 12 ตัวอักษร [FR-AUTH-02]
2. **Roles:** รองรับเฉพาะ 3 roles เท่านั้น ได้แก่ Admin, Editor, Author [BR-05]
3. **Password Hashing:** ต้องรับ Dependency จากภายนอกเป็นแบบ Interface (`IPasswordHasher`) ที่มีการเข้ารหัสแบบ Argon2id [FR-AUTH-03]
4. **Domain Purity:** ห้าม Import โมดูลของ NestJS หรือ Prisma เข้ามาใน Domain Layer อย่างเด็ดขาด [04-ARCH]
5. **Pattern:** กำหนดให้ใช้การสร้าง Instance ผ่าน Static Factory Method (`User.create()`) ตามที่ตัดสินใจร่วมกันไว้ใน **ADR-001**
