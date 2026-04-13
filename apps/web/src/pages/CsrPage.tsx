export const CsrPage = () => (
  <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Enterprise ESG</p>
      <h2 className="font-display text-3xl font-semibold">CSR and sustainability reporting</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-emerald-50 p-5">125.4K meals served</div>
        <div className="rounded-2xl bg-sky-50 p-5">18.4T CO2 saved</div>
        <div className="rounded-2xl bg-amber-50 p-5">32.6T waste reduced</div>
      </div>
      <div className="mt-6 rounded-3xl bg-slate-900 p-6 text-white">
        Download-ready PDF and CSV exports can be generated per tenant, donor account, or ESG period.
      </div>
    </div>
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <h3 className="font-display text-2xl font-semibold">Reporting controls</h3>
      <div className="mt-5 space-y-3 text-sm">
        <button className="w-full rounded-2xl bg-ink px-4 py-3 text-white">Generate quarterly PDF</button>
        <button className="w-full rounded-2xl bg-pine px-4 py-3 text-white">Export raw impact CSV</button>
        <button className="w-full rounded-2xl bg-clay px-4 py-3 text-white">Share tenant ESG summary</button>
      </div>
    </div>
  </div>
);
