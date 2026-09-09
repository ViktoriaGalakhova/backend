import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReviewsApiController } from './reviews-api.controller';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController, ReviewsApiController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
