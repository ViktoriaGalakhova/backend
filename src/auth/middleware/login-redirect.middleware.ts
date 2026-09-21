import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class LoginRedirectMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = await this.authService.resolveSessionUser(req, res);

    if (user) {
      req.currentUser = user;
      next();
      return;
    }

    const target = encodeURIComponent(req.originalUrl);
    const message = encodeURIComponent(
      'Эта страница доступна только после входа.',
    );

    res.redirect(`/auth/login?next=${target}&error=${message}`);
  }
}
