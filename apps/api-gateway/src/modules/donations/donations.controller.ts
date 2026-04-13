import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { donationService } from './donation.service.js';

const donationSchema = z.object({
  title: z.string().min(3),
  quantity: z.number().int().positive(),
  expiryAt: z.string().datetime(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  batches: z.array(z.object({
    foodType: z.string(),
    quantity: z.number().int().positive(),
    cookedAt: z.string().datetime(),
    expiryAt: z.string().datetime()
  })).min(1)
});

export const donationsController = {
  create(req: Request, res: Response) {
    const payload = donationSchema.parse(req.body);
    const donation = donationService.create({
      donorId: req.user?.id ?? 'usr_demo_1',
      donorName: req.user?.name ?? 'Authenticated Donor',
      ...payload
    });

    return res.status(201).json(ok(donation, req.requestId));
  },
  list(req: Request, res: Response) {
    return res.json(ok({ donations: donationService.list() }, req.requestId));
  }
};
