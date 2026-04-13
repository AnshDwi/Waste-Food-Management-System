import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { platformApi } from '../features/platform/platformApi';
import { PrimaryButton } from '../components/ui/PrimaryButton';

type Driver = {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'DELIVERING';
  vehicleType: string;
  phone?: string;
  currentLocation: { lat: number; lng: number };
};

type Delivery = {
  id: string;
  status: string;
  route: {
    etaMinutes: number;
    distanceKm: number;
    progressPercent: number;
  };
  driver?: { id?: string; name?: string } | null;
  donation?: { title?: string } | null;
  ngo?: { name?: string } | null;
};

export const DriversPage = () => {
  const navigate = useNavigate();
  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: platformApi.getDrivers
  });
  const deliveriesQuery = useQuery({
    queryKey: ['deliveries'],
    queryFn: platformApi.getDeliveries,
    refetchInterval: 4000
  });

  const drivers = driversQuery.data?.drivers ?? [];
  const deliveries = deliveriesQuery.data?.deliveries ?? [];

  const stats = useMemo(() => {
    const available = drivers.filter((driver: Driver) => driver.status === 'AVAILABLE').length;
    const active = deliveries.filter((delivery: Delivery) => delivery.status !== 'DELIVERED').length;
    const moving = drivers.filter((driver: Driver) => driver.status === 'DELIVERING').length;
    return { available, active, moving };
  }, [deliveries, drivers]);

  const getDriverRun = (driverId: string) =>
    deliveries.find((delivery: Delivery) => delivery.driver?.id === driverId && delivery.status !== 'DELIVERED') ?? null;

  return (
    <div className="space-y-6">
      <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
        <SectionHeader
          eyebrow="Driver management"
          title="Monitor driver availability, live position, and rescue runs from one control desk."
          description="Admins can see who is free, who is moving, and which delivery is currently attached to each field driver."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel-strong rounded-[30px] p-5">
          <p className="text-sm font-medium text-[color:var(--muted)]">Available drivers</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{stats.available}</p>
        </div>
        <div className="glass-panel-strong rounded-[30px] p-5">
          <p className="text-sm font-medium text-[color:var(--muted)]">Drivers on route</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{stats.moving}</p>
        </div>
        <div className="glass-panel-strong rounded-[30px] p-5">
          <p className="text-sm font-medium text-[color:var(--muted)]">Active deliveries</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{stats.active}</p>
        </div>
      </section>

      <section className="glass-panel-strong rounded-[34px] p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Driver roster</h3>
          <PrimaryButton variant="secondary" onClick={() => navigate('/app/deliveries')}>
            Open assignment desk
          </PrimaryButton>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {drivers.map((driver: Driver) => {
            const liveRun = getDriverRun(driver.id);

            return (
              <div key={driver.id} className="panel-subtle rounded-[28px] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[color:var(--text)]">{driver.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{driver.vehicleType}</p>
                    {driver.phone ? <p className="text-sm text-[color:var(--muted)]">{driver.phone}</p> : null}
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/14 dark:text-emerald-300">
                    {driver.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="status-tint rounded-[20px] p-3 text-sm">
                    Current location: {driver.currentLocation.lat.toFixed(4)}, {driver.currentLocation.lng.toFixed(4)}
                  </div>
                  <div className="status-tint rounded-[20px] p-3 text-sm">
                    {liveRun ? `ETA ${liveRun.route.etaMinutes} min | ${liveRun.route.distanceKm} km` : 'No active run'}
                  </div>
                </div>

                {liveRun ? (
                  <div className="mt-4 rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/44">
                    <p className="text-sm font-semibold text-[color:var(--text)]">
                      {liveRun.donation?.title ?? 'Rescue run'} to {liveRun.ngo?.name ?? 'NGO'}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">Status: {liveRun.status}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"
                        style={{ width: `${Math.max(8, liveRun.route.progressPercent)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 status-tint rounded-[22px] p-4 text-sm">
                    This driver is ready for assignment.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
