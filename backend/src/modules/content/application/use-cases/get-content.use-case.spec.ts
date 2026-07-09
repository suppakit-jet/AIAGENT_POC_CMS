import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetContentUseCase } from './get-content.use-case';
import { IContentRepository } from '../ports/out/content.repository.interface';
import { Content, ContentType } from '../../domain/entities/content.entity';

describe('GetContentUseCase', () => {
  let useCase: GetContentUseCase;
  let mockRepo: IContentRepository;
  let existingContent: Content;

  beforeEach(() => {
    existingContent = Content.create({
      title: 'Article 1',
      slug: 'article-1',
      body: 'Body',
      type: ContentType.Article,
    });

    mockRepo = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingContent),
      findBySlug: vi.fn(),
      findMany: vi.fn().mockResolvedValue([existingContent]),
      delete: vi.fn(),
    };

    useCase = new GetContentUseCase(mockRepo);
  });

  it('should get content by ID successfully', async () => {
    const result = await useCase.getById(existingContent.id);
    expect(result).toEqual(existingContent);
  });

  it('should throw error if getById finds nothing', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue(null);

    await expect(useCase.getById('missing-id')).rejects.toThrow(
      'Content with ID "missing-id" not found',
    );
  });

  it('should list content by search criteria', async () => {
    const list = await useCase.list({ type: ContentType.Article });
    expect(list).toHaveLength(1);
    expect(mockRepo.findMany).toHaveBeenCalledWith({ type: ContentType.Article });
  });
});
