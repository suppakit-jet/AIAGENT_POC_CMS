import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from './register-user.use-case';
import { IUserRepository } from '../ports/out/user.repository.interface';
import { IPasswordHasher } from '../ports/out/password-hasher.interface';
import { Role, User } from '../../domain/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  it('should register a new user successfully', async () => {
    // Arrange
    const props = {
      id: 'uuid-test-123',
      email: 'test@example.com',
      password: 'StrongPassword123!',
      role: Role.Author,
      status: 'active' as const,
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null); // User does not exist
    vi.mocked(mockPasswordHasher.hash).mockResolvedValue('hashed_password');

    // Act
    const result = await useCase.execute(props as any);

    // Assert
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(props.email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(props.password);
    expect(mockUserRepository.save).toHaveBeenCalledOnce();
    
    // Check if the saved user has the correct properties
    const savedUserArg = vi.mocked(mockUserRepository.save).mock.calls[0]![0];
    expect((savedUserArg as any).id).toBe(props.id);
    expect(savedUserArg.email).toBe(props.email);
    expect(savedUserArg.password).toBe('hashed_password');
    expect(savedUserArg.role).toBe(props.role);
    expect((savedUserArg as any).status).toBe(props.status);
    
    expect(result).toBeInstanceOf(User);
    expect((result as any).id).toBe(props.id);
    expect(result.email).toBe(props.email);
    expect((result as any).status).toBe(props.status);
  });

  it('should throw an error if email already exists', async () => {
    // Arrange
    const props = {
      id: 'uuid-test-456',
      email: 'existing@example.com',
      password: 'StrongPassword123!',
      role: Role.Author,
      status: 'active' as const,
    };
    
    // Create a dummy user to represent an existing user
    const existingUser = await User.create(props, mockPasswordHasher);

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

    // Act & Assert
    await expect(useCase.execute(props)).rejects.toThrow('User with this email already exists');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an error if validation fails (e.g., password too short)', async () => {
    // Arrange
    const props = {
      id: 'uuid-test-789',
      email: 'test@example.com',
      password: 'short', // Invalid password
      role: Role.Author,
      status: 'active' as const,
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(props as any)).rejects.toThrow(/Password must be at least/);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
