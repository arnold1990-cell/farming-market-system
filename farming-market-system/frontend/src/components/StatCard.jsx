export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-farm-charcoal">{value}</p>
        </div>
        {Icon ? <span className="rounded-xl bg-farm-mint p-2 text-farm-green"><Icon size={18} /></span> : null}
      </div>
    </div>
  );
}
