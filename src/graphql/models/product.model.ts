import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageMeta } from './page-meta.model';

@ObjectType({ description: 'Позиция меню' })
export class Product {
  @Field(() => Int, { description: 'Идентификатор позиции' })
  id: number;

  @Field(() => String, { description: 'Название позиции' })
  name: string;

  @Field(() => String, {
    nullable: true,
    description: 'Описание позиции',
  })
  description: string | null;

  @Field(() => Int, { description: 'Цена в рублях' })
  price: number;

  @Field(() => String, { description: 'Ссылка на изображение позиции' })
  imageUrl: string;

  @Field(() => Boolean, { description: 'Доступна ли позиция к заказу' })
  isAvailable: boolean;

  @Field(() => Int, { description: 'Идентификатор раздела меню' })
  categoryId: number;

  @Field(() => Date, { description: 'Дата создания позиции' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата последнего изменения позиции' })
  updatedAt: Date;
}

@ObjectType({ description: 'Страница списка позиций меню' })
export class ProductPage {
  @Field(() => [Product], { description: 'Позиции текущей страницы' })
  items: Product[];

  @Field(() => PageMeta, { description: 'Сведения о странице' })
  meta: PageMeta;
}
