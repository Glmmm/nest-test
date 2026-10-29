import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { isUniqueViolation } from '../../../../shared/db/errors';
import { POST_STATUS } from '../../../../shared/enums/post-status.enum';
import { Category } from '../../../../shared/orm/Category';
import { Post } from '../../../../shared/orm/Post';
import { Tag } from '../../../../shared/orm/Tag';
import { CreatePostDTO } from '../dtos/create-post.dto';
import { UpdatePostDTO } from '../dtos/update-post.dto';

@Injectable()
export class CreatorService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}

  findMine(authorId: string): Promise<Post[]> {
    return this.postRepository.find({
      where: { authorId },
      relations: { category: true, tags: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(authorId: string, dto: CreatePostDTO): Promise<Post> {
    return this.dataSource
      .transaction(async (manager) => {
        await this.assertCategoryExists(manager, dto.categoryId);
        const tags = await this.resolveTags(manager, dto.tagIds);
        const { tagIds: _tagIds, ...fields } = dto;

        const post = manager.create(Post, {
          ...fields,
          categoryId: fields.categoryId ?? null,
          authorId,
          tags,
          publishedAt:
            dto.status === POST_STATUS.PUBLISHED ? new Date() : null,
        });

        return manager.save(post);
      })
      .catch((error) => {
        if (isUniqueViolation(error)) {
          throw new ConflictException('Já existe um post com este slug.');
        }
        throw error;
      });
  }

  async update(
    id: string,
    authorId: string,
    dto: UpdatePostDTO,
  ): Promise<Post> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const post = await manager.findOne(Post, {
          where: { id, authorId },
          relations: { tags: true },
        });
        if (!post) {
          throw new NotFoundException('Post não encontrado ou sem permissão.');
        }

        await this.assertCategoryExists(manager, dto.categoryId);
        if (dto.tagIds) {
          post.tags = await this.resolveTags(manager, dto.tagIds);
        }

        const { tagIds: _tagIds, ...fields } = dto;
        const previousStatus = post.status;
        Object.assign(post, fields);

        if (dto.status && dto.status !== previousStatus) {
          post.publishedAt =
            dto.status === POST_STATUS.PUBLISHED ? new Date() : null;
        }

        return manager.save(post);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um post com este slug.');
      }
      throw error;
    }
  }

  async remove(id: string, authorId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id, authorId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado ou sem permissão.');
    }
    await this.postRepository.remove(post);
  }

  private async resolveTags(
    manager: EntityManager,
    tagIds?: string[],
  ): Promise<Tag[]> {
    if (!tagIds?.length) return [];

    const tags = await manager.findBy(Tag, { id: In(tagIds) });
    if (tags.length !== tagIds.length) {
      throw new BadRequestException('Uma ou mais tags informadas não existem.');
    }
    return tags;
  }

  private async assertCategoryExists(
    manager: EntityManager,
    categoryId?: string,
  ): Promise<void> {
    if (!categoryId) return;

    const exists = await manager.existsBy(Category, { id: categoryId });
    if (!exists) {
      throw new BadRequestException('A categoria informada não existe.');
    }
  }
}
