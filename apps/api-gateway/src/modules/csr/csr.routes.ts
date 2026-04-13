import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { tenantContext } from '../../common/middleware/tenant-context.js';
import { csrController } from './csr.controller.js';

export const csrRoutes = Router();

csrRoutes.use(authenticate, tenantContext);
csrRoutes.get('/reports/summary', csrController.summary);
