import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { AUTH_SECURITY_SCHEME } from '../auth.config';
import { AppRole } from '../auth.types';
import { IS_PUBLIC_KEY } from './public-access.decorator';

export const ROLES_KEY = 'requiredRoles';

export const Roles = (...roles: AppRole[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    SetMetadata(IS_PUBLIC_KEY, false),
    ApiCookieAuth(AUTH_SECURITY_SCHEME),
    ApiUnauthorizedResponse({
      description: 'Нужен вход в аккаунт',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Недостаточно прав',
      type: ErrorResponseDto,
    }),
  );
