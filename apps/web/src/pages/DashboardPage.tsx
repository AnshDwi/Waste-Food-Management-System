import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { platformApi } from '../features/platform/platformApi';
import { useRealtimeTracking } from '../features/platform/useRealtimeTracking';
import { KpiCard } from '../components/ui/KpiCard';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SkeletonBlock } from '../components/ui/SkeletonBlock';
import { pushToast } from '../components/ui/ToastViewport';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  useRealtimeTracking();

  const summaryQuery = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: platformApi.getAnalyticsSummary
  });
  const trendsQuery = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: platformApi.getAnalyticsTrends
  });
  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: platformApi.getDrivers
  });
  const deliveriesQuery = useQuery({
    queryKey: ['deliveries'],
    queryFn: platformApi.getDeliveries
  });
  const quickDonationMutation = useMutation({
    mutationFn: () =>
      platformApi.createDonation({
        title: 'One-click rescue pack',
        quantity: 60,
        expiryAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        location: { lat: 28.5937, lng: 77.3148 },
        batches: [
          {
            foodType: 'Ready meals',
            quantity: 60,
            cookedAt: new Date().toISOString(),
            expiryAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
          }
        ]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-trends'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      pushToast('One-click donation created successfully.', 'success');
      navigate('/app/donations');
    },
    onError: () => pushToast('Unable to create one-click donation.', 'error')
  });

  if (summaryQuery.isLoading || trendsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-panel-strong rounded-[34px] p-6"><SkeletonBlock className="h-20 w-full" /></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const trend = trendsQuery.data?.trend ?? [];

  if (user?.role === 'VOLUNTEER') {
    const drivers = driversQuery.data?.drivers ?? [];
    const deliveries = deliveriesQuery.data?.deliveries ?? [];
    const me = drivers.find((driver: { name: string }) => driver.name === user.name) ?? drivers[0];
    const myRun = deliveries.find((delivery: { driver?: { id?: string; name?: string }; status: string }) => (delivery.driver?.id === me?.id || delivery.driver?.name === me?.name) && delivery.status !== 'DELIVERED') ?? null;

    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader
            eyebrow="Driver home"
            title="Everything you need for the current run, nothing you do not."
            description="See pickup and drop details, stay on route, and move the delivery through each stage with fast field actions."
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="glass-panel-strong rounded-[34px] p-6">
            <p className="text-sm font-medium text-[color:var(--muted)]">Current assignment</p>
            <h3 className="mt-3 text-3xl font-semibold text-[color:var(--text)]">
              {myRun?.donation?.title ?? 'No active delivery'}
            </h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="status-tint rounded-[24px] p-4 text-sm">
                ETA {myRun?.route?.etaMinutes ?? 0} min
              </div>
              <div className="status-tint rounded-[24px] p-4 text-sm">
                Distance {myRun?.route?.distanceKm ?? 0} km
              </div>
              <div className="status-tint rounded-[24px] p-4 text-sm">
                Status {myRun?.status ?? 'WAITING'}
              </div>
              <div className="status-tint rounded-[24px] p-4 text-sm">
                Location {me?.currentLocation?.lat?.toFixed?.(4) ?? '0.0000'}, {me?.currentLocation?.lng?.toFixed?.(4) ?? '0.0000'}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton onClick={() => navigate('/app/driver')}>
                Open driver panel
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => navigate('/app/map')}>
                Open live map
              </PrimaryButton>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel-strong rounded-[34px] p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Run checklist</h3>
              <div className="mt-4 space-y-3">
                {['Assigned', 'Picked up', 'On the way', 'Delivered'].map((step, index) => (
                  <div key={step} className={`rounded-[22px] px-4 py-3 text-sm font-medium ${index === 0 ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/14 dark:text-emerald-200' : 'status-tint'}`}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel-strong rounded-[34px] p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Driver profile</h3>
              <p className="mt-4 text-sm text-[color:var(--muted)]">{me?.name ?? user.name}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{me?.vehicleType ?? 'Vehicle not set'}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Status: {me?.status ?? 'AVAILABLE'}</p>
            </div>
          </div>
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
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Live dashboard"
            title="Operational telemetry with real analytics, not placeholders."
            description="These KPIs, trend charts, and dispatch signals are now backed by the API gateway and refresh in real time."
          />
          <PrimaryButton className="shrink-0" onClick={() => quickDonationMutation.mutate()}>
            {quickDonationMutation.isPending ? 'Creating...' : 'Create one-click donation'}
          </PrimaryButton>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Food saved" value={`${summary.totalFoodSavedKg} kg`} subtitle="Live aggregated donation quantity" accent="text-emerald-700 dark:text-emerald-300" />
        <KpiCard title="Meals served" value={summary.mealsServed} subtitle="Derived from fulfilled food batches" accent="text-orange-600" />
        <KpiCard title="Active donations" value={summary.activeDonations} subtitle="Open donation records in progress" accent="text-sky-600" />
        <KpiCard title="Successful deliveries" value={summary.successfulDeliveries} subtitle="Realtime logistics completions" accent="text-teal-600" />
        <KpiCard title="Avg delivery time" value={`${summary.avgDeliveryTimeMinutes} min`} subtitle="Average rescue completion time" accent="text-violet-700 dark:text-violet-300" />
        <KpiCard title="Delivered food" value={`${summary.deliveredFoodKg} kg`} subtitle="Food completed through logistics flow" accent="text-cyan-700 dark:text-cyan-300" />
        <KpiCard title="Expired food" value={`${summary.expiredFoodKg} kg`} subtitle="Monitor spoilage risk across donations" accent="text-rose-700 dark:text-rose-300" />
        <KpiCard title="Active NGOs" value={summary.activeNgos} subtitle="Capacity-aware partners in the network" accent="text-slate-800 dark:text-slate-100" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <motion.div
          whileHover={{ y: -6, rotateX: -2 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="glass-panel-strong interactive-card rounded-[38px] p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Meals served trend</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">Citywide impact trend</h3>
            </div>
            <div className="gradient-badge rounded-full px-3 py-1 text-xs font-semibold text-white">Realtime</div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.18)" />
                <XAxis dataKey="label" stroke="#334155" />
                <YAxis stroke="#334155" />
                <Tooltip />
                <Bar dataKey="meals" radius={[12, 12, 0, 0]} fill="url(#mealsGradient)" />
                <defs>
                  <linearGradient id="mealsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-panel-strong interactive-card rounded-[38px] p-6"
          >
            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Operational summary</h3>
            <div className="mt-5 space-y-3 text-slate-900 dark:text-slate-100">
              <div className="status-tint rounded-[24px] p-4 font-medium text-emerald-950 shadow-sm dark:text-slate-100">Waste reduction: {summary.wasteReductionPercent}%</div>
              <div className="status-tint rounded-[24px] p-4 font-medium text-orange-950 shadow-sm dark:text-slate-100">Active NGOs: {summary.activeNgos}</div>
              <div className="status-tint rounded-[24px] p-4 font-medium text-sky-950 shadow-sm dark:text-slate-100">Connected to live delivery and driver updates</div>
            </div>
          </motion.div>
          {summaryQuery.isError || trendsQuery.isError ? (
            <div className="rounded-[28px] bg-rose-50 p-4 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
              Unable to load dashboard data right now.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
