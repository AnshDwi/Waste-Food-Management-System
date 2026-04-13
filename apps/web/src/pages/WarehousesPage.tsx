export const WarehousesPage = () => (
  <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <h2 className="font-display text-3xl font-semibold">Supply chain and warehouse ERP</h2>
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3">Cold Storage</th>
              <th className="px-4 py-3">Batches</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">Central Hub</td>
              <td className="px-4 py-4">82%</td>
              <td className="px-4 py-4">146</td>
              <td className="px-4 py-4">Operational</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">North Relay</td>
              <td className="px-4 py-4">61%</td>
              <td className="px-4 py-4">84</td>
              <td className="px-4 py-4">Receiving</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
      <h3 className="font-display text-2xl font-semibold">Batch movement</h3>
      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-2xl bg-slate-100 p-4">Batch B-104: Donor to Central Hub</div>
        <div className="rounded-2xl bg-slate-100 p-4">Batch B-104: Quality review passed</div>
        <div className="rounded-2xl bg-slate-100 p-4">Batch B-104: Central Hub to Hope Kitchen</div>
      </div>
    </div>
  </div>
);
