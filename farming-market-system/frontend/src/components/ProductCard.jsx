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

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-soft transition duration-200 active:scale-[0.99]">
      <div className="relative">
        <img src={imgSrc} onError={() => setImgSrc(FALLBACK_IMAGE)} loading="lazy" className="h-40 w-full object-cover" />
        {discount > 0 ? <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">-{discount}%</span> : null}
        <button type="button" className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-600">
          <Heart size={14} />
        </button>
        <button onClick={onAdd} disabled={disabled} className="absolute bottom-2 right-2 rounded-full bg-farm-green p-2 text-white shadow-lg disabled:opacity-50" aria-label="Add to cart">
          <ShoppingCart size={16} />
        </button>
      </div>

      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
        <p className="line-clamp-1 text-xs text-gray-500">{product.farmer}</p>
        <p className="inline-flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{product.location}</p>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-farm-green">BWP {Number(product.price).toFixed(2)}</p>
          <p className="inline-flex items-center gap-1 text-xs text-gray-500"><Star size={12} className="fill-yellow-400 text-yellow-400" />{product.averageRating ? Number(product.averageRating).toFixed(1) : 'N/A'}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${stockLevel <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{stockLevel <= 5 ? `Low stock (${stockLevel})` : `In stock (${stockLevel})`}</span>
          <Link to={`/products/${product.id}`} className="text-xs font-semibold text-farm-green">View</Link>
        </div>
      </div>
    </article>
  );
}
