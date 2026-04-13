import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../app/hooks';
import { SectionHeader } from '../components/ui/SectionHeader';
import { platformApi } from '../features/platform/platformApi';
import { useRealtimeTracking } from '../features/platform/useRealtimeTracking';
import { pushToast } from '../components/ui/ToastViewport';

const driverStatuses = ['ASSIGNED', 'STARTED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'] as const;
const speedMs = {
  slow: 5000,
  normal: 3000,
  fast: 1500
} as const;

type DeliveryView = {
  id: string;
  status: string;
  assignment?: {
    mode?: 'AI_ASSIGNED' | 'MANUAL';
    score?: number;
  };
  timeline?: Array<{
    status: string;
    label: string;
    timestamp: string;
  }>;
  donation?: { title?: string } | null;
  ngo?: { name?: string } | null;
  route: {
    etaMinutes: number;
    progressPercent: number;
    distanceKm: number;
    points?: Array<{ lat: number; lng: number }>;
  };
  driver?: { id?: string; name?: string; currentLocation?: { lat: number; lng: number } };
};

export const DriverPanelPage = () => {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const timerRef = useRef<number | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<keyof typeof speedMs>('normal');
  const [stepIndex, setStepIndex] = useState(0);
  useRealtimeTracking();

  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: platformApi.getDrivers,
    refetchInterval: 4000
  });
  const deliveriesQuery = useQuery({
    queryKey: ['deliveries'],
    queryFn: platformApi.getDeliveries,
    refetchInterval: 4000
  });

  const driver = useMemo(
    () => (driversQuery.data?.drivers ?? []).find((item: { name: string }) => item.name === user?.name) ?? (driversQuery.data?.drivers ?? [])[0],
    [driversQuery.data?.drivers, user?.name]
  );
  const myDeliveries = useMemo(
    () => (deliveriesQuery.data?.deliveries ?? []).filter((delivery: { driver?: { id?: string; name?: string } }) => delivery.driver?.id === driver?.id || delivery.driver?.name === driver?.name),
    [deliveriesQuery.data?.deliveries, driver?.id, driver?.name]
  );
  const activeDelivery = (myDeliveries[0] ?? null) as DeliveryView | null;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => platformApi.updateDeliveryStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      pushToast('Driver status updated.', 'success');
    },
    onError: () => pushToast('Unable to update delivery status.', 'error')
  });

  const locationMutation = useMutation({
    mutationFn: ({ id, lat, lng }: { id: string; lat: number; lng: number }) =>
      platformApi.updateDriverLocation(id, { lat, lng }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
    },
    onError: () => pushToast('Unable to update driver location.', 'error')
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
    if (!simulationRunning || !activeDelivery?.route.points?.length || !driver?.id) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setStepIndex((current) => {
        const nextIndex = Math.min(current + 1, activeDelivery.route.points!.length - 1);
        const nextPoint = activeDelivery.route.points![nextIndex];
        locationMutation.mutate({
          id: driver.id,
          lat: nextPoint.lat,
          lng: nextPoint.lng
        });

        const pickupIndex = Math.max(1, Math.floor(activeDelivery.route.points!.length * 0.35));
        if (nextIndex === 1) {
          statusMutation.mutate({ id: activeDelivery.id, status: 'STARTED' });
        } else if (nextIndex === pickupIndex) {
          statusMutation.mutate({ id: activeDelivery.id, status: 'PICKED_UP' });
        } else if (nextIndex === pickupIndex + 2) {
          statusMutation.mutate({ id: activeDelivery.id, status: 'ON_THE_WAY' });
        } else if (nextIndex >= activeDelivery.route.points!.length - 1) {
          statusMutation.mutate({ id: activeDelivery.id, status: 'DELIVERED' });
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
  }, [activeDelivery, driver?.id, locationMutation, simulationRunning, simulationSpeed, statusMutation]);

  const startSimulation = () => {
    if (!activeDelivery?.route.points?.length || !driver?.id) {
      pushToast('No active delivery route available to simulate.', 'error');
      return;
    }

    setStepIndex(0);
    setSimulationRunning(true);
    pushToast('Driver simulation started.', 'success');
  };

  const routePreview = activeDelivery?.route.points?.length
    ? `${activeDelivery.route.points[0]?.lat.toFixed(3)}, ${activeDelivery.route.points[0]?.lng.toFixed(3)} -> ${activeDelivery.route.points[activeDelivery.route.points.length - 1]?.lat.toFixed(3)}, ${activeDelivery.route.points[activeDelivery.route.points.length - 1]?.lng.toFixed(3)}`
    : 'No route available';

  if (driversQuery.isLoading || deliveriesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Driver app" title="Loading your current run..." description="Fetching assignment, route, and driver telemetry." />
        </section>
      </div>
    );
  }

  if (driversQuery.isError || deliveriesQuery.isError) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Driver app" title="Unable to load the driver panel." description="Retry to restore your active assignment." />
          <button
            onClick={() => {
              driversQuery.refetch();
              deliveriesQuery.refetch();
            }}
            className="mt-4 rounded-2xl bg-[image:var(--accent)] px-5 py-3 text-sm font-semibold text-white"
          >
            Retry
          </button>
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
          eyebrow="Driver app"
          title="A mobile-style driver panel for pickup, transit, and delivery completion."
          description="Each driver gets a focused action surface with live runs, location-aware progress, and one-tap state changes."
        />
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-[0.82fr,1.18fr]">
        <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Driver profile</h3>
          <div className="mt-5 space-y-3">
            <div className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <p className="text-sm text-[color:var(--muted)]">Name</p>
              <p className="mt-1 text-lg font-semibold text-[color:var(--text)]">{driver?.name ?? 'Unassigned driver'}</p>
            </div>
            <div className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <p className="text-sm text-[color:var(--muted)]">Vehicle</p>
              <p className="mt-1 text-lg font-semibold text-[color:var(--text)]">{driver?.vehicleType ?? 'N/A'}</p>
            </div>
            <div className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <p className="text-sm text-[color:var(--muted)]">Live status</p>
              <p className="mt-1 text-lg font-semibold text-[color:var(--text)]">{driver?.status ?? 'N/A'}</p>
            </div>
            <div className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <p className="text-sm text-[color:var(--muted)]">Simulation controls</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={startSimulation} className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">Start simulation</button>
                <button onClick={stopSimulation} className="rounded-2xl soft-chip px-4 py-3 text-sm font-semibold text-[color:var(--text)]">Stop simulation</button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold ${simulationSpeed === speed ? 'bg-sky-500 text-white' : 'soft-chip text-[color:var(--text)]'}`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
              <div className="mt-4 panel-subtle rounded-2xl px-4 py-3 text-sm text-[color:var(--text)]">
                Route preview: {routePreview}
              </div>
              <div className="mt-3 panel-subtle rounded-2xl px-4 py-3 text-sm text-[color:var(--text)]">
                Step {stepIndex + 1} of {activeDelivery?.route.points?.length ?? 0}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {myDeliveries.map((delivery: DeliveryView) => (
            <motion.div
              key={delivery.id}
              whileHover={{ y: -4, scale: 1.005 }}
              className="glass-panel-strong interactive-card rounded-[38px] p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-[color:var(--text)]">{delivery.donation?.title ?? 'Assigned run'}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    Destination: {delivery.ngo?.name ?? 'NGO'} | ETA {delivery.route.etaMinutes} min | {delivery.route.distanceKm} km
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {delivery.assignment?.mode === 'AI_ASSIGNED' ? `AI assigned | score ${delivery.assignment.score ?? 0}` : 'Manual dispatch'}
                  </p>
                  {delivery.driver?.currentLocation ? (
                    <p className="mt-2 text-xs text-[color:var(--muted)]">
                      Live location: {delivery.driver.currentLocation.lat.toFixed(4)}, {delivery.driver.currentLocation.lng.toFixed(4)}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-800 dark:bg-sky-500/10 dark:text-sky-200">
                  {delivery.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {driverStatuses.map((status, index) => {
                  const active = driverStatuses.indexOf(delivery.status as typeof driverStatuses[number]) >= index;
                  return (
                    <button
                      key={status}
                      onClick={() => statusMutation.mutate({ id: delivery.id, status })}
                      className={`rounded-2xl px-3 py-3 text-center text-[11px] font-semibold ${active ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200' : 'soft-chip text-[color:var(--text)]'}`}
                    >
                      {status.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-emerald-500 to-teal-500 transition-all duration-700"
                  style={{ width: `${Math.max(8, delivery.route.progressPercent)}%` }}
                />
              </div>

              {delivery.timeline?.length ? (
                <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                  {delivery.timeline.map((entry) => (
                    <div key={`${delivery.id}-${entry.status}`} className="panel-subtle rounded-2xl px-3 py-3 text-xs shadow-sm">
                      <p className="font-semibold text-[color:var(--text)]">{entry.label}</p>
                      <p className="mt-1 text-[color:var(--muted)]">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
