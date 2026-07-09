import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogActionUseCase } from './log-action.use-case';
import { IAuditLogRepository } from '../ports/out/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';

describe('LogActionUseCase', () => {
  let useCase: LogActionUseCase;
  let mockRepo: IAuditLogRepository;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findMany: vi.fn(),
    };
    useCase = new LogActionUseCase(mockRepo);
  });

  it('should create and save an audit log successfully', async () => {
    const log = await useCase.execute({
      action: 'CONTENT_CREATED',
      entityType: 'Content',
      entityId: 'c-1',
      actorId: 'u-1',
      details: { slug: 'test' },
    });

    expect(log).toBeInstanceOf(AuditLog);
    expect(log.action).toBe('CONTENT_CREATED');
    expect(mockRepo.save).toHaveBeenCalledWith(log);
  });
});
