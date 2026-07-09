import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadMediaUseCase } from '../../../application/use-cases/upload-media.use-case';
import { GetMediaUseCase } from '../../../application/use-cases/get-media.use-case';

@Controller('api/admin/media')
export class MediaController {
  constructor(
    @Inject(UploadMediaUseCase)
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    @Inject(GetMediaUseCase)
    private readonly getMediaUseCase: GetMediaUseCase,
  ) {}

  @Post()
  async upload(
    @Body()
    dto: {
      filename: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      url: string;
      uploadedBy?: string | undefined;
    },
  ) {
    try {
      return await this.uploadMediaUseCase.execute(dto);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      throw new InternalServerErrorException(message);
    }
  }

  @Get()
  async list() {
    return this.getMediaUseCase.list();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await this.getMediaUseCase.getById(id);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('not found')) {
        throw new NotFoundException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }
}
