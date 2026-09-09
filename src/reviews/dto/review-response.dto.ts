import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class ReviewResponseDto {
  @ApiProperty({ description: 'Идентификатор отзыва', example: 1 })
  id: number;

  @ApiProperty({ description: 'Идентификатор автора', example: 1 })
  authorId: number;

  @ApiProperty({ description: 'Имя автора', example: 'Виктория' })
  authorName: string;

  @ApiProperty({ description: 'Email автора', example: 'user@example.com' })
  authorEmail: string;

  @ApiProperty({
    description: 'Текст отзыва',
    example: 'Очень уютная кофейня и вкусный капучино.',
  })
  comment: string;

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

export class PaginatedReviewsDto {
  @ApiProperty({ type: [ReviewResponseDto], description: 'Отзывы' })
  items: ReviewResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Данные о странице' })
  meta: PaginationMetaDto;
}
