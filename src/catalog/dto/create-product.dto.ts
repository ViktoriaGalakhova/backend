import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Название позиции', example: 'Капучино' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Описание позиции',
    example: 'Эспрессо с молочной пеной',
  })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  description?: string;

  @ApiProperty({ description: 'Цена в рублях', example: 200, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  price: number;

  @ApiProperty({
    description: 'Ссылка на изображение позиции',
    example: '/media/cappuccino.png',
  })
  @IsString()
  @Length(1, 200)
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Доступна ли позиция к заказу',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Идентификатор раздела меню', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;
}

export class CreateCategoryProductDto extends OmitType(CreateProductDto, [
  'categoryId',
] as const) {}
