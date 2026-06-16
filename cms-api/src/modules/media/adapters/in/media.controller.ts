import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from '../../application/media.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/admin/media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() body: { filename: string; mimeType: string }, @Request() req: any) {
    return this.mediaService.getPresignedUploadUrl(body.filename, body.mimeType, req.user.id);
  }

  @Post('confirm')
  async confirmUpload(@Body() body: { storageKey: string; filename: string; mimeType: string; sizeBytes: number }, @Request() req: any) {
    return this.mediaService.saveMediaRecord({
      ...body,
      uploadedBy: req.user.id
    });
  }

  @Get()
  async findAll() {
    return this.mediaService.findAll();
  }
}
