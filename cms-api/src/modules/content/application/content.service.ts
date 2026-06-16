import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ContextOrchestrator } from './context.orchestrator';
import { ContentType, ContentStatus } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private orchestrator: ContextOrchestrator
  ) {}

  async createDraft(data: { title: string; slug: string; type: ContentType; authorId: string; body?: any }) {
    return this.prisma.content.create({
      data: {
        title: data.title,
        slug: data.slug,
        type: data.type,
        body: data.body || {},
        status: 'DRAFT',
        authorId: data.authorId
      }
    });
  }

  async updateContent(id: string, data: any, editorId: string) {
    const content = await this.prisma.content.update({
      where: { id },
      data
    });
    
    // Create a new version snapshot
    const count = await this.prisma.contentVersion.count({ where: { contentId: id } });
    await this.prisma.contentVersion.create({
      data: {
        contentId: id,
        versionNo: count + 1,
        editorId,
        snapshot: content.body as any,
      }
    });

    return content;
  }

  async submitForReview(id: string) {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');

    // Call Hermes Agent Core via Orchestrator
    const reviewResult = await this.orchestrator.processContentAction(
      id,
      JSON.stringify(content.body),
      content.seoDescription || undefined
    );

    await this.prisma.content.update({
      where: { id },
      data: { status: reviewResult.success ? 'PUBLISHED' : 'IN_REVIEW' }
    });

    return { content, reviewNotes: reviewResult.message };
  }

  async publish(id: string, userId: string) {
    const res = await this.prisma.content.update({
      where: { id },
      data: { 
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    // Fire and forget audit log
    this.prisma.auditEvent.create({
      data: {
        actorId: userId,
        action: 'CONTENT_PUBLISHED',
        targetType: 'CONTENT',
        targetId: id
      }
    }).catch(e => console.error('Failed to log audit:', e));

    return res;
  }

  async findAll() {
    return this.prisma.content.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
