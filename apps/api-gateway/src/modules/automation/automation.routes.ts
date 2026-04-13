import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { tenantContext } from '../../common/middleware/tenant-context.js';
import { automationController } from './automation.controller.js';

export const automationRoutes = Router();

automationRoutes.use(authenticate, tenantContext);
automationRoutes.post('/reassign', automationController.reassign);
