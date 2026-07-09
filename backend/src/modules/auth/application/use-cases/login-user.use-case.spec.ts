import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUserUseCase } from './login-user.use-case';
import { IUserRepository } from '../ports/out/user.repository.interface';
import { IPasswordHasher } from '../ports/out/password-hasher.interface';
import { ITokenGenerator } from '../ports/out/token-generator.interface';
import { User, Role } from '../../domain/entities/user.entity';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;
  let mockTokenGenerator: ITokenGenerator;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    mockTokenGenerator = {
      generateTokens: vi.fn(),
    };

    useCase = new LoginUserUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenGenerator,
    );
  });

  it('should login successfully and return tokens when credentials are valid', async () => {
    const user = User.restore({
      id: 'uuid-user-1',
      email: 'admin@example.com',
      passwordHash: 'hashed_pw',
      role: Role.Admin,
      status: 'active',
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);
    vi.mocked(mockTokenGenerator.generateTokens).mockResolvedValue({
      accessToken: 'jwt.token.here',
    });

    const result = await useCase.execute({
      email: 'admin@example.com',
      password: 'StrongPassword123!',
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith('StrongPassword123!', 'hashed_pw');
    expect(mockTokenGenerator.generateTokens).toHaveBeenCalledWith({
      sub: 'uuid-user-1',
      email: 'admin@example.com',
      role: Role.Admin,
    });
    expect(result).toEqual({
      accessToken: 'jwt.token.here',
    });
  });

  it('should throw error when user is not found', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow('Invalid email or password');
  });

  it('should throw error when password is incorrect', async () => {
    const user = User.restore({
      id: 'uuid-user-1',
      email: 'admin@example.com',
      passwordHash: 'hashed_pw',
      role: Role.Admin,
      status: 'active',
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'admin@example.com',
        password: 'WrongPassword123!',
      }),
    ).rejects.toThrow('Invalid email or password');
  });

  it('should throw error when user status is deactivated', async () => {
    const user = User.restore({
      id: 'uuid-user-2',
      email: 'deactivated@example.com',
      passwordHash: 'hashed_pw',
      role: Role.Author,
      status: 'deactivated',
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);

    await expect(
      useCase.execute({
        email: 'deactivated@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow('User account is deactivated');

    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
  });
});
