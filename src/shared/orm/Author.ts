import { Exclude } from 'class-transformer';
import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @OneToMany(() => Post, (post) => post.author)
  posts: Relation<Post>[];
}
