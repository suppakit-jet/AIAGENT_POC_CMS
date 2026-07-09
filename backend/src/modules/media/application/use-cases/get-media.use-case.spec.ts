import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetMediaUseCase } from './get-media.use-case';
import { StoragePort } from '../ports/out/storage.port';
import { Media } from '../../domain/entities/media.entity';

describe('GetMediaUseCase', () => {
  let useCase: GetMediaUseCase;
  let mockStorage: StoragePort;
  let sampleMedia: Media;

  beforeEach(() => {
    sampleMedia = Media.create({
      filename: 'file.jpg',
      originalName: 'photo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      url: '/uploads/file.jpg',
    });

    mockStorage = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(sampleMedia),
      findMany: vi.fn().mockResolvedValue([sampleMedia]),
      delete: vi.fn(),
    };

    useCase = new GetMediaUseCase(mockStorage);
  });

  it('should get all media files', async () => {
    const list = await useCase.list();
    expect(list).toEqual([sampleMedia]);
    expect(mockStorage.findMany).toHaveBeenCalled();
  });

  it('should get media by id', async () => {
    const media = await useCase.getById(sampleMedia.id);
    expect(media).toEqual(sampleMedia);
    expect(mockStorage.findById).toHaveBeenCalledWith(sampleMedia.id);
  });

  it('should throw error when getById finds nothing', async () => {
    mockStorage.findById = vi.fn().mockResolvedValue(null);
    await expect(useCase.getById('missing')).rejects.toThrow(
      'Media with ID "missing" not found',
    );
  });
});
