import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';

export const botsController = {
  whatsappWebhook(req: Request, res: Response) {
    const message = req.body?.message ?? 'Unknown';
    return res.json(ok({
      provider: 'WHATSAPP',
      receivedMessage: message,
      inferredAction: message.toLowerCase().includes('donate') ? 'CREATE_DONATION_FLOW' : 'TRACK_STATUS_FLOW'
    }, req.requestId));
  }
};
