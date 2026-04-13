import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';
import { platformStore } from '../../data/platform-store.js';

export const gamificationController = {
  leaderboards(req: Request, res: Response) {
    return res.json(ok({
      tenantId: req.tenantId,
      topDonors: platformStore.donations
        .reduce<Array<{ id: string; name: string; score: number; badge: string }>>((acc, donation) => {
          const existing = acc.find((item) => item.id === donation.donorId);
          if (existing) {
            existing.score += donation.quantity;
            return acc;
          }
          acc.push({
            id: donation.donorId,
            name: donation.donorName,
            score: donation.quantity,
            badge: donation.quantity > 100 ? 'Impact Champion' : 'Waste Warrior'
          });
          return acc;
        }, [])
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      topNgos: platformStore.ngos
        .map((ngo) => ({
          id: ngo.id,
          name: ngo.name,
          score: Math.max(100, ngo.capacity - ngo.activeRequests * 8),
          rating: Number((4.2 + Math.max(0, 1 - ngo.activeRequests / Math.max(ngo.capacity, 1))).toFixed(1))
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      topDrivers: platformStore.drivers
        .map((driver) => ({
          id: driver.id,
          name: driver.name,
          score: driver.metrics.completedDeliveries * 100 + Math.round(driver.metrics.rating * 10),
          rating: driver.metrics.rating,
          completionRate: driver.metrics.completionRate
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    }, req.requestId));
  }
};
