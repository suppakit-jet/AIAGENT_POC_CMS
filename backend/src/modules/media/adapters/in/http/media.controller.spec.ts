import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaController } from './media.controller';
import { Media } from '../../../domain/entities/media.entity';
import { NotFoundException } from '@nestjs/common';

describe('MediaController', () => {
  let controller: MediaController;
  let mockUploadUseCase: any;
  let mockGetUseCase: any;
  let sampleMedia: Media;

  beforeEach(() => {
    sampleMedia = Media.create({
      filename: 'file.jpg',
      originalName: 'photo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      url: '/uploads/file.jpg',
    });

    mockUploadUseCase = {
      execute: vi.fn().mockResolvedValue(sampleMedia),
    };

    mockGetUseCase = {
      list: vi.fn().mockResolvedValue([sampleMedia]),
      getById: vi.fn().mockResolvedValue(sampleMedia),
    };

    controller = new MediaController(mockUploadUseCase, mockGetUseCase);
  });

  it('should upload media metadata via POST', async () => {
    const dto = {
      filename: 'file.jpg',
      originalName: 'photo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      url: '/uploads/file.jpg',
    };
    const result = await controller.upload(dto);
    expect(result).toEqual(sampleMedia);
    expect(mockUploadUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should list media via GET', async () => {
    const result = await controller.list();
    expect(result).toEqual([sampleMedia]);
    expect(mockGetUseCase.list).toHaveBeenCalled();
  });

  it('should get media by id via GET :id', async () => {
    const result = await controller.getById(sampleMedia.id);
    expect(result).toEqual(sampleMedia);
  });

  it('should throw NotFoundException when getById fails with not found', async () => {
    mockGetUseCase.getById.mockRejectedValue(new Error('not found'));
    await expect(controller.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException on unexpected errors', async () => {
    mockUploadUseCase.execute.mockRejectedValue(new Error('upload failure'));
    await expect(
      controller.upload({
        filename: 'file.jpg',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        url: '/uploads/file.jpg',
      }),
    ).rejects.toThrow('upload failure');

    mockUploadUseCase.execute.mockRejectedValue({});
    await expect(
      controller.upload({
        filename: 'file.jpg',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        url: '/uploads/file.jpg',
      }),
    ).rejects.toThrow('Unknown error');

    mockGetUseCase.getById.mockRejectedValue({});
    await expect(controller.getById('err')).rejects.toThrow('Unknown error');
  });
});
