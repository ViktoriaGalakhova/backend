import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class SessionResponseDto {
  @ApiProperty({ description: 'Идентификатор сессии', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Токен сессии',
    example: '5f2b8c1d9a1e4f6b8c1d9a1e4f6b8c1d',
  })
  token: string;

  @ApiProperty({ description: 'Идентификатор пользователя', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Дата истечения сессии',
    example: '2026-10-09T10:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Дата создания сессии',
    example: '2026-09-09T10:00:00.000Z',
  })
  createdAt: Date;
}

export class PaginatedSessionsDto {
  @ApiProperty({
    type: [SessionResponseDto],
    description: 'Сессии пользователя',
  })
  items: SessionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Данные о странице' })
  meta: PaginationMetaDto;
}
