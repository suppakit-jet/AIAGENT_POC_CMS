import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiKeyGuard } from '../../api-key.guard';
import { PrismaService } from '../../../../prisma.service';

@UseGuards(ApiKeyGuard)
@Controller('api/v1/content')
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getPublishedContent() {
    return this.prisma.content.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        body: true,
        seoTitle: true,
        seoDescription: true,
        publishedAt: true,
        author: { select: { name: true } }
      },
      orderBy: { publishedAt: 'desc' }
    });
  }

  @Get(':slug')
  async getContentBySlug(@Param('slug') slug: string) {
    const content = await this.prisma.content.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: { author: { select: { name: true } } }
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content;
  }
}
