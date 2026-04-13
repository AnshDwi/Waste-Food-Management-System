export const StatCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-lg backdrop-blur">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
  </div>
);
