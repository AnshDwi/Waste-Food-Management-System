import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authRepository } from './auth.repository.js';
import { clearRefreshCookie, setRefreshCookie } from './auth.cookies.js';
import { tokenService } from './auth.tokens.js';
import { AuthUser, UserRole, rolePermissions } from './auth.types.js';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN'>;
  rememberMe: boolean;
};

type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const sanitizeUser = (user: AuthUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  permissions: rolePermissions[user.role]
});

const makeError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export const authService = {
  async register(payload: RegisterPayload, res: Response) {
    const existing = await authRepository.findByEmail(payload.email);
    if (existing) {
      throw makeError('An account with this email already exists.', StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await authRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role
    });

    const accessToken = tokenService.createAccessToken(user);
    const refresh = tokenService.createRefreshToken(user, payload.rememberMe);
    await authRepository.saveRefreshToken(user.id, {
      id: refresh.tokenId,
      expiresAt: refresh.expiresAt,
      rememberMe: payload.rememberMe
    });

    setRefreshCookie(res as never, refresh.token, payload.rememberMe);

    return {
      accessToken,
      user: sanitizeUser(user)
    };
  },
  async login(payload: LoginPayload, res: Response) {
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      throw makeError('Invalid email or password.', StatusCodes.UNAUTHORIZED);
    }

    const validPassword = await bcrypt.compare(payload.password, user.passwordHash);
    if (!validPassword) {
      throw makeError('Invalid email or password.', StatusCodes.UNAUTHORIZED);
    }

    const accessToken = tokenService.createAccessToken(user);
    const refresh = tokenService.createRefreshToken(user, payload.rememberMe);
    await authRepository.saveRefreshToken(user.id, {
      id: refresh.tokenId,
      expiresAt: refresh.expiresAt,
      rememberMe: payload.rememberMe
    });

    setRefreshCookie(res as never, refresh.token, payload.rememberMe);

    return {
      accessToken,
      user: sanitizeUser(user)
    };
  },
  async refresh(refreshToken: string, res: Response) {
    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const user = await authRepository.findById(decoded.sub);
    if (!user) {
      throw makeError('Invalid session.', StatusCodes.UNAUTHORIZED);
    }

    const exists = await authRepository.hasRefreshToken(user.id, decoded.tokenId);
    if (!exists) {
      await authRepository.revokeAllRefreshTokens(user.id);
      clearRefreshCookie(res as never);
      throw makeError('Session expired. Please log in again.', StatusCodes.UNAUTHORIZED);
    }

    await authRepository.revokeRefreshToken(user.id, decoded.tokenId);
    const nextRefresh = tokenService.createRefreshToken(user, Boolean(decoded.rememberMe));
    await authRepository.saveRefreshToken(user.id, {
      id: nextRefresh.tokenId,
      expiresAt: nextRefresh.expiresAt,
      rememberMe: Boolean(decoded.rememberMe)
    });
    setRefreshCookie(res as never, nextRefresh.token, Boolean(decoded.rememberMe));

    return {
      accessToken: tokenService.createAccessToken(user),
      user: sanitizeUser(user)
    };
  },
  async logout(refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      try {
        const decoded = tokenService.verifyRefreshToken(refreshToken);
        await authRepository.revokeRefreshToken(decoded.sub, decoded.tokenId);
      } catch {
        // no-op to avoid leaking session state
      }
    }

    clearRefreshCookie(res as never);
    return { message: 'Logged out successfully.' };
  },
  getAuthenticatedUser(user: AuthUser | null) {
    if (!user) {
      throw makeError('User not found.', StatusCodes.NOT_FOUND);
    }

    return sanitizeUser(user);
  }
};
