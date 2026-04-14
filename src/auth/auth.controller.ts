import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PagesService } from '../pages/pages.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly pagesService: PagesService,
  ) {}

  @Get('login')
  @Render('auth-login')
  async getLoginPage(
    @Req() req: Request,
    @Query('next') next?: string,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    const user = await this.authService.getSessionUser(req);
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
  async getRegisterPage(
    @Req() req: Request,
    @Query('next') next?: string,
    @Query('error') error?: string,
  ) {
    const user = await this.authService.getSessionUser(req);
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

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('next') next: string,
    @Res() res: Response,
  ) {
    const safeNext = this.authService.sanitizeNextPath(next);

    try {
      await this.authService.login(email, password, res);
      return res.redirect(
        `${safeNext}?notice=${encodeURIComponent('Вы вошли в аккаунт.')}`,
      );
    } catch (error) {
      const message =
        error instanceof UnauthorizedException
          ? error.message
          : 'Не удалось выполнить вход.';

      return res.redirect(
        `/auth/login?next=${encodeURIComponent(safeNext)}&error=${encodeURIComponent(message)}`,
      );
    }
  }

  @Post('register')
  async register(
    @Body('displayName') displayName: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('next') next: string,
    @Res() res: Response,
  ) {
    const safeNext = this.authService.sanitizeNextPath(next);

    try {
      await this.authService.register(displayName, email, password, res);
      return res.redirect(
        `${safeNext}?notice=${encodeURIComponent('Аккаунт создан, вы уже вошли.')}`,
      );
    } catch (error) {
      const message =
        error instanceof ConflictException
          ? error.message
          : 'Не удалось создать аккаунт.';

      return res.redirect(
        `/auth/register?next=${encodeURIComponent(safeNext)}&error=${encodeURIComponent(message)}`,
      );
    }
  }

  @Get('logout')
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @Query('next') next?: string,
  ) {
    const safeNext = this.authService.sanitizeNextPath(next);
    await this.authService.logout(req, res);

    return res.redirect(
      `${safeNext}?notice=${encodeURIComponent('Вы вышли из аккаунта.')}`,
    );
  }
}
