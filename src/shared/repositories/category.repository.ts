import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Category } from '../orm/Category';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }
}
