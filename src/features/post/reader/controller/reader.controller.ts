import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../../../core/decorators/public.decorator';
import { ListPostsQueryDTO } from '../dtos/list-posts-query.dto';
import { ReaderService } from '../services/reader.service';

@Controller('read')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @Public()
  @Get()
  getPublishedPosts(@Query() query: ListPostsQueryDTO) {
    return this.readerService.findAll(query);
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.readerService.findBySlug(slug);
  }
}
