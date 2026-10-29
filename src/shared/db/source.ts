import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './data-source.options';

export const AppDataSource = new DataSource(buildDataSourceOptions());

export default AppDataSource;
