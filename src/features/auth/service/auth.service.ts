import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../../../core/security/password';
import { isUniqueViolation } from '../../../shared/db/errors';
import { Author } from '../../../shared/orm/Author';
import { Post } from '../../../shared/orm/Post';
import { User } from '../../../shared/orm/User';
import { LoginDTO } from '../dtos/login.dto';
import { RegisterDTO } from '../dtos/register.dto';

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  author: { id: string; name: string };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('E-mail já cadastrado.');

    const passwordHash = await hashPassword(dto.password);

    try {
      const { user, author } = await this.dataSource.transaction(
        async (manager) => {
          const createdUser = manager.create(User, {
            email: dto.email,
            password: passwordHash,
          });
          await manager.save(createdUser);

          const createdAuthor = manager.create(Author, {
            userId: createdUser.id,
            name: dto.name,
            bio: dto.bio ?? null,
          });
          await manager.save(createdAuthor);

          return { user: createdUser, author: createdAuthor };
        },
      );

      return this.buildAuthResponse(user, author);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('E-mail já cadastrado.');
      }
      throw error;
    }
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const author = await this.authorRepository.findOne({
      where: { userId: user.id },
    });
    if (!author) {
      throw new UnauthorizedException('Perfil de autor não encontrado.');
    }

    return this.buildAuthResponse(user, author);
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('Usuário não encontrado.');

    const author = await this.authorRepository.findOne({
      where: { userId },
    });
    if (!author) throw new UnauthorizedException('Perfil não encontrado.');

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      author: {
        id: author.id,
        name: author.name,
        bio: author.bio,
        postCount: await this.postRepository.count({
          where: { authorId: author.id },
        }),
      },
    };
  }

  private async buildAuthResponse(
    user: User,
    author: Author,
  ): Promise<AuthResponse> {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h';
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      authorId: author.id,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      author: { id: author.id, name: author.name },
    };
  }
}
