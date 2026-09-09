import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { CategoryResponseDto } from './category-response.dto';
import { ProductResponseDto } from './product-response.dto';

export class PaginatedCategoriesDto {
  @ApiProperty({ type: [CategoryResponseDto], description: 'Разделы меню' })
  items: CategoryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Данные о странице' })
  meta: PaginationMetaDto;
}

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductResponseDto], description: 'Позиции меню' })
  items: ProductResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Данные о странице' })
  meta: PaginationMetaDto;
}
