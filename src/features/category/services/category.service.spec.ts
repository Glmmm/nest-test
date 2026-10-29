import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from '../../../shared/orm/Category';
import { CategoriesService } from './category.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: any;

  beforeEach(() => {
    repository = {
      create: jest.fn((data: object) => ({ ...data })),
      save: jest.fn(async (category: { id?: string }) => ({
        id: category.id ?? 'category-1',
        ...category,
      })),
      find: (jest.fn() as any),
      findOne: (jest.fn() as any),
      remove: (jest.fn() as any),
    };
    service = new CategoriesService(repository as unknown as Repository<Category>);
  });

  it('creates a category', async () => {
    await expect(
      service.create({ name: 'Tech', slug: 'tech' }),
    ).resolves.toMatchObject({ id: 'category-1', slug: 'tech' });
  });

  it('maps duplicated slugs to 409', async () => {
    repository.save.mockRejectedValueOnce({ code: '23505' });
    await expect(
      service.create({ name: 'Tech', slug: 'tech' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists categories alphabetically', async () => {
    repository.find.mockResolvedValue([{ id: 'category-1' }]);

    await expect(service.findAll()).resolves.toEqual([{ id: 'category-1' }]);
    expect(repository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('updates an existing category', async () => {
    repository.findOne.mockResolvedValue({
      id: 'category-1',
      name: 'Old',
      slug: 'old',
    });

    const result = await service.update('category-1', { name: 'New' });

    expect(result).toMatchObject({ id: 'category-1', name: 'New', slug: 'old' });
  });

  it('maps duplicated slugs to 409 on update', async () => {
    repository.findOne.mockResolvedValue({ id: 'category-1', slug: 'tech' });
    repository.save.mockRejectedValueOnce({ code: '23505' });

    await expect(
      service.update('category-1', { slug: 'tech' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws 404 when the category does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes an existing category', async () => {
    const category = { id: 'category-1' };
    repository.findOne.mockResolvedValue(category);

    await service.remove('category-1');

    expect(repository.remove).toHaveBeenCalledWith(category);
  });
});
