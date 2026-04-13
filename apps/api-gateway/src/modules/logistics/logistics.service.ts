import { randomUUID } from 'node:crypto';
import { platformStore, type Coordinates, type DeliveryRecord, type DonationRecord, type DriverRecord } from '../../data/platform-store.js';
import { auditService } from '../audit/audit.service.js';

type DeliveryStatus = DeliveryRecord['status'];
type SocketEvent = 'delivery:assigned' | 'delivery:status' | 'driver:location' | 'delivery:delay' | 'notification:ngo' | 'delivery:completed';
type PublishFn = ((event: SocketEvent, payload: unknown) => void) | null;

const simulationTimers = new Map<string, NodeJS.Timeout>();
let eventPublisher: PublishFn = null;

const nowIso = () => new Date().toISOString();
const timelineLabel: Record<Exclude<DeliveryStatus, 'PENDING'>, string> = {
  ASSIGNED: 'Assigned',
  STARTED: 'Started',
  PICKED_UP: 'Picked up',
  ON_THE_WAY: 'On the way',
  DELIVERED: 'Delivered',
  DELAYED: 'Delayed'
};

const distanceKm = (from: Coordinates, to: Coordinates) => {
  return Math.sqrt(Math.pow(from.lat - to.lat, 2) + Math.pow(from.lng - to.lng, 2)) * 111;
};

const interpolatePoints = (from: Coordinates, to: Coordinates, steps = 12) => {
  return Array.from({ length: steps + 1 }, (_, index) => ({
    lat: Number((from.lat + ((to.lat - from.lat) * index) / steps).toFixed(6)),
    lng: Number((from.lng + ((to.lng - from.lng) * index) / steps).toFixed(6))
  }));
};

const buildRoute = (driverLocation: Coordinates, donorLocation: Coordinates, ngoLocation: Coordinates) => {
  const legOne = interpolatePoints(driverLocation, donorLocation, 8);
  const legTwo = interpolatePoints(donorLocation, ngoLocation, 12).slice(1);
  const points = [...legOne, ...legTwo];
  const totalDistance = distanceKm(driverLocation, donorLocation) + distanceKm(donorLocation, ngoLocation);

  return {
    distanceKm: Number(totalDistance.toFixed(2)),
    polyline: points.map((point) => `${point.lat},${point.lng}`).join('|'),
    points,
    etaMinutes: Math.max(8, Math.round(totalDistance * 3.2)),
    progressPercent: 0
  };
};

const emit = (event: SocketEvent, payload: unknown) => {
  eventPublisher?.(event, payload);
};

const stopSimulation = (deliveryId: string) => {
  const timer = simulationTimers.get(deliveryId);
  if (timer) {
    clearInterval(timer);
    simulationTimers.delete(deliveryId);
  }
};

const addTimelineEntry = (delivery: DeliveryRecord, status: Exclude<DeliveryStatus, 'PENDING'>, timestamp = nowIso()) => {
  if (delivery.timeline.some((entry) => entry.status === status)) {
    return;
  }

  delivery.timeline.push({
    status,
    label: timelineLabel[status],
    timestamp
  });
};

const recalculateDriverMetrics = (driverId: string) => {
  const driver = platformStore.drivers.find((item) => item.id === driverId);
  if (!driver) {
    return;
  }

  const deliveries = platformStore.deliveries.filter((delivery) => delivery.driverId === driverId);
  const completed = deliveries.filter((delivery) => delivery.status === 'DELIVERED');
  const activeDeliveries = deliveries.filter((delivery) => delivery.status !== 'DELIVERED').length;
  const avgDeliveryMinutes = completed.length
    ? Math.round(completed.reduce((sum, delivery) => sum + delivery.assignment.etaMinutesAtAssignment, 0) / completed.length)
    : 0;
  const completionRate = deliveries.length ? Math.round((completed.length / deliveries.length) * 100) : 0;
  const rating = Number(
    Math.max(
      3.5,
      Math.min(5, 3.8 + completionRate / 100 + (avgDeliveryMinutes ? Math.max(0, 0.7 - avgDeliveryMinutes / 60) : 0.3))
    ).toFixed(1)
  );

  driver.metrics = {
    ...driver.metrics,
    totalAssignments: deliveries.length,
    completedDeliveries: completed.length,
    activeDeliveries,
    avgDeliveryMinutes,
    completionRate,
    rating
  };
};

