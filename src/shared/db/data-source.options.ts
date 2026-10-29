import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { Author } from '../orm/Author';
import { Category } from '../orm/Category';
import { Post } from '../orm/Post';
import { Tag } from '../orm/Tag';
import { User } from '../orm/User';
import { readEnv } from '../config/env';

/**
 * Works in CommonJS (compiled app, TypeORM CLI) and in ESM (Jest), where
 * `__dirname` is not defined.
 */
function migrationsGlob(): string {
  if (typeof __dirname !== 'undefined') {
    return join(__dirname, 'migrations/*.{ts,js}');
  }
  return join(process.cwd(), 'src/shared/db/migrations/*.{ts,js}');
}

export function buildDataSourceOptions(): DataSourceOptions {
  const env = readEnv();

  return {
    type: 'postgres',
    host: env.dbHost,
    port: env.dbPort,
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    entities: [User, Author, Category, Tag, Post],
    migrations: [migrationsGlob()],
    migrationsTableName: 'migrations',
    synchronize: env.dbSynchronize,
    logging:
      env.nodeEnv === 'development'
        ? ['error', 'warn']
        : env.nodeEnv === 'test'
          ? false
          : ['error'],
  };
}
