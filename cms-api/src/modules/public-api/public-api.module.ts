import { Module } from '@nestjs/common';
import { PublicController } from './adapters/in/public.controller';
import { PrismaService } from '../../prisma.service';
import { ApiKeyGuard } from './api-key.guard';

@Module({
  controllers: [PublicController],
  providers: [PrismaService, ApiKeyGuard]
})
export class PublicApiModule {}
