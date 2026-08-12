import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
