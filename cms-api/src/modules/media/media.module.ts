import { Module } from '@nestjs/common';
import { MediaService } from './application/media.service';
import { MediaController } from './adapters/in/media.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, PrismaService],
  exports: [MediaService]
})
export class MediaModule {}
