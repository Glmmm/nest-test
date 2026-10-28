import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from '../../../../shared/orm/Tag';
import { Post } from '../../../../shared/orm/Post';
import { CreatePostDto } from '../dtos/create-post.dto';
import { POST_STATUS } from '../../../../shared/enums/post-status.enum';

@Injectable()
export class CreatorService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const tags = dto.tagIds
      ? await this.tagRepository.findBy({ id: In(dto.tagIds) })
      : [];

    let post = this.postRepository.create({
      ...dto,
      authorId,
      tags,
      publishedAt:
        dto.status === POST_STATUS.PUBLISHED ? new Date() : undefined,
    });

    return this.postRepository.save(post);
  }

  async update(id: string, authorId: string, dto: Partial<CreatePostDto>) {
    const post = await this.postRepository.findOne({ where: { id, authorId } });
    if (!post) throw new NotFoundException('Post not found or unauthorized');

    if (dto.tagIds) {
      post.tags = await this.tagRepository.findBy({ id: In(dto.tagIds) });
    }

    if (
      dto.status === POST_STATUS.PUBLISHED &&
      post.status !== POST_STATUS.PUBLISHED
    ) {
      post.publishedAt = new Date();
    }

    Object.assign(post, dto);
    return this.postRepository.save(post);
  }

  async remove(id: string, authorId: string) {
    const post = await this.postRepository.findOne({ where: { id, authorId } });
    if (!post) throw new NotFoundException('Post not found or unauthorized');
    return this.postRepository.remove(post);
  }
}
