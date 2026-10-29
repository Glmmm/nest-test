import { jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hashPassword } from '../../../core/security/password';
import { Author } from '../../../shared/orm/Author';
import { Post } from '../../../shared/orm/Post';
import { User } from '../../../shared/orm/User';
import { AuthService } from './auth.service';

type AnyMock = any;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: AnyMock;
  let authorRepository: AnyMock;
  let manager: AnyMock;
  let dataSource: AnyMock;
  let jwtService: AnyMock;
  let configService: AnyMock;

  beforeEach(() => {
    userRepository = { findOne: (jest.fn() as any), createQueryBuilder: (jest.fn() as any) };
    authorRepository = { findOne: (jest.fn() as any) };
    manager = {
      create: jest.fn((_entity: unknown, data: object) => ({ ...data })),
      save: jest.fn(async (entity: { id?: string }) => {
        if (!entity.id) entity.id = 'generated-id';
        return entity;
      }),
    };
    dataSource = { transaction: jest.fn(async (cb: Function) => cb(manager)) };
    jwtService = { signAsync: (jest.fn() as any).mockResolvedValue('signed-token') };
    configService = { get: (jest.fn() as any).mockReturnValue('1h') };

    service = new AuthService(
      userRepository as Repository<User>,
      authorRepository as Repository<Author>,
      { count: (jest.fn() as any) } as unknown as Repository<Post>,
      dataSource as never,
      jwtService as never,
      configService as never,
    );
  });

  describe('register', () => {
    it('creates user and author and returns a token', async () => {
      (userRepository.findOne as any).mockResolvedValue(null);

      const result = await service.register({
        email: 'author@test.dev',
        password: 'secret-pass-1',
        name: 'Author',
      });

      expect(result).toMatchObject({
        accessToken: 'signed-token',
        tokenType: 'Bearer',
        expiresIn: '1h',
      });

      const createdUser = manager.create.mock.calls[0][1] as {
        password: string;
      };
      expect(createdUser.password).not.toBe('secret-pass-1');
      expect(createdUser.password).toMatch(/^scrypt\$/);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'generated-id',
        email: 'author@test.dev',
        authorId: 'generated-id',
      });
    });

    it('rejects duplicated e-mails', async () => {
      (userRepository.findOne as any).mockResolvedValue({ id: 'user-1' });

      await expect(
        service.register({
          email: 'author@test.dev',
          password: 'secret-pass-1',
          name: 'Author',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('maps a unique violation on insert to 409', async () => {
      (userRepository.findOne as any).mockResolvedValue(null);
      manager.save.mockRejectedValueOnce({ code: '23505' });

      await expect(
        service.register({
          email: 'author@test.dev',
          password: 'secret-pass-1',
          name: 'Author',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    const mockQuery = (user: unknown) => {
      const queryBuilder = {
        addSelect: (jest.fn() as any).mockReturnThis(),
        where: (jest.fn() as any).mockReturnThis(),
        getOne: (jest.fn() as any).mockResolvedValue(user),
      };
      (userRepository.createQueryBuilder as any).mockReturnValue(
        queryBuilder,
      );
      return queryBuilder;
    };

    it('returns a token for valid credentials', async () => {
      const password = await hashPassword('secret-pass-1');
      mockQuery({ id: 'user-1', email: 'author@test.dev', password });
      (authorRepository.findOne as any).mockResolvedValue({
        id: 'author-1',
        name: 'Author',
      });

      const result = await service.login({
        email: 'author@test.dev',
        password: 'secret-pass-1',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.author).toEqual({ id: 'author-1', name: 'Author' });
    });

    it('rejects a wrong password', async () => {
      const password = await hashPassword('secret-pass-1');
      mockQuery({ id: 'user-1', email: 'author@test.dev', password });

      await expect(
        service.login({ email: 'author@test.dev', password: 'nope' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an unknown e-mail', async () => {
      mockQuery(null);

      await expect(
        service.login({ email: 'ghost@test.dev', password: 'anything' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
