import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { logisticsService } from './logistics.service.js';

const assignSchema = z.object({
  donationId: z.string(),
  ngoId: z.string().optional(),
  driverId: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'STARTED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'DELAYED'])
});

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const logisticsController = {
  drivers(req: Request, res: Response) {
    return res.json(ok({ drivers: logisticsService.listDrivers() }, req.requestId));
  },
  deliveries(req: Request, res: Response) {
    return res.json(ok({ deliveries: logisticsService.listDeliveries() }, req.requestId));
  },
  assignDriver(req: Request, res: Response) {
    const payload = assignSchema.parse(req.body);
    const delivery = logisticsService.assignDriver({
      ...payload,
      actorId: req.user?.id
    });
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Donation, NGO, or driver not found.' });
    }

    req.app.get('io')?.emit('delivery:assigned', delivery);
    return res.status(201).json(ok({ delivery }, req.requestId));
  },
  updateStatus(req: Request, res: Response) {
    const payload = statusSchema.parse(req.body);
    const delivery = logisticsService.updateDeliveryStatus(String(req.params.id), payload.status, req.user?.id);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery not found.' });
    }

    req.app.get('io')?.emit('delivery:status', delivery);
    return res.json(ok({ delivery }, req.requestId));
  },
  trackLocation(req: Request, res: Response) {
    const payload = locationSchema.parse(req.body);
    const driver = logisticsService.trackDriverLocation(String(req.params.id), payload, req.user?.id);
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found.' });
    }

    req.app.get('io')?.emit('driver:location', driver);
    return res.json(ok({ driver }, req.requestId));
  },
  startTracking(req: Request, res: Response) {
    const delivery = logisticsService.startTracking(String(req.params.id));
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery not found.' });
    }

    req.app.get('io')?.emit('delivery:status', delivery);
    return res.json(ok({ delivery }, req.requestId));
  },
  mapData(req: Request, res: Response) {
    return res.json(ok(logisticsService.mapData(), req.requestId));
  }
};
