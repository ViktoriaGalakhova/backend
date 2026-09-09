import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Отображаемое имя', example: 'Виктория' })
  @IsString()
  @Length(2, 50)
  displayName: string;

  @ApiProperty({
    description: 'Электронная почта',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Укажите корректный email.' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'secret123',
    minLength: 6,
  })
  @IsString()
  @Length(6, 72)
  password: string;
}
