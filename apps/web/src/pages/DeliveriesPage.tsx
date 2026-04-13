import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SectionHeader } from '../components/ui/SectionHeader';
import { platformApi } from '../features/platform/platformApi';
import { useRealtimeTracking } from '../features/platform/useRealtimeTracking';
import { pushToast } from '../components/ui/ToastViewport';

type Driver = {
  id: string;
  name: string;
  status: string;
  vehicleType: string;
  currentLocation: { lat: number; lng: number };
};

type Donation = {
  id: string;
  title: string;
  quantity: number;
  status: string;
};

type Ngo = {
  id: string;
  name: string;
  verified?: boolean;
};

type Delivery = {
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
  route: {
    distanceKm: number;
    etaMinutes: number;
    progressPercent: number;
  };
  donation?: Donation | null;
  driver?: Driver | null;
  ngo?: Ngo | null;
};

const adminSteps = ['ASSIGNED', 'STARTED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];

export const DeliveriesPage = () => {
  const queryClient = useQueryClient();
  useRealtimeTracking();

  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: platformApi.getDrivers
  });
  const deliveriesQuery = useQuery({
    queryKey: ['deliveries'],
    queryFn: platformApi.getDeliveries,
    refetchInterval: 4000
  });
  const donationsQuery = useQuery({
    queryKey: ['donations'],
    queryFn: platformApi.getDonations
  });
  const ngosQuery = useQuery({
    queryKey: ['ngos'],
    queryFn: platformApi.getNgos
  });

  const donationOptions = donationsQuery.data?.donations ?? [];
  const ngoOptions = ngosQuery.data?.ngos ?? [];
  const driverOptions = driversQuery.data?.drivers ?? [];

  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  useEffect(() => {
    if (!selectedDonationId && donationOptions.length > 0) {
      const candidate = donationOptions.find((donation: Donation) => donation.status !== 'DELIVERED') ?? donationOptions[0];
      setSelectedDonationId(candidate.id);
    }
  }, [donationOptions, selectedDonationId]);

  useEffect(() => {
    if (!selectedNgoId && ngoOptions.length > 0) {
      setSelectedNgoId(ngoOptions[0].id);
    }
  }, [ngoOptions, selectedNgoId]);

  useEffect(() => {
    if (!selectedDriverId && driverOptions.length > 0) {
      const candidate = driverOptions.find((driver: Driver) => driver.status === 'AVAILABLE') ?? driverOptions[0];
      setSelectedDriverId(candidate.id);
    }
  }, [driverOptions, selectedDriverId]);

  const assignMutation = useMutation({
    mutationFn: platformApi.assignDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      pushToast('Driver assigned and route tracking started.', 'success');
    },
    onError: () => pushToast('Unable to assign driver.', 'error')
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => platformApi.updateDeliveryStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      pushToast('Delivery status updated.', 'success');
    }
  });

  const trackingMutation = useMutation({
    mutationFn: platformApi.startDeliveryTracking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      pushToast('Live tracking restarted.', 'success');
    }
  });

  const selectedDonation = useMemo(
    () => donationOptions.find((donation: Donation) => donation.id === selectedDonationId),
    [donationOptions, selectedDonationId]
  );
  const selectedNgo = useMemo(
    () => ngoOptions.find((ngo: Ngo) => ngo.id === selectedNgoId),
    [ngoOptions, selectedNgoId]
  );
  const selectedDriver = useMemo(
    () => driverOptions.find((driver: Driver) => driver.id === selectedDriverId),
    [driverOptions, selectedDriverId]
  );

  if (driversQuery.isLoading || deliveriesQuery.isLoading || donationsQuery.isLoading || ngosQuery.isLoading) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Delivery control" title="Loading live delivery operations..." description="Fetching donations, drivers, NGOs, and route state." />
        </section>
      </div>
    );
  }

  if (driversQuery.isError || deliveriesQuery.isError || donationsQuery.isError || ngosQuery.isError) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Delivery control" title="Unable to load the delivery desk." description="Retry to restore driver, NGO, and route data." />
          <button
            onClick={() => {
              driversQuery.refetch();
              deliveriesQuery.refetch();
              donationsQuery.refetch();
              ngosQuery.refetch();
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
          eyebrow="Delivery control"
          title="Assign drivers, manage runs, and monitor the delivery lifecycle from one admin desk."
          description="This panel is built for operations control: pickup to drop, driver assignment, stage changes, and live delivery visibility."
        />
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-[0.94fr,1.06fr]">
        <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Quick assignment</h3>

          <div className="mt-5 grid gap-3">
            <label className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <span className="text-sm font-semibold text-[color:var(--muted)]">Donation</span>
              <select value={selectedDonationId} onChange={(event) => setSelectedDonationId(event.target.value)} className="theme-input mt-2 w-full rounded-xl px-3 py-3 text-lg font-medium">
                {donationOptions.map((donation: Donation) => (
                  <option key={donation.id} value={donation.id}>
                    {donation.title} | {donation.quantity} portions | {donation.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <span className="text-sm font-semibold text-[color:var(--muted)]">NGO destination</span>
              <select value={selectedNgoId} onChange={(event) => setSelectedNgoId(event.target.value)} className="theme-input mt-2 w-full rounded-xl px-3 py-3 text-lg font-medium">
                {ngoOptions.map((ngo: Ngo) => (
                  <option key={ngo.id} value={ngo.id}>
                    {ngo.name}{ngo.verified === false ? ' | pending verification' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <span className="text-sm font-semibold text-[color:var(--muted)]">Driver</span>
              <select value={selectedDriverId} onChange={(event) => setSelectedDriverId(event.target.value)} className="theme-input mt-2 w-full rounded-xl px-3 py-3 text-lg font-medium">
                {driverOptions.map((driver: Driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} | {driver.vehicleType} | {driver.status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="status-tint mt-5 rounded-[24px] p-4 text-sm">
            <p>Donation: <span className="font-semibold">{selectedDonation?.title ?? 'Select a donation'}</span></p>
            <p className="mt-1">NGO: <span className="font-semibold">{selectedNgo?.name ?? 'Select an NGO'}</span></p>
            <p className="mt-1">Driver: <span className="font-semibold">{selectedDriver?.name ?? 'Select a driver'}</span></p>
          </div>

          <button
            disabled={!selectedDonationId || assignMutation.isPending}
            onClick={() =>
              assignMutation.mutate({
                donationId: selectedDonationId,
                ngoId: selectedNgoId || undefined,
                driverId: selectedDriverId || undefined
              })
            }
            className="mt-5 rounded-2xl bg-[image:var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign driver'}
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Delivery board</h3>
          <div className="mt-5 space-y-4">
            {(deliveriesQuery.data?.deliveries ?? []).map((delivery: Delivery) => (
              <motion.div
                key={delivery.id}
                whileHover={{ scale: 1.01, y: -2 }}
                className="panel-subtle rounded-[28px] p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="text-[color:var(--text)]">
                      <p className="font-semibold">Delivery {delivery.id.slice(0, 8)}</p>
                      <p className="text-sm text-[color:var(--muted)]">
                        {delivery.donation?.title ?? 'Donation'} to {delivery.ngo?.name ?? 'NGO'} via {delivery.driver?.name ?? 'Unassigned driver'}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        {delivery.assignment?.mode === 'AI_ASSIGNED'
                          ? `AI Assigned Driver | score ${delivery.assignment.score ?? 0}`
                          : 'Manually assigned driver'}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {delivery.route.distanceKm} km | ETA {delivery.route.etaMinutes} min | Progress {delivery.route.progressPercent}%
                      </p>
                      {delivery.driver?.currentLocation ? (
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          Driver location: {delivery.driver.currentLocation.lat.toFixed(4)}, {delivery.driver.currentLocation.lng.toFixed(4)}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {adminSteps.map((status) => (
                        <button
                          key={status}
                          onClick={() => statusMutation.mutate({ id: delivery.id, status })}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                            delivery.status === status
                              ? 'bg-emerald-500 text-white'
                              : 'soft-chip text-[color:var(--text)]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                      <button
                        onClick={() => trackingMutation.mutate(delivery.id)}
                        className="rounded-xl bg-[image:var(--accent)] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Restart live tracking
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {adminSteps.map((step, index) => {
                      const active = adminSteps.indexOf(delivery.status) >= index || (delivery.status === 'DELAYED' && step !== 'DELIVERED');
                      return (
                        <div
                          key={step}
                          className={`rounded-2xl px-3 py-3 text-center text-[11px] font-semibold ${
                            active
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200'
                              : 'status-tint'
                          }`}
                        >
                          {step.replace(/_/g, ' ')}
                        </div>
                      );
                    })}
                  </div>

                  {delivery.timeline?.length ? (
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                      {delivery.timeline.map((entry) => (
                        <div key={`${delivery.id}-${entry.status}`} className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 text-xs shadow-sm dark:border-white/10 dark:bg-slate-900/35">
                          <p className="font-semibold text-[color:var(--text)]">{entry.label}</p>
                          <p className="mt-1 text-[color:var(--muted)]">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {delivery.status === 'DELAYED' ? (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                      Delay alert raised. Admin can monitor this run from the audit and command panels.
                    </div>
                  ) : null}

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 via-emerald-500 to-teal-500 transition-all duration-700"
                      style={{ width: `${Math.max(8, delivery.route.progressPercent)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};
