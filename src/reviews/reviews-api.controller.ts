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
import { setLinkHeader } from '../common/pagination';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import {
  PaginatedReviewsDto,
  ReviewResponseDto,
} from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBadRequestResponse({
  description: 'Некорректные параметры запроса или тело запроса',
  type: ErrorResponseDto,
})
@Controller('api/reviews')
export class ReviewsApiController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить страницу отзывов' })
  @ApiOkResponse({
    description: 'Страница отзывов',
    type: PaginatedReviewsDto,
    headers: linkHeaderDoc,
  })
  async findAll(
    @Query() query: ReviewQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedReviewsDto> {
    const result = await this.reviewsService.findAll(
      query.page,
      query.limit,
      query.authorId,
    );
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор отзыва', example: 1 })
  @ApiOkResponse({ description: 'Отзыв', type: ReviewResponseDto })
  @ApiNotFoundResponse({
    description: 'Отзыв не найден',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiCreatedResponse({ description: 'Отзыв создан', type: ReviewResponseDto })
  @ApiNotFoundResponse({
    description: 'Автор отзыва не найден',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateReviewDto): Promise<ReviewResponseDto> {
    return this.reviewsService.createForApi(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить текст отзыва' })
  @ApiParam({ name: 'id', description: 'Идентификатор отзыва', example: 1 })
  @ApiOkResponse({ description: 'Обновлённый отзыв', type: ReviewResponseDto })
  @ApiNotFoundResponse({
    description: 'Отзыв не найден',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.updateForApi(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiParam({ name: 'id', description: 'Идентификатор отзыва', example: 1 })
  @ApiNoContentResponse({ description: 'Отзыв удалён' })
  @ApiNotFoundResponse({
    description: 'Отзыв не найден',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reviewsService.removeForApi(id);
  }
}
