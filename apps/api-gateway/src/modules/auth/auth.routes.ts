import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authLoginRateLimit, authSessionRateLimit } from './auth.rate-limit.js';
import { authenticate } from '../../common/middleware/authenticate.js';
import { asyncHandler } from '../../common/middleware/async-handler.js';

export const authRoutes = Router();

authRoutes.post('/register', authLoginRateLimit, asyncHandler(authController.register));
authRoutes.post('/login', authLoginRateLimit, asyncHandler(authController.login));
authRoutes.post('/refresh', authSessionRateLimit, asyncHandler(authController.refresh));
authRoutes.post('/logout', authSessionRateLimit, asyncHandler(authController.logout));
authRoutes.get('/me', authenticate, asyncHandler(authController.me));
authRoutes.get('/google', authController.googleLogin);
