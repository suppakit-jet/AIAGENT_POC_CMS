import { Injectable } from '@nestjs/common';
import { AgentCore } from '../domain/agent.core';

/**
 * The Context Layer in the Hermes architecture.
 * Belongs to the Hexagonal Application Layer (Use Cases).
 * Responsibilities:
 * - Gathering memory, documents, and RAG data.
 * - Calling the Agent Core for reasoning.
 * - Managing the application state based on the Agent's decision.
 */
@Injectable()
export class ContextOrchestrator {
  constructor(private readonly agentCore: AgentCore) {}

  async processContentAction(contentId: string, rawContent: string, seoDescription?: string) {
    // 1. Gather Context (In a real scenario, fetch from DB via Outbound Ports)
    const context = {
      contentId,
      systemPrompt: 'You are an expert editor reviewing content for a modern CMS.',
      seoDescription,
      historicalEdits: [], // RAG data could be loaded here
    };

    // 2. Pass context to Reasoning Core
    const evaluation = await this.agentCore.evaluateContent(context, rawContent);

    // 3. Act on the Core's decision
    if (evaluation.action === 'approve') {
      // e.g., Update content status to 'published' via Outbound Port Repository
      return { success: true, status: 'published', message: evaluation.feedback };
    } else {
      // e.g., Return error to the user or mark as 'needs-review'
      return { success: false, status: 'draft', message: evaluation.feedback };
    }
  }
}
