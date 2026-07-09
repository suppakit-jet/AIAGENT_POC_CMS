import { describe, it, expect } from 'vitest';
import { User, Role } from './user.entity';

describe('User Entity', () => {
  // [04-ARCH] Domain must be pure (no NestJS/Prisma imports). 
  // Hashing implementation (Argon2id) should be injected as a port/dependency to keep domain pure.
  const mockHasher = {
    // [FR-AUTH-03] Password hashed via Argon2id format simulator
    hash: async (password: string) => `$argon2id$v=19$m=65536,t=3,p=4$some_salt$some_hash_${password}`,
    compare: async (plain: string, hash: string) => hash.includes(plain),
  };

  describe('create', () => {
    it('should create a valid user with automatic UUID id and default active status', async () => {
      // [FR-AUTH-02] Password minimum 12 chars, letter + digit
      const plainPassword = 'SuperSecretPassword12!'; 
      
      // [BR-05] 3 roles: Admin, Editor, Author
      const user = await User.create({
        email: 'admin@example.com',
        password: plainPassword,
        role: Role.Admin,
      } as any, mockHasher);

      expect(user).toBeDefined();
      expect((user as any).id).toBeDefined();
      expect(typeof (user as any).id).toBe('string');
      expect((user as any).id.length).toBeGreaterThan(0);
      expect(user.email).toBe('admin@example.com');
      expect(user.role).toBe(Role.Admin);
      expect((user as any).status).toBe('active');
      
      // Check that the password is not stored in plain text and uses the argon2id format
      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$argon2id\$/);
    });

    it('should allow providing an explicit id and status when creating a user', async () => {
      const plainPassword = 'SuperSecretPassword12!'; 
      const user = await User.create({
        id: 'custom-uuid-123',
        email: 'admin@example.com',
        password: plainPassword,
        role: Role.Admin,
        status: 'active',
      } as any, mockHasher);

      expect((user as any).id).toBe('custom-uuid-123');
      expect((user as any).status).toBe('active');
    });

    it('should throw when password is less than 12 chars', async () => {
      await expect(User.create({
        id: 'uuid-123',
        email: 'admin@example.com',
        password: 'short', // 5 chars
        role: Role.Admin,
        status: 'active',
      } as any, mockHasher)).rejects.toThrow('Password must be at least 12 characters');
    });

    it('should throw when password does not contain a digit', async () => {
      await expect(User.create({
        id: 'uuid-123',
        email: 'admin@example.com',
        password: 'SuperSecretPasswordNoDigit!',
        role: Role.Admin,
        status: 'active',
      } as any, mockHasher)).rejects.toThrow(/at least one letter and one digit/);
    });

    it('should throw when password does not contain a letter', async () => {
      await expect(User.create({
        id: 'uuid-123',
        email: 'admin@example.com',
        password: '1234567890123!',
        role: Role.Admin,
        status: 'active',
      } as any, mockHasher)).rejects.toThrow(/at least one letter and one digit/);
    });

    it('should throw when role is invalid', async () => {
      await expect(User.create({
        id: 'uuid-123',
        email: 'admin@example.com',
        password: 'SuperSecretPassword12!',
        role: 'SuperAdmin' as any, // Force invalid role casting
        status: 'active',
      } as any, mockHasher)).rejects.toThrow('Invalid role');
    });
  });

  describe('restore', () => {
    it('should restore a user with id and deactivated status', () => {
      const user = (User as any).restore({
        id: 'uuid-999',
        email: 'deactivated@example.com',
        passwordHash: 'hashed_pw',
        role: Role.Author,
        status: 'deactivated',
      });
      expect(user).toBeDefined();
      expect((user as any).id).toBe('uuid-999');
      expect(user.email).toBe('deactivated@example.com');
      expect((user as any).status).toBe('deactivated');
    });
  });
});
