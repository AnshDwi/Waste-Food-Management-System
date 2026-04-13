import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.js';

const authLimitMessage = {
  success: false,
  error: 'Too many authentication attempts, please try again shortly.'
};

const sessionLimitMessage = {
  success: false,
  error: 'Too many session requests, please wait a moment and retry.'
};

export const authLoginRateLimit = rateLimit({
  windowMs: env.nodeEnv === 'development' ? 60 * 1000 : 15 * 60 * 1000,
  limit: env.nodeEnv === 'development' ? 50 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: authLimitMessage
});

export const authSessionRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: env.nodeEnv === 'development' ? 120 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: sessionLimitMessage
});
