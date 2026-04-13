import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../app/hooks';
import { SectionHeader } from '../components/ui/SectionHeader';
import { platformApi } from '../features/platform/platformApi';
import { useRealtimeTracking } from '../features/platform/useRealtimeTracking';
import { OperationsMap } from '../components/map/OperationsMap';
import { pushToast } from '../components/ui/ToastViewport';

const speedMs = {
  slow: 5000,
  normal: 3000,
  fast: 1500
} as const;

type DeliveryView = {
  id: string;
  status: string;
  donation?: { title?: string } | null;
  ngo?: { name?: string } | null;
  route: {
    points?: Array<{ lat: number; lng: number }>;
    progressPercent?: number;
    etaMinutes?: number;
    distanceKm?: number;
  };
  driver?: { id?: string; name?: string; currentLocation?: { lat: number; lng: number } } | null;
};

export const MapExperiencePage = () => {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const timerRef = useRef<number | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<keyof typeof speedMs>('normal');
  const [stepIndex, setStepIndex] = useState(0);
  useRealtimeTracking();

  const mapQuery = useQuery({
    queryKey: ['map-data'],
    queryFn: platformApi.getMapData,
    refetchInterval: 4000
  });

  const leadDelivery = useMemo(
    () => ((mapQuery.data?.deliveries ?? []).find((delivery: DeliveryView) => delivery.status !== 'DELIVERED') ?? (mapQuery.data?.deliveries ?? [])[0] ?? null) as DeliveryView | null,
    [mapQuery.data?.deliveries]
  );

  const locationMutation = useMutation({
    mutationFn: ({ id, lat, lng }: { id: string; lat: number; lng: number }) => platformApi.updateDriverLocation(id, { lat, lng }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => platformApi.updateDeliveryStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
    }
  });

  const stopSimulation = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSimulationRunning(false);
  };

  useEffect(() => stopSimulation, []);

  useEffect(() => {
    if (!simulationRunning || !leadDelivery?.route.points?.length || !leadDelivery.driver?.id) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setStepIndex((current) => {
        const points = leadDelivery.route.points ?? [];
        const nextIndex = Math.min(current + 1, points.length - 1);
        const nextPoint = points[nextIndex];
        if (!nextPoint || !leadDelivery.driver?.id) {
          stopSimulation();
          return current;
        }

        locationMutation.mutate({
          id: leadDelivery.driver.id,
          lat: nextPoint.lat,
          lng: nextPoint.lng
        });

        const pickupIndex = Math.max(1, Math.floor(points.length * 0.35));
        if (nextIndex === 1) {
          statusMutation.mutate({ id: leadDelivery.id, status: 'STARTED' });
        } else if (nextIndex === pickupIndex) {
          statusMutation.mutate({ id: leadDelivery.id, status: 'PICKED_UP' });
        } else if (nextIndex === pickupIndex + 2) {
          statusMutation.mutate({ id: leadDelivery.id, status: 'ON_THE_WAY' });
        } else if (nextIndex >= points.length - 1) {
          statusMutation.mutate({ id: leadDelivery.id, status: 'DELIVERED' });
          stopSimulation();
        }

        return nextIndex;
      });
    }, speedMs[simulationSpeed]);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [leadDelivery, locationMutation, simulationRunning, simulationSpeed, statusMutation]);

  const startSimulation = () => {
    if (!leadDelivery?.route.points?.length || !leadDelivery.driver?.id) {
      pushToast('No live route available to simulate.', 'error');
      return;
    }

    setStepIndex(0);
    setSimulationRunning(true);
    pushToast('Map simulation started.', 'success');
  };

  const routePreview = leadDelivery?.route.points?.length
    ? `${leadDelivery.route.points[0]?.lat.toFixed(3)}, ${leadDelivery.route.points[0]?.lng.toFixed(3)} -> ${leadDelivery.route.points[leadDelivery.route.points.length - 1]?.lat.toFixed(3)}, ${leadDelivery.route.points[leadDelivery.route.points.length - 1]?.lng.toFixed(3)}`
    : 'No route available';

  const isDriver = user?.role === 'VOLUNTEER';

  if (mapQuery.isLoading) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Realtime map" title="Loading live logistics map..." description="Fetching drivers, routes, and marker positions." />
        </section>
      </div>
    );
  }

  if (mapQuery.isError) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Realtime map" title="Unable to load the map." description="Retry to restore the live geo feed." />
          <button onClick={() => mapQuery.refetch()} className="mt-4 rounded-2xl bg-[image:var(--accent)] px-5 py-3 text-sm font-semibold text-white">Retry</button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong interactive-card rounded-[38px] p-6 md:p-8"
      >
        <SectionHeader
          eyebrow="Realtime map"
          title={isDriver ? 'Stay centered on your current route and live position.' : 'A working operations map with donors, NGOs, and delivery routes.'}
          description={isDriver ? 'Drivers only see the route they need to execute, with live ETA, movement, and route progress.' : 'This screen now pulls real map data from the API and updates as deliveries are assigned, moved, and completed.'}
        />
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel-strong interactive-card rounded-[38px] p-5"
        >
          <OperationsMap
            donors={mapQuery.data?.donors ?? []}
            ngos={mapQuery.data?.ngos ?? []}
            drivers={mapQuery.data?.drivers ?? []}
            deliveries={mapQuery.data?.deliveries ?? []}
          />
        </motion.div>
        <div className="space-y-4">
          <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">{isDriver ? 'Route controls' : 'Floating simulation panel'}</h3>
              <span className="soft-chip rounded-full px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
                {simulationRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--text)]">
              <button onClick={startSimulation} className="w-full rounded-[22px] bg-[image:var(--accent)] px-4 py-3 font-semibold text-white shadow-lg shadow-orange-300/20 dark:shadow-emerald-500/20">Start Simulation</button>
              <button onClick={stopSimulation} className="soft-chip w-full rounded-[22px] px-4 py-3 font-semibold text-[color:var(--text)]">Stop Simulation</button>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`rounded-[20px] px-3 py-3 font-semibold transition-all ${
                      simulationSpeed === speed
                        ? 'bg-[image:var(--accent)] text-white shadow-md shadow-orange-300/20 dark:shadow-emerald-500/20'
                        : 'soft-chip text-[color:var(--text)]'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
              <div className="panel-subtle rounded-[22px] p-4 text-[color:var(--muted)]">
                Route preview: {routePreview}
              </div>
              <div className="panel-subtle rounded-[22px] p-4 text-[color:var(--muted)]">
                Step {stepIndex + 1} of {leadDelivery?.route.points?.length ?? 0}
              </div>
            </div>
          </motion.div>
          {isDriver ? (
            <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Current run snapshot</h3>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--text)]">
                <div className="status-tint rounded-[22px] p-4 font-medium shadow-sm">Delivery: {leadDelivery?.donation?.title ?? 'No active run'}</div>
                <div className="status-tint rounded-[22px] p-4 font-medium shadow-sm">Destination NGO: {leadDelivery?.ngo?.name ?? 'Waiting for assignment'}</div>
                <div className="status-tint rounded-[22px] p-4 font-medium shadow-sm">ETA: {leadDelivery?.route?.etaMinutes ?? 0} min</div>
                <div className="status-tint rounded-[22px] p-4 font-medium shadow-sm">Progress: {leadDelivery?.route?.progressPercent ?? 0}%</div>
              </div>
            </motion.div>
          ) : (
            <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Live overlays</h3>
              <div className="mt-4 grid gap-3 text-sm text-[color:var(--text)]">
                <button type="button" className="panel-subtle flex items-start justify-between rounded-[22px] p-4 text-left shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Pickup points</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--text)]">Donor markers</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">All active donation origins currently plotted on the map.</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                    {(mapQuery.data?.donors ?? []).length}
                  </span>
                </button>
                <button type="button" className="panel-subtle flex items-start justify-between rounded-[22px] p-4 text-left shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Drop hubs</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--text)]">NGO destinations</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">Verified NGO receiving points available for dispatch.</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800 dark:bg-sky-500/15 dark:text-sky-200">
                    {(mapQuery.data?.ngos ?? []).length}
                  </span>
                </button>
                <button type="button" className="panel-subtle flex items-start justify-between rounded-[22px] p-4 text-left shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">Live fleet</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--text)]">Drivers in motion</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">Field vehicles actively sharing location updates.</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
                    {(mapQuery.data?.drivers ?? []).length}
                  </span>
                </button>
                <button type="button" className="panel-subtle flex items-start justify-between rounded-[22px] p-4 text-left shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Dispatch lines</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--text)]">Active delivery routes</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">Pickup-to-drop route lines currently being tracked.</p>
                  </div>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-800 dark:bg-violet-500/15 dark:text-violet-200">
                    {(mapQuery.data?.deliveries ?? []).length}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
          <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
            <h3 className="text-xl font-semibold text-[color:var(--text)]">Map status</h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              The geo feed, delivery routes, and driver markers are live on a free OpenStreetMap basemap. The route, ETA, and driver position all update without any API key.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
