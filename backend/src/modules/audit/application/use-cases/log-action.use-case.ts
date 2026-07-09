import { AuditLog } from '../../domain/entities/audit-log.entity';
import { IAuditLogRepository } from '../ports/out/audit-log.repository.interface';

export interface LogActionDto {
  action: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  details?: Record<string, any>;
}

export class LogActionUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(dto: LogActionDto): Promise<AuditLog> {
    const auditLog = AuditLog.create({
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId,
      actorId: dto.actorId,
      details: dto.details,
    });

    await this.auditLogRepository.save(auditLog);
    return auditLog;
  }
}
