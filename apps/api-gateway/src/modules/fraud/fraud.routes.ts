import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { fraudController } from './fraud.controller.js';

export const fraudRoutes = Router();

fraudRoutes.use(authenticate, authorize(['admin:read']));
fraudRoutes.post('/evaluate', fraudController.evaluate);
