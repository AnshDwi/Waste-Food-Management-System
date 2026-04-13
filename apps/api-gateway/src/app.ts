import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRateLimit } from './common/middleware/rate-limit.js';
import { requestContext } from './common/middleware/request-context.js';
import { errorHandler } from './common/middleware/error-handler.js';
import { sanitizeInput } from './common/middleware/sanitize.js';
import { router } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan('combined'));
  app.use(requestContext);
  app.use(sanitizeInput);
  app.use(apiRateLimit);

  app.get('/health', (_req, res) => {
    res.json({ success: true, service: 'api-gateway', timestamp: new Date().toISOString() });
  });

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'api-gateway',
      message: 'api gateway is running',
      health: '/health',
      api: '/api/v1'
    });
  });

  app.use('/api/v1', router);
  app.use(errorHandler);

  return app;
};
