import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    description: 'Новый текст отзыва',
    example: 'Обновлённый отзыв о кофейне.',
    minLength: 10,
    maxLength: 300,
  })
  @IsString()
  @Length(10, 300)
  comment: string;
}
