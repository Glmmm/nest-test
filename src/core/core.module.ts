import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../shared/orm/Author';
import { User } from '../shared/orm/User';
import { JwtAuthGuard } from './guards/jwt.guard';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Author]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-only-insecure-secret',
        signOptions: {
          // jsonwebtoken types expect ms.StringValue; the value is validated at boot.
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1h') as any,
        },
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [
    JwtAuthGuard,
    // Every route is protected unless decorated with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [JwtModule, TypeOrmModule],
})
export class CoreModule {}
