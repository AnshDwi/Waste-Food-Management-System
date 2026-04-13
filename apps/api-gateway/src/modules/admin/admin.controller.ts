import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';
import { platformStore } from '../../data/platform-store.js';
import { auditService } from '../audit/audit.service.js';

const toCsv = (rows: Array<Record<string, unknown>>) => {
  if (rows.length === 0) {
    return 'section,empty\n';
  }

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')).join('\n');
  return `${headers.join(',')}\n${body}`;
};

export const adminController = {
  overview(req: Request, res: Response) {
    const pendingNgo = platformStore.ngoVerifications.filter((item) => item.status === 'PENDING');
    const flagged = platformStore.fraudSignals.filter((item) => item.status !== 'RESOLVED');
    const failedDeliveriesToday = platformStore.deliveries.filter((item) => item.status !== 'DELIVERED').length;

    return res.json(ok({
      pendingNgoVerifications: pendingNgo.length,
      flaggedAccounts: flagged.length,
      failedDeliveriesToday,
      fraudSignals: flagged,
      ngoVerificationQueue: pendingNgo
    }, req.requestId));
  },
  approveNgoVerification(req: Request, res: Response) {
    const verification = platformStore.ngoVerifications.find((item) => item.status === 'PENDING');
    if (!verification) {
      return res.status(404).json({ success: false, error: 'No pending NGO verification found.' });
    }

    verification.status = 'APPROVED';
    const ngo = platformStore.ngos.find((item) => item.id === verification.ngoId);
    if (ngo) {
      ngo.verified = true;
    }

    auditService.record({
      actorId: req.user?.id ?? 'system_admin',
      action: 'NGO_VERIFICATION_APPROVED',
      entityId: verification.ngoId,
      entityType: 'ngo',
      metadata: { verificationId: verification.id }
    });

    return res.json(ok({ verification, ngo }, req.requestId));
  },
  escalateFraudSignal(req: Request, res: Response) {
    const signal = platformStore.fraudSignals.find((item) => item.status === 'OPEN');
    if (!signal) {
      return res.status(404).json({ success: false, error: 'No open fraud signal found.' });
    }

    signal.status = 'ESCALATED';
    auditService.record({
      actorId: req.user?.id ?? 'system_admin',
      action: 'FRAUD_SIGNAL_ESCALATED',
      entityId: signal.id,
      entityType: 'fraud_signal',
      metadata: { actor: signal.actor, severity: signal.severity }
    });

    return res.json(ok({ signal }, req.requestId));
  },
  exportComplianceReport(req: Request, res: Response) {
    const reportRows = [
      ...platformStore.auditLogs.map((log) => ({
        section: 'audit',
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        timestamp: log.timestamp
      })),
      ...platformStore.deliveries.map((delivery) => ({
        section: 'delivery',
        id: delivery.id,
        action: delivery.status,
        entityType: 'delivery',
        entityId: delivery.donationId,
        timestamp: delivery.updatedAt
      }))
    ];

    auditService.record({
      actorId: req.user?.id ?? 'system_admin',
      action: 'COMPLIANCE_REPORT_EXPORTED',
      entityId: 'compliance_report',
      entityType: 'report'
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="compliance-report-${Date.now()}.csv"`);
    return res.send(toCsv(reportRows));
  }
};
