import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { SessionUser } from '../auth.types';

export const CurrentUser = createParamDecorator(
  (_data, context: ExecutionContext): SessionUser | null =>
    context.switchToHttp().getRequest<Request>().currentUser ?? null,
);
