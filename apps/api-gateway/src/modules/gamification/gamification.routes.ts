import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { tenantContext } from '../../common/middleware/tenant-context.js';
import { gamificationController } from './gamification.controller.js';

export const gamificationRoutes = Router();

gamificationRoutes.use(authenticate, tenantContext);
gamificationRoutes.get('/leaderboards', gamificationController.leaderboards);
