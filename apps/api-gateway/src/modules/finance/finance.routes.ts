import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { financeController } from './finance.controller.js';

export const financeRoutes = Router();

financeRoutes.use(authenticate);
financeRoutes.post('/donations', financeController.createDonation);
