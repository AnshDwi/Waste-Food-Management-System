import { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../common/utils/response.js';
import { intelligenceService } from './intelligence.service.js';

const matchSchema = z.object({
  expiryMinutes: z.number().int().positive(),
  quantity: z.number().positive(),
  candidates: z.array(z.object({
    id: z.string(),
    distanceKm: z.number().nonnegative(),
    avgResponseMinutes: z.number().nonnegative(),
    acceptanceRate: z.number().min(0).max(1)
  })).min(1)
});

const demandSchema = z.object({
  zoneId: z.string(),
  historicalDemand: z.array(z.number()).min(1),
  activeEvents: z.number().int().nonnegative()
});

const qualitySchema = z.object({
  freshnessSignals: z.object({
    temperatureC: z.number(),
    hoursSinceCooked: z.number().nonnegative(),
    imageConfidence: z.number().min(0).max(1).optional()
  })
});

const heatmapSchema = z.object({
  wasteZones: z.array(z.object({ zoneId: z.string(), volume: z.number().nonnegative() })),
  demandZones: z.array(z.object({ zoneId: z.string(), demand: z.number().nonnegative() }))
});

export const intelligenceController = {
  scoreMatch(req: Request, res: Response) {
    const payload = matchSchema.parse(req.body);
    return res.json(ok({ recommendations: intelligenceService.rankNgos(payload), tenantId: req.tenantId }, req.requestId));
  },
  demandForecast(req: Request, res: Response) {
    const payload = demandSchema.parse(req.body);
    return res.json(ok(intelligenceService.forecastDemand(payload), req.requestId));
  },
  foodQuality(req: Request, res: Response) {
    const payload = qualitySchema.parse(req.body);
    return res.json(ok(intelligenceService.assessFoodQuality(payload), req.requestId));
  },
  heatmaps(req: Request, res: Response) {
    const payload = heatmapSchema.parse(req.body);
    return res.json(ok(intelligenceService.buildHeatmap(payload), req.requestId));
  },
  controlRoom(req: Request, res: Response) {
    return res.json(ok(intelligenceService.controlRoom(), req.requestId));
  },
  digitalTwin(req: Request, res: Response) {
    return res.json(ok(intelligenceService.digitalTwin(), req.requestId));
  },
  predictiveFailures(req: Request, res: Response) {
    return res.json(ok(intelligenceService.predictiveFailures(), req.requestId));
  },
  globalOptimization(req: Request, res: Response) {
    return res.json(ok(intelligenceService.globalOptimization(), req.requestId));
  },
  assistant(req: Request, res: Response) {
    return res.json(ok(intelligenceService.assistant(), req.requestId));
  },
  impact(req: Request, res: Response) {
    return res.json(ok(intelligenceService.impact(), req.requestId));
  }
};
