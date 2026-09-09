import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { linkHeaderDoc } from '../common/api-link-header';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { setLinkHeader } from '../common/pagination';
import { CreateLocationDto } from './dto/create-location.dto';
import {
  LocationResponseDto,
  PaginatedLocationsDto,
} from './dto/location-response.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@ApiBadRequestResponse({
  description: 'Некорректные параметры запроса или тело запроса',
  type: ErrorResponseDto,
})
@Controller('api/locations')
export class LocationsApiController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить страницу кофеен' })
  @ApiOkResponse({
    description: 'Страница кофеен',
    type: PaginatedLocationsDto,
    headers: linkHeaderDoc,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedLocationsDto> {
    const result = await this.locationsService.findAll(query.page, query.limit);
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить кофейню по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор кофейни', example: 1 })
  @ApiOkResponse({ description: 'Кофейня', type: LocationResponseDto })
  @ApiNotFoundResponse({
    description: 'Кофейня не найдена',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<LocationResponseDto> {
    return this.locationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить кофейню' })
  @ApiCreatedResponse({
    description: 'Кофейня создана',
    type: LocationResponseDto,
  })
  create(@Body() dto: CreateLocationDto): Promise<LocationResponseDto> {
    return this.locationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить кофейню' })
  @ApiParam({ name: 'id', description: 'Идентификатор кофейни', example: 1 })
  @ApiOkResponse({
    description: 'Обновлённая кофейня',
    type: LocationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Кофейня не найдена',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить кофейню' })
  @ApiParam({ name: 'id', description: 'Идентификатор кофейни', example: 1 })
  @ApiNoContentResponse({ description: 'Кофейня удалена' })
  @ApiNotFoundResponse({
    description: 'Кофейня не найдена',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.locationsService.remove(id);
  }
}
