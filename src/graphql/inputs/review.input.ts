import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, Length, Min } from 'class-validator';

@InputType({ description: 'Данные для публикации отзыва' })
export class PublishReviewInput {
  @Field(() => Int, { description: 'Идентификатор автора отзыва' })
  @IsInt()
  @Min(1)
  authorId: number;

  @Field(() => String, { description: 'Текст отзыва' })
  @IsString()
  @Length(10, 300)
  comment: string;
}
