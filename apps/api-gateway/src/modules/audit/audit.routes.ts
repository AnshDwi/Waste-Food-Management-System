import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { auditController } from './audit.controller.js';

export const auditRoutes = Router();

auditRoutes.use(authenticate, authorize(['audit:read']));
auditRoutes.get('/', auditController.list);
