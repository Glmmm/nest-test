import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from '../../../../shared/orm/Post';
import { ReaderService } from './reader.service';

describe('ReaderService', () => {
  let service: ReaderService;
  let queryBuilder: any;
  let postRepository: any;

  beforeEach(() => {
    queryBuilder = {
      leftJoinAndSelect: (jest.fn() as any).mockReturnThis(),
      where: (jest.fn() as any).mockReturnThis(),
      andWhere: (jest.fn() as any).mockReturnThis(),
      orderBy: (jest.fn() as any).mockReturnThis(),
      addOrderBy: (jest.fn() as any).mockReturnThis(),
      skip: (jest.fn() as any).mockReturnThis(),
      take: (jest.fn() as any).mockReturnThis(),
      getManyAndCount: (jest.fn() as any).mockResolvedValue([[{ id: 'post-1' }], 1]),
    };
    postRepository = {
      createQueryBuilder: (jest.fn() as any).mockReturnValue(queryBuilder),
      findOne: (jest.fn() as any),
    };

    service = new ReaderService(postRepository as unknown as Repository<Post>);
  });

  it('paginates published posts', async () => {
    const result = await service.findAll({ page: 2, limit: 5 });

    expect(result.meta).toEqual({
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'post.publishedAt',
      'DESC',
    );
  });

  it('filters by category, tag and search term', async () => {
    await service.findAll({
      page: 1,
      limit: 10,
      category: 'technology',
      tag: 'typescript',
      search: 'hello',
    });

    const calls = queryBuilder.andWhere.mock.calls as unknown[][];
    const statements = calls
      .map((call) => call[0])
      .filter((sql): sql is string => typeof sql === 'string');
    expect(statements.some((sql) => sql.includes('categories'))).toBe(true);
    expect(statements.some((sql) => sql.includes('post_tags'))).toBe(true);
    // The free-text clause is wrapped in a Brackets object.
    expect(calls.some((call) => typeof call[0] === 'object')).toBe(true);
  });

  it('returns the post detail by slug or 404', async () => {
    (postRepository.findOne as any).mockResolvedValueOnce({
      id: 'post-1',
    });
    await expect(service.findBySlug('hello')).resolves.toMatchObject({
      id: 'post-1',
    });

    (postRepository.findOne as any).mockResolvedValueOnce(null);
    await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
