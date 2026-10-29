import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../../../shared/db/errors';
import { Category } from '../../../shared/orm/Category';
import { CreateCategoryDTO } from '../dtos/create-category.dto';
import { UpdateCategoryDTO } from '../dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDTO): Promise<Category> {
    const category = this.categoryRepository.create(dto);
    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe uma categoria com este slug.');
      }
      throw error;
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada.');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe uma categoria com este slug.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
