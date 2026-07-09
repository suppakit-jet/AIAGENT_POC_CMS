import { IContentRepository } from '../ports/out/content.repository.interface';

export class DeleteContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(id: string): Promise<void> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new Error(`Content with ID "${id}" not found`);
    }

    await this.contentRepository.delete(id);
  }
}
