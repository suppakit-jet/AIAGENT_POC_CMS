import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaMediaRepository } from './prisma-media.repository';
import { Media } from '../../../domain/entities/media.entity';

describe('PrismaMediaRepository', () => {
  let repo: PrismaMediaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      media: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        delete: vi.fn(),
      },
    };
    repo = new PrismaMediaRepository(mockPrisma);
  });

  it('should save media to prisma', async () => {
    const media = Media.create({
      filename: 'test.jpg',
      originalName: 'orig.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      url: '/uploads/test.jpg',
      uploadedBy: 'u-1',
    });

    await repo.save(media);
    expect(mockPrisma.media.create).toHaveBeenCalled();
  });

  it('should find media by id', async () => {
    const now = new Date();
    mockPrisma.media.findUnique.mockResolvedValue({
      id: 'm-1',
      filename: 'test.jpg',
      originalName: 'orig.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      url: '/uploads/test.jpg',
      uploadedBy: 'u-1',
      createdAt: now,
    });

    const result = await repo.findById('m-1');
    expect(result).toBeInstanceOf(Media);
    expect(result?.id).toBe('m-1');
  });

  it('should return null when findById finds nothing', async () => {
    mockPrisma.media.findUnique.mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('should find many media', async () => {
    mockPrisma.media.findMany.mockResolvedValue([]);
    const result = await repo.findMany();
    expect(result).toEqual([]);
  });

  it('should delete media by id', async () => {
    await repo.delete('m-1');
    expect(mockPrisma.media.delete).toHaveBeenCalledWith({ where: { id: 'm-1' } });
  });

  it('should handle media without uploadedBy', async () => {
    const media = Media.create({
      filename: 'anon.jpg',
      originalName: 'anon.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 500,
      url: '/uploads/anon.jpg',
    });
    await repo.save(media);

    mockPrisma.media.findUnique.mockResolvedValue({
      id: media.id,
      filename: 'anon.jpg',
      originalName: 'anon.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 500,
      url: '/uploads/anon.jpg',
      uploadedBy: null,
      createdAt: new Date(),
    });

    const found = await repo.findById(media.id);
    expect(found?.uploadedBy).toBeUndefined();
  });
});
