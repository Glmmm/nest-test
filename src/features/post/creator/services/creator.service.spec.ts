import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from '../../../../shared/orm/Category';
import { Post } from '../../../../shared/orm/Post';
import { CreatorService } from './creator.service';

describe('CreatorService', () => {
  let service: CreatorService;
  let postRepository: any;
  let manager: any;
  let dataSource: any;

  beforeEach(() => {
    postRepository = { findOne: (jest.fn() as any), remove: (jest.fn() as any) };
    manager = {
      existsBy: (jest.fn() as any).mockResolvedValue(true),
      findBy: (jest.fn() as any).mockResolvedValue([{ id: 'tag-1' }]),
      create: jest.fn((_entity: unknown, data: object) => ({ ...data })),
      save: jest.fn(async (post: { id?: string }) => {
        if (!post.id) post.id = 'post-1';
        return post;
      }),
      findOne: (jest.fn() as any),
    };
    dataSource = { transaction: jest.fn(async (cb: Function) => cb(manager)) };

    service = new CreatorService(
      postRepository as Repository<Post>,
      dataSource as never,
    );
  });

  it('creates a published post with tags and publishedAt', async () => {
    const result = await service.create('author-1', {
      title: 'Hello',
      slug: 'hello',
      content: 'content',
      status: 'published' as never,
      categoryId: 'category-1',
      tagIds: ['tag-1'],
    });

    expect(result).toMatchObject({
      id: 'post-1',
      authorId: 'author-1',
      categoryId: 'category-1',
      tags: [{ id: 'tag-1' }],
    });
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(manager.existsBy).toHaveBeenCalledWith(Category, {
      id: 'category-1',
    });
  });

  it('keeps draft posts without publishedAt', async () => {
    const result = await service.create('author-1', {
      title: 'Hello',
      slug: 'hello',
      content: 'content',
    });

    expect(result.publishedAt).toBeNull();
  });

  it('rejects unknown tags and categories', async () => {
    manager.findBy.mockResolvedValueOnce([]);
    await expect(
      service.create('author-1', {
        title: 'Hello',
        slug: 'hello',
        content: 'content',
        tagIds: ['tag-1'],
      }),
    ).rejects.toThrow('tags informadas não existem');

    manager.existsBy.mockResolvedValueOnce(false);
    await expect(
      service.create('author-1', {
        title: 'Hello',
        slug: 'hello',
        content: 'content',
        categoryId: 'category-1',
      }),
    ).rejects.toThrow('categoria informada não existe');
  });

  it('maps duplicated slugs to 409', async () => {
    manager.save.mockRejectedValueOnce({ code: '23505' });

    await expect(
      service.create('author-1', {
        title: 'Hello',
        slug: 'hello',
        content: 'content',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('clears publishedAt when unpublished', async () => {
    manager.findOne.mockResolvedValue({
      id: 'post-1',
      authorId: 'author-1',
      status: 'published',
      publishedAt: new Date(),
      tags: [],
    });

    const result = await service.update('post-1', 'author-1', {
      status: 'draft' as never,
    });

    expect(result.publishedAt).toBeNull();
  });

  it('refuses to update or delete posts from another author', async () => {
    manager.findOne.mockResolvedValue(null);
    await expect(
      service.update('post-1', 'author-2', { title: 'Hijack' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    (postRepository.findOne as any).mockResolvedValue(null);
    await expect(service.remove('post-1', 'author-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
