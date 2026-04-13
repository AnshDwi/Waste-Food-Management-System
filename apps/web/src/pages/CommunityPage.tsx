export const CommunityPage = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <h2 className="font-display text-3xl font-semibold">Leaderboards and badges</h2>
      <div className="mt-5 space-y-3 text-sm">
        <div className="rounded-2xl bg-amber-50 p-4">Sunrise Hotel leads donors with the Waste Warrior badge.</div>
        <div className="rounded-2xl bg-emerald-50 p-4">Hope Kitchen leads NGOs with a 4.9 service rating.</div>
        <div className="rounded-2xl bg-sky-50 p-4">Volunteer V-204 unlocked the Route Hero streak badge.</div>
      </div>
    </div>
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <h3 className="font-display text-2xl font-semibold">Community trust</h3>
      <ul className="mt-5 space-y-3 text-sm text-slate-600">
        <li>Ratings influence recommendation confidence and fraud review thresholds.</li>
        <li>Badges reward consistent fulfillment, safe handling, and response speed.</li>
        <li>Tenant admins can tune reward rules without affecting global logic.</li>
      </ul>
    </div>
  </div>
);
