import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';

export const tenantsController = {
  current(req: Request, res: Response) {
    return res.json(ok({
      tenantId: req.tenantId,
      name: 'Metro Relief Network',
      tier: 'enterprise',
      featureFlags: ['quality-ai', 'csr-reports', 'warehouses', 'whatsapp-bot']
    }, req.requestId));
  }
};