const eligibleNgo = (donation: DonationRecord, ngoId?: string) => {
  const candidates = [...platformStore.ngos].filter((ngo) => ngo.verified && ngo.activeRequests < ngo.capacity && ngo.capacity - ngo.activeRequests >= donation.quantity);
  if (ngoId) {
    return candidates.find((ngo) => ngo.id === ngoId) ?? null;
  }

  return candidates
    .map((ngo) => {
      const distanceScore = Math.max(0, 100 - distanceKm(donation.location, ngo.location) * 10);
      const capacityScore = Math.min(100, ((ngo.capacity - ngo.activeRequests) / Math.max(donation.quantity, 1)) * 25);
      const loadScore = Math.max(0, 100 - ngo.activeRequests * 14);
      return {
        ngo,
        score: Math.round(distanceScore * 0.45 + capacityScore * 0.35 + loadScore * 0.2)
      };
    })
    .sort((left, right) => right.score - left.score)[0]?.ngo ?? null;
};

const computeDriverScore = (driver: DriverRecord, pickupLocation: Coordinates) => {
  const distanceScore = Math.max(0, 100 - distanceKm(driver.currentLocation, pickupLocation) * 11);
  const availabilityScore = driver.status === 'AVAILABLE' ? 100 : driver.status === 'ASSIGNED' ? 30 : 0;
  const workloadScore = Math.max(0, 100 - driver.metrics.activeDeliveries * 35);
  const reliabilityScore = driver.metrics.rating * 20;

  return Math.round(distanceScore * 0.45 + availabilityScore * 0.2 + workloadScore * 0.2 + reliabilityScore * 0.15);
};

const availableDriver = (pickupLocation: Coordinates, driverId?: string) => {
  const candidates = [...platformStore.drivers].filter((driver) => driver.status === 'AVAILABLE');
  if (driverId) {
    const driver = candidates.find((item) => item.id === driverId) ?? null;
    return driver ? { driver, score: computeDriverScore(driver, pickupLocation) } : null;
  }

  return candidates
    .map((driver) => ({ driver, score: computeDriverScore(driver, pickupLocation) }))
    .sort((left, right) => right.score - left.score)[0] ?? null;
};

const enrichDelivery = (delivery: DeliveryRecord) => {
  const donation = platformStore.donations.find((item) => item.id === delivery.donationId) ?? null;
  const ngo = platformStore.ngos.find((item) => item.id === delivery.ngoId) ?? null;
  const driver = platformStore.drivers.find((item) => item.id === delivery.driverId) ?? null;

  return {
    ...delivery,
    donation,
    ngo,
    driver
  };
};

const findDeliveryGraph = (deliveryId: string) => {
  const delivery = platformStore.deliveries.find((item) => item.id === deliveryId);
  if (!delivery || !delivery.driverId) {
    return null;
  }

  const driver = platformStore.drivers.find((item) => item.id === delivery.driverId);
  const donation = platformStore.donations.find((item) => item.id === delivery.donationId);
  const ngo = platformStore.ngos.find((item) => item.id === delivery.ngoId);

  if (!driver || !donation || !ngo) {
    return null;
  }

  return { delivery, driver, donation, ngo };
};

