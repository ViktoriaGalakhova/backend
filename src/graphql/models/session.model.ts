import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageMeta } from './page-meta.model';

@ObjectType({ description: 'Сессия пользователя' })
export class Session {
  @Field(() => Int, { description: 'Идентификатор сессии' })
  id: number;

  @Field(() => String, { description: 'Токен сессии' })
  token: string;

  @Field(() => Int, { description: 'Идентификатор владельца сессии' })
  userId: number;

  @Field(() => Date, { description: 'Дата истечения сессии' })
  expiresAt: Date;

  @Field(() => Date, { description: 'Дата открытия сессии' })
  createdAt: Date;
}

@ObjectType({ description: 'Страница списка сессий' })
export class SessionPage {
  @Field(() => [Session], { description: 'Сессии текущей страницы' })
  items: Session[];

  @Field(() => PageMeta, { description: 'Сведения о странице' })
  meta: PageMeta;
}
