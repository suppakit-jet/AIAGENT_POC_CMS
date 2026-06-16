import { Module } from '@nestjs/common';
import { AuditService } from './application/audit.service';
import { AuditController } from './adapters/in/audit.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AuditController],
  providers: [AuditService, PrismaService],
  exports: [AuditService]
})
export class AuditModule {}
