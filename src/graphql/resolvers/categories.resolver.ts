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
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../inputs/category.input';
import {
  DEFAULT_PAGINATION,
  PaginationInput,
} from '../inputs/pagination.input';
import { Category, CategoryPage } from '../models/category.model';
import { ProductPage } from '../models/product.model';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly catalogService: CatalogService) {}

  @Query(() => CategoryPage, {
    description: 'Список разделов меню постранично',
    complexity: pageComplexity,
  })
  menuCategories(
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
  ): Promise<CategoryPage> {
    return this.catalogService.findCategories(
      pagination.page,
      pagination.limit,
    );
  }

  @Query(() => Category, { description: 'Раздел меню по идентификатору' })
  menuCategory(
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ): Promise<Category> {
    return this.catalogService.findCategory(categoryId);
  }

  @ResolveField(() => ProductPage, {
    description: 'Позиции раздела меню постранично',
    complexity: pageComplexity,
  })
  products(
    @Parent() category: Category,
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
  ): Promise<ProductPage> {
    return this.catalogService.findProducts(
      pagination.page,
      pagination.limit,
      category.id,
    );
  }

  @Mutation(() => Category, { description: 'Создать раздел меню' })
  createCategory(@Args('input') input: CreateCategoryInput): Promise<Category> {
    return this.catalogService.createCategory(input);
  }

  @Mutation(() => Category, { description: 'Изменить раздел меню' })
  updateCategory(
    @Args('categoryId', { type: () => Int }) categoryId: number,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<Category> {
    return this.catalogService.updateCategory(categoryId, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить раздел меню' })
  async deleteCategory(
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ): Promise<boolean> {
    await this.catalogService.removeCategory(categoryId);
    return true;
  }
}
