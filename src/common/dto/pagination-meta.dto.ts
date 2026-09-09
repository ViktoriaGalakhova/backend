import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Текущая страница', example: 1 })
  page: number;

  @ApiProperty({ description: 'Количество элементов на странице', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Всего элементов в коллекции', example: 42 })
  total: number;

  @ApiProperty({ description: 'Всего страниц', example: 5 })
  pageCount: number;
}
