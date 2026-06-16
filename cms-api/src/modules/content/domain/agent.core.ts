import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';

/**
 * The Reasoning Core (LLM/Agent) in the Hermes architecture.
 * Belongs to the Hexagonal Domain Layer.
 * It encapsulates the pure business logic of evaluating content using an LLM model.
 */
@Injectable()
export class AgentCore {
  private readonly logger = new Logger(AgentCore.name);
  private readonly ollama: Ollama;

  constructor() {
    // Connect to local Ollama instance
    this.ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
  }

  /**
   * Evaluates content based on the provided context using local Ollama model.
   */
  async evaluateContent(context: Record<string, any>, content: string): Promise<{ action: string; feedback: string }> {
    this.logger.log('Evaluating content using Ollama...');
    
    // We expect the user to have a model like 'llama3' or 'mistral' pulled in their Ollama
    const model = process.env.OLLAMA_MODEL || 'llama3';

    const prompt = `
      ${context.systemPrompt}
      
      Review the following content and SEO description.
      Content: "${content}"
      SEO Description: "${context.seoDescription || 'None provided'}"
      
      If the content is too short (less than 50 characters) or lacks a good SEO description, reject it.
      Otherwise, approve it.
      
      Respond in strictly JSON format like this: {"action": "approve" | "reject", "feedback": "your feedback reason here"}.
      Do not include any other text outside the JSON.
    `;

    try {
      const response = await this.ollama.generate({
        model: model,
        prompt: prompt,
        format: 'json',
        stream: false,
      });

      const result = JSON.parse(response.response);
      
      if (result.action !== 'approve' && result.action !== 'reject') {
        return { action: 'reject', feedback: 'Invalid response action from AI.' };
      }

      return { action: result.action, feedback: result.feedback };
    } catch (error: any) {
      this.logger.error(`Failed to evaluate content with Ollama: ${error.message}`);
      return { action: 'reject', feedback: 'AI evaluation failed due to connection error. Is Ollama running?' };
    }
  }
}
