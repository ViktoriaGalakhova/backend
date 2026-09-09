import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { LocationsModule } from '../locations/locations.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { PagesController } from './pages.controller';
import { PagesDataModule } from './pages-data.module';

@Module({
  imports: [
    PagesDataModule,
    AuthModule,
    ReviewsModule,
    CatalogModule,
    LocationsModule,
  ],
  controllers: [PagesController],
})
export class PagesModule {}
