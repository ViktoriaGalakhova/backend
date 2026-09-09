import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Идентификатор автора отзыва', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId: number;

  @ApiProperty({
    description: 'Текст отзыва',
    example: 'Очень уютная кофейня и вкусный капучино.',
    minLength: 10,
    maxLength: 300,
  })
  @IsString()
  @Length(10, 300)
  comment: string;
}
