import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-too',
  refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'wfm_refresh',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? '7d',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/waste-food',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
};
