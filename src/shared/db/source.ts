import { DataSource } from 'typeorm';

import * as path from 'path';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME || 'db',
  entities: [path.join(__dirname, '../orm/**/*.{ts,js}')],
  synchronize: true,
});
