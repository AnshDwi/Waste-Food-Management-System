import { randomUUID } from 'node:crypto';
import { platformStore } from '../../data/platform-store.js';
import type { DonationRecord } from '../../data/platform-store.js';
import { auditService } from '../audit/audit.service.js';
import { logisticsService } from '../logistics/logistics.service.js';

type DonationBatch = {
  foodType: string;
  quantity: number;
  cookedAt: string;
  expiryAt: string;
};

export const donationService = {
  create(payload: {
    donorId: string;
    donorName?: string;
    title: string;
    quantity: number;
    expiryAt: string;
    location: { lat: number; lng: number };
    batches: DonationBatch[];
  }) {
    const now = Date.now();
    const expiry = new Date(payload.expiryAt).getTime();
    const freshnessStatus: DonationRecord['freshnessStatus'] = expiry <= now ? 'EXPIRED' : expiry - now < 2 * 60 * 60 * 1000 ? 'NEAR_EXPIRY' : 'FRESH';

    const donation: DonationRecord = {
      id: randomUUID(),
      title: payload.title,
      quantity: payload.quantity,
      donorId: payload.donorId,
      donorName: payload.donorName ?? 'Authenticated Donor',
      expiryAt: payload.expiryAt,
      location: payload.location,
      status: 'PENDING_MATCH',
      freshnessStatus,
      createdAt: new Date().toISOString(),
      batches: [...payload.batches].sort((a, b) => +new Date(a.expiryAt) - +new Date(b.expiryAt))
    };

    platformStore.donations.unshift(donation);
    auditService.record({
      actorId: payload.donorId,
      action: 'DONATION_CREATED',
      entityId: donation.id,
      entityType: 'donation',
      metadata: {
        title: donation.title,
        quantity: donation.quantity
      }
    });

    const autoDelivery = logisticsService.assignDriver({
      donationId: donation.id,
      actorId: payload.donorId
    });

    return {
      ...donation,
      autoDelivery,
      aiAssignedDriver: autoDelivery?.driver
        ? {
            id: autoDelivery.driver.id,
            name: autoDelivery.driver.name,
            score: autoDelivery.assignment.score
          }
        : null
    };
  },
  list() {
    return platformStore.donations;
  }
};
