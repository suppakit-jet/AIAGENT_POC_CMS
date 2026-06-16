import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import * as Minio from 'minio';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class MediaService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName = process.env.MINIO_BUCKET || 'cms-media';

  constructor(private prisma: PrismaService) {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'cms_minio',
      secretKey: process.env.MINIO_SECRET_KEY || 'cms_minio_secret'
    });
  }

  async onModuleInit() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`]
          }
        ]
      };
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
    }
  }

  async getPresignedUploadUrl(filename: string, mimeType: string, userId: string) {
    // Validate mime type (magic bytes should be checked at upload, but we check mime here as a first pass)
    if (!mimeType.startsWith('image/')) {
      throw new BadRequestException('Only images are allowed');
    }

    const ext = filename.split('.').pop();
    const objectName = `${userId}/${Date.now()}.${ext}`;

    const url = await this.minioClient.presignedPutObject(this.bucketName, objectName, 3600); // 1 hour expiry
    
    return { url, objectName };
  }

  async saveMediaRecord(data: { storageKey: string; filename: string; mimeType: string; sizeBytes: number; uploadedBy: string }) {
    return this.prisma.mediaItem.create({
      data: {
        storageKey: data.storageKey,
        filename: data.filename,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        uploadedBy: data.uploadedBy,
      }
    });
  }

  async findAll() {
    return this.prisma.mediaItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
