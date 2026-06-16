import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(actorId: string, action: string, targetType: string, targetId?: string, summary?: any) {
    return this.prisma.auditEvent.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        summary
      }
    });
  }

  async getLogs() {
    return this.prisma.auditEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      include: { actor: { select: { email: true, name: true } } }
    });
  }
}
