import { NextFunction, Request, Response } from 'express';

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(/[<>$]/g, '').trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, nested]) => {
      if (key.startsWith('$') || key.includes('.')) {
        return acc;
      }

      acc[key] = sanitizeValue(nested);
      return acc;
    }, {});
  }

  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeValue(req.body) as Request['body'];
  req.query = sanitizeValue(req.query) as Request['query'];
  next();
};
