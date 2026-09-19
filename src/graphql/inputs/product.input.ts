import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

@InputType({ description: 'Данные для добавления позиции меню' })
export class CreateProductInput {
  @Field(() => String, { description: 'Название позиции' })
  @IsString()
  @Length(2, 100)
  name: string;

  @Field(() => String, { nullable: true, description: 'Описание позиции' })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  description?: string;

  @Field(() => Int, { description: 'Цена в рублях' })
  @IsInt()
  @Min(0)
  @Max(100000)
  price: number;

  @Field(() => String, {
    nullable: true,
    description: 'Ссылка на изображение позиции',
  })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  imageUrl?: string;

  @Field(() => Int, { description: 'Идентификатор раздела меню' })
  @IsInt()
  @Min(1)
  categoryId: number;
}

@InputType({ description: 'Данные для изменения позиции меню' })
export class UpdateProductInput extends PartialType(CreateProductInput) {}
