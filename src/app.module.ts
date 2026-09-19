import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { ElapsedTimeInterceptor } from './common/interceptors/elapsed-time.interceptor';
import { GraphqlApiModule } from './graphql/graphql-api.module';
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
    ConfigModule.forRoot({ isGlobal: true }),
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
    GraphqlApiModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ElapsedTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
