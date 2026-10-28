import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './Post';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('identity')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
