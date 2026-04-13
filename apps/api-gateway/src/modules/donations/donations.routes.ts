import { Router } from 'express';
import { donationsController } from './donations.controller.js';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';

export const donationsRoutes = Router();

donationsRoutes.use(authenticate);
donationsRoutes.post('/', authorize(['donation:create']), donationsController.create);
donationsRoutes.get('/', authorize(['donation:read']), donationsController.list);
