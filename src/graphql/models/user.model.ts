import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageMeta } from './page-meta.model';

@ObjectType({ description: 'Посетитель кофейни' })
export class User {
  @Field(() => Int, { description: 'Идентификатор пользователя' })
  id: number;

  @Field(() => String, { description: 'Отображаемое имя' })
  displayName: string;

  @Field(() => String, { description: 'Электронная почта' })
  email: string;

  @Field(() => Int, { description: 'Количество оставленных отзывов' })
  reviewsCount: number;

  @Field(() => Date, { description: 'Дата регистрации' })
  createdAt: Date;
}

@ObjectType({ description: 'Страница списка пользователей' })
export class UserPage {
  @Field(() => [User], { description: 'Пользователи текущей страницы' })
  items: User[];

  @Field(() => PageMeta, { description: 'Сведения о странице' })
  meta: PageMeta;
}
