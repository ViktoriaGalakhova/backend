import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { PagesController } from './pages.controller';
import { PagesDataModule } from './pages-data.module';

@Module({
  imports: [PagesDataModule, AuthModule, ReviewsModule],
  controllers: [PagesController],
})
export class PagesModule {}
