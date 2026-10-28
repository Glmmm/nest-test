import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../orm/Post';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }
}
