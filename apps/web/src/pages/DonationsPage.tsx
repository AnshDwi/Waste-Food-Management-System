const rows = [
  ['Prepared meals', '120 units', 'Near expiry', 'Auto-prioritized'],
  ['Bakery items', '80 units', 'Fresh', 'Awaiting NGO acceptance'],
  ['Fruit packs', '65 units', 'Fresh', 'Pickup scheduled']
];

export const DonationsPage = () => (
  <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Food management</p>
        <h2 className="font-display text-3xl font-semibold">Donation inventory and FIFO batches</h2>
      </div>
      <button className="rounded-2xl bg-pine px-5 py-3 text-sm font-semibold text-white">Add donation</button>
    </div>
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-500">
          <tr>
            <th className="px-4 py-3">Batch</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Freshness</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-slate-100">
              {row.map((cell) => (
                <td key={cell} className="px-4 py-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
