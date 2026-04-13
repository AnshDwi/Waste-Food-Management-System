import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        role: string;
        email: string;
        name: string;
        isVerified: boolean;
        tenantId?: string;
        permissions: string[];
      };
    }
  }
}

export const requestContext = (req: Request, _res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id']?.toString() ?? randomUUID();
  next();
};
