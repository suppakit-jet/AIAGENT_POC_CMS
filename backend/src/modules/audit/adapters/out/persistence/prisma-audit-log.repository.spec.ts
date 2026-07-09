import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaAuditLogRepository } from './prisma-audit-log.repository';
import { AuditLog } from '../../../domain/entities/audit-log.entity';

describe('PrismaAuditLogRepository', () => {
  let repo: PrismaAuditLogRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    };
    repo = new PrismaAuditLogRepository(mockPrisma);
  });

  it('should save audit log into prisma', async () => {
    const log = AuditLog.create({
      action: 'CONTENT_CREATED',
      entityType: 'Content',
      entityId: 'c-1',
      actorId: 'user-1',
      details: { test: true },
    });

    await repo.save(log);

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actorId: log.actorId,
        details: log.details ? JSON.stringify(log.details) : null,
        createdAt: log.createdAt,
      },
    });
  });

  it('should find audit log by id', async () => {
    const now = new Date();
    mockPrisma.auditLog.findUnique.mockResolvedValue({
      id: 'id-1',
      action: 'CONTENT_UPDATED',
      entityType: 'Content',
      entityId: 'c-1',
      actorId: 'user-1',
      details: {},
      createdAt: now,
    });

    const result = await repo.findById('id-1');
    expect(result).toBeInstanceOf(AuditLog);
    expect(result?.id).toBe('id-1');
  });

  it('should return null if findById finds nothing', async () => {
    mockPrisma.auditLog.findUnique.mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('should find many audit logs with filters', async () => {
    const now = new Date();
    mockPrisma.auditLog.findMany.mockResolvedValue([
      {
        id: 'id-1',
        action: 'CONTENT_UPDATED',
        entityType: 'Content',
        entityId: 'c-1',
        actorId: 'user-1',
        details: {},
        createdAt: now,
      },
    ]);

    const logs = await repo.findMany({
      entityType: 'Content',
      entityId: 'c-1',
      actorId: 'user-1',
      action: 'CONTENT_UPDATED',
    });

    expect(logs).toHaveLength(1);
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        entityType: 'Content',
        entityId: 'c-1',
        actorId: 'user-1',
        action: 'CONTENT_UPDATED',
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should parse valid JSON string details', async () => {
    mockPrisma.auditLog.findUnique.mockResolvedValue({
      id: 'e-1',
      action: 'TEST',
      entityType: 'User',
      entityId: 'u-1',
      actorId: null,
      details: '{"foo":"bar"}',
      createdAt: new Date(),
    });

    const result = await repo.findById('e-1');
    expect(result?.details).toEqual({ foo: 'bar' });
  });

  it('should handle invalid JSON string details gracefully', async () => {
    mockPrisma.auditLog.findUnique.mockResolvedValue({
      id: 'e-bad',
      action: 'FAIL',
      entityType: 'User',
      entityId: 'u-1',
      actorId: null,
      details: 'not a json string {',
      createdAt: new Date(),
    });

    const result = await repo.findById('e-bad');
    expect(result?.details).toEqual({});
  });
});
