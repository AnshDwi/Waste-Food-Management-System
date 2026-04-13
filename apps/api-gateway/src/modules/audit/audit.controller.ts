import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';
import { auditService } from './audit.service.js';

export const auditController = {
  list(req: Request, res: Response) {
    return res.json(ok({ logs: auditService.list() }, req.requestId));
  }
};
