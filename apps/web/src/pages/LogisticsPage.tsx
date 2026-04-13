export const LogisticsPage = () => (
  <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <h2 className="font-display text-3xl font-semibold">Dispatch and live tracking</h2>
      <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
        <p className="text-sm text-slate-300">Route optimization placeholder for Google Maps integration</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4">Assigned Driver: V-204</div>
          <div className="rounded-2xl bg-white/10 p-4">ETA: 24 min</div>
          <div className="rounded-2xl bg-white/10 p-4">Status: In Transit</div>
        </div>
      </div>
    </div>
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <h3 className="font-display text-2xl font-semibold">Live event feed</h3>
      <div className="mt-5 space-y-3 text-sm">
        <div className="rounded-2xl bg-slate-100 p-4">10:05 Volunteer accepted pickup assignment.</div>
        <div className="rounded-2xl bg-slate-100 p-4">10:11 Donor handoff confirmed with photo proof.</div>
        <div className="rounded-2xl bg-slate-100 p-4">10:18 NGO notified of arrival ETA update.</div>
      </div>
    </div>
  </div>
);
