import { Module } from '@nestjs/common';
import { TagModule } from './tag/tag.module';
import { AuthModule } from './auth/auth.module';
import { ReaderModule } from './post/reader/reader.module';
import { CreatorModule } from './post/creator/creator.module';

@Module({
  imports: [TagModule, AuthModule, ReaderModule, CreatorModule],
  exports: [TagModule, AuthModule, ReaderModule, CreatorModule],
})
export class FeaturesModule {}
