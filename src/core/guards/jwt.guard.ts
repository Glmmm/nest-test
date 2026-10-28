import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../shared/orm/User';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      return false;
    }

    const user = await this.userRepository.findOneBy({ email: authHeader });

    return user ? true : false;
  }
}
