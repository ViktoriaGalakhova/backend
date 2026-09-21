import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiCookieAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { AUTH_SECURITY_SCHEME } from '../auth.config';
import { IS_PUBLIC_KEY } from './public-access.decorator';

export const Authenticated = () =>
  applyDecorators(
    SetMetadata(IS_PUBLIC_KEY, false),
    ApiCookieAuth(AUTH_SECURITY_SCHEME),
    ApiUnauthorizedResponse({
      description: 'Нужен вход в аккаунт',
      type: ErrorResponseDto,
    }),
  );
