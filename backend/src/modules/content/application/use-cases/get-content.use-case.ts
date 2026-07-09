import { Content } from '../../domain/entities/content.entity';
import { IContentRepository, ContentSearchCriteria } from '../ports/out/content.repository.interface';

export class GetContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async getById(id: string): Promise<Content> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new Error(`Content with ID "${id}" not found`);
    }
    return content;
  }

  async list(criteria?: ContentSearchCriteria): Promise<Content[]> {
    return this.contentRepository.findMany(criteria);
  }
}
