import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadMediaUseCase } from './upload-media.use-case';
import { StoragePort } from '../ports/out/storage.port';
import { Media } from '../../domain/entities/media.entity';

describe('UploadMediaUseCase', () => {
  let useCase: UploadMediaUseCase;
  let mockStorage: StoragePort;

  beforeEach(() => {
    mockStorage = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new UploadMediaUseCase(mockStorage);
  });

  it('should upload media and save metadata via StoragePort', async () => {
    const media = await useCase.execute({
      filename: 'image-1.jpg',
      originalName: 'photo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      url: '/uploads/image-1.jpg',
      uploadedBy: 'admin-1',
    });

    expect(media).toBeInstanceOf(Media);
    expect(media.filename).toBe('image-1.jpg');
    expect(mockStorage.save).toHaveBeenCalledWith(media);
  });
});
