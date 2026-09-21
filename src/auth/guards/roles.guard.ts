import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppRole } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length || context.getType() !== 'http') {
      return true;
    }

    const user = context.switchToHttp().getRequest<Request>().currentUser;

    if (!user) {
      throw new UnauthorizedException('Сначала войдите в аккаунт');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
