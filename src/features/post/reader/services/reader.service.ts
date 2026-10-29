import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { POST_STATUS } from '../../../../shared/enums/post-status.enum';
import { Post } from '../../../../shared/orm/Post';
import { ListPostsQueryDTO } from '../dtos/list-posts-query.dto';

export interface PaginatedPosts {
  data: Post[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ReaderService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(query: ListPostsQueryDTO): Promise<PaginatedPosts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.status = :status', { status: POST_STATUS.PUBLISHED });

    if (query.category) {
      qb.andWhere(
        'post.category_id IN (SELECT c.id FROM categories c WHERE c.slug = :category)',
        { category: query.category },
      );
    }

    if (query.tag) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM post_tags pt
          INNER JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = post.id AND t.slug = :tag
        )`,
        { tag: query.tag },
      );
    }

    if (query.search) {
      const term = `%${query.search}%`;
      qb.andWhere(
        new Brackets((bracket) => {
          bracket
            .where('post.title ILIKE :term', { term })
            .orWhere('post.content ILIKE :term', { term })
            .orWhere('post.excerpt ILIKE :term', { term })
            .orWhere('category.name ILIKE :term', { term })
            .orWhere(
              `EXISTS (
                SELECT 1 FROM post_tags pt2
                INNER JOIN tags t2 ON t2.id = pt2.tag_id
                WHERE pt2.post_id = post.id AND t2.name ILIKE :term
              )`,
              { term },
            );
        }),
      );
    }

    const [data, total] = await qb
      .orderBy('post.publishedAt', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug, status: POST_STATUS.PUBLISHED },
      relations: { author: true, category: true, tags: true },
    });
    if (!post) throw new NotFoundException('Post não encontrado.');
    return post;
  }
}
