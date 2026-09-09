import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Идентификатор раздела', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Машинный идентификатор раздела',
    example: 'hot',
  })
  slug: string;

  @ApiProperty({ description: 'Название раздела', example: 'Горячие напитки' })
  title: string;

  @ApiProperty({
    description: 'Описание раздела',
    example: 'Напитки, которые подаются горячими',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'Количество позиций в разделе', example: 3 })
  productsCount: number;

  @ApiProperty({
    description: 'Дата создания',
    example: '2026-09-09T10:00:00.000Z',
  })
  createdAt: Date;
}
