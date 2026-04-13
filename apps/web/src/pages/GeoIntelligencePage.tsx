export const GeoIntelligencePage = () => (
  <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
    <div className="glass-panel-strong rounded-[34px] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300">Geo intelligence</p>
          <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">Waste and demand heatmaps</h2>
        </div>
        <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
          Open live OSM layer
        </button>
      </div>
      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6 dark:border-white/10 dark:from-emerald-500/10 dark:via-slate-900/60 dark:to-orange-500/10">
        <div className="h-80 rounded-[1.5rem] border border-dashed border-slate-300 bg-[radial-gradient(circle_at_20%_30%,rgba(249,115,22,0.25),transparent_18%),radial-gradient(circle_at_60%_55%,rgba(14,165,233,0.25),transparent_20%),radial-gradient(circle_at_78%_25%,rgba(16,185,129,0.22),transparent_18%),#f8fafc] dark:border-white/10 dark:bg-[radial-gradient(circle_at_20%_30%,rgba(249,115,22,0.25),transparent_18%),radial-gradient(circle_at_60%_55%,rgba(14,165,233,0.25),transparent_20%),radial-gradient(circle_at_78%_25%,rgba(16,185,129,0.22),transparent_18%),#0f172a]" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="glass-panel-strong rounded-[34px] p-6">
        <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">Hot zones</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-950 dark:border-transparent dark:bg-rose-500/10 dark:text-rose-100">Zone A12: high waste volume, 3 expiring batches, geo-fence alert active.</div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-950 dark:border-transparent dark:bg-sky-500/10 dark:text-sky-100">Zone D04: high NGO demand, recommended redirection target.</div>
        </div>
      </div>
      <div className="glass-panel-strong rounded-[34px] p-6">
        <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">Geo-fencing rules</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <li>Notify verified NGOs within 7 km for near-expiry donations.</li>
          <li>Escalate to warehouse routing when direct NGO capacity is unavailable.</li>
          <li>Boost volunteer assignment where delivery density exceeds threshold.</li>
        </ul>
      </div>
    </div>
  </div>
);
