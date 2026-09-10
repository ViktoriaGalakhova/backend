import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, Length } from 'class-validator';

@InputType({ description: 'Данные для регистрации пользователя' })
export class RegisterUserInput {
  @Field(() => String, { description: 'Отображаемое имя' })
  @IsString()
  @Length(2, 50)
  displayName: string;

  @Field(() => String, { description: 'Электронная почта' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'Пароль пользователя' })
  @IsString()
  @Length(6, 72)
  password: string;
}
