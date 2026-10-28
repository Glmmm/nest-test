import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { User } from '../../shared/orm/User';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],

  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
