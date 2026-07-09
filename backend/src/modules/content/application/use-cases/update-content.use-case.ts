import { Content } from '../../domain/entities/content.entity';
import { IContentRepository } from '../ports/out/content.repository.interface';

export interface UpdateContentDto {
  title?: string;
  slug?: string;
  body?: string;
  action?: 'submitForReview' | 'publish';
}

export class UpdateContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(id: string, dto: UpdateContentDto): Promise<Content> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new Error(`Content with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== content.slug) {
      const existing = await this.contentRepository.findBySlug(dto.slug, content.type);
      if (existing && existing.id !== id) {
        throw new Error(`Content with slug "${dto.slug}" already exists`);
      }
    }

    content.update({
      title: dto.title,
      slug: dto.slug,
      body: dto.body,
    });

    if (dto.action === 'submitForReview') {
      content.submitForReview();
    } else if (dto.action === 'publish') {
      content.publish();
    }

    await this.contentRepository.save(content);
    return content;
  }
}
