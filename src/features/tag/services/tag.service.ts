import { Injectable } from '@nestjs/common';
import { Tag } from '../../../shared/orm/Tag';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find();
  }
}
