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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AppRole } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { linkHeaderDoc } from '../common/api-link-header';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { setLinkHeader } from '../common/pagination';
import {
  PaginatedReviewsDto,
  ReviewResponseDto,
} from '../reviews/dto/review-response.dto';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  PaginatedSessionsDto,
  SessionResponseDto,
} from './dto/session-response.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersDto, UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Roles(AppRole.Admin)
@ApiBadRequestResponse({
  description: 'Некорректные параметры запроса или тело запроса',
  type: ErrorResponseDto,
})
@Controller('api/users')
export class UsersApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получить страницу пользователей' })
  @ApiOkResponse({
    description: 'Страница пользователей',
    type: PaginatedUsersDto,
    headers: linkHeaderDoc,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedUsersDto> {
    const result = await this.usersService.findAll(query.page, query.limit);
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по идентификатору' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiOkResponse({ description: 'Пользователь', type: UserResponseDto })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiCreatedResponse({
    description: 'Пользователь создан',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже существует',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить данные пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Обновлённый пользователь',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже существует',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить пользователя вместе с его отзывами' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiNoContentResponse({ description: 'Пользователь удалён' })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Изменить роль пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Пользователь с новой ролью',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    type: ErrorResponseDto,
  })
  changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeRoleDto,
  ): Promise<UserResponseDto> {
    return this.usersService.changeRole(id, dto.role);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Получить страницу отзывов пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Страница отзывов пользователя',
    type: PaginatedReviewsDto,
    headers: linkHeaderDoc,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    type: ErrorResponseDto,
  })
  async findReviews(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedReviewsDto> {
    await this.usersService.findOne(id);
    const result = await this.reviewsService.findAll(
      query.page,
      query.limit,
      id,
    );
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Получить отзыв пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiParam({
    name: 'reviewId',
    description: 'Идентификатор отзыва',
    example: 1,
  })
  @ApiOkResponse({ description: 'Отзыв пользователя', type: ReviewResponseDto })
  @ApiNotFoundResponse({
    description: 'Пользователь или отзыв не найдены',
    type: ErrorResponseDto,
  })
  async findReview(
    @Param('id', ParseIntPipe) id: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ): Promise<ReviewResponseDto> {
    await this.usersService.findOne(id);
    return this.reviewsService.findOneByAuthor(id, reviewId);
  }

  @Get(':id/sessions')
  @ApiOperation({ summary: 'Получить страницу сессий пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Страница сессий пользователя',
    type: PaginatedSessionsDto,
    headers: linkHeaderDoc,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    type: ErrorResponseDto,
  })
  async findSessions(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedSessionsDto> {
    const result = await this.usersService.findSessions(
      id,
      query.page,
      query.limit,
    );
    setLinkHeader(req, res, result.meta);
    return result;
  }

  @Get(':id/sessions/:sessionId')
  @ApiOperation({ summary: 'Получить сессию пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Идентификатор сессии',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Сессия пользователя',
    type: SessionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь или сессия не найдены',
    type: ErrorResponseDto,
  })
  findSession(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ): Promise<SessionResponseDto> {
    return this.usersService.findSession(id, sessionId);
  }

  @Post(':id/sessions')
  @ApiOperation({ summary: 'Выдать пользователю новую сессию' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiCreatedResponse({
    description: 'Сессия создана',
    type: SessionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    type: ErrorResponseDto,
  })
  createSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.usersService.createSession(id, dto);
  }

  @Patch(':id/sessions/:sessionId')
  @ApiOperation({ summary: 'Продлить сессию пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Идентификатор сессии',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Обновлённая сессия',
    type: SessionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь или сессия не найдены',
    type: ErrorResponseDto,
  })
  updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.usersService.updateSession(id, sessionId, dto);
  }

  @Delete(':id/sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Завершить сессию пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: 1,
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Идентификатор сессии',
    example: 1,
  })
  @ApiNoContentResponse({ description: 'Сессия завершена' })
  @ApiNotFoundResponse({
    description: 'Пользователь или сессия не найдены',
    type: ErrorResponseDto,
  })
  removeSession(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ): Promise<void> {
    return this.usersService.removeSession(id, sessionId);
  }
}
