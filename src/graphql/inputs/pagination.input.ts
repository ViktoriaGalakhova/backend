import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@InputType({ description: 'Параметры постраничной выборки' })
export class PaginationInput {
  @Field(() => Int, {
    defaultValue: 1,
    description: 'Номер страницы, начиная с 1',
  })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, {
    defaultValue: 10,
    description: 'Количество элементов на странице, не больше 100',
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;
}

export const DEFAULT_PAGINATION: PaginationInput = { page: 1, limit: 10 };
