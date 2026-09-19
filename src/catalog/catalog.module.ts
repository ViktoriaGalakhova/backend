import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { CatalogService } from './catalog.service';
import { CategoriesApiController } from './categories-api.controller';
import { ProductsApiController } from './products-api.controller';

@Module({
  imports: [CacheModule.register({ ttl: 5000 }), StorageModule],
  controllers: [CategoriesApiController, ProductsApiController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
