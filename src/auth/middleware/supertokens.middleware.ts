import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { middleware } from 'supertokens-node/framework/express';
import { SupertokensService } from '../supertokens.service';

@Injectable()
export class SupertokensMiddleware implements NestMiddleware {
  private readonly handler = middleware();

  constructor(private readonly supertokensService: SupertokensService) {}

  use(req: Request, res: Response, next: NextFunction) {
    return this.handler(req, res, next);
  }
}
