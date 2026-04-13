import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { tenantContext } from '../../common/middleware/tenant-context.js';
import { tenantsController } from './tenants.controller.js';

export const tenantsRoutes = Router();

tenantsRoutes.use(authenticate, tenantContext);
tenantsRoutes.get('/current', tenantsController.current);
