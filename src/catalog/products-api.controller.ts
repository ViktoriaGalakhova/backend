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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
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
import { setLinkHeader } from '../common/pagination';
import { imageFileBody, imageFilePipe } from '../storage/image-upload';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginatedProductsDto } from './dto/paginated-catalog.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('catalog')
@ApiBadRequestResponse({
  description: 'Некорректные параметры запроса или тело запроса',
  type: ErrorResponseDto,
})
@UseInterceptors(EtagInterceptor)
@Controller('api/products')
export class ProductsApiController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @CacheControl(3600)
  @ApiOperation({ summary: 'Получить страницу позиций меню' })
  @ApiOkResponse({
    description: 'Страница позиций меню',
    type: PaginatedProductsDto,
    headers: linkHeaderDoc,
  })
  async findAll(
    @Query() query: ProductQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedProductsDto> {
    const result = await this.catalogService.findProducts(
      query.page,
      query.limit,
      query.categoryId,
    );
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id')
  @CacheControl(3600)
  @ApiOperation({ summary: 'Получить позицию меню по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор позиции', example: 1 })
  @ApiOkResponse({ description: 'Позиция меню', type: ProductResponseDto })
  @ApiNotFoundResponse({
    description: 'Позиция не найдена',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.catalogService.findProduct(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать позицию меню' })
  @ApiCreatedResponse({
    description: 'Позиция создана',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Раздел меню не найден',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.catalogService.createProduct(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить позицию меню' })
  @ApiParam({ name: 'id', description: 'Идентификатор позиции', example: 1 })
  @ApiOkResponse({
    description: 'Обновлённая позиция',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Позиция или раздел не найдены',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.catalogService.updateProduct(id, dto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageFileBody)
  @ApiOperation({ summary: 'Загрузить изображение позиции меню' })
  @ApiParam({ name: 'id', description: 'Идентификатор позиции', example: 1 })
  @ApiOkResponse({
    description: 'Позиция с обновлённым изображением',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Позиция не найдена',
    type: ErrorResponseDto,
  })
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.catalogService.setProductImage(id, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить позицию меню' })
  @ApiParam({ name: 'id', description: 'Идентификатор позиции', example: 1 })
  @ApiNoContentResponse({ description: 'Позиция удалена' })
  @ApiNotFoundResponse({
    description: 'Позиция не найдена',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.catalogService.removeProduct(id);
  }
}
