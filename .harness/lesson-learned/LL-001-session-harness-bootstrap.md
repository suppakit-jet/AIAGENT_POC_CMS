# LL-001: Session Harness Bootstrap & TDD Cycle

## ปัญหาที่พบใน Session (Observed Issues)
1. **Agent ข้ามขั้นตอน (Skipping Steps):** โดยธรรมชาติ AI Agent มักจะมีความพยายามช่วยรวบรัด โดยเขียนทั้งไฟล์ Test และ Implementation ควบคู่กันไปรวดเดียว (ทำ RED และ GREEN พร้อมกัน) ซึ่งขัดกับหลักการ TDD อย่างร้ายแรง
2. **ปัญหา Hardcode Path และ Environment:** พบปัญหาการเรียกใช้งาน CLI (เช่น ปัญหารัน `npx` แล้วติด PowerShell Execution Policy บน Windows) หรือการอ้างอิง Path ที่ทำให้รัน Test ไม่สำเร็จหากไม่ชี้ Working Directory อย่างระมัดระวัง
3. **Scope Creep:** หากไม่ได้ตีกรอบให้ชัดเจน Agent อาจจะเผลอคิดเผื่อและ Implement ขยายไปถึงส่วนอื่น (เช่น พยายามพ่วง NestJS/Prisma เข้ามาตอนทำ Domain Layer)

## วิธีแก้ไขที่นำมาใช้ใน Session นี้ (Remediations)
1. **Strict Stop-and-Confirm:** บังคับจังหวะการทำงานให้ Agent ต้องหยุด (Pause) ทันทีที่เขียนไฟล์ `.spec.ts` เสร็จ จากนั้นรันโชว์ผลลัพธ์ให้เห็น Error จริง (RED Phase) ก่อน จึงจะรอฟังคำสั่ง Approve จาก User 
2. **Cross-Platform Execution:** เลี่ยงข้อจำกัดการรันสคริปต์บน Windows โดยใช้คำสั่งแบบ Explicit ผ่าน Shell (เช่น `cmd.exe /c npx vitest ...`) พร้อมกำหนด Directory (Cwd) แบบระบุตำแหน่งเจาะจง
3. **Rule Binding:** การย้ำเตือนกฎ Domain Purity และข้อกำหนดแบบเป๊ะๆ 4 ข้อก่อนเริ่มงาน ทำให้ตัดปัญหา Scope Creep ทิ้งไปได้

## กฎที่ควรพิจารณาเพิ่มใน AGENTS.md (Proposed Rules Updates)
- **Rule [TDD-STOP-GATE]:** "Agent จะต้องหยุดรอให้ User ทำการ Approve ทันทีที่จบช่วง RED Phase ห้ามเขียน Production code นำหน้าอย่างเด็ดขาด"
- **Rule [EXEC-ROBUSTNESS]:** "หากมีการเรียกใช้งาน Command / Script บน Windows ให้ห่อด้วย `cmd.exe /c` เสมอ เพื่อป้องกันปัญหา Execution Policy"
- **Rule [STRICT-SCOPE]:** "ห้าม Agent ดำเนินการสร้างไฟล์ นอกเหนือจากที่ระบุใน Input/Contract ปัจจุบันอย่างเด็ดขาด"
