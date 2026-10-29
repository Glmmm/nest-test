import type { Relation } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './Post';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Post, (post) => post.category)
  posts: Relation<Post>[];
}
