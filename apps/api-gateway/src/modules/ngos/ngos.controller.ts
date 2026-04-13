import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { ngosService } from './ngos.service.js';

const ngoSchema = z.object({
  name: z.string().min(2),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  capacity: z.number().int().positive(),
  contact: z.string().min(8)
});

export const ngosController = {
  list(req: Request, res: Response) {
    return res.json(ok({ ngos: ngosService.list() }, req.requestId));
  },
  create(req: Request, res: Response) {
    const payload = ngoSchema.parse(req.body);
    const ngo = ngosService.create(payload);
    return res.status(201).json(ok({ ngo }, req.requestId));
  },
  update(req: Request, res: Response) {
    const payload = ngoSchema.parse(req.body);
    const ngo = ngosService.update(String(req.params.id), payload);
    if (!ngo) {
      return res.status(404).json({ success: false, error: 'NGO not found' });
    }

    return res.json(ok({ ngo }, req.requestId));
  },
  remove(req: Request, res: Response) {
    const removed = ngosService.remove(String(req.params.id));
    if (!removed) {
      return res.status(404).json({ success: false, error: 'NGO not found' });
    }

    return res.json(ok({ removed: true }, req.requestId));
  }
};
