import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { createHash } from 'crypto';
import type { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class EtagInterceptor<T> implements NestInterceptor<T, T | undefined> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | undefined> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (request.method !== 'GET' || data === undefined || data === null) {
          return data;
        }

        const etag = this.buildEtag(data);
        response.setHeader('ETag', etag);

        if (request.headers['if-none-match'] === etag) {
          response.status(HttpStatus.NOT_MODIFIED);
          return undefined;
        }

        return data;
      }),
    );
  }

  private buildEtag(data: T): string {
    const hash = createHash('md5').update(JSON.stringify(data)).digest('hex');

    return `"${hash}"`;
  }
}
