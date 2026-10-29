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
import { CurrentUser } from '../../../../core/decorators/current-user.decorator';
import { CreatePostDTO } from '../dtos/create-post.dto';
import { UpdatePostDTO } from '../dtos/update-post.dto';
import { CreatorService } from '../services/creator.service';

@Controller('creator/posts')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Get()
  findMine(@CurrentUser('authorId') authorId: string) {
    return this.creatorService.findMine(authorId);
  }

  @Post()
  create(
    @CurrentUser('authorId') authorId: string,
    @Body() dto: CreatePostDTO,
  ) {
    return this.creatorService.create(authorId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser('authorId') authorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDTO,
  ) {
    return this.creatorService.update(id, authorId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser('authorId') authorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.creatorService.remove(id, authorId);
  }
}
