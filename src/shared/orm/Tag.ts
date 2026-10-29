import type { Relation } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Post } from './Post';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  slug: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Relation<Post>[];
}
