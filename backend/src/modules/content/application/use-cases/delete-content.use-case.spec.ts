import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteContentUseCase } from './delete-content.use-case';
import { IContentRepository } from '../ports/out/content.repository.interface';
import { Content, ContentType } from '../../domain/entities/content.entity';

describe('DeleteContentUseCase', () => {
  let useCase: DeleteContentUseCase;
  let mockRepo: IContentRepository;
  let existingContent: Content;

  beforeEach(() => {
    existingContent = Content.create({
      title: 'To Delete',
      slug: 'to-delete',
      body: 'Body',
      type: ContentType.Article,
    });

    mockRepo = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingContent),
      findBySlug: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new DeleteContentUseCase(mockRepo);
  });

  it('should delete existing content successfully', async () => {
    await useCase.execute(existingContent.id);
    expect(mockRepo.delete).toHaveBeenCalledWith(existingContent.id);
  });

  it('should throw error if content not found', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      'Content with ID "non-existent-id" not found',
    );
  });
});
