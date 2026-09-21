import { Module } from '@nestjs/common';
import { ReviewsApiController } from './reviews-api.controller';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController, ReviewsApiController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
