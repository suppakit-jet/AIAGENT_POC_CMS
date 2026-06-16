import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContentService } from '../../application/content.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/admin/content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get()
  async findAll() {
    return this.contentService.findAll();
  }

  @Post()
  async createDraft(@Body() body: any, @Request() req: any) {
    return this.contentService.createDraft({
      ...body,
      authorId: req.user.id
    });
  }

  @Put(':id')
  async updateContent(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.contentService.updateContent(id, body, req.user.id);
  }

  @Post(':id/review')
  async submitForReview(@Param('id') id: string) {
    return this.contentService.submitForReview(id);
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string, @Request() req: any) {
    return this.contentService.publish(id, req.user.id);
  }
}
