const tones = {
  SEVERE: 'border-red-200 bg-red-50 text-red-700',
  WARNING: 'border-amber-200 bg-amber-50 text-amber-700',
  WATCH: 'border-sky-200 bg-sky-50 text-sky-700',
  INFO: 'border-emerald-200 bg-emerald-50 text-emerald-700'
};

export default function WeatherAlertsPanel({ alerts = [], title = 'Weather alerts', subtitle = 'Alerts will become live when a weather API is connected.' }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <article key={alert.id} className={`rounded-[24px] border px-4 py-3 shadow-soft ${tones[alert.severity] || tones.INFO}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-1 text-xs opacity-80">{alert.area}</p>
              </div>
              <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold">{alert.severity}</span>
            </div>
            <p className="mt-2 text-sm leading-5">{alert.message}</p>
            <p className="mt-2 text-[11px] opacity-75">{alert.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
