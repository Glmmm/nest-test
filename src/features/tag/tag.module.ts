import { Module } from '@nestjs/common';
import { TagController } from './controllers/tag.controller';
import { TagService } from './services/tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../../shared/orm/Tag';
import { User } from '../../shared/orm/User';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, User])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
