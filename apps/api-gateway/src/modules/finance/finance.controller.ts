import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';

export const financeController = {
  createDonation(req: Request, res: Response) {
    return res.status(201).json(ok({
      paymentId: 'pay_1',
      gateway: 'STRIPE',
      amount: req.body.amount ?? 0,
      currency: req.body.currency ?? 'INR',
      status: 'PENDING_CONFIRMATION'
    }, req.requestId));
  }
};
