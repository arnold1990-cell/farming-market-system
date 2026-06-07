import { MapPin, Store } from 'lucide-react';

export default function FarmerCard({ farmer }) {
  return (
    <div className="w-full max-w-full rounded-[26px] border border-white/80 bg-white/90 p-3.5 shadow-soft">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-farm-mint text-farm-green">
          <Store size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{farmer.name}</p>
          <p className="text-xs text-gray-500">{farmer.products} active listings</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{farmer.location}</p>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Nearby grower</span>
      </div>
    </div>
  );
}
