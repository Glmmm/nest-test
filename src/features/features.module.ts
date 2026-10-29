import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CreatorModule } from './post/creator/creator.module';
import { ReaderModule } from './post/reader/reader.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [
    AuthModule,
    CategoryModule,
    TagModule,
    ReaderModule,
    CreatorModule,
  ],
  exports: [AuthModule, CategoryModule, TagModule, ReaderModule, CreatorModule],
})
export class FeaturesModule {}
