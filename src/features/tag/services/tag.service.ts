import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { isUniqueViolation } from '../../../shared/db/errors';
import { Tag } from '../../../shared/orm/Tag';
import { CreateTagDTO } from '../dtos/create-tag.dto';
import { UpdateTagDTO } from '../dtos/update-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.tagRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag não encontrada.');
    return tag;
  }

  async create(dto: CreateTagDTO): Promise<Tag> {
    const tag = this.tagRepository.create(dto);
    try {
      return await this.tagRepository.save(tag);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe uma tag com este slug.');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTagDTO): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);

    try {
      return await this.tagRepository.save(tag);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe uma tag com este slug.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .delete()
        .from('post_tags')
        .where('tag_id = :id', { id })
        .execute();
      await manager.remove(tag);
    });
  }
}
