import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../../prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Mock the PrismaService
    const mockPrismaService = {
      auditEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    it('should successfully create an audit log', async () => {
      const mockLog = { id: 'log1', actorId: 'user1', action: 'LOGIN', targetType: 'SYSTEM' };
      (prisma.auditEvent.create as any).mockResolvedValue(mockLog);

      const result = await service.logAction('user1', 'LOGIN', 'SYSTEM');

      expect(prisma.auditEvent.create).toHaveBeenCalledWith({
        data: {
          actorId: 'user1',
          action: 'LOGIN',
          targetType: 'SYSTEM',
          targetId: undefined,
          summary: undefined,
        },
      });
      expect(result).toEqual(mockLog);
    });
  });

  describe('getLogs', () => {
    it('should return a list of logs', async () => {
      const mockLogs = [{ id: 'log1', action: 'LOGIN' }];
      (prisma.auditEvent.findMany as any).mockResolvedValue(mockLogs);

      const result = await service.getLogs();

      expect(prisma.auditEvent.findMany).toHaveBeenCalledWith({
        orderBy: { occurredAt: 'desc' },
        include: { actor: { select: { email: true, name: true } } },
      });
      expect(result).toEqual(mockLogs);
    });
  });
});