const setDriverStatus = (deliveryStatus: DeliveryStatus, driverId: string | null) => {
  if (!driverId) {
    return;
  }

  const driver = platformStore.drivers.find((item) => item.id === driverId);
  if (!driver) {
    return;
  }

  if (deliveryStatus === 'ASSIGNED' || deliveryStatus === 'STARTED') {
    driver.status = 'ASSIGNED';
  } else if (deliveryStatus === 'PICKED_UP' || deliveryStatus === 'ON_THE_WAY' || deliveryStatus === 'DELAYED') {
    driver.status = 'DELIVERING';
  } else if (deliveryStatus === 'DELIVERED') {
    driver.status = 'AVAILABLE';
  }

  driver.metrics.activeDeliveries = platformStore.deliveries.filter((item) => item.driverId === driverId && item.status !== 'DELIVERED').length;
};

const syncDonationStatus = (deliveryStatus: DeliveryStatus, donationId: string) => {
  const donation = platformStore.donations.find((item) => item.id === donationId);
  if (!donation) {
    return;
  }

  if (deliveryStatus === 'DELIVERED') {
    donation.status = 'DELIVERED';
  } else if (deliveryStatus === 'PICKED_UP' || deliveryStatus === 'ON_THE_WAY' || deliveryStatus === 'DELAYED') {
    donation.status = 'PICKED_UP';
  } else {
    donation.status = 'ASSIGNED';
  }
};

const maybeRaiseDelay = (deliveryId: string) => {
  const graph = findDeliveryGraph(deliveryId);
  if (!graph) {
    return;
  }

  const { delivery, driver } = graph;
  if (delivery.route.progressPercent >= 65 && delivery.route.etaMinutes > 12 && delivery.status !== 'DELAYED') {
    delivery.status = 'DELAYED';
    addTimelineEntry(delivery, 'DELAYED');
    setDriverStatus('DELAYED', driver.id);
    auditService.record({
      actorId: driver.id,
      action: 'DELIVERY_DELAY_ALERT',
      entityId: delivery.id,
      entityType: 'delivery',
      metadata: {
        etaMinutes: delivery.route.etaMinutes,
        progressPercent: delivery.route.progressPercent
      }
    });
    emit('delivery:delay', enrichDelivery(delivery));
    emit('delivery:status', enrichDelivery(delivery));
  }
};

const finalizeDelivery = (graph: NonNullable<ReturnType<typeof findDeliveryGraph>>) => {
  const { delivery, donation, driver, ngo } = graph;
  delivery.status = 'DELIVERED';
  delivery.route.progressPercent = 100;
  delivery.route.etaMinutes = 0;
  delivery.updatedAt = nowIso();
  addTimelineEntry(delivery, 'DELIVERED');
  donation.status = 'DELIVERED';
  ngo.activeRequests = Math.max(0, ngo.activeRequests - 1);
  stopSimulation(delivery.id);
  setDriverStatus('DELIVERED', driver.id);
  recalculateDriverMetrics(driver.id);
  auditService.record({
    actorId: driver.id,
    action: 'DELIVERY_COMPLETED',
    entityId: delivery.id,
    entityType: 'delivery',
    metadata: {
      durationMinutes: delivery.assignment.etaMinutesAtAssignment
    }
  });
  emit('delivery:status', enrichDelivery(delivery));
  emit('delivery:completed', enrichDelivery(delivery));
};

