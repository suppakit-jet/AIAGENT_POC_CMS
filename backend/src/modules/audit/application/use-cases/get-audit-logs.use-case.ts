import { AuditLog } from '../../domain/entities/audit-log.entity';
import { IAuditLogRepository, AuditLogSearchCriteria } from '../ports/out/audit-log.repository.interface';

export class GetAuditLogsUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async list(criteria?: AuditLogSearchCriteria): Promise<AuditLog[]> {
    return this.auditLogRepository.findMany(criteria);
  }

  async getById(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new Error(`Audit log with ID "${id}" not found`);
    }
    return log;
  }
}
