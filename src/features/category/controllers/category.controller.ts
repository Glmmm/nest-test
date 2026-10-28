import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from '../services/category.service';
import { JWTGuard } from '../../../core/guards/jwt.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JWTGuard)
  @Post()
  create(@Body() body: any) {
    return this.categoriesService.create(body);
  }

  @UseGuards(JWTGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.categoriesService.update(id, body);
  }

  @UseGuards(JWTGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