const advanceDelivery = (deliveryId: string) => {
  const graph = findDeliveryGraph(deliveryId);
  if (!graph) {
    stopSimulation(deliveryId);
    return;
  }

  const { delivery, driver, donation } = graph;
  const points = delivery.route.points;
  const currentIndex = Math.max(0, points.findIndex((point) => point.lat === driver.currentLocation.lat && point.lng === driver.currentLocation.lng));
  const nextIndex = Math.min(points.length - 1, currentIndex + 1);
  const nextPoint = points[nextIndex];
  const pickupIndex = Math.max(1, Math.floor(points.length * 0.35));

  driver.currentLocation = nextPoint;
  delivery.route.progressPercent = Math.round((nextIndex / (points.length - 1)) * 100);
  delivery.route.etaMinutes = Math.max(1, Math.round(((points.length - 1 - nextIndex) / (points.length - 1)) * delivery.assignment.etaMinutesAtAssignment));
  delivery.updatedAt = nowIso();

  if (delivery.status === 'ASSIGNED' && nextIndex > 0) {
    delivery.status = 'STARTED';
    addTimelineEntry(delivery, 'STARTED');
    setDriverStatus('STARTED', driver.id);
    emit('delivery:status', enrichDelivery(delivery));
  }

  if ((delivery.status === 'STARTED' || delivery.status === 'ASSIGNED') && nextIndex >= pickupIndex) {
    delivery.status = 'PICKED_UP';
    donation.status = 'PICKED_UP';
    addTimelineEntry(delivery, 'PICKED_UP');
    setDriverStatus('PICKED_UP', driver.id);
    emit('delivery:status', enrichDelivery(delivery));
    auditService.record({
      actorId: driver.id,
      action: 'DELIVERY_PICKED_UP',
      entityId: delivery.id,
      entityType: 'delivery'
    });
  }

  if ((delivery.status === 'PICKED_UP' || delivery.status === 'DELAYED') && nextIndex > pickupIndex + 1) {
    delivery.status = 'ON_THE_WAY';
    addTimelineEntry(delivery, 'ON_THE_WAY');
    setDriverStatus('ON_THE_WAY', driver.id);
    emit('delivery:status', enrichDelivery(delivery));
  }

  emit('driver:location', { driverId: driver.id, currentLocation: driver.currentLocation, deliveryId: delivery.id });
  maybeRaiseDelay(delivery.id);

  if (nextIndex >= points.length - 1) {
    finalizeDelivery(graph);
  }
};

const startSimulation = (deliveryId: string) => {
  stopSimulation(deliveryId);
  const timer = setInterval(() => advanceDelivery(deliveryId), 3000);
  simulationTimers.set(deliveryId, timer);
};

