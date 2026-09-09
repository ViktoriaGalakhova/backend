import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CategoriesApiController } from './categories-api.controller';
import { ProductsApiController } from './products-api.controller';

@Module({
  controllers: [CategoriesApiController, ProductsApiController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
