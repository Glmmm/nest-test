import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
