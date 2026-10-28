import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Author } from '../orm/Author';

@Injectable()
export class AuthorRepository extends Repository<Author> {
  constructor(private dataSource: DataSource) {
    super(Author, dataSource.createEntityManager());
  }
}
