import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const authorize = (permissions: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: 'Unauthorized' });
  }

  const allowed = permissions.every((permission) => user.permissions.includes(permission) || user.role === 'ADMIN');
  if (!allowed) {
    return res.status(StatusCodes.FORBIDDEN).json({ success: false, error: 'Forbidden' });
  }

  next();
};
