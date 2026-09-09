import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { LocationsModule } from './locations/locations.module';
import { MediaModule } from './media/media.module';
import { PagesDataModule } from './pages/pages-data.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      renderPath: '/index.html',
    }),
    PrismaModule,
    SeedModule,
    PagesDataModule,
    PagesModule,
    AuthModule,
    UsersModule,
    ReviewsModule,
    CatalogModule,
    LocationsModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
