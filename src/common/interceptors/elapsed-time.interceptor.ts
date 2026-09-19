import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import type { GraphQLResolveInfo } from 'graphql';
import { Observable, map } from 'rxjs';

const RENDER_METADATA = '__renderTemplate__';

type ServerTiming = {
  serverElapsedMs: number;
};

type Timed<T> = T | (T & ServerTiming);

type GraphQLHttpContext = {
  req?: Request;
  res?: Response;
};

@Injectable()
export class ElapsedTimeInterceptor<T> implements NestInterceptor<T, Timed<T>> {
  private readonly logger = new Logger(ElapsedTimeInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Timed<T>> {
    const startedAt = performance.now();

    return next.handle().pipe(
      map((data) => {
        const elapsedMs =
          Math.round((performance.now() - startedAt) * 100) / 100;

        this.logger.log(`${this.describe(context)} - ${elapsedMs} мс`);
        this.setHeader(context, elapsedMs);

        if (this.rendersView(context) && this.isViewModel(data)) {
          return { ...data, serverElapsedMs: elapsedMs };
        }

        return data;
      }),
    );
  }

  private describe(context: ExecutionContext): string {
    if (context.getType<GqlContextType>() === 'graphql') {
      const info =
        GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>();

      return `GraphQL ${info.parentType.name}.${info.fieldName}`;
    }

    const request = context.switchToHttp().getRequest<Request>();

    return `${request.method} ${request.originalUrl}`;
  }

  private setHeader(context: ExecutionContext, elapsedMs: number): void {
    const response = this.getResponse(context);

    if (response && !response.headersSent) {
      response.setHeader('X-Elapsed-Time', `${elapsedMs}ms`);
    }
  }

  private getResponse(context: ExecutionContext): Response | undefined {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext =
        GqlExecutionContext.create(context).getContext<GraphQLHttpContext>();

      return gqlContext.res ?? gqlContext.req?.res;
    }

    return context.switchToHttp().getResponse<Response>();
  }

  private rendersView(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.get<string>(RENDER_METADATA, context.getHandler()),
    );
  }

  private isViewModel(data: T): data is T & object {
    return typeof data === 'object' && data !== null && !Array.isArray(data);
  }
}
