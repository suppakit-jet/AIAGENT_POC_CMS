import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentController } from './content.controller';
import { Content, ContentType } from '../../../domain/entities/content.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ContentController', () => {
  let controller: ContentController;
  let mockCreateUseCase: any;
  let mockUpdateUseCase: any;
  let mockDeleteUseCase: any;
  let mockGetUseCase: any;
  let sampleContent: Content;

  beforeEach(() => {
    sampleContent = Content.create({
      title: 'Sample Article',
      slug: 'sample-article',
      body: 'Sample body',
      type: ContentType.Article,
    });

    mockCreateUseCase = {
      execute: vi.fn().mockResolvedValue(sampleContent),
    };
    mockUpdateUseCase = {
      execute: vi.fn().mockResolvedValue(sampleContent),
    };
    mockDeleteUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    mockGetUseCase = {
      getById: vi.fn().mockResolvedValue(sampleContent),
      list: vi.fn().mockResolvedValue([sampleContent]),
    };

    controller = new ContentController(
      mockCreateUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase,
      mockGetUseCase,
    );
  });

  it('should create content via POST', async () => {
    const dto = {
      title: 'Sample Article',
      slug: 'sample-article',
      body: 'Sample body',
      type: ContentType.Article,
    };
    const result = await controller.create(dto);
    expect(result).toEqual(sampleContent);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException when creating duplicate slug', async () => {
    mockCreateUseCase.execute.mockRejectedValue(new Error('already exists'));
    await expect(
      controller.create({
        title: 'Sample',
        slug: 'dup',
        body: 'Body',
        type: ContentType.Article,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should get content by id via GET :id', async () => {
    const result = await controller.getById(sampleContent.id);
    expect(result).toEqual(sampleContent);
    expect(mockGetUseCase.getById).toHaveBeenCalledWith(sampleContent.id);
  });

  it('should throw NotFoundException when getById fails', async () => {
    mockGetUseCase.getById.mockRejectedValue(new Error('not found'));
    await expect(controller.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('should list content via GET', async () => {
    const result = await controller.list({ type: ContentType.Article });
    expect(result).toEqual([sampleContent]);
    expect(mockGetUseCase.list).toHaveBeenCalledWith({ type: ContentType.Article });
  });

  it('should update content via PATCH :id', async () => {
    const dto = { title: 'New Title' };
    const result = await controller.update(sampleContent.id, dto);
    expect(result).toEqual(sampleContent);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(sampleContent.id, dto);
  });

  it('should throw ConflictException on update if slug already exists', async () => {
    mockUpdateUseCase.execute.mockRejectedValue(new Error('already exists'));
    await expect(
      controller.update(sampleContent.id, { slug: 'dup' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException on update if content not found', async () => {
    mockUpdateUseCase.execute.mockRejectedValue(new Error('not found'));
    await expect(
      controller.update('missing', { title: 'New' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete content via DELETE :id', async () => {
    await controller.delete(sampleContent.id);
    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(sampleContent.id);
  });

  it('should throw NotFoundException on delete if content not found', async () => {
    mockDeleteUseCase.execute.mockRejectedValue(new Error('not found'));
    await expect(controller.delete('missing')).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException on unexpected errors', async () => {
    mockCreateUseCase.execute.mockRejectedValue(new Error('Unexpected DB failure'));
    await expect(
      controller.create({
        title: 'Sample',
        slug: 'slug',
        body: 'Body',
        type: ContentType.Article,
      }),
    ).rejects.toThrow('Unexpected DB failure');

    mockCreateUseCase.execute.mockRejectedValue({});
    await expect(
      controller.create({
        title: 'Sample',
        slug: 'slug',
        body: 'Body',
        type: ContentType.Article,
      }),
    ).rejects.toThrow('Unknown error');

    mockGetUseCase.getById.mockRejectedValue(new Error('Unexpected get failure'));
    await expect(controller.getById('id')).rejects.toThrow('Unexpected get failure');

    mockUpdateUseCase.execute.mockRejectedValue(new Error('Unexpected update failure'));
    await expect(controller.update('id', { title: 'New' })).rejects.toThrow(
      'Unexpected update failure',
    );

    mockDeleteUseCase.execute.mockRejectedValue(new Error('Unexpected delete failure'));
    await expect(controller.delete('id')).rejects.toThrow('Unexpected delete failure');

    mockGetUseCase.getById.mockRejectedValue({});
    await expect(controller.getById('id')).rejects.toThrow('Unknown error');

    mockUpdateUseCase.execute.mockRejectedValue({});
    await expect(controller.update('id', {})).rejects.toThrow('Unknown error');

    mockDeleteUseCase.execute.mockRejectedValue({});
    await expect(controller.delete('id')).rejects.toThrow('Unknown error');
  });
});
