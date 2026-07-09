import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateContentUseCase } from './create-content.use-case';
import { IContentRepository } from '../ports/out/content.repository.interface';
import { ContentType } from '../../domain/entities/content.entity';

describe('CreateContentUseCase', () => {
  let useCase: CreateContentUseCase;
  let mockRepo: IContentRepository;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new CreateContentUseCase(mockRepo);
  });

  it('should create and save content successfully', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue(null);

    const result = await useCase.execute({
      title: 'My Article',
      slug: 'my-article',
      body: 'Article body',
      type: ContentType.Article,
    });

    expect(result.id).toBeDefined();
    expect(result.title).toBe('My Article');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw error if slug already exists', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue({ id: 'existing-id' } as any);

    await expect(
      useCase.execute({
        title: 'My Article',
        slug: 'my-article',
        body: 'Article body',
        type: ContentType.Article,
      }),
    ).rejects.toThrow('Content with slug "my-article" already exists');
  });
});
