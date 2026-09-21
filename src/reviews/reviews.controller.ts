import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Res,
  Sse,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import type { SessionUser } from '../auth/auth.types';
import { Authenticated } from '../auth/decorators/authenticated.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { ReviewsService } from './reviews.service';

@PublicAccess()
@ApiExcludeController()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getAll(@CurrentUser() user: SessionUser | null) {
    return this.reviewsService.getAllForView(user);
  }

  @Sse('events')
  stream() {
    return this.reviewsService.stream();
  }

  @Get(':id')
  getOne(@CurrentUser() user: SessionUser | null, @Param('id') id: string) {
    return this.reviewsService.getOneForView(Number(id), user);
  }

  @Post()
  async create(
    @CurrentUser() user: SessionUser | null,
    @Res() res: Response,
    @Body('comment') comment: string,
  ) {
    if (!user) {
      return res.redirect(
        `/auth/login?next=${encodeURIComponent('/feedback')}&error=${encodeURIComponent('Чтобы оставить отзыв, сначала войдите в аккаунт.')}`,
      );
    }

    try {
      await this.reviewsService.create(user, comment);
      return res.redirect(
        `/feedback?notice=${encodeURIComponent('Спасибо, отзыв опубликован.')}`,
      );
    } catch (error) {
      const message =
        error instanceof ForbiddenException
          ? error.message
          : 'Не удалось сохранить отзыв.';

      return res.redirect(`/feedback?error=${encodeURIComponent(message)}`);
    }
  }

  @Patch(':id')
  @Authenticated()
  async update(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
    @Body('comment') comment: string,
  ) {
    const review = await this.reviewsService.update(Number(id), user, comment);

    return { review };
  }

  @Delete(':id')
  @Authenticated()
  async remove(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    await this.reviewsService.remove(Number(id), user);
    return { ok: true };
  }
}
