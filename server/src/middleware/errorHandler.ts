import { Request, Response, NextFunction } from 'express';
import { TranslationServiceError } from '../services/googleTranslationService';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof TranslationServiceError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  const isDev = process.env.NODE_ENV === 'development';
  const errorMessage = err instanceof Error ? err.message : 'An unexpected server error occurred.';

  res.status(500).json({
    success: false,
    error: 'An unexpected internal error occurred on the translation server.',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDev ? { details: errorMessage } : {}),
  });
}
