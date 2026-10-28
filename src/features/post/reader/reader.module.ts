import { Module } from '@nestjs/common';
import { ReaderService } from './services/reader.service';
import { ReaderController } from './controller/reader.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../../shared/orm/Post';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [ReaderController],
  providers: [ReaderService],
})
export class ReaderModule {}
