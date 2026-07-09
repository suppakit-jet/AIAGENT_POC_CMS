import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateContentUseCase } from '../../../application/use-cases/create-content.use-case';
import { UpdateContentUseCase } from '../../../application/use-cases/update-content.use-case';
import { DeleteContentUseCase } from '../../../application/use-cases/delete-content.use-case';
import { GetContentUseCase } from '../../../application/use-cases/get-content.use-case';
import { ContentType } from '../../../domain/entities/content.entity';

@Controller('api/admin/content')
export class ContentController {
  constructor(
    @Inject(CreateContentUseCase)
    private readonly createContentUseCase: CreateContentUseCase,
    @Inject(UpdateContentUseCase)
    private readonly updateContentUseCase: UpdateContentUseCase,
    @Inject(DeleteContentUseCase)
    private readonly deleteContentUseCase: DeleteContentUseCase,
    @Inject(GetContentUseCase)
    private readonly getContentUseCase: GetContentUseCase,
  ) {}

  @Post()
  async create(@Body() dto: { title: string; slug: string; body: string; type: ContentType }) {
    try {
      return await this.createContentUseCase.execute(dto);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('already exists')) {
        throw new ConflictException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }

  @Get()
  async list(@Query() query: { type?: ContentType; status?: string }) {
    return this.getContentUseCase.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await this.getContentUseCase.getById(id);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('not found')) {
        throw new NotFoundException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      slug?: string;
      body?: string;
      action?: 'submitForReview' | 'publish';
    },
  ) {
    try {
      return await this.updateContentUseCase.execute(id, dto);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('already exists')) {
        throw new ConflictException(message);
      }
      if (message.includes('not found')) {
        throw new NotFoundException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    try {
      await this.deleteContentUseCase.execute(id);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('not found')) {
        throw new NotFoundException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }
}
