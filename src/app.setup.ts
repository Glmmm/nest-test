import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

/**
 * Shared HTTP configuration so tests boot the app exactly like production.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:4200').split(','),
    credentials: true,
  });
  app.enableShutdownHooks();
}
