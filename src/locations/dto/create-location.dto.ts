import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ description: 'Название кофейни', example: 'Невский проспект' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Адрес кофейни',
    example: 'Невский пр., 28, Санкт-Петербург',
  })
  @IsString()
  @Length(5, 200)
  address: string;

  @ApiProperty({
    description: 'Телефон кофейни',
    example: '+7 (999) 111-22-33',
  })
  @IsString()
  @Length(5, 30)
  phone: string;

  @ApiProperty({ description: 'Часы работы', example: '08:00-22:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}-\d{2}:\d{2}$/, {
    message: 'openingHours должен быть в формате ЧЧ:ММ-ЧЧ:ММ.',
  })
  openingHours: string;

  @ApiProperty({
    description: 'Ссылка на фотографию кофейни',
    example: '/media/nevsky.png',
  })
  @IsString()
  @Length(1, 200)
  imageUrl: string;
}
