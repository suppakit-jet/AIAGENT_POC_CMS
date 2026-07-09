import { Injectable, Inject } from '@nestjs/common';
import {
  IAuditLogRepository,
  AuditLogSearchCriteria,
} from '../../../application/ports/out/audit-log.repository.interface';
import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { PrismaService } from '../../../../auth/adapters/out/persistence/prisma.service';

@Injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  private toDomain(row: any): AuditLog {
    let parsedDetails = row.details;
    if (typeof row.details === 'string') {
      try {
        parsedDetails = JSON.parse(row.details);
      } catch {
        parsedDetails = {};
      }
    }
    return AuditLog.restore({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      actorId: row.actorId,
      details: parsedDetails,
      createdAt: row.createdAt,
    });
  }

  async save(auditLog: AuditLog): Promise<void> {
    await (this.prisma as any).auditLog.create({
      data: {
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        actorId: auditLog.actorId,
        details: auditLog.details ? JSON.stringify(auditLog.details) : null,
        createdAt: auditLog.createdAt,
      },
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    const row = await (this.prisma as any).auditLog.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findMany(criteria?: AuditLogSearchCriteria): Promise<AuditLog[]> {
    const where: any = {};
    if (criteria?.entityType) where.entityType = criteria.entityType;
    if (criteria?.entityId) where.entityId = criteria.entityId;
    if (criteria?.actorId) where.actorId = criteria.actorId;
    if (criteria?.action) where.action = criteria.action;

    const rows = await (this.prisma as any).auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row: any) => this.toDomain(row));
  }
}
