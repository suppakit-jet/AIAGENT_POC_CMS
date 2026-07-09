import { Injectable, Inject } from '@nestjs/common';
import { StoragePort } from '../../../application/ports/out/storage.port';
import { Media } from '../../../domain/entities/media.entity';
import { PrismaService } from '../../../../auth/adapters/out/persistence/prisma.service';

@Injectable()
export class PrismaMediaRepository implements StoragePort {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  private toDomain(row: any): Media {
    return Media.restore({
      id: row.id,
      filename: row.filename,
      originalName: row.originalName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      url: row.url,
      uploadedBy: row.uploadedBy ?? undefined,
      createdAt: row.createdAt,
    });
  }

  async save(media: Media): Promise<void> {
    await (this.prisma as any).media.create({
      data: {
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        url: media.url,
        uploadedBy: media.uploadedBy ?? null,
        createdAt: media.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Media | null> {
    const row = await (this.prisma as any).media.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findMany(): Promise<Media[]> {
    const rows = await (this.prisma as any).media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r: any) => this.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).media.delete({ where: { id } });
  }
}
