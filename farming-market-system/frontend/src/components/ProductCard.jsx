import { Heart, MapPin, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function ProductCard({ product, onAdd }) {
  const [imgSrc, setImgSrc] = useState(product.image || '');
  const status = product.availabilityStatus || 'AVAILABLE';
  const disabled = status !== 'AVAILABLE';
  const stockLevel = Number(product.stock || 0);
  const discount =
    product.oldPrice && Number(product.oldPrice) > Number(product.price)
      ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
      : 0;
  const harvestDate = product.harvestReadyDate
    ? new Date(product.harvestReadyDate).toLocaleDateString('en-BW', { day: 'numeric', month: 'short' })
    : '';
  const harvestLabel =
    {
      IN_FIELD: 'Maturing Soon',
      HARVESTED: 'Ready Now',
      PACKAGED: 'Packed',
      READY_FOR_DELIVERY: 'Ready for Delivery'
    }[product.harvestStatus] || 'Ready Now';

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#EEF3EF] bg-white p-2.5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition duration-200 active:scale-[0.99]">
      <div className="relative rounded-[20px] bg-[#F0F7F1] p-2">
        {imgSrc ? (
          <img
            src={imgSrc}
            onError={() => setImgSrc('')}
            loading="lazy"
            alt={product.name || 'Product image'}
            className="h-24 w-full rounded-[16px] object-cover"
          />
        ) : (
          <div className="grid h-24 w-full place-items-center rounded-[16px] bg-gradient-to-br from-emerald-100 to-lime-50 text-center text-[11px] font-semibold text-emerald-800">
            No product image
          </div>
        )}
        {discount > 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">
            -{discount}%
          </span>
        ) : null}
        <button type="button" className="absolute right-3 top-3 rounded-full bg-white/95 p-1.5 text-gray-600 shadow-sm">
          <Heart size={14} />
        </button>
      </div>

      <div className="space-y-1.5 px-1 pb-1 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[13px] font-bold text-slate-900">{product.name}</h3>
            <p className="line-clamp-1 text-[11px] text-gray-500">{product.farmer}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            {product.averageRating ? Number(product.averageRating).toFixed(1) : '4.8'}
          </span>
        </div>

        <p className="inline-flex items-center gap-1 text-[11px] text-gray-500">
          <MapPin size={11} />
          {product.location}
        </p>

        {harvestDate ? (
          <p className="text-[11px] font-medium text-emerald-700">
            {harvestLabel} - {harvestDate}
          </p>
        ) : (
          <p className="text-[11px] font-medium text-emerald-700">{harvestLabel}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[15px] font-black text-farm-green">BWP {Number(product.price).toFixed(2)}</p>
            <p className="text-[10px] text-gray-500">per {product.unit || product.measurementUnit || 'unit'}</p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
              stockLevel <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {stockLevel <= 5 ? `Low stock ${stockLevel}` : `${stockLevel} in stock`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            to={`/products/${product.id}`}
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-farm-green"
          >
            View details
          </Link>
          <button
            onClick={onAdd}
            disabled={disabled}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-farm-green text-white shadow-sm disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
