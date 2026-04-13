import { randomUUID } from 'node:crypto';
import { platformStore } from '../../data/platform-store.js';

export const auditService = {
  list() {
    return [...platformStore.auditLogs].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  },
  record(input: {
    actorId: string;
    action: string;
    entityId: string;
    entityType: string;
    metadata?: Record<string, unknown>;
  }) {
    const log = {
      id: randomUUID(),
      actorId: input.actorId,
      action: input.action,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata: input.metadata,
      timestamp: new Date().toISOString()
    };

    platformStore.auditLogs.unshift(log);
    return log;
  }
};
