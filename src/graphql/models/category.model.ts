import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageMeta } from './page-meta.model';

@ObjectType({ description: 'Раздел меню' })
export class Category {
  @Field(() => Int, { description: 'Идентификатор раздела' })
  id: number;

  @Field(() => String, { description: 'Машинный идентификатор раздела' })
  slug: string;

  @Field(() => String, { description: 'Название раздела' })
  title: string;

  @Field(() => String, {
    nullable: true,
    description: 'Описание раздела',
  })
  description: string | null;

  @Field(() => Int, { description: 'Количество позиций в разделе' })
  productsCount: number;

  @Field(() => Date, { description: 'Дата создания раздела' })
  createdAt: Date;
}

@ObjectType({ description: 'Страница списка разделов меню' })
export class CategoryPage {
  @Field(() => [Category], { description: 'Разделы текущей страницы' })
  items: Category[];

  @Field(() => PageMeta, { description: 'Сведения о странице' })
  meta: PageMeta;
}
