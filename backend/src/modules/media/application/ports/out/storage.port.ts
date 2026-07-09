import { Media } from '../../../domain/entities/media.entity';

export interface StoragePort {
  save(media: Media): Promise<void>;
  findById(id: string): Promise<Media | null>;
  findMany(): Promise<Media[]>;
  delete(id: string): Promise<void>;
}
