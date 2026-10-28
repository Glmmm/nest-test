import { Controller, Get, UseGuards } from '@nestjs/common';
import { TagService } from '../services/tag.service';
import { Tag } from '../../../shared/orm/Tag';
import { JWTGuard } from '../../../core/guards/jwt.guard';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @UseGuards(JWTGuard)
  getTags(): Promise<Tag[]> {
    return this.tagService.getAllTags();
  }
}
