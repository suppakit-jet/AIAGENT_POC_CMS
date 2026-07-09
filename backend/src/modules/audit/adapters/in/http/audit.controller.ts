import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LogActionUseCase } from '../../../application/use-cases/log-action.use-case';
import { GetAuditLogsUseCase } from '../../../application/use-cases/get-audit-logs.use-case';

@Controller('api/admin/audit')
export class AuditController {
  constructor(
    @Inject(LogActionUseCase)
    private readonly logActionUseCase: LogActionUseCase,
    @Inject(GetAuditLogsUseCase)
    private readonly getAuditLogsUseCase: GetAuditLogsUseCase,
  ) {}

  @Post()
  async create(
    @Body()
    dto: {
      action: string;
      entityType: string;
      entityId: string;
      actorId?: string;
      details?: Record<string, any>;
    },
  ) {
    try {
      return await this.logActionUseCase.execute(dto);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      throw new InternalServerErrorException(message);
    }
  }

  @Get()
  async list(
    @Query()
    query: {
      entityType?: string;
      entityId?: string;
      actorId?: string;
      action?: string;
    },
  ) {
    return this.getAuditLogsUseCase.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await this.getAuditLogsUseCase.getById(id);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('not found')) {
        throw new NotFoundException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }
}
