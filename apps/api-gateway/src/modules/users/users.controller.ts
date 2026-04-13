import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';

export const usersController = {
  me(req: Request, res: Response) {
    return res.json(ok({ user: req.user }, req.requestId));
  },
  list(req: Request, res: Response) {
    return res.json(ok({
      users: [
        { id: 'usr_1', role: 'DONOR', email: 'donor@example.com', status: 'ACTIVE' },
        { id: 'usr_2', role: 'NGO', email: 'ngo@example.com', status: 'VERIFIED' }
      ]
    }, req.requestId));
  }
};
