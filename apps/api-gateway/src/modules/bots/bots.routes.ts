import { Router } from 'express';
import { botsController } from './bots.controller.js';

export const botsRoutes = Router();

botsRoutes.post('/whatsapp/webhook', botsController.whatsappWebhook);
