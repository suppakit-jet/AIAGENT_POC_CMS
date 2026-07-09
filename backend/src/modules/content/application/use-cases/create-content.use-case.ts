import { Content, ContentType } from '../../domain/entities/content.entity';
import { IContentRepository } from '../ports/out/content.repository.interface';

export interface CreateContentDto {
  title: string;
  slug: string;
  body: string;
  type: ContentType;
}

export class CreateContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(dto: CreateContentDto): Promise<Content> {
    const existing = await this.contentRepository.findBySlug(dto.slug, dto.type);
    if (existing) {
      throw new Error(`Content with slug "${dto.slug}" already exists`);
    }

    const content = Content.create({
      title: dto.title,
      slug: dto.slug,
      body: dto.body,
      type: dto.type,
    });

    await this.contentRepository.save(content);
    return content;
  }
}
