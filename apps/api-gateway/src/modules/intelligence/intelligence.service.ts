import { platformStore, type Coordinates } from '../../data/platform-store.js';

type NgoCandidate = {
  id: string;
  distanceKm: number;
  avgResponseMinutes: number;
  acceptanceRate: number;
};

const distanceKm = (from: Coordinates, to: Coordinates) => {
  return Math.sqrt(Math.pow(from.lat - to.lat, 2) + Math.pow(from.lng - to.lng, 2)) * 111;
};

const delivered = () => platformStore.deliveries.filter((item) => item.status === 'DELIVERED');
const activeDeliveries = () => platformStore.deliveries.filter((item) => item.status !== 'DELIVERED');

export const intelligenceService = {
  rankNgos(input: {
    expiryMinutes: number;
    quantity: number;
    candidates: NgoCandidate[];
  }) {
    return input.candidates
      .map((candidate) => {
        const distanceScore = Math.max(0, 1 - candidate.distanceKm / 30);
        const responseScore = Math.max(0, 1 - candidate.avgResponseMinutes / 60);
        const urgencyScore = Math.max(0, 1 - input.expiryMinutes / 720);
        const acceptanceScore = candidate.acceptanceRate;
        const totalScore = Number((
          distanceScore * 0.3 +
          responseScore * 0.2 +
          urgencyScore * 0.3 +
          acceptanceScore * 0.2
        ).toFixed(4));

        return {
          ngoId: candidate.id,
          totalScore,
          featureContribution: {
            distanceScore,
            responseScore,
            urgencyScore,
            acceptanceScore
          }
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  },
  forecastDemand(input: {
    zoneId: string;
    historicalDemand: number[];
    activeEvents: number;
  }) {
    const average = input.historicalDemand.reduce((sum, value) => sum + value, 0) / Math.max(input.historicalDemand.length, 1);
    const spikeFactor = 1 + input.activeEvents * 0.05;
    const predictedDemand = Number((average * spikeFactor).toFixed(2));

    return {
      zoneId: input.zoneId,
      predictedDemand,
      redirectToZone: predictedDemand > average ? input.zoneId : 'zone-buffer-1',
      confidence: 0.82
    };
  },
  assessFoodQuality(input: {
    freshnessSignals: { temperatureC: number; hoursSinceCooked: number; imageConfidence?: number };
  }) {
    const risk = input.freshnessSignals.hoursSinceCooked / 12 + Math.max(0, input.freshnessSignals.temperatureC - 5) / 20;
    const label = risk < 0.7 ? 'fresh' : risk < 1.1 ? 'review' : 'spoiled';
    return {
      label,
      confidence: Number((1 - Math.min(risk / 1.5, 0.65)).toFixed(2)),
      usableMinutes: label === 'fresh' ? 240 : label === 'review' ? 90 : 0
    };
  },
  buildHeatmap(input: { wasteZones: Array<{ zoneId: string; volume: number }>; demandZones: Array<{ zoneId: string; demand: number }> }) {
    return {
      wasteHeatmap: input.wasteZones.sort((a, b) => b.volume - a.volume),
      demandHeatmap: input.demandZones.sort((a, b) => b.demand - a.demand)
    };
  },
  controlRoom() {
    const deliveries = activeDeliveries();
    const risks = this.predictiveFailures().alerts;
    return {
      networkLoad: {
        activeDeliveries: deliveries.length,
        availableDrivers: platformStore.drivers.filter((driver) => driver.status === 'AVAILABLE').length,
        ngoUtilization: platformStore.ngos.map((ngo) => ({
          ngoId: ngo.id,
          name: ngo.name,
          utilizationPercent: Math.min(100, Math.round((ngo.activeRequests / Math.max(ngo.capacity, 1)) * 100))
        })),
        predictedFailures: risks.length
      },
      liveAlerts: risks,
      systemEvents: platformStore.auditLogs.slice(0, 8).map((log) => ({
        id: log.id,
        action: log.action,
        timestamp: log.timestamp,
        actorId: log.actorId
      })),
      orchestration: this.globalOptimization()
    };
  },
  digitalTwin() {
    const active = activeDeliveries();
    const twinRuns = active.map((delivery) => {
      const trafficMultiplier = delivery.route.progressPercent > 40 ? 1.16 : 1.08;
      const simulatedEta = Math.round(delivery.route.etaMinutes * trafficMultiplier);
      const failureProbability = Number(Math.min(0.94, 0.12 + simulatedEta / 120 + (delivery.status === 'DELAYED' ? 0.25 : 0)).toFixed(2));
      return {
        deliveryId: delivery.id,
        donationTitle: platformStore.donations.find((item) => item.id === delivery.donationId)?.title ?? 'Donation',
        scenario: delivery.status === 'DELAYED' ? 'reroute-recommended' : 'baseline',
        simulatedEtaMinutes: simulatedEta,
        failureProbability,
        recommendedAction: failureProbability > 0.48 ? 'reassign-mid-route' : 'continue-current-route',
        simulationPath: delivery.route.points.map((point, index) => ({
          lat: point.lat,
          lng: point.lng,
          intensity: Number((index / Math.max(delivery.route.points.length - 1, 1)).toFixed(2))
        }))
      };
    });

    return {
      twinRuns,
      summary: {
        simulatedRuns: twinRuns.length,
        reroutesRecommended: twinRuns.filter((run) => run.recommendedAction === 'reassign-mid-route').length,
        averageFailureProbability: twinRuns.length
          ? Number((twinRuns.reduce((sum, run) => sum + run.failureProbability, 0) / twinRuns.length).toFixed(2))
          : 0
      }
    };
  },
  predictiveFailures() {
    const alerts = activeDeliveries().flatMap((delivery) => {
      const driver = platformStore.drivers.find((item) => item.id === delivery.driverId);
      const ngo = platformStore.ngos.find((item) => item.id === delivery.ngoId);
      const etaRisk = Math.min(0.95, delivery.route.etaMinutes / 35);
      const driverRisk = driver ? Number(Math.max(0.08, 1 - driver.metrics.completionRate / 100).toFixed(2)) : 0.4;
      const ngoRisk = ngo ? Number(Math.min(0.95, ngo.activeRequests / Math.max(ngo.capacity, 1) + 0.12).toFixed(2)) : 0.2;

      return [
        {
          id: `${delivery.id}-delay`,
          type: 'delivery_delay',
          deliveryId: delivery.id,
          score: Number(etaRisk.toFixed(2)),
          action: etaRisk > 0.6 ? 'proactive-reroute' : 'monitor',
          message: `Delay predictor estimates ${(etaRisk * 100).toFixed(0)}% risk for ${delivery.id.slice(0, 8)}.`
        },
        {
          id: `${delivery.id}-driver`,
          type: 'driver_failure',
          deliveryId: delivery.id,
          score: driverRisk,
          action: driverRisk > 0.35 ? 'standby-driver' : 'keep-route',
          message: `Driver resilience score suggests ${(driverRisk * 100).toFixed(0)}% fallback risk.`
        },
        {
          id: `${delivery.id}-ngo`,
          type: 'ngo_overload',
          deliveryId: delivery.id,
          score: ngoRisk,
          action: ngoRisk > 0.6 ? 'alternate-ngo' : 'keep-destination',
          message: `NGO capacity pressure is at ${(ngoRisk * 100).toFixed(0)}% overload risk.`
        }
      ];
    }).sort((left, right) => right.score - left.score);

    return { alerts };
  },
  globalOptimization() {
    const deliveries = activeDeliveries();
    const totalRemainingDistance = deliveries.reduce((sum, delivery) => sum + delivery.route.distanceKm * (1 - delivery.route.progressPercent / 100), 0);
    const totalFoodInFlight = deliveries.reduce((sum, delivery) => {
      const donation = platformStore.donations.find((item) => item.id === delivery.donationId);
      return sum + (donation?.quantity ?? 0);
    }, 0);

    return {
      objective: {
        totalRemainingDistanceKm: Number(totalRemainingDistance.toFixed(2)),
        foodInFlight: totalFoodInFlight,
        estimatedMealsSavedIfOptimized: totalFoodInFlight + Math.round(totalFoodInFlight * 0.12)
      },
      routingPlan: deliveries.map((delivery, index) => ({
        deliveryId: delivery.id,
        priorityRank: index + 1,
        recommendedStrategy: delivery.status === 'DELAYED' ? 'reroute-nearest-driver' : 'continue-min-cost-path',
        clusterId: `cluster-${Math.max(1, Math.ceil((index + 1) / 2))}`
      })),
      swarmPlan: deliveries.slice(0, 2).map((delivery, index) => ({
        deliveryId: delivery.id,
        strategy: index === 0 ? 'handoff-ready' : 'parallel-support',
        supportDriver: platformStore.drivers.filter((driver) => driver.status === 'AVAILABLE')[0]?.name ?? 'No standby driver'
      }))
    };
  },
  assistant() {
    const optimization = this.globalOptimization();
    const predictive = this.predictiveFailures().alerts.slice(0, 3);
    const bestNgo = platformStore.ngos
      .filter((ngo) => ngo.verified)
      .sort((left, right) => (left.activeRequests / Math.max(left.capacity, 1)) - (right.activeRequests / Math.max(right.capacity, 1)))[0];

    return {
      suggestions: [
        {
          id: 'ngo-best-fit',
          title: 'Best NGO for next donation',
          message: `${bestNgo?.name ?? 'Hope Kitchen'} currently has the strongest capacity buffer for urgent rescue loads.`
        },
        {
          id: 'route-best-plan',
          title: 'Best routing policy',
          message: `${optimization.routingPlan[0]?.recommendedStrategy ?? 'continue-min-cost-path'} is the top optimization move for the current network state.`
        },
        {
          id: 'failure-watch',
          title: 'Highest proactive risk',
          message: predictive[0]?.message ?? 'No elevated failure signals right now.'
        }
      ],
      chatSeed: [
        'Which NGO should receive the next high-urgency donation?',
        'Show me the riskiest live delivery.',
        'Recommend a reroute for delayed runs.'
      ]
    };
  },
  impact() {
    const deliveredQuantity = delivered().reduce((sum, delivery) => {
      const donation = platformStore.donations.find((item) => item.id === delivery.donationId);
      return sum + (donation?.quantity ?? 0);
    }, 0);

    return {
      mealsDelivered: deliveredQuantity,
      foodSavedKg: deliveredQuantity,
      co2SavedKg: Number((deliveredQuantity * 2.35).toFixed(2)),
      waterSavedLitres: deliveredQuantity * 120,
      impactTrend: platformStore.donations.map((donation, index) => ({
        label: `Impact ${index + 1}`,
        foodSavedKg: donation.quantity,
        co2SavedKg: Number((donation.quantity * 2.35).toFixed(2))
      }))
    };
  }
};
