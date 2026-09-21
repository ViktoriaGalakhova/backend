import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PagesDataModule } from '../pages/pages-data.module';
import { AUTH_OPTIONS, AuthOptions } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoginRedirectMiddleware } from './middleware/login-redirect.middleware';
import { SupertokensMiddleware } from './middleware/supertokens.middleware';
import { SupertokensService } from './supertokens.service';

@Module({})
export class AuthModule implements NestModule {
  static forRoot(options: AuthOptions): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [PagesDataModule],
      controllers: [AuthController],
      providers: [
        { provide: AUTH_OPTIONS, useValue: options },
        SupertokensService,
        AuthService,
        SupertokensMiddleware,
        LoginRedirectMiddleware,
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
      exports: [AUTH_OPTIONS, AuthService, LoginRedirectMiddleware],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SupertokensMiddleware)
      .forRoutes({ path: '{*splat}', method: RequestMethod.ALL });
  }
}
