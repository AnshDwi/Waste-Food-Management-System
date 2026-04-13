import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { platformApi } from '../features/platform/platformApi';
import { SectionHeader } from '../components/ui/SectionHeader';

const pieColors = ['#22c55e', '#0ea5e9', '#f97316', '#a855f7'];

export const AnalyticsPage = () => {
  const summaryQuery = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: platformApi.getAnalyticsSummary
  });
  const trendsQuery = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: platformApi.getAnalyticsTrends
  });

  if (summaryQuery.isLoading || trendsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Analytics" title="Loading live analytics..." description="Fetching delivery, NGO, and driver performance metrics." />
        </section>
      </div>
    );
  }

  if (summaryQuery.isError || trendsQuery.isError) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Analytics" title="Unable to load analytics." description="Retry to restore the realtime dashboard." />
          <button
            onClick={() => {
              summaryQuery.refetch();
              trendsQuery.refetch();
            }}
            className="mt-4 rounded-2xl bg-[image:var(--accent)] px-5 py-3 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </section>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const trend = trendsQuery.data?.trend ?? [];
  const distribution = trendsQuery.data?.distribution ?? [];
  const deliveriesPerDay = trendsQuery.data?.deliveriesPerDay ?? [];
  const ngoEfficiency = summary?.ngoEfficiency ?? [];
  const driverPerformance = summary?.driverPerformance ?? [];
  const heatmap = trendsQuery.data?.heatmap ?? [];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong interactive-card rounded-[38px] p-6 md:p-8"
      >
        <SectionHeader
          eyebrow="Analytics"
          title="Live impact and operational intelligence from the backend."
          description="Food flow, delivery speed, NGO efficiency, driver performance, and supply-demand intensity are now backed by real analytics responses."
        />
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.div whileHover={{ y: -4, rotateX: -2 }} className="glass-panel-strong interactive-card rounded-[34px] p-5">
          <p className="text-sm font-medium text-[color:var(--muted)]">Total food donated</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{summary?.totalFoodSavedKg ?? 0} kg</p>
        </motion.div>
        <motion.div whileHover={{ y: -4, rotateX: -2 }} className="glass-panel-strong interactive-card rounded-[34px] p-5">
          <p className="text-sm font-medium text-[color:var(--muted)]">Average delivery time</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{summary?.avgDeliveryTimeMinutes ?? 0} min</p>
        </motion.div>
        <motion.div whileHover={{ y: -4, rotateX: -2 }} className="glass-panel-strong interactive-card rounded-[34px] p-5">
          <p className="text-sm font-medium text-[color:var(--muted)]">Completed deliveries</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{summary?.completedDeliveries ?? 0}</p>
        </motion.div>
        <motion.div whileHover={{ y: -4, rotateX: -2 }} className="glass-panel-strong interactive-card rounded-[34px] p-5">
          <p className="text-sm font-medium text-[color:var(--muted)]">Success rate</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{summary?.successRate ?? 0}%</p>
        </motion.div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Deliveries per day</h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deliveriesPerDay}>
                <defs>
                  <linearGradient id="impactFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.18)" />
                <XAxis dataKey="label" stroke="#334155" />
                <YAxis stroke="#334155" />
                <Tooltip />
                <Area dataKey="assigned" stroke="#22c55e" strokeWidth={3} fill="url(#impactFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
          <p className="text-sm font-medium text-[color:var(--muted)]">Delivery distribution</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {distribution.map((_: unknown, index: number) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
          <h3 className="text-xl font-semibold text-[color:var(--text)]">NGO efficiency</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ngoEfficiency}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.18)" />
                <XAxis dataKey="name" stroke="#334155" />
                <YAxis stroke="#334155" />
                <Tooltip />
                <Bar dataKey="utilizationPercent" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
          <h3 className="text-xl font-semibold text-[color:var(--text)]">Driver performance</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.18)" />
                <XAxis dataKey="name" stroke="#334155" />
                <YAxis stroke="#334155" />
                <Tooltip />
                <Bar dataKey="rating" fill="#22c55e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      <motion.section whileHover={{ y: -4 }} className="glass-panel-strong interactive-card rounded-[38px] p-6">
        <h3 className="text-xl font-semibold text-[color:var(--text)]">Supply vs demand heat zones</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {heatmap.map((zone: { id: string; lat: number; lng: number; supply: number; demand: number }) => (
            <div key={zone.id} className="panel-subtle rounded-[24px] p-4 shadow-sm">
              <p className="text-sm font-semibold text-[color:var(--text)]">Zone {zone.id.slice(0, 6)}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">Lat {zone.lat.toFixed(3)} | Lng {zone.lng.toFixed(3)}</p>
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Supply: {zone.supply}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">Demand: {zone.demand}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
