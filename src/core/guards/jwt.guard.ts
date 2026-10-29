import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '../../shared/orm/Author';
import { AuthenticatedRequest, JwtPayload } from '../auth/auth-user';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token de acesso ausente');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const author = await this.authorRepository.findOne({
      where: { id: payload.authorId, userId: payload.sub },
    });
    if (!author) {
      throw new UnauthorizedException('Perfil de autor não encontrado');
    }

    request.user = {
      userId: payload.sub,
      email: payload.email,
      authorId: author.id,
    };
    return true;
  }
}
