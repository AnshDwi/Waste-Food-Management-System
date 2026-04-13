import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { matchingService } from './matching.service.js';

const matchSchema = z.object({
  quantity: z.number().positive(),
  minutesToExpiry: z.number().int().positive(),
  candidates: z.array(z.object({
    id: z.string(),
    capacity: z.number().int().positive(),
    distanceKm: z.number().nonnegative(),
    acceptsFoodType: z.boolean()
  })).min(1)
});

export const matchingController = {
  recommend(req: Request, res: Response) {
    const payload = matchSchema.parse(req.body);
    const recommendations = matchingService.recommend(payload);
    return res.json(ok({ recommendations }, req.requestId));
  }
};
