import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { fraudService } from './fraud.service.js';

const schema = z.object({
  repeatedImages: z.number().int().nonnegative(),
  requestVelocity: z.number().nonnegative(),
  failedHandOffs: z.number().int().nonnegative(),
  geoMismatchKm: z.number().nonnegative()
});

export const fraudController = {
  evaluate(req: Request, res: Response) {
    const payload = schema.parse(req.body);
    return res.json(ok(fraudService.evaluate(payload), req.requestId));
  }
};
