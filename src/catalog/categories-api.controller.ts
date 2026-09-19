import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { linkHeaderDoc } from '../common/api-link-header';
import { CacheControl } from '../common/decorators/cache-control.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { EtagInterceptor } from '../common/interceptors/etag.interceptor';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { setLinkHeader } from '../common/pagination';
import { CatalogService } from './catalog.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryProductDto } from './dto/create-product.dto';
import {
  PaginatedCategoriesDto,
  PaginatedProductsDto,
} from './dto/paginated-catalog.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('catalog')
@ApiBadRequestResponse({
  description: 'Некорректные параметры запроса или тело запроса',
  type: ErrorResponseDto,
})
@UseInterceptors(EtagInterceptor)
@Controller('api/categories')
export class CategoriesApiController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @CacheControl(3600)
  @ApiOperation({ summary: 'Получить страницу разделов меню' })
  @ApiOkResponse({
    description: 'Страница разделов меню',
    type: PaginatedCategoriesDto,
    headers: linkHeaderDoc,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedCategoriesDto> {
    const result = await this.catalogService.findCategories(
      query.page,
      query.limit,
    );
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id')
  @CacheControl(3600)
  @ApiOperation({ summary: 'Получить раздел меню по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор раздела', example: 1 })
  @ApiOkResponse({ description: 'Раздел меню', type: CategoryResponseDto })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.catalogService.findCategory(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать раздел меню' })
  @ApiCreatedResponse({
    description: 'Раздел создан',
    type: CategoryResponseDto,
  })
  @ApiConflictResponse({
    description: 'Раздел с таким slug уже существует',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.catalogService.createCategory(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить раздел меню' })
  @ApiParam({ name: 'id', description: 'Идентификатор раздела', example: 1 })
  @ApiOkResponse({
    description: 'Обновлённый раздел',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Раздел с таким slug уже существует',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.catalogService.updateCategory(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить раздел меню вместе с его позициями' })
  @ApiParam({ name: 'id', description: 'Идентификатор раздела', example: 1 })
  @ApiNoContentResponse({ description: 'Раздел удалён' })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.catalogService.removeCategory(id);
  }

  @Get(':id/products')
  @CacheControl(3600)
  @ApiOperation({ summary: 'Получить страницу позиций выбранного раздела' })
  @ApiParam({ name: 'id', description: 'Идентификатор раздела', example: 1 })
  @ApiOkResponse({
    description: 'Страница позиций раздела',
    type: PaginatedProductsDto,
    headers: linkHeaderDoc,
  })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  async findProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedProductsDto> {
    const result = await this.catalogService.findCategoryProducts(
      id,
      query.page,
      query.limit,
    );
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id/products/:productId')
  @CacheControl(3600)
  @ApiOperation({ summary: 'Получить позицию выбранного раздела' })
  @ApiParam({ name: 'id', description: 'Идентификатор раздела', example: 1 })
  @ApiParam({
    name: 'productId',
    description: 'Идентификатор позиции',
    example: 1,
  })
  @ApiOkResponse({ description: 'Позиция меню', type: ProductResponseDto })
  @ApiNotFoundResponse({
    description: 'Раздел или позиция не найдены',
    type: ErrorResponseDto,
  })
  findProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductResponseDto> {
    return this.catalogService.findCategoryProduct(id, productId);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Добавить позицию в выбранный раздел' })
  @ApiParam({ name: 'id', description: 'Идентификатор раздела', example: 1 })
  @ApiCreatedResponse({
    description: 'Позиция создана',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  createProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCategoryProductDto,
  ): Promise<ProductResponseDto> {
    return this.catalogService.createProduct({ ...dto, categoryId: id });
  }
}
