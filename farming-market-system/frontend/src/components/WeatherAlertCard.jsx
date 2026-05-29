export default function WeatherAlertCard({ alert, onMarkRead }) {
  const sev = String(alert?.severity || 'LOW').toUpperCase();
  const sevCls = {
    LOW: 'bg-blue-100 text-blue-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700'
  };
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm">{alert?.title || 'Weather Alert'}</h4>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${sevCls[sev] || 'bg-gray-100 text-gray-700'}`}>{sev}</span>
      </div>
      <p className="text-sm text-gray-600">{alert?.message || '-'}</p>
      <p className="text-xs text-gray-500">Area: {alert?.targetArea || 'All'} | Radius: {alert?.radiusKm ?? '-'} km</p>
      {onMarkRead ? <button onClick={() => onMarkRead(alert)} className="text-xs font-semibold text-farm-green">Mark as read</button> : null}
    </div>
  );
}
