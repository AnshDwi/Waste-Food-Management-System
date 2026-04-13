import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as {
      sub: string;
      role: string;
      email: string;
      name: string;
      isVerified: boolean;
      permissions: string[];
    };
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
      isVerified: decoded.isVerified,
      permissions: decoded.permissions
    };
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: 'Invalid token' });
  }
};
