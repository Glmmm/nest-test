import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../../core/core.module';
import { Author } from '../../shared/orm/Author';
import { Post } from '../../shared/orm/Post';
import { User } from '../../shared/orm/User';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([User, Author, Post])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
