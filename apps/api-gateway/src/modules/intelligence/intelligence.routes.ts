import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { tenantContext } from '../../common/middleware/tenant-context.js';
import { intelligenceController } from './intelligence.controller.js';

export const intelligenceRoutes = Router();

intelligenceRoutes.use(authenticate, tenantContext);
intelligenceRoutes.post('/match-score', intelligenceController.scoreMatch);
intelligenceRoutes.post('/demand-forecast', intelligenceController.demandForecast);
intelligenceRoutes.post('/food-quality', intelligenceController.foodQuality);
intelligenceRoutes.post('/heatmaps', intelligenceController.heatmaps);
intelligenceRoutes.get('/control-room', intelligenceController.controlRoom);
intelligenceRoutes.get('/digital-twin', intelligenceController.digitalTwin);
intelligenceRoutes.get('/predictive-failures', intelligenceController.predictiveFailures);
intelligenceRoutes.get('/global-optimization', intelligenceController.globalOptimization);
intelligenceRoutes.get('/assistant', intelligenceController.assistant);
intelligenceRoutes.get('/impact', intelligenceController.impact);
