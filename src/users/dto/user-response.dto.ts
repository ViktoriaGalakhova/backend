import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class UserResponseDto {
  @ApiProperty({ description: 'Идентификатор пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Отображаемое имя', example: 'Виктория' })
  displayName: string;

  @ApiProperty({
    description: 'Электронная почта',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Количество отзывов пользователя', example: 2 })
  reviewsCount: number;

  @ApiProperty({
    description: 'Дата регистрации',
    example: '2026-09-09T10:00:00.000Z',
  })
  createdAt: Date;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [UserResponseDto], description: 'Пользователи' })
  items: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Данные о странице' })
  meta: PaginationMetaDto;
}
