import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './shared/db/source';
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [TypeOrmModule.forRoot(AppDataSource.options), FeaturesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
