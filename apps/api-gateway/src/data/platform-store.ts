import { randomUUID } from 'node:crypto';

export type Coordinates = { lat: number; lng: number };

export type NgoRecord = {
  id: string;
  name: string;
  location: Coordinates;
  capacity: number;
  contact: string;
  activeRequests: number;
  verified: boolean;
  createdAt: string;
};

export type DonationRecord = {
  id: string;
  donorId: string;
  donorName: string;
  title: string;
  quantity: number;
  expiryAt: string;
  location: Coordinates;
  freshnessStatus: 'FRESH' | 'NEAR_EXPIRY' | 'EXPIRED';
  status: 'PENDING_MATCH' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
  batches: Array<{
    foodType: string;
    quantity: number;
    cookedAt: string;
    expiryAt: string;
  }>;
  createdAt: string;
};

export type DriverRecord = {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'DELIVERING';
  currentLocation: Coordinates;
  metrics: {
    totalAssignments: number;
    completedDeliveries: number;
    activeDeliveries: number;
    avgDeliveryMinutes: number;
    completionRate: number;
    rating: number;
    lastAssignedAt?: string;
  };
};

export type DeliveryCheckpoint = {
  label: string;
  location: Coordinates;
};

export type DeliveryRecord = {
  id: string;
  donationId: string;
  donorLocation: Coordinates;
  ngoId: string;
  ngoLocation: Coordinates;
  driverId: string | null;
  status: 'PENDING' | 'ASSIGNED' | 'STARTED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'DELAYED';
  route: {
    distanceKm: number;
    polyline: string;
    points: Coordinates[];
    etaMinutes: number;
    progressPercent: number;
  };
  assignment: {
    mode: 'AI_ASSIGNED' | 'MANUAL';
    score: number;
    etaMinutesAtAssignment: number;
    assignedAt: string;
  };
  timeline: Array<{
    status: 'ASSIGNED' | 'STARTED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'DELAYED';
    label: string;
    timestamp: string;
  }>;
  checkpoints: DeliveryCheckpoint[];
  updatedAt: string;
};

