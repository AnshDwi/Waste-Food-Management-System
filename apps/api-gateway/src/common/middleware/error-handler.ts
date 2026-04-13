import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error, requestId: req.requestId }, 'request failed');

  if (error instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: 'Validation failed',
      details: error.flatten()
    });
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  const statusCode =
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : StatusCodes.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({
    success: false,
    error: message,
    requestId: req.requestId
  });
};
