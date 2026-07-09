import { describe, it, expect, beforeEach } from 'vitest';
import { JwtTokenGenerator } from './jwt-token-generator';

describe('JwtTokenGenerator', () => {
  let generator: JwtTokenGenerator;

  beforeEach(() => {
    generator = new JwtTokenGenerator('super-secret-jwt-key');
  });

  it('should generate a valid JWT access token', async () => {
    const payload = {
      sub: 'uuid-123',
      email: 'admin@example.com',
      role: 'Admin',
    };

    const tokens = await generator.generateTokens(payload);

    expect(tokens).toBeDefined();
    expect(tokens.accessToken).toBeDefined();
    expect(typeof tokens.accessToken).toBe('string');

    const parts = tokens.accessToken.split('.');
    expect(parts.length).toBe(3);
  });

  it('should use default secret when no secret is provided', async () => {
    const defaultGen = new JwtTokenGenerator();
    const tokens = await defaultGen.generateTokens({
      sub: 'uuid-456',
      email: 'test@example.com',
      role: 'Editor',
    });
    expect(tokens.accessToken.split('.').length).toBe(3);
  });
});
