import { ShoppingCart, Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

export default function ProductCard({ product, onAdd }) {
  const [imgSrc, setImgSrc] = useState(product.image || FALLBACK_IMAGE);
  const status = product.availabilityStatus || 'AVAILABLE';
  const disabled = status !== 'AVAILABLE';
  const stockLevel = Number(product.stock || 0);
  const discount = product.oldPrice && Number(product.oldPrice) > Number(product.price) ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100) : 0;
  const harvestDate = product.harvestReadyDate
    ? new Date(product.harvestReadyDate).toLocaleDateString('en-BW', { day: 'numeric', month: 'short' })
    : '';
  const harvestLabel = {
    IN_FIELD: 'Maturing Soon',
    HARVESTED: 'Ready Now',
    PACKAGED: 'Packed',
    READY_FOR_DELIVERY: 'Ready for Delivery'
  }[product.harvestStatus] || 'Ready Now';

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-soft transition duration-200 active:scale-[0.99]">
      <div className="relative">
        <img src={imgSrc} onError={() => setImgSrc(FALLBACK_IMAGE)} loading="lazy" className="h-40 w-full object-cover" />
        {discount > 0 ? <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">-{discount}%</span> : null}
        <button type="button" className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-600">
          <Heart size={14} />
        </button>
      </div>

      <div className="space-y-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{product.name}</h3>
            <p className="line-clamp-1 text-xs text-gray-500">{product.farmer}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{harvestLabel}</span>
        </div>
        {harvestDate ? <p className="text-[11px] font-medium text-amber-700">Harvest date: {harvestDate}</p> : null}
        <p className="inline-flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{product.location}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-farm-green">BWP {Number(product.price).toFixed(2)}</p>
            <p className="text-[11px] text-gray-500">per {product.unit || product.measurementUnit || 'unit'}</p>
          </div>
          <p className="inline-flex items-center gap-1 text-xs text-gray-500"><Star size={12} className="fill-yellow-400 text-yellow-400" />{product.averageRating ? Number(product.averageRating).toFixed(1) : 'N/A'}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${stockLevel <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{stockLevel <= 5 ? `Low stock ${stockLevel}` : `${stockLevel} available`}</span>
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${disabled ? 'bg-slate-100 text-slate-500' : 'bg-lime-100 text-lime-700'}`}>{disabled ? status.replaceAll('_', ' ') : 'Open for orders'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button onClick={onAdd} disabled={disabled} className="inline-flex items-center justify-center gap-1 rounded-2xl bg-farm-green px-3 py-2.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50" aria-label="Add to cart">
            <ShoppingCart size={15} />
            Add to cart
          </button>
          <Link to={`/products/${product.id}`} className="inline-flex items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-farm-green">View details</Link>
        </div>
      </div>
    </article>
  );
}
