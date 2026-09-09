import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Уникальный машинный идентификатор раздела меню',
    example: 'hot',
  })
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'slug может содержать только латиницу в нижнем регистре, цифры и дефис.',
  })
  slug: string;

  @ApiProperty({ description: 'Название раздела', example: 'Горячие напитки' })
  @IsString()
  @Length(2, 100)
  title: string;

  @ApiPropertyOptional({
    description: 'Описание раздела',
    example: 'Напитки, которые подаются горячими',
  })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  description?: string;
}
