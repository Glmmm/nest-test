import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Author } from './Author';
import { Category } from './Category';
import { Tag } from './Tag';
import { POST_STATUS } from '../enums/post-status.enum';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId: string;

  @ManyToOne(() => Author, (author) => author.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: Author;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: POST_STATUS, default: POST_STATUS.DRAFT })
  status: POST_STATUS;

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
