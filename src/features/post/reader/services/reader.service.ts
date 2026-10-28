import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { POST_STATUS } from '../../../../shared/enums/post-status.enum';
import { Post } from '../../../../shared/orm/Post';

@Injectable()
export class ReaderService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  findAllPublished() {
    return this.postRepository.find({
      where: { status: POST_STATUS.PUBLISHED },
      relations: {
        author: true,
        category: true,
        tags: true,
      },
      select: {
        authorId: false,
        categoryId: false,
      },
      order: { publishedAt: 'DESC' },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.postRepository.findOne({
      where: { slug, status: POST_STATUS.PUBLISHED },
      relations: {
        author: true,
        category: true,
        tags: true,
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async search(query: string) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.status = :status', { status: POST_STATUS.PUBLISHED });

    if (query) {
      qb.andWhere(
        new Brackets((bracket) => {
          bracket
            .where('post.title ILIKE :q', { q: `%${query}%` })
            .orWhere('post.content ILIKE :q', { q: `%${query}%` })
            .orWhere('category.name ILIKE :q', { q: `%${query}%` })
            .orWhere('tags.name ILIKE :q', { q: `%${query}%` });
        }),
      );
    }

    return qb.orderBy('post.publishedAt', 'DESC').getMany();
  }
}
