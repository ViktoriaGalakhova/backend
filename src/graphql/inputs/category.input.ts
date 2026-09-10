import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

@InputType({ description: 'Данные для создания раздела меню' })
export class CreateCategoryInput {
  @Field(() => String, { description: 'Машинный идентификатор раздела' })
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @Field(() => String, { description: 'Название раздела' })
  @IsString()
  @Length(2, 100)
  title: string;

  @Field(() => String, { nullable: true, description: 'Описание раздела' })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  description?: string;
}

@InputType({ description: 'Данные для изменения раздела меню' })
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {}
