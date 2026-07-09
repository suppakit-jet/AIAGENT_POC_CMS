import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAuditLogsUseCase } from './get-audit-logs.use-case';
import { IAuditLogRepository } from '../ports/out/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';

describe('GetAuditLogsUseCase', () => {
  let useCase: GetAuditLogsUseCase;
  let mockRepo: IAuditLogRepository;
  let sampleLog: AuditLog;

  beforeEach(() => {
    sampleLog = AuditLog.create({
      action: 'CONTENT_CREATED',
      entityType: 'Content',
      entityId: 'c-1',
    });

    mockRepo = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(sampleLog),
      findMany: vi.fn().mockResolvedValue([sampleLog]),
    };

    useCase = new GetAuditLogsUseCase(mockRepo);
  });

  it('should list audit logs with search criteria', async () => {
    const logs = await useCase.list({ entityType: 'Content' });
    expect(logs).toEqual([sampleLog]);
    expect(mockRepo.findMany).toHaveBeenCalledWith({ entityType: 'Content' });
  });

  it('should get audit log by id', async () => {
    const log = await useCase.getById(sampleLog.id);
    expect(log).toEqual(sampleLog);
  });

  it('should throw error if getById finds nothing', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue(null);
    await expect(useCase.getById('missing')).rejects.toThrow(
      'Audit log with ID "missing" not found',
    );
  });
});
