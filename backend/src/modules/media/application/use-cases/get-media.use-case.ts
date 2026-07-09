import { Media } from '../../domain/entities/media.entity';
import { StoragePort } from '../ports/out/storage.port';

export class GetMediaUseCase {
  constructor(private readonly storagePort: StoragePort) {}

  async list(): Promise<Media[]> {
    return this.storagePort.findMany();
  }

  async getById(id: string): Promise<Media> {
    const media = await this.storagePort.findById(id);
    if (!media) {
      throw new Error(`Media with ID "${id}" not found`);
    }
    return media;
  }
}
