import { Media } from '../../domain/entities/media.entity';
import { StoragePort } from '../ports/out/storage.port';

export interface UploadMediaDto {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  uploadedBy?: string | undefined;
}

export class UploadMediaUseCase {
  constructor(private readonly storagePort: StoragePort) {}

  async execute(dto: UploadMediaDto): Promise<Media> {
    const media = Media.create({
      filename: dto.filename,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      url: dto.url,
      uploadedBy: dto.uploadedBy,
    });

    await this.storagePort.save(media);
    return media;
  }
}
