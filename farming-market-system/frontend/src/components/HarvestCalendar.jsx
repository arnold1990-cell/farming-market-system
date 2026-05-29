import { useMemo, useState } from 'react';

export default function HarvestCalendar({ items = [], showOwner = false }) {
  const [filter, setFilter] = useState('ALL');

  const visible = useMemo(() => items.filter((item) => filter === 'ALL' ? true : item.calendarWindow === filter), [items, filter]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft space-y-3">
      <div className="flex flex-wrap gap-2">
        {['ALL', 'READY_NOW', 'THIS_WEEK', 'THIS_MONTH', 'LATER'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${filter === f ? 'bg-farm-green text-white' : 'bg-gray-100 text-gray-700'}`}>
            {f.replaceAll('_', ' ')}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {visible.length === 0 ? <p className="text-sm text-gray-500">No produce in this window.</p> : visible.map((item) => (
          <div key={item.id} className="rounded-xl border border-gray-100 p-3 text-sm">
            <p className="font-semibold">{item.name}</p>
            <p className="text-gray-600">{item.calendarWindow?.replaceAll('_', ' ')}</p>
            {showOwner ? <p className="text-xs text-gray-500">{item.farmerName || 'My listing'}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
