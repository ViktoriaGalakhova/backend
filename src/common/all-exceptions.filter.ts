import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { PagesService } from '../pages/pages.service';

type NormalizedError = {
  statusCode: number;
  message: string | string[];
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly pagesService: PagesService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const { statusCode, message } = this.normalize(exception);

    if (this.wantsJson(request)) {
      response.status(statusCode).json({
        statusCode,
        message,
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(statusCode).render('error', {
      ...this.pagesService.buildPageModel(
        request.path,
        `Ошибка ${statusCode} | British Coffee Shop`,
        null,
      ),
      statusCode,
      errorMessage: Array.isArray(message) ? message.join(' ') : message,
    });
  }

  private wantsJson(request: Request): boolean {
    return (
      request.originalUrl.startsWith('/api') ||
      Boolean(request.headers.accept?.includes('application/json'))
    );
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      return {
        statusCode: exception.getStatus(),
        message:
          typeof payload === 'string'
            ? payload
            : ((payload as { message?: string | string[] }).message ??
              exception.message),
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.normalizePrisma(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Переданы некорректные данные для базы данных.',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера.',
    };
  }

  private normalizePrisma(
    exception: Prisma.PrismaClientKnownRequestError,
  ): NormalizedError {
    switch (exception.code) {
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Запись не найдена.',
        };
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Запись с такими данными уже существует.',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Связанная запись не существует.',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка при обращении к базе данных.',
        };
    }
  }
}
