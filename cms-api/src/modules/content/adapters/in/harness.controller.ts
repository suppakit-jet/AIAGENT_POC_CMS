import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ContextOrchestrator } from '../../application/context.orchestrator';

/**
 * The Harness Layer in the Hermes architecture.
 * Belongs to the Hexagonal Adapters Layer (Driving Adapter).
 * Responsibilities:
 * - Execution control, permissions, and guardrails.
 * - Receives HTTP requests and routes them to the Context layer.
 */
@Controller('api/admin/content')
export class HarnessController {
  constructor(private readonly orchestrator: ContextOrchestrator) {}

  @Post('publish')
  async publishContent(@Body() payload: { contentId: string; content: string; seoDescription?: string }) {
    try {
      // 1. Guardrails & Permissions (In a real app, use @UseGuards())
      if (!payload.contentId || !payload.content) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      // 2. Pass to Context Orchestrator
      const result = await this.orchestrator.processContentAction(
        payload.contentId,
        payload.content,
        payload.seoDescription,
      );

      return result;
    } catch (error: any) {
      // Observability & Evaluation could be logged here
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
