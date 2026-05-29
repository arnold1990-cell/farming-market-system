import { MapPin, Store } from 'lucide-react';

export default function FarmerCard({ farmer }) {
  return (
    <div className="w-full max-w-full rounded-2xl bg-white p-3 shadow-soft">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-farm-mint text-farm-green">
          <Store size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold">{farmer.name}</p>
          <p className="text-xs text-gray-500">{farmer.products} products</p>
        </div>
      </div>
      <p className="inline-flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{farmer.location}</p>
    </div>
  );
}
