import { Request, Response } from 'express';
import { ok } from '../../common/utils/response.js';
import { platformStore } from '../../data/platform-store.js';

const mealsServed = () => platformStore.donations.reduce((sum, donation) => sum + donation.quantity, 0);
const deliveredDeliveries = () => platformStore.deliveries.filter((item) => item.status === 'DELIVERED');
const activeDeliveries = () => platformStore.deliveries.filter((item) => item.status !== 'DELIVERED');
const avgDeliveryTimeMinutes = () => {
  const delivered = deliveredDeliveries();
  if (delivered.length === 0) {
    return 0;
  }

  return Math.round(delivered.reduce((sum, delivery) => sum + (delivery.route.distanceKm * 3.2), 0) / delivered.length);
};

export const analyticsController = {
  summary(req: Request, res: Response) {
    const delivered = deliveredDeliveries().length;
    const totalDeliveries = platformStore.deliveries.length;
    const active = platformStore.donations.filter((item) => item.status !== 'DELIVERED').length;
    const expiredFood = platformStore.donations.filter((item) => item.freshnessStatus === 'EXPIRED').reduce((sum, donation) => sum + donation.quantity, 0);
    const driverPerformance = platformStore.drivers.map((driver) => ({
      driverId: driver.id,
      name: driver.name,
      completed: driver.metrics.completedDeliveries,
      active: driver.metrics.activeDeliveries,
      completionRate: driver.metrics.completionRate,
      avgDeliveryMinutes: driver.metrics.avgDeliveryMinutes,
      rating: driver.metrics.rating
    }));
    const ngoEfficiency = platformStore.ngos.map((ngo) => ({
      ngoId: ngo.id,
      name: ngo.name,
      activeRequests: ngo.activeRequests,
      utilizationPercent: Math.min(100, Math.round((ngo.activeRequests / Math.max(ngo.capacity, 1)) * 100))
    }));

    return res.json(ok({
      totalFoodSavedKg: platformStore.donations.reduce((sum, donation) => sum + donation.quantity, 0),
      mealsServed: mealsServed(),
      wasteReductionPercent: 41.2,
      activeNgos: platformStore.ngos.length,
      activeDonations: active,
      totalDeliveries,
      completedDeliveries: delivered,
      successfulDeliveries: delivered,
      successRate: totalDeliveries ? Math.round((delivered / totalDeliveries) * 100) : 0,
      availableDrivers: platformStore.drivers.filter((driver) => driver.status === 'AVAILABLE').length,
      activeDeliveries: activeDeliveries().length,
      avgDeliveryTimeMinutes: avgDeliveryTimeMinutes(),
      expiredFoodKg: expiredFood,
      deliveredFoodKg: deliveredDeliveries().reduce((sum, delivery) => {
        const donation = platformStore.donations.find((item) => item.id === delivery.donationId);
        return sum + (donation?.quantity ?? 0);
      }, 0),
      driverPerformance,
      ngoEfficiency
    }, req.requestId));
  },
  trends(req: Request, res: Response) {
    const trend = platformStore.donations.map((donation, index) => {
      const delivery = platformStore.deliveries.find((item) => item.donationId === donation.id);
      return {
        label: `Batch ${index + 1}`,
        meals: donation.quantity,
        deliveries: platformStore.deliveries.filter((item) => item.donationId === donation.id).length,
        avgDeliveryTime: delivery ? Math.round(delivery.assignment.etaMinutesAtAssignment) : 0
      };
    });

    const distribution = [
      { name: 'Delivered', value: platformStore.donations.filter((item) => item.status === 'DELIVERED').length },
      { name: 'Assigned', value: platformStore.donations.filter((item) => item.status === 'ASSIGNED').length },
      { name: 'Picked Up', value: platformStore.donations.filter((item) => item.status === 'PICKED_UP').length },
      { name: 'Pending', value: platformStore.donations.filter((item) => item.status === 'PENDING_MATCH').length }
    ];

    const heatmap = platformStore.donations.map((donation) => ({
      id: donation.id,
      lat: donation.location.lat,
      lng: donation.location.lng,
      supply: donation.quantity,
      demand: Math.max(20, Math.round(donation.quantity * 0.8))
    }));

    const deliveriesPerDay = trend.map((point) => ({
      label: point.label,
      completed: platformStore.deliveries.filter((delivery) => delivery.donationId === platformStore.donations[trend.indexOf(point)]?.id && delivery.status === 'DELIVERED').length,
      assigned: point.deliveries
    }));

    return res.json(ok({ trend, distribution, heatmap, deliveriesPerDay }, req.requestId));
  }
};
