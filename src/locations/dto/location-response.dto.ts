import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class LocationResponseDto {
  @ApiProperty({ description: 'Идентификатор кофейни', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название кофейни', example: 'Невский проспект' })
  name: string;

  @ApiProperty({
    description: 'Адрес кофейни',
    example: 'Невский пр., 28, Санкт-Петербург',
  })
  address: string;

  @ApiProperty({
    description: 'Телефон кофейни',
    example: '+7 (999) 111-22-33',
  })
  phone: string;

  @ApiProperty({ description: 'Часы работы', example: '08:00-22:00' })
  openingHours: string;

  @ApiProperty({
    description: 'Ссылка на фотографию кофейни',
    example: '/media/nevsky.png',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Дата создания',
    example: '2026-09-09T10:00:00.000Z',
  })
  createdAt: Date;
}

export class PaginatedLocationsDto {
  @ApiProperty({ type: [LocationResponseDto], description: 'Кофейни' })
  items: LocationResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Данные о странице' })
  meta: PaginationMetaDto;
}
