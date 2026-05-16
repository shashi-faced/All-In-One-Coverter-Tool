import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseWrapper<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseWrapper<T>> {
    const now = new Date().toISOString();
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        if (data && data.pagination) {
          return {
            success: true,
            timestamp: now,
            data: data.items,
            meta: {
              page: data.pagination.page,
              limit: data.pagination.limit,
              total: data.pagination.total,
              totalPages: data.pagination.totalPages,
            },
          };
        }

        return {
          success: true,
          timestamp: now,
          data,
        };
      }),
    );
  }
}
