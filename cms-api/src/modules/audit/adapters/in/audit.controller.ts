import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from '../../application/audit.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/admin/audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  async getLogs() {
    return this.auditService.getLogs();
  }
}
