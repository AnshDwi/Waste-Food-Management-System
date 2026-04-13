import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { ngosController } from './ngos.controller.js';

export const ngosRoutes = Router();

ngosRoutes.use(authenticate);
ngosRoutes.get('/', ngosController.list);
ngosRoutes.post('/', authorize(['admin:write']), ngosController.create);
ngosRoutes.put('/:id', authorize(['admin:write']), ngosController.update);
ngosRoutes.delete('/:id', authorize(['admin:write']), ngosController.remove);
