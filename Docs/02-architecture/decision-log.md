# Architecture Decision Log

## ADR-001: Hexagonal Architecture Isolation for Auth & Crypto (Contract-06)
- **Status:** Accepted
- **Date:** 2026-07-09
- **Context:** ต้องการพัฒนาระบบ Login และ Token Generation โดยไม่ให้ Domain และ Application Layer ขึ้นกับ Library ภายนอก (`@nestjs/jwt` หรือ external dependencies)
- **Decision:**
  - กำหนด Outbound Port: `IPasswordHasher` และ `ITokenGenerator` ใน Application Layer
  - อิมพลีเมนต์ `Argon2PasswordHasher` และ `JwtTokenGenerator` ใน Adapter Layer (`adapters/out/cryptography`)
- **Consequences:**
  - Domain และ UseCase มีความบริสุทธิ์ (Pure TypeScript) ตามเกณฑ์ `m-hex.py` (0 violations)
  - ทดสอบง่ายด้วยการ Mock Ports ผ่าน TDD (Coverage 100%)
