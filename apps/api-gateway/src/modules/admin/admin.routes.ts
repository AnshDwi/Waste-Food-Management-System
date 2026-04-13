import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { adminController } from './admin.controller.js';

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize(['admin:read']));
adminRoutes.get('/overview', adminController.overview);
adminRoutes.post('/ngo-verifications/approve', adminController.approveNgoVerification);
adminRoutes.post('/fraud/escalate', adminController.escalateFraudSignal);
adminRoutes.get('/compliance-report', adminController.exportComplianceReport);
