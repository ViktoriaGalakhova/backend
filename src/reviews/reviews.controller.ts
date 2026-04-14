import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getAll(@Req() req: Request) {
    const user = await this.authService.getSessionUser(req);
    return this.reviewsService.getAllForView(user?.id ?? null);
  }

  @Get(':id')
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const user = await this.authService.getSessionUser(req);
    return this.reviewsService.getOneForView(Number(id), user?.id ?? null);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body('comment') comment: string,
  ) {
    const user = await this.authService.getSessionUser(req);

    if (!user) {
      return res.redirect(
        `/auth/login?next=${encodeURIComponent('/feedback')}&error=${encodeURIComponent('Чтобы оставить отзыв, сначала войдите в аккаунт.')}`,
      );
    }

    try {
      await this.reviewsService.create(user.id, comment);
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
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('comment') comment: string,
  ) {
    const user = await this.authService.getSessionUser(req);

    if (!user) {
      throw new ForbiddenException('Сначала войдите в аккаунт.');
    }

    const review = await this.reviewsService.update(Number(id), user.id, comment);
    return { review };
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = await this.authService.getSessionUser(req);

    if (!user) {
      throw new ForbiddenException('Сначала войдите в аккаунт.');
    }

    await this.reviewsService.remove(Number(id), user.id);
    return { ok: true };
  }

  @Sse('stream')
  stream() {
    return this.reviewsService.stream();
  }
}
