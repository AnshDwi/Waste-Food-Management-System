import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';

export const usersRoutes = Router();

usersRoutes.use(authenticate);
usersRoutes.get('/me', usersController.me);
usersRoutes.get('/', authorize(['user:read']), usersController.list);