export type AuditLogRecord = {
  id: string;
  actorId: string;
  action: string;
  entityId: string;
  entityType: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

export type FraudSignalRecord = {
  id: string;
  actor: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'ESCALATED' | 'RESOLVED';
};

export type NgoVerificationRecord = {
  id: string;
  ngoId: string;
  ngoName: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED';
};

const nowIso = () => new Date().toISOString();

const hopeKitchenId = randomUUID();
const cityReliefId = randomUUID();
const greenEarthId = randomUUID();
const donationAssignedId = randomUUID();
const donationPendingId = randomUUID();
const driverRaviId = randomUUID();
const driverAyeshaId = randomUUID();
const seededDeliveryId = randomUUID();

export const platformStore = {
  ngoVerifications: [
    {
      id: randomUUID(),
      ngoId: greenEarthId,
      ngoName: 'Green Earth Foundation',
      requestedAt: nowIso(),
      status: 'PENDING'
    }
  ] as NgoVerificationRecord[],
  fraudSignals: [
    {
      id: randomUUID(),
      actor: 'donor_221',
      reason: 'Duplicate image reuse',
      severity: 'HIGH',
      status: 'OPEN'
    },
    {
      id: randomUUID(),
      actor: 'ngo_084',
      reason: 'Acceptance anomaly',
      severity: 'MEDIUM',
      status: 'OPEN'
    }
  ] as FraudSignalRecord[],
  ngos: [
    {
      id: hopeKitchenId,
      name: 'Hope Kitchen',
      location: { lat: 28.6139, lng: 77.209 },
      capacity: 320,
      contact: '+91-9876543201',
      activeRequests: 5,
      verified: true,
      createdAt: nowIso()
    },
    {
      id: cityReliefId,
      name: 'City Relief',
      location: { lat: 28.5355, lng: 77.391 },
      capacity: 240,
      contact: '+91-9876543202',
      activeRequests: 3,
      verified: true,
      createdAt: nowIso()
    },
    {
      id: greenEarthId,
      name: 'Green Earth Foundation',
      location: { lat: 28.5824, lng: 77.3151 },
      capacity: 180,
      contact: '+91-9876543203',
      activeRequests: 1,
      verified: false,
      createdAt: nowIso()
    }
  ] as NgoRecord[],
  donations: [
    {
      id: donationAssignedId,
      donorId: 'seed_donor_1',
      donorName: 'Sunrise Hotel',
      title: 'Prepared meals',
      quantity: 120,
      expiryAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      location: { lat: 28.5708, lng: 77.3272 },
      freshnessStatus: 'NEAR_EXPIRY',
      status: 'ASSIGNED',
      batches: [
        {
          foodType: 'Cooked meals',
          quantity: 120,
          cookedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          expiryAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: nowIso()
    },
    {
      id: donationPendingId,
      donorId: 'seed_donor_2',
      donorName: 'Urban Feast',
      title: 'Bread and curry boxes',
      quantity: 80,
      expiryAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      location: { lat: 28.6029, lng: 77.2842 },
      freshnessStatus: 'FRESH',
      status: 'PENDING_MATCH',
      batches: [
        {
          foodType: 'Meal boxes',
          quantity: 80,
          cookedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          expiryAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: nowIso()
    }
  ] as DonationRecord[],
  drivers: [
    {
      id: driverRaviId,
      name: 'Ravi Kumar',
      phone: '+91-9810011100',
      vehicleType: 'Van',
      status: 'DELIVERING',
      currentLocation: { lat: 28.5665, lng: 77.3152 },
      metrics: {
        totalAssignments: 4,
        completedDeliveries: 3,
        activeDeliveries: 1,
        avgDeliveryMinutes: 21,
        completionRate: 75,
        rating: 4.6,
        lastAssignedAt: nowIso()
      }
    },
    {
      id: driverAyeshaId,
      name: 'Ayesha Khan',
      phone: '+91-9810011101',
      vehicleType: 'Bike',
      status: 'AVAILABLE',
      currentLocation: { lat: 28.6201, lng: 77.3011 },
      metrics: {
        totalAssignments: 2,
        completedDeliveries: 2,
        activeDeliveries: 0,
        avgDeliveryMinutes: 17,
        completionRate: 100,
        rating: 4.9,
        lastAssignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    }
  ] as DriverRecord[],
  deliveries: [
    {
      id: seededDeliveryId,
      donationId: donationAssignedId,
      donorLocation: { lat: 28.5708, lng: 77.3272 },
      ngoId: cityReliefId,
      ngoLocation: { lat: 28.5355, lng: 77.391 },
      driverId: driverRaviId,
      status: 'ON_THE_WAY',
      route: {
        distanceKm: 13.97,
        polyline: '28.5665,77.3152|28.5708,77.3272|28.5355,77.391',
        points: [
          { lat: 28.5665, lng: 77.3152 },
          { lat: 28.5708, lng: 77.3272 },
          { lat: 28.5355, lng: 77.391 }
        ],
        etaMinutes: 24,
        progressPercent: 22
      },
      assignment: {
        mode: 'MANUAL',
        score: 86,
        etaMinutesAtAssignment: 24,
        assignedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      timeline: [
        {
          status: 'ASSIGNED',
          label: 'Assigned',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        {
          status: 'STARTED',
          label: 'Started',
          timestamp: new Date(Date.now() - 37 * 60 * 1000).toISOString()
        },
        {
          status: 'PICKED_UP',
          label: 'Picked up',
          timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString()
        },
        {
          status: 'ON_THE_WAY',
          label: 'On the way',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString()
        }
      ],
      checkpoints: [
        { label: 'Driver origin', location: { lat: 28.5665, lng: 77.3152 } },
        { label: 'Pickup', location: { lat: 28.5708, lng: 77.3272 } },
        { label: 'Dropoff', location: { lat: 28.5355, lng: 77.391 } }
      ],
      updatedAt: nowIso()
    }
  ] as DeliveryRecord[],
  auditLogs: [
    {
      id: randomUUID(),
      actorId: 'seed_admin',
      action: 'DELIVERY_ASSIGNED',
      entityId: seededDeliveryId,
      entityType: 'delivery',
      metadata: {
        donationId: donationAssignedId,
        driverId: driverRaviId,
        ngoId: cityReliefId
      },
      timestamp: nowIso()
    }
  ] as AuditLogRecord[]
};
