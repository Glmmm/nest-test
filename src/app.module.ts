import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
import { FeaturesModule } from './features/features.module';
import { validateEnv } from './shared/config/env';
import { buildDataSourceOptions } from './shared/db/data-source.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      cache: true,
    }),
    TypeOrmModule.forRoot(buildDataSourceOptions()),
    CoreModule,
    FeaturesModule,
  ],
})
export class AppModule {}
