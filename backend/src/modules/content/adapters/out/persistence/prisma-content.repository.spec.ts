import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaContentRepository } from './prisma-content.repository';
import { Content, ContentType } from '../../../domain/entities/content.entity';

describe('PrismaContentRepository', () => {
  let repo: PrismaContentRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      content: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        delete: vi.fn(),
      },
    };
    repo = new PrismaContentRepository(mockPrisma);
  });

  it('should save content using upsert', async () => {
    const content = Content.create({
      title: 'Title',
      slug: 'slug',
      body: 'Body',
      type: ContentType.Article,
    });

    await repo.save(content);

    expect(mockPrisma.content.upsert).toHaveBeenCalledWith({
      where: { id: content.id },
      create: expect.objectContaining({
        id: content.id,
        title: content.title,
        slug: content.slug,
        body: content.body,
        type: content.type,
        status: content.status,
      }),
      update: expect.objectContaining({
        title: content.title,
        slug: content.slug,
        body: content.body,
        status: content.status,
      }),
    });
  });

  it('should find content by id and reconstitute domain entity', async () => {
    const now = new Date();
    mockPrisma.content.findUnique.mockResolvedValue({
      id: 'id-1',
      title: 'Title',
      slug: 'slug',
      body: 'Body',
      type: 'article',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });

    const result = await repo.findById('id-1');

    expect(result).toBeInstanceOf(Content);
    expect(result?.id).toBe('id-1');
  });

  it('should return null if findById finds nothing', async () => {
    mockPrisma.content.findUnique.mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('should find content by slug and type', async () => {
    const now = new Date();
    mockPrisma.content.findFirst.mockResolvedValue({
      id: 'id-1',
      title: 'Title',
      slug: 'slug',
      body: 'Body',
      type: 'article',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });

    const result = await repo.findBySlug('slug', ContentType.Article);
    expect(result?.slug).toBe('slug');
    expect(mockPrisma.content.findFirst).toHaveBeenCalledWith({
      where: { slug: 'slug', type: ContentType.Article },
    });
  });

  it('should return null if findBySlug finds nothing', async () => {
    mockPrisma.content.findFirst.mockResolvedValue(null);
    const result = await repo.findBySlug('slug');
    expect(result).toBeNull();
  });

  it('should find many content items with optional criteria', async () => {
    const now = new Date();
    mockPrisma.content.findMany.mockResolvedValue([
      {
        id: 'id-1',
        title: 'Title',
        slug: 'slug',
        body: 'Body',
        type: 'article',
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await repo.findMany({ type: ContentType.Article });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Content);
    expect(mockPrisma.content.findMany).toHaveBeenCalledWith({
      where: { type: ContentType.Article },
    });
  });

  it('should find many content items filtering by status', async () => {
    mockPrisma.content.findMany.mockResolvedValue([]);
    await repo.findMany({ status: 'published' });
    expect(mockPrisma.content.findMany).toHaveBeenCalledWith({
      where: { status: 'published' },
    });
  });

  it('should delete content by ID', async () => {
    await repo.delete('id-1');
    expect(mockPrisma.content.delete).toHaveBeenCalledWith({
      where: { id: 'id-1' },
    });
  });
});
