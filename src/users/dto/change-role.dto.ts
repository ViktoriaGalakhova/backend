import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AppRole } from '../../auth/auth.types';

export class ChangeRoleDto {
  @ApiProperty({
    description: 'Новая роль пользователя',
    enum: AppRole,
    example: AppRole.Admin,
  })
  @IsEnum(AppRole)
  role: AppRole;
}
