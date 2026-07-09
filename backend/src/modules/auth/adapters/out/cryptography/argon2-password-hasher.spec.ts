import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Argon2PasswordHasher } from './argon2-password-hasher';

vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('hashed_value'),
  verify: vi.fn().mockResolvedValue(true),
}));

describe('Argon2PasswordHasher', () => {
  let hasher: Argon2PasswordHasher;

  beforeEach(() => {
    hasher = new Argon2PasswordHasher();
  });

  it('should hash a password', async () => {
    const result = await hasher.hash('plainpassword');
    expect(result).toBe('hashed_value');
  });

  it('should compare plain and hashed password correctly', async () => {
    const result = await hasher.compare('plainpassword', 'hashed_value');
    expect(result).toBe(true);
  });
});
