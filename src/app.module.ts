import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { LocationsModule } from './locations/locations.module';
import { MediaModule } from './media/media.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
    }),
    PrismaModule,
    SeedModule,
    PagesModule,
    AuthModule,
    ReviewsModule,
    CatalogModule,
    LocationsModule,
    MediaModule,
  ],
})
export class AppModule {}
