import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { logisticsController } from './logistics.controller.js';

export const logisticsRoutes = Router();

logisticsRoutes.use(authenticate);
logisticsRoutes.get('/drivers', logisticsController.drivers);
logisticsRoutes.get('/deliveries', logisticsController.deliveries);
logisticsRoutes.get('/map-data', logisticsController.mapData);
logisticsRoutes.post('/assign-driver', authorize(['delivery:update']), logisticsController.assignDriver);
logisticsRoutes.patch('/deliveries/:id/status', authorize(['delivery:update']), logisticsController.updateStatus);
logisticsRoutes.post('/deliveries/:id/start-tracking', authorize(['delivery:update']), logisticsController.startTracking);
logisticsRoutes.patch('/drivers/:id/location', authorize(['delivery:update']), logisticsController.trackLocation);
