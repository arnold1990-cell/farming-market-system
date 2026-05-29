export default function AnalyticsCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
    </div>
  );
}
