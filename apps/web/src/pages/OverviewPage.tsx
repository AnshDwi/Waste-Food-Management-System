import { StatCard } from '../components/ui/StatCard';

export const OverviewPage = () => (
  <div className="space-y-6">
    <section className="rounded-[2rem] bg-gradient-to-r from-ink via-slate-800 to-pine p-8 text-white shadow-2xl">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Enterprise command center</p>
      <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold">Coordinate donation supply, NGO demand, and volunteer logistics in real time.</h2>
    </section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Food Saved" value="18.2T" accent="text-pine" />
      <StatCard label="Meals Served" value="54.6K" accent="text-clay" />
      <StatCard label="Active NGOs" value="124" accent="text-sky-600" />
      <StatCard label="Live Deliveries" value="42" accent="text-amber-600" />
    </section>
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
        <h3 className="font-display text-xl font-semibold">AI modules</h3>
        <p className="mt-4 text-sm text-slate-600">Smart matching, demand forecasting, fraud anomaly scoring, and food-quality vision pipelines are active across tenant operations.</p>
      </div>
      <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
        <h3 className="font-display text-xl font-semibold">Automation</h3>
        <p className="mt-4 text-sm text-slate-600">SLA-based NGO reassignment, geo-fence alerts, and batch routing now run through queue-driven workers.</p>
      </div>
      <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
        <h3 className="font-display text-xl font-semibold">Multi-tenant SaaS</h3>
        <p className="mt-4 text-sm text-slate-600">Tenant partitions, admin controls, CSR exports, and branded enterprise dashboards are enabled by design.</p>
      </div>
    </section>
  </div>
);
