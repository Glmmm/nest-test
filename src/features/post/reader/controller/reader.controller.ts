import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReaderService } from '../services/reader.service';

@Controller('read')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}
  @Get()
  getPublishedPosts(@Query('search') search?: string) {
    if (search) {
      return this.readerService.search(search);
    }
    return this.readerService.findAllPublished();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.readerService.findBySlug(slug);
  }
}
