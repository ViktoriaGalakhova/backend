import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: 'HTTP-код ответа', example: 404 })
  statusCode: number;

  @ApiProperty({
    description: 'Описание ошибки или список ошибок валидации',
    example: 'Отзыв не найден.',
  })
  message: string | string[];

  @ApiProperty({ description: 'Путь запроса', example: '/api/reviews/10' })
  path: string;

  @ApiProperty({
    description: 'Время возникновения ошибки',
    example: '2026-09-09T10:00:00.000Z',
  })
  timestamp: string;
}