export const logisticsService = {
  setPublisher(publisher: PublishFn) {
    eventPublisher = publisher;
  },
  listDrivers() {
    return platformStore.drivers.map((driver) => ({
      ...driver,
      workload: driver.metrics.activeDeliveries,
      rating: driver.metrics.rating
    }));
  },
  listDeliveries() {
    return platformStore.deliveries.map(enrichDelivery);
  },
  assignDriver(payload: {
    donationId: string;
    ngoId?: string;
    driverId?: string;
    actorId?: string;
  }) {
    const donation = platformStore.donations.find((item) => item.id === payload.donationId);
    if (!donation) {
      return null;
    }

    const ngo = eligibleNgo(donation, payload.ngoId);
    const driverSelection = availableDriver(donation.location, payload.driverId);
    const driver = driverSelection?.driver ?? null;
    const assignmentScore = driverSelection?.score ?? 0;

    if (!ngo || !driver) {
      return null;
    }

    const existingDelivery = platformStore.deliveries.find((item) => item.donationId === donation.id && item.status !== 'DELIVERED');
    if (existingDelivery) {
      return enrichDelivery(existingDelivery);
    }

    const route = buildRoute(driver.currentLocation, donation.location, ngo.location);
    const assignedAt = nowIso();
    setDriverStatus('ASSIGNED', driver.id);
    donation.status = 'ASSIGNED';
    ngo.activeRequests += 1;
    driver.metrics.lastAssignedAt = assignedAt;

    const delivery: DeliveryRecord = {
      id: randomUUID(),
      donationId: donation.id,
      donorLocation: donation.location,
      ngoId: ngo.id,
      ngoLocation: ngo.location,
      driverId: driver.id,
      status: 'ASSIGNED',
      route,
      assignment: {
        mode: payload.driverId ? 'MANUAL' : 'AI_ASSIGNED',
        score: assignmentScore,
        etaMinutesAtAssignment: route.etaMinutes,
        assignedAt
      },
      timeline: [
        {
          status: 'ASSIGNED',
          label: timelineLabel.ASSIGNED,
          timestamp: assignedAt
        }
      ],
      checkpoints: [
        { label: 'Driver', location: driver.currentLocation },
        { label: 'Pickup', location: donation.location },
        { label: 'Dropoff', location: ngo.location }
      ],
      updatedAt: assignedAt
    };

    platformStore.deliveries.unshift(delivery);
    recalculateDriverMetrics(driver.id);
    auditService.record({
      actorId: payload.actorId ?? driver.id,
      action: 'DELIVERY_ASSIGNED',
      entityId: delivery.id,
      entityType: 'delivery',
      metadata: {
        donationId: donation.id,
        ngoId: ngo.id,
        driverId: driver.id,
        autoAssigned: !payload.driverId,
        score: assignmentScore
      }
    });
    emit('notification:ngo', {
      ngoId: ngo.id,
      message: `Driver ${driver.name} assigned for ${donation.title}. ETA ${route.etaMinutes} min.`
    });
    emit('delivery:assigned', enrichDelivery(delivery));
    startSimulation(delivery.id);
    return enrichDelivery(delivery);
  },
  updateDeliveryStatus(id: string, status: DeliveryStatus, actorId = 'system_admin') {
    const graph = findDeliveryGraph(id);
    if (!graph) {
      return null;
    }

    const { delivery, ngo, driver } = graph;
    delivery.status = status;
    delivery.updatedAt = nowIso();
    if (status !== 'PENDING') {
      addTimelineEntry(delivery, status);
    }
    setDriverStatus(status, delivery.driverId);
    syncDonationStatus(status, delivery.donationId);

    if (status === 'DELIVERED') {
      ngo.activeRequests = Math.max(0, ngo.activeRequests - 1);
      finalizeDelivery(graph);
    } else {
      recalculateDriverMetrics(driver.id);
      startSimulation(delivery.id);
      emit('delivery:status', enrichDelivery(delivery));
    }

    auditService.record({
      actorId,
      action: 'DELIVERY_STATUS_UPDATED',
      entityId: delivery.id,
      entityType: 'delivery',
      metadata: { status }
    });

    return enrichDelivery(delivery);
  },
  trackDriverLocation(id: string, location: Coordinates, actorId = 'system_admin') {
    const driver = platformStore.drivers.find((item) => item.id === id);
    if (!driver) {
      return null;
    }

    driver.currentLocation = location;
    auditService.record({
      actorId,
      action: 'DRIVER_LOCATION_UPDATED',
      entityId: driver.id,
      entityType: 'driver',
      metadata: location
    });
    emit('driver:location', { driverId: driver.id, currentLocation: location });
    return driver;
  },
  startTracking(deliveryId: string) {
    const delivery = platformStore.deliveries.find((item) => item.id === deliveryId);
    if (!delivery) {
      return null;
    }

    startSimulation(delivery.id);
    return enrichDelivery(delivery);
  },
  mapData() {
    const driversInTransit = platformStore.drivers.map((driver) => {
      const linkedDelivery = platformStore.deliveries.find((delivery) => delivery.driverId === driver.id && delivery.status !== 'DELIVERED');
      return {
        id: driver.id,
        name: driver.name,
        status: driver.status,
        vehicleType: driver.vehicleType,
        deliveryId: linkedDelivery?.id ?? null,
        location: driver.currentLocation,
        rating: driver.metrics.rating
      };
    });

    return {
      donors: platformStore.donations.map((donation) => ({
        id: donation.id,
        name: donation.donorName,
        title: donation.title,
        quantity: donation.quantity,
        status: donation.status,
        location: donation.location
      })),
      ngos: platformStore.ngos.map((ngo) => ({
        id: ngo.id,
        name: ngo.name,
        capacity: ngo.capacity,
        status: ngo.verified ? 'VERIFIED' : 'PENDING_VERIFICATION',
        location: ngo.location
      })),
      drivers: driversInTransit,
      deliveries: platformStore.deliveries.map(enrichDelivery)
    };
  }
};
