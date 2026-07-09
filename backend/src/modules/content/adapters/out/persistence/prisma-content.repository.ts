import { Injectable, Inject } from '@nestjs/common';
import { IContentRepository, ContentSearchCriteria } from '../../../application/ports/out/content.repository.interface';
import { Content, ContentType, ContentStatus } from '../../../domain/entities/content.entity';
import { PrismaService } from '../../../../auth/adapters/out/persistence/prisma.service';

@Injectable()
export class PrismaContentRepository implements IContentRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  private toDomain(row: any): Content {
    return Content.restore({
      id: row.id,
      title: row.title,
      slug: row.slug,
      body: row.body,
      type: row.type as ContentType,
      status: row.status as ContentStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(content: Content): Promise<void> {
    const data = {
      id: content.id,
      title: content.title,
      slug: content.slug,
      body: content.body,
      type: content.type,
      status: content.status,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
    };

    await (this.prisma as any).content.upsert({
      where: { id: content.id },
      create: data,
      update: {
        title: content.title,
        slug: content.slug,
        body: content.body,
        status: content.status,
        updatedAt: content.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Content | null> {
    const row = await (this.prisma as any).content.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findBySlug(slug: string, type?: ContentType): Promise<Content | null> {
    const where: any = { slug };
    if (type) {
      where.type = type;
    }
    const row = await (this.prisma as any).content.findFirst({ where });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findMany(criteria?: ContentSearchCriteria): Promise<Content[]> {
    const where: any = {};
    if (criteria?.type) where.type = criteria.type;
    if (criteria?.status) where.status = criteria.status;

    const rows = await (this.prisma as any).content.findMany({ where });
    return rows.map((row: any) => this.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).content.delete({ where: { id } });
  }
}
