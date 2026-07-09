import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditController } from './audit.controller';
import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { NotFoundException } from '@nestjs/common';

describe('AuditController', () => {
  let controller: AuditController;
  let mockLogActionUseCase: any;
  let mockGetAuditLogsUseCase: any;
  let sampleLog: AuditLog;

  beforeEach(() => {
    sampleLog = AuditLog.create({
      action: 'CONTENT_CREATED',
      entityType: 'Content',
      entityId: 'c-1',
    });

    mockLogActionUseCase = {
      execute: vi.fn().mockResolvedValue(sampleLog),
    };

    mockGetAuditLogsUseCase = {
      list: vi.fn().mockResolvedValue([sampleLog]),
      getById: vi.fn().mockResolvedValue(sampleLog),
    };

    controller = new AuditController(mockLogActionUseCase, mockGetAuditLogsUseCase);
  });

  it('should create audit log via POST', async () => {
    const dto = {
      action: 'CONTENT_CREATED',
      entityType: 'Content',
      entityId: 'c-1',
    };
    const result = await controller.create(dto);
    expect(result).toEqual(sampleLog);
    expect(mockLogActionUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should list audit logs via GET', async () => {
    const result = await controller.list({ entityType: 'Content' });
    expect(result).toEqual([sampleLog]);
    expect(mockGetAuditLogsUseCase.list).toHaveBeenCalledWith({ entityType: 'Content' });
  });

  it('should get audit log by id via GET :id', async () => {
    const result = await controller.getById(sampleLog.id);
    expect(result).toEqual(sampleLog);
  });

  it('should throw NotFoundException when getById fails with not found', async () => {
    mockGetAuditLogsUseCase.getById.mockRejectedValue(new Error('not found'));
    await expect(controller.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException on unexpected errors', async () => {
    mockLogActionUseCase.execute.mockRejectedValue(new Error('db err'));
    await expect(
      controller.create({
        action: 'CONTENT_CREATED',
        entityType: 'Content',
        entityId: 'c-1',
      }),
    ).rejects.toThrow('db err');

    mockLogActionUseCase.execute.mockRejectedValue({});
    await expect(
      controller.create({
        action: 'CONTENT_CREATED',
        entityType: 'Content',
        entityId: 'c-1',
      }),
    ).rejects.toThrow('Unknown error');

    mockGetAuditLogsUseCase.getById.mockRejectedValue({});
    await expect(controller.getById('x')).rejects.toThrow('Unknown error');
  });
});
