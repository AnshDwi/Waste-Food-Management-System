import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';

export const csrController = {
  summary(req: Request, res: Response) {
    return res.json(ok({
      tenantId: req.tenantId,
      company: 'Acme Foods',
      mealsServed: 125400,
      co2SavedKg: 18420,
      wasteReducedKg: 32650,
      reportFormats: ['PDF', 'CSV'],
      reportingPeriod: '2026-Q2'
    }, req.requestId));
  }
};
