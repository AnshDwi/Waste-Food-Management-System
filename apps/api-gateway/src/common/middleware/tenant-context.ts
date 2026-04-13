import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export const tenantContext = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id']?.toString() ?? req.user?.id?.split('_')[0] ?? 'tenant_demo';

  if (!tenantId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: 'Missing tenant context' });
  }

  req.tenantId = tenantId;
  next();
};
