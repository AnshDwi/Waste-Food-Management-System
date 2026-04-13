import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthUser, rolePermissions } from './auth.types.js';

const parseTtlMs = (value: string) => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return amount * unitMs;
};

export const tokenService = {
  createAccessToken(user: AuthUser) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        permissions: rolePermissions[user.role]
      },
      env.jwtSecret,
      {
        expiresIn: env.accessTokenTtl as jwt.SignOptions['expiresIn']
      }
    );
  },
  createRefreshToken(user: AuthUser, rememberMe: boolean) {
    const tokenId = randomUUID();
    const expiresAt = new Date(Date.now() + parseTtlMs(env.refreshTokenTtl)).toISOString();
    const token = jwt.sign(
      {
        sub: user.id,
        tokenId,
        type: 'refresh',
        rememberMe
      },
      env.jwtRefreshSecret,
      {
        expiresIn: env.refreshTokenTtl as jwt.SignOptions['expiresIn']
      }
    );

    return {
      token,
      tokenId,
      expiresAt
    };
  },
  verifyRefreshToken(token: string) {
    return jwt.verify(token, env.jwtRefreshSecret) as { sub: string; tokenId: string; type: 'refresh'; rememberMe?: boolean };
  }
};
