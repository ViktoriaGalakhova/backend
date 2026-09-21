import { Controller, Get, Query, Render, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagesService } from '../pages/pages.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { PublicAccess } from './decorators/public-access.decorator';
import type { SessionUser } from './auth.types';

@ApiExcludeController()
@PublicAccess()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly pagesService: PagesService,
  ) {}

  @Get('login')
  @Render('auth-login')
  getLoginPage(
    @CurrentUser() user: SessionUser | null,
    @Query('next') next?: string,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    const safeNext = this.authService.sanitizeNextPath(next);

    return {
      ...this.pagesService.buildPageModel(
        safeNext,
        'Вход | British Coffee Shop',
        user,
        notice ?? error,
        error ? 'error' : 'success',
      ),
      authPage: {
        title: 'Вход в аккаунт',
        next: safeNext,
      },
    };
  }

  @Get('register')
  @Render('auth-register')
  getRegisterPage(
    @CurrentUser() user: SessionUser | null,
    @Query('next') next?: string,
    @Query('error') error?: string,
  ) {
    const safeNext = this.authService.sanitizeNextPath(next);

    return {
      ...this.pagesService.buildPageModel(
        safeNext,
        'Регистрация | British Coffee Shop',
        user,
        error,
        error ? 'error' : 'info',
      ),
      authPage: {
        title: 'Создание аккаунта',
        next: safeNext,
      },
    };
  }

  @Get('logout')
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @Query('next') next?: string,
  ) {
    const safeNext = this.authService.sanitizeNextPath(next);
    await this.authService.revokeSession(req, res);

    return res.redirect(
      `${safeNext}?notice=${encodeURIComponent('Вы вышли из аккаунта.')}`,
    );
  }
}
