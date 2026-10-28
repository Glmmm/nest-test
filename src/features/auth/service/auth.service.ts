import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../shared/orm/User';
import { LoginDTO } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(dto: LoginDTO) {
    let user;
    try {
      user = await this.userRepository.findOne({
        where: { email: dto.email },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });
    } catch (error) {
      return new UnauthorizedException('Credenciais Inválidas');
    }

    return user;
  }
}
