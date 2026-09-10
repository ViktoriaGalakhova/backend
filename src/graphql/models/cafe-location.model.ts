import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageMeta } from './page-meta.model';

@ObjectType({ description: 'Кофейня сети' })
export class CafeLocation {
  @Field(() => Int, { description: 'Идентификатор кофейни' })
  id: number;

  @Field(() => String, { description: 'Название кофейни' })
  name: string;

  @Field(() => String, { description: 'Адрес кофейни' })
  address: string;

  @Field(() => String, { description: 'Контактный телефон' })
  phone: string;

  @Field(() => String, { description: 'Часы работы в формате ЧЧ:ММ-ЧЧ:ММ' })
  openingHours: string;

  @Field(() => String, { description: 'Ссылка на фотографию кофейни' })
  imageUrl: string;

  @Field(() => Date, { description: 'Дата добавления кофейни' })
  createdAt: Date;
}

@ObjectType({ description: 'Страница списка кофеен' })
export class CafeLocationPage {
  @Field(() => [CafeLocation], { description: 'Кофейни текущей страницы' })
  items: CafeLocation[];

  @Field(() => PageMeta, { description: 'Сведения о странице' })
  meta: PageMeta;
}
