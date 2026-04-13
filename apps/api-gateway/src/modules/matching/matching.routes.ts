import { Router } from 'express';
import { matchingController } from './matching.controller.js';
import { authenticate } from '../../common/middleware/authenticate.js';

export const matchingRoutes = Router();

matchingRoutes.use(authenticate);
matchingRoutes.post('/recommendations', matchingController.recommend);
