import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Идентификатор позиции', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название позиции', example: 'Капучино' })
  name: string;

  @ApiProperty({
    description: 'Описание позиции',
    example: 'Эспрессо с молочной пеной',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'Цена в рублях', example: 200 })
  price: number;

  @ApiProperty({
    description: 'Ссылка на изображение',
    example: '/media/cappuccino.png',
  })
  imageUrl: string;

  @ApiProperty({ description: 'Доступна ли позиция', example: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Идентификатор раздела меню', example: 1 })
  categoryId: number;

  @ApiProperty({
    description: 'Дата создания',
    example: '2026-09-09T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего изменения',
    example: '2026-09-09T10:00:00.000Z',
  })
  updatedAt: Date;
}
