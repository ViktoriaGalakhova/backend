import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

@InputType({ description: 'Данные для добавления кофейни' })
export class CreateCafeLocationInput {
  @Field(() => String, { description: 'Название кофейни' })
  @IsString()
  @Length(2, 100)
  name: string;

  @Field(() => String, { description: 'Адрес кофейни' })
  @IsString()
  @Length(5, 200)
  address: string;

  @Field(() => String, { description: 'Контактный телефон' })
  @IsString()
  @Length(5, 30)
  phone: string;

  @Field(() => String, { description: 'Часы работы в формате ЧЧ:ММ-ЧЧ:ММ' })
  @IsString()
  @Matches(/^\d{2}:\d{2}-\d{2}:\d{2}$/)
  openingHours: string;

  @Field(() => String, {
    nullable: true,
    description: 'Ссылка на фотографию кофейни',
  })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  imageUrl?: string;
}

@InputType({ description: 'Данные для изменения кофейни' })
export class UpdateCafeLocationInput extends PartialType(
  CreateCafeLocationInput,
) {}
