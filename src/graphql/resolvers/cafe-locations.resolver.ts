import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LocationsService } from '../../locations/locations.service';
import { pageComplexity } from '../complexity';
import {
  CreateCafeLocationInput,
  UpdateCafeLocationInput,
} from '../inputs/cafe-location.input';
import {
  DEFAULT_PAGINATION,
  PaginationInput,
} from '../inputs/pagination.input';
import { CafeLocation, CafeLocationPage } from '../models/cafe-location.model';

@Resolver(() => CafeLocation)
export class CafeLocationsResolver {
  constructor(private readonly locationsService: LocationsService) {}

  @Query(() => CafeLocationPage, {
    description: 'Список кофеен сети постранично',
    complexity: pageComplexity,
  })
  cafeLocations(
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
  ): Promise<CafeLocationPage> {
    return this.locationsService.findAll(pagination.page, pagination.limit);
  }

  @Query(() => CafeLocation, { description: 'Кофейня по идентификатору' })
  cafeLocation(
    @Args('locationId', { type: () => Int }) locationId: number,
  ): Promise<CafeLocation> {
    return this.locationsService.findOne(locationId);
  }

  @Mutation(() => CafeLocation, { description: 'Добавить кофейню в сеть' })
  addCafeLocation(
    @Args('input') input: CreateCafeLocationInput,
  ): Promise<CafeLocation> {
    return this.locationsService.create(input);
  }

  @Mutation(() => CafeLocation, { description: 'Изменить данные кофейни' })
  updateCafeLocation(
    @Args('locationId', { type: () => Int }) locationId: number,
    @Args('input') input: UpdateCafeLocationInput,
  ): Promise<CafeLocation> {
    return this.locationsService.update(locationId, input);
  }

  @Mutation(() => CafeLocation, { description: 'Изменить часы работы кофейни' })
  changeCafeOpeningHours(
    @Args('locationId', { type: () => Int }) locationId: number,
    @Args('openingHours') openingHours: string,
  ): Promise<CafeLocation> {
    return this.locationsService.update(locationId, { openingHours });
  }

  @Mutation(() => Boolean, { description: 'Убрать кофейню из сети' })
  async removeCafeLocation(
    @Args('locationId', { type: () => Int }) locationId: number,
  ): Promise<boolean> {
    await this.locationsService.remove(locationId);
    return true;
  }
}
