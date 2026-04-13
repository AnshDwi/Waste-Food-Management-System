import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { automationService } from './automation.service.js';

const schema = z.object({
  donationId: z.string(),
  previousNgoId: z.string(),
  elapsedMinutes: z.number().int().nonnegative(),
  recommendations: z.array(z.object({
    ngoId: z.string(),
    totalScore: z.number()
  })).min(1)
});

export const automationController = {
  reassign(req: Request, res: Response) {
    const payload = schema.parse(req.body);
    return res.json(ok(automationService.reassign(payload), req.requestId));
  }
};
