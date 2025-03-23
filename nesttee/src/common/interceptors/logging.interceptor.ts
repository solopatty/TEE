import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log({
            request: {
              method,
              url,
              body,
              query,
              params,
            },
            response: data,
            duration: `${duration}ms`,
          });
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.error({
            request: {
              method,
              url,
              body,
              query,
              params,
            },
            error: {
              message: error.message,
              status: error.status,
              stack: error.stack,
            },
            duration: `${duration}ms`,
          });
        },
      }),
    );
  }
} 