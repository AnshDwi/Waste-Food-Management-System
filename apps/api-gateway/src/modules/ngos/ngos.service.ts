import { randomUUID } from 'node:crypto';
import { platformStore } from '../../data/platform-store.js';
import { auditService } from '../audit/audit.service.js';

export const ngosService = {
  list() {
    return platformStore.ngos;
  },
  create(payload: {
    name: string;
    location: { lat: number; lng: number };
    capacity: number;
    contact: string;
  }) {
    const ngo = {
      id: randomUUID(),
      activeRequests: 0,
      verified: false,
      createdAt: new Date().toISOString(),
      ...payload
    };
    platformStore.ngos.push(ngo);
    platformStore.ngoVerifications.unshift({
      id: randomUUID(),
      ngoId: ngo.id,
      ngoName: ngo.name,
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    });
    auditService.record({
      actorId: 'system_admin',
      action: 'NGO_CREATED',
      entityId: ngo.id,
      entityType: 'ngo',
      metadata: { name: ngo.name }
    });
    return ngo;
  },
  update(id: string, payload: {
    name: string;
    location: { lat: number; lng: number };
    capacity: number;
    contact: string;
  }) {
    const index = platformStore.ngos.findIndex((ngo) => ngo.id === id);
    if (index === -1) {
      return null;
    }

    const next = { ...platformStore.ngos[index], ...payload };
    platformStore.ngos[index] = next;
    auditService.record({
      actorId: 'system_admin',
      action: 'NGO_UPDATED',
      entityId: next.id,
      entityType: 'ngo',
      metadata: { name: next.name }
    });
    return next;
  },
  remove(id: string) {
    const index = platformStore.ngos.findIndex((ngo) => ngo.id === id);
    if (index === -1) {
      return false;
    }

    platformStore.ngos.splice(index, 1);
    auditService.record({
      actorId: 'system_admin',
      action: 'NGO_REMOVED',
      entityId: id,
      entityType: 'ngo'
    });
    return true;
  }
};
