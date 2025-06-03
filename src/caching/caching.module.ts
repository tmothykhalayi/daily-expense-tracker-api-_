import { Module } from '@nestjs/common';
import { CachingService } from './caching.service';
import { CachingController } from './caching.controller';

@Module({
  imports: [],
  controllers: [CachingController],
  providers: [CachingService],
})
export class CachingModule {}
