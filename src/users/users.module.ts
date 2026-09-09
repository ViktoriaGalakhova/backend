import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { UsersApiController } from './users-api.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, ReviewsModule],
  controllers: [UsersApiController],
  providers: [UsersService],
})
export class UsersModule {}
