import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Сведения о текущей странице выборки' })
export class PageMeta {
  @Field(() => Int, { description: 'Номер текущей страницы' })
  page: number;

  @Field(() => Int, { description: 'Количество элементов на странице' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество элементов' })
  total: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  pageCount: number;
}
