import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { AuthController, RegisterUserDto } from './auth.controller';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { Role } from '../../../domain/entities/user.entity';

describe('AuthController (POST /auth/register)', () => {
  let controller: AuthController;
  let mockUseCase: { execute: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockUseCase = {
      execute: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterUserUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should instantiate RegisterUserDto', () => {
    const dto = new RegisterUserDto();
    dto.email = 'test@example.com';
    dto.password = 'pass';
    dto.role = Role.Author;
    expect(dto).toBeDefined();
  });

  // 1. POST /auth/register — success (201 Created)
  it('should register user successfully and return status 201 Created', async () => {
    const dto = {
      email: 'newuser@example.com',
      password: 'securePassword123!',
      role: Role.Author,
    };

    const mockUserResult = {
      email: dto.email,
      role: dto.role,
    };

    mockUseCase.execute.mockResolvedValue(mockUserResult);

    const result: any = await controller.register(dto);

    // ตรวจว่า UseCase ถูกเรียกพร้อม arguments ถูกต้อง
    expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockUseCase.execute).toHaveBeenCalledWith(dto);

    // ตรวจว่า response status เป็น 201
    expect(result.statusCode).toBe(HttpStatus.CREATED);
  });

  // 2. POST /auth/register — duplicate email (409 Conflict)
  it('should return status 409 Conflict when email already exists', async () => {
    const dto = {
      email: 'duplicate@example.com',
      password: 'validPassword123!',
      role: Role.Author,
    };

    mockUseCase.execute.mockRejectedValue(new Error('User with this email already exists'));

    await expect(controller.register(dto)).rejects.toThrow(ConflictException);
  });

  // 3. POST /auth/register — validation error (400 Bad Request)
  it('should return status 400 Bad Request when validation error occurs', async () => {
    const dto = {
      email: 'invalid-email',
      password: 'short',
      role: Role.Author,
    };

    mockUseCase.execute.mockRejectedValue(new Error('Password must be at least 12 characters long'));

    await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
  });

  // 4. POST /auth/register — unknown error (500 Internal Server Error)
  it('should return status 500 Internal Server Error when unknown error occurs', async () => {
    const dto = new RegisterUserDto();
    dto.email = 'error@example.com';
    dto.password = 'validPassword123!';
    dto.role = Role.Author;

    mockUseCase.execute.mockRejectedValue(new Error('Database connection failed'));

    await expect(controller.register(dto)).rejects.toThrow(InternalServerErrorException);
  });

  // 5. POST /auth/register — error without message property
  it('should handle error without message property and return status 500', async () => {
    const dto = new RegisterUserDto();
    dto.email = 'nomessage@example.com';
    dto.password = 'validPassword123!';
    dto.role = Role.Author;

    mockUseCase.execute.mockRejectedValue({});

    await expect(controller.register(dto)).rejects.toThrow(InternalServerErrorException);
  });
});
