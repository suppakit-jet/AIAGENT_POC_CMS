import { AuditLog } from '../../../domain/entities/audit-log.entity';

export interface AuditLogSearchCriteria {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
}

export interface IAuditLogRepository {
  save(auditLog: AuditLog): Promise<void>;
  findById(id: string): Promise<AuditLog | null>;
  findMany(criteria?: AuditLogSearchCriteria): Promise<AuditLog[]>;
}
