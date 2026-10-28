import { Module } from '@nestjs/common';
import { CreatorService } from './services/creator.service';
import { CreatorController } from './controllers/creator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../../../shared/orm/Tag';
import { Post } from '../../../shared/orm/Post';
import { User } from '../../../shared/orm/User';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Tag, User])],

  controllers: [CreatorController],
  providers: [CreatorService],
})
export class CreatorModule {}
