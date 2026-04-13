import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { tenantContext } from '../../common/middleware/tenant-context.js';
import { authorize } from '../../common/middleware/authorize.js';
import { warehousesController } from './warehouses.controller.js';

export const warehousesRoutes = Router();

warehousesRoutes.use(authenticate, tenantContext);
warehousesRoutes.post('/', authorize(['admin:write']), warehousesController.create);
warehousesRoutes.post('/movements', authorize(['delivery:update']), warehousesController.moveBatch);
