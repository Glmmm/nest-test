import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../../shared/orm/Category';
import { Post } from '../../../shared/orm/Post';
import { Tag } from '../../../shared/orm/Tag';
import { CreatorController } from './controllers/creator.controller';
import { CreatorService } from './services/creator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Tag, Category])],
  controllers: [CreatorController],
  providers: [CreatorService],
})
export class CreatorModule {}
