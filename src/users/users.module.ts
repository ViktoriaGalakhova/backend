import { Module } from '@nestjs/common';
import { ReviewsModule } from '../reviews/reviews.module';
import { UsersApiController } from './users-api.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ReviewsModule],
  controllers: [UsersApiController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
