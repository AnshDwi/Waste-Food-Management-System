import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { env } from '../../config/env.js';
import { authService } from './auth.service.js';
import { authRepository } from './auth.repository.js';

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(10).max(128),
  role: z.enum(['DONOR', 'NGO', 'VOLUNTEER']),
  rememberMe: z.boolean().optional().default(false)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128),
  rememberMe: z.boolean().optional().default(false)
});

export const authController = {
  async register(req: Request, res: Response) {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload, res);
    return res.status(201).json(ok(result, req.requestId));
  },
  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload, res);
    return res.json(ok(result, req.requestId));
  },
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[env.refreshCookieName];
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }

    const result = await authService.refresh(refreshToken, res);
    return res.json(ok(result, req.requestId));
  },
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[env.refreshCookieName];
    const result = await authService.logout(refreshToken, res);
    return res.json(ok(result, req.requestId));
  },
  async me(req: Request, res: Response) {
    const user = req.user ? await authRepository.findById(req.user.id) : null;
    const result = authService.getAuthenticatedUser(user);
    return res.json(ok({ user: result }, req.requestId));
  },
  googleLogin(_req: Request, res: Response) {
    return res.json(ok({
      provider: 'google',
      clientId: env.googleClientId,
      message: 'Wire Google OAuth consent flow and callback in production.'
    }, 'oauth_google'));
  }
};
