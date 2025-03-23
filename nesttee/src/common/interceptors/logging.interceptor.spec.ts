import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    let mockContext: ExecutionContext;
    let mockCallHandler: CallHandler;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/test',
            body: { test: 'data' },
            query: { param: 'value' },
            params: { id: '123' },
          }),
        }),
      } as ExecutionContext;

      mockCallHandler = {
        handle: () => of({ success: true }),
      } as CallHandler;

      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log successful request and response', (done) => {
      const response = { success: true };
      mockCallHandler.handle = () => of(response);

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        complete: () => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              request: {
                method: 'POST',
                url: '/test',
                body: { test: 'data' },
                query: { param: 'value' },
                params: { id: '123' },
              },
              response: response,
              duration: expect.any(String),
            }),
          );
          done();
        },
      });
    });

    it('should log error response', (done) => {
      const error = new Error('Test error');
      error['status'] = 500;
      mockCallHandler.handle = () => throwError(() => error);

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              request: {
                method: 'POST',
                url: '/test',
                body: { test: 'data' },
                query: { param: 'value' },
                params: { id: '123' },
              },
              error: {
                message: 'Test error',
                status: 500,
                stack: expect.any(String),
              },
              duration: expect.any(String),
            }),
          );
          done();
        },
      });
    });
  });
}); 