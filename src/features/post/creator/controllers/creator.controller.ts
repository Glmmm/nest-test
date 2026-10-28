import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreatorService } from '../services/creator.service';
import { JWTGuard } from '../../../../core/guards/jwt.guard';
import { CreatePostDto } from '../dtos/create-post.dto';

@Controller('creator')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @UseGuards(JWTGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    const authorId = req.user.authorId;
    return this.creatorService.create(authorId, dto);
  }

  @UseGuards(JWTGuard)
  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePostDto>,
  ) {
    const authorId = req.user.authorId;
    return this.creatorService.update(id, authorId, dto);
  }

  @UseGuards(JWTGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const authorId = req.user.authorId;
    return this.creatorService.remove(id, authorId);
  }
}
