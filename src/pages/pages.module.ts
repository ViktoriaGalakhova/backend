import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LoginRedirectMiddleware } from '../auth/middleware/login-redirect.middleware';
import { CatalogModule } from '../catalog/catalog.module';
import { LocationsModule } from '../locations/locations.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { UsersModule } from '../users/users.module';
import { PagesController } from './pages.controller';
import { PagesDataModule } from './pages-data.module';

@Module({
  imports: [
    PagesDataModule,
    ReviewsModule,
    CatalogModule,
    LocationsModule,
    UsersModule,
  ],
  controllers: [PagesController],
})
export class PagesModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoginRedirectMiddleware)
      .forRoutes(
        { path: 'profile', method: RequestMethod.GET },
        { path: 'admin', method: RequestMethod.GET },
      );
  }
}
