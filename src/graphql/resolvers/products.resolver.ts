import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CatalogService } from '../../catalog/catalog.service';
import { pageComplexity } from '../complexity';
import {
  DEFAULT_PAGINATION,
  PaginationInput,
} from '../inputs/pagination.input';
import {
  CreateProductInput,
  UpdateProductInput,
} from '../inputs/product.input';
import { Category } from '../models/category.model';
import { Product, ProductPage } from '../models/product.model';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly catalogService: CatalogService) {}

  @Query(() => ProductPage, {
    description: 'Список позиций меню постранично',
    complexity: pageComplexity,
  })
  products(
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
    @Args('categoryId', { type: () => Int, nullable: true })
    categoryId?: number,
  ): Promise<ProductPage> {
    return this.catalogService.findProducts(
      pagination.page,
      pagination.limit,
      categoryId,
    );
  }

  @Query(() => Product, { description: 'Позиция меню по идентификатору' })
  product(
    @Args('productId', { type: () => Int }) productId: number,
  ): Promise<Product> {
    return this.catalogService.findProduct(productId);
  }

  @ResolveField(() => Category, {
    description: 'Раздел меню, к которому относится позиция',
  })
  category(@Parent() product: Product): Promise<Category> {
    return this.catalogService.findCategory(product.categoryId);
  }

  @Mutation(() => Product, { description: 'Добавить позицию в меню' })
  addProduct(@Args('input') input: CreateProductInput): Promise<Product> {
    return this.catalogService.createProduct(input);
  }

  @Mutation(() => Product, { description: 'Изменить позицию меню' })
  updateProduct(
    @Args('productId', { type: () => Int }) productId: number,
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    return this.catalogService.updateProduct(productId, input);
  }

  @Mutation(() => Product, { description: 'Вернуть позицию в продажу' })
  makeProductAvailable(
    @Args('productId', { type: () => Int }) productId: number,
  ): Promise<Product> {
    return this.catalogService.updateProduct(productId, { isAvailable: true });
  }

  @Mutation(() => Product, { description: 'Снять позицию с продажи' })
  makeProductUnavailable(
    @Args('productId', { type: () => Int }) productId: number,
  ): Promise<Product> {
    return this.catalogService.updateProduct(productId, { isAvailable: false });
  }

  @Mutation(() => Boolean, { description: 'Удалить позицию из меню' })
  async removeProduct(
    @Args('productId', { type: () => Int }) productId: number,
  ): Promise<boolean> {
    await this.catalogService.removeProduct(productId);
    return true;
  }
}
