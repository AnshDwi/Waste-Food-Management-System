import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';

const warehouseSchema = z.object({
  name: z.string().min(2),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  coldStorageCapacity: z.number().int().positive()
});

const movementSchema = z.object({
  batchId: z.string(),
  fromNode: z.string(),
  toNode: z.string(),
  movementType: z.enum(['DONOR_TO_WAREHOUSE', 'WAREHOUSE_TO_NGO', 'WAREHOUSE_INTERNAL'])
});

export const warehousesController = {
  create(req: Request, res: Response) {
    const payload = warehouseSchema.parse(req.body);
    return res.status(201).json(ok({
      id: 'wh_1',
      tenantId: req.tenantId,
      status: 'ACTIVE',
      ...payload
    }, req.requestId));
  },
  moveBatch(req: Request, res: Response) {
    const payload = movementSchema.parse(req.body);
    return res.status(201).json(ok({
      movementId: 'mov_1',
      tenantId: req.tenantId,
      movedAt: new Date().toISOString(),
      ...payload
    }, req.requestId));
  }
};
