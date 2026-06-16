import { Module } from '@nestjs/common';
import { HarnessController } from './adapters/in/harness.controller';
import { ContentController } from './adapters/in/content.controller';
import { ContextOrchestrator } from './application/context.orchestrator';
import { AgentCore } from './domain/agent.core';
import { ContentService } from './application/content.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [HarnessController, ContentController],
  providers: [
    ContextOrchestrator,
    AgentCore,
    ContentService,
    PrismaService,
  ],
  exports: [ContentService]
})
export class ContentModule {}
