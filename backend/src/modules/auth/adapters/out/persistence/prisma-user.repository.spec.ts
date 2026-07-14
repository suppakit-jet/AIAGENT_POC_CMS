import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from './prisma.service';
import { User, Role } from '../../../domain/entities/user.entity';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockPrismaService: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // 1. findByEmail — found (return User)
  it('should return a User instance when user is found by email', async () => {
    const email = 'found@example.com';
    const mockDbUser = {
      id: 'uuid-123',
      email,
      passwordHash: 'hashedpassword123',
      role: Role.Author,
      status: 'active',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockDbUser);

    const result = await repository.findByEmail(email);

    // ตรวจว่า return เป็น User instance
    expect(result).toBeInstanceOf(User);
    expect((result as any)?.id).toBe('uuid-123');
    expect(result?.email).toBe(email);
    expect(result?.role).toBe(Role.Author);
    expect((result as any)?.status).toBe('active');

    // ตรวจว่า prisma.user.findUnique ถูกเรียกด้วย email ถูกต้อง
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });
  });

  it('should default status to active when dbUser.status is undefined', async () => {
    const email = 'nostatus@example.com';
    const mockDbUser = {
      id: 'uuid-789',
      email,
      passwordHash: 'hashedpassword123',
      role: Role.Author,
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockDbUser);

    const result = await repository.findByEmail(email);

    expect(result).toBeInstanceOf(User);
    expect((result as any)?.status).toBe('active');
  });

  // 2. findByEmail — not found (return null)
  it('should return null when user is not found by email', async () => {
    const email = 'notfound@example.com';

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const result = await repository.findByEmail(email);

    // ตรวจว่า return เป็น null
    expect(result).toBeNull();
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });
  });

  // 3. save — success
  it('should save a user successfully without throwing error', async () => {
    const mockHasher = { hash: vi.fn().mockResolvedValue('hashedSecurePassword') };
    const user = await User.create(
      { id: 'uuid-456', email: 'newuser@example.com', password: 'securepassword123!', role: Role.Editor, status: 'active' } as any,
      mockHasher as any,
    );

    mockPrismaService.user.create.mockResolvedValue({
      id: 'uuid-456',
      email: user.email,
      passwordHash: user.password,
      role: user.role,
      status: 'active',
    });

    // ตรวจว่าไม่ throw error
    await expect(repository.save(user)).resolves.not.toThrow();

    // ตรวจว่า prisma.user.create ถูกเรียกพร้อม data ถูกต้อง
    expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        id: (user as any).id,
        email: user.email,
        passwordHash: user.password,
        role: user.role,
        status: (user as any).status,
      },
    });
  });

  it('should connect to database when onModuleInit is called on PrismaService', async () => {
    const mockPrismaService = {
      $connect: vi.fn().mockResolvedValue(undefined),
      onModuleInit: PrismaService.prototype.onModuleInit,
    };
    await mockPrismaService.onModuleInit();
    expect(mockPrismaService.$connect).toHaveBeenCalledTimes(1);
  });
});
