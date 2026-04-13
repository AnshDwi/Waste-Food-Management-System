import { Response } from 'express';
import { env } from '../../config/env.js';

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

export const setRefreshCookie = (res: Response, token: string, rememberMe: boolean) => {
  res.cookie(env.refreshCookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: rememberMe ? sevenDaysMs : undefined
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(env.refreshCookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth'
  });
};
