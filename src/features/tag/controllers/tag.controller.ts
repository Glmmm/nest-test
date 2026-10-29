import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Public } from '../../../core/decorators/public.decorator';
import { CreateTagDTO } from '../dtos/create-tag.dto';
import { UpdateTagDTO } from '../dtos/update-tag.dto';
import { TagService } from '../services/tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Public()
  @Get()
  getTags() {
    return this.tagService.findAll();
  }

  @Public()
  @Get(':id')
  getTag(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTagDTO) {
    return this.tagService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTagDTO) {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.tagService.remove(id);
  }
}
