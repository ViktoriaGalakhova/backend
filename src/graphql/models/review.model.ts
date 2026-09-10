import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageMeta } from './page-meta.model';

@ObjectType({ description: 'Отзыв о кофейне' })
export class Review {
  @Field(() => Int, { description: 'Идентификатор отзыва' })
  id: number;

  @Field(() => Int, { description: 'Идентификатор автора отзыва' })
  authorId: number;

  @Field(() => String, { description: 'Текст отзыва' })
  comment: string;

  @Field(() => Date, { description: 'Дата публикации отзыва' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата последнего изменения отзыва' })
  updatedAt: Date;
}

@ObjectType({ description: 'Страница списка отзывов' })
export class ReviewPage {
  @Field(() => [Review], { description: 'Отзывы текущей страницы' })
  items: Review[];

  @Field(() => PageMeta, { description: 'Сведения о странице' })
  meta: PageMeta;
}
