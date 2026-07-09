import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateContentUseCase } from './update-content.use-case';
import { IContentRepository } from '../ports/out/content.repository.interface';
import { Content, ContentType, ContentStatus } from '../../domain/entities/content.entity';

describe('UpdateContentUseCase', () => {
  let useCase: UpdateContentUseCase;
  let mockRepo: IContentRepository;
  let existingContent: Content;

  beforeEach(() => {
    existingContent = Content.create({
      title: 'Initial Title',
      slug: 'initial-slug',
      body: 'Initial Body',
      type: ContentType.Article,
    });

    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(existingContent),
      findBySlug: vi.fn().mockResolvedValue(null),
      findMany: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new UpdateContentUseCase(mockRepo);
  });

  it('should update content fields successfully', async () => {
    const updated = await useCase.execute(existingContent.id, {
      title: 'Updated Title',
    });

    expect(updated.title).toBe('Updated Title');
    expect(mockRepo.save).toHaveBeenCalledWith(existingContent);
  });

  it('should transition status when action is submitForReview', async () => {
    const updated = await useCase.execute(existingContent.id, {
      action: 'submitForReview',
    });

    expect(updated.status).toBe(ContentStatus.InReview);
  });

  it('should transition status when action is publish', async () => {
    const updated = await useCase.execute(existingContent.id, {
      action: 'publish',
    });

    expect(updated.status).toBe(ContentStatus.Published);
  });

  it('should throw error if content not found', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', { title: 'New' })).rejects.toThrow(
      'Content with ID "non-existent-id" not found',
    );
  });

  it('should throw error if updating to an already existing slug', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue({ id: 'other-id' } as any);

    await expect(
      useCase.execute(existingContent.id, { slug: 'duplicate-slug' }),
    ).rejects.toThrow('Content with slug "duplicate-slug" already exists');
  });

  it('should allow updating slug if it resolves to the same content id', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue(existingContent);

    const updated = await useCase.execute(existingContent.id, {
      slug: 'initial-slug',
    });

    expect(updated.slug).toBe('initial-slug');
  });
});
