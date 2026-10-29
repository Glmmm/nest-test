import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tag } from '../../../shared/orm/Tag';
import { TagService } from './tag.service';

describe('TagService', () => {
  let service: TagService;
  let repository: any;
  let manager: any;
  let dataSource: any;

  beforeEach(() => {
    repository = {
      create: jest.fn((data: object) => ({ ...data })),
      save: jest.fn(async (tag: { id?: string }) => ({
        id: tag.id ?? 'tag-1',
        ...tag,
      })),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    manager = {
      createQueryBuilder: jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: (jest.fn() as any).mockResolvedValue({}),
      })),
      remove: jest.fn(),
    };
    dataSource = { transaction: jest.fn(async (cb: Function) => cb(manager)) };

    service = new TagService(
      repository as Repository<Tag>,
      dataSource as never,
    );
  });

  it('lists tags alphabetically', async () => {
    repository.find.mockResolvedValue([{ id: 'tag-1' }]);

    await expect(service.findAll()).resolves.toEqual([{ id: 'tag-1' }]);
    expect(repository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('creates a tag', async () => {
    await expect(
      service.create({ name: 'TypeScript', slug: 'typescript' }),
    ).resolves.toMatchObject({ id: 'tag-1', slug: 'typescript' });
  });

  it('maps duplicated slugs to 409 on create and update', async () => {
    repository.save.mockRejectedValueOnce({ code: '23505' });
    await expect(
      service.create({ name: 'TypeScript', slug: 'typescript' }),
    ).rejects.toBeInstanceOf(ConflictException);

    repository.findOne.mockResolvedValue({ id: 'tag-1', slug: 'typescript' });
    repository.save.mockRejectedValueOnce({ code: '23505' });
    await expect(
      service.update('tag-1', { slug: 'typescript' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates an existing tag', async () => {
    repository.findOne.mockResolvedValue({
      id: 'tag-1',
      name: 'Old',
      slug: 'old',
    });

    const result = await service.update('tag-1', { name: 'New' });

    expect(result).toMatchObject({ id: 'tag-1', name: 'New', slug: 'old' });
  });

  it('throws 404 when the tag does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes the tag and its post relations in a transaction', async () => {
    const tag = { id: 'tag-1' };
    repository.findOne.mockResolvedValue(tag);

    await service.remove('tag-1');

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(manager.remove).toHaveBeenCalledWith(tag);
  });
});
