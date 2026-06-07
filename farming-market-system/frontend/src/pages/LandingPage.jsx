import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CalendarClock, ChevronRight, Flame, MapPin, Menu, Search, Sparkles, Tag } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import ToastStack from '../components/ToastStack';
import ProductCard from '../components/ProductCard';
import FarmerCard from '../components/FarmerCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getApprovedMarketplaceFeed } from '../services/marketplaceService';
import { addToCart } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import { toMediaUrl } from '../utils/media';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

const categoryVisuals = {
  'Fresh Fruits': { label: 'FF', tint: 'from-emerald-100 to-lime-100' },
  Vegetables: { label: 'VG', tint: 'from-emerald-100 to-green-100' },
  Beverages: { label: 'BV', tint: 'from-cyan-100 to-sky-100' },
  'Grocery & Staples': { label: 'GS', tint: 'from-orange-100 to-amber-100' },
  'Frozen Food': { label: 'FR', tint: 'from-slate-100 to-blue-100' },
  'Cooking Oil & Ghee': { label: 'OG', tint: 'from-yellow-100 to-amber-100' },
  'Bakery & Snacks': { label: 'BK', tint: 'from-rose-100 to-orange-100' },
  'Dairy & Eggs': { label: 'DE', tint: 'from-stone-100 to-yellow-50' },
  'Household & Care': { label: 'HC', tint: 'from-violet-100 to-fuchsia-100' }
};

const defaultCategories = [
  'Fresh Fruits',
  'Vegetables',
  'Beverages',
  'Grocery & Staples',
  'Frozen Food',
  'Cooking Oil & Ghee',
  'Bakery & Snacks',
  'Dairy & Eggs',
  'Household & Care'
];

export default function LandingPage() {
  const [publicProducts, setPublicProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toasts, setToasts] = useState([]);

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const products = await getApprovedMarketplaceFeed();
      setPublicProducts(products || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load products. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(publicProducts.map((p) => p.categoryName).filter(Boolean)))],
    [publicProducts]
  );

  const visibleCategories = useMemo(() => {
    const apiCategories = categoryOptions.filter((item) => item !== 'ALL');
    return [...defaultCategories, ...apiCategories.filter((item) => !defaultCategories.includes(item))];
  }, [categoryOptions]);

  const filtered = useMemo(() => {
    const byCategory =
      selectedCategory === 'ALL' ? publicProducts : publicProducts.filter((p) => p.categoryName === selectedCategory);
    if (!search) return byCategory;
    return byCategory.filter((p) =>
      `${p.name || ''} ${p.farmerName || ''} ${p.categoryName || ''} ${p.locationName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [publicProducts, search, selectedCategory]);

  const trendingProducts = useMemo(() => filtered.slice(0, 6), [filtered]);
  const freshFinds = useMemo(() => filtered.slice(2, 8), [filtered]);
  const flashDeals = useMemo(() => filtered.filter((_, i) => i % 3 === 0).slice(0, 4), [filtered]);
  const recommendedProducts = useMemo(() => filtered.slice(4, 8), [filtered]);
  const nearbyFarmers = useMemo(() => {
    const grouped = filtered.reduce((acc, p) => {
      const name = p.farmerName || 'Farmer';
      if (!acc[name]) {
        acc[name] = { name, products: 0, location: p.pickupAddress || p.locationName || 'Unknown' };
      }
      acc[name].products += 1;
      return acc;
    }, {});
    return Object.values(grouped).slice(0, 5);
  }, [filtered]);

  const readyNowCount = useMemo(
    () => filtered.filter((p) => (p.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length,
    [filtered]
  );

  const onAdd = async (product) => {
    try {
      await addToCart(product, 1);
      pushToast('success', 'Added to cart');
    } catch (err) {
      pushToast('error', getApiErrorMessage(err, 'Could not add to cart'));
    }
  };

  const mapProduct = (product, oldPrice = null) => ({
    ...product,
    stock: product.quantity,
    farmer: product.farmerName || 'Farmer',
    image: product.imageUrl ? toMediaUrl(product.imageUrl) : fallbackImage,
    location: product.pickupAddress || product.locationName || 'Unknown',
    availabilityStatus: product.availabilityStatus || 'AVAILABLE',
    oldPrice
  });

  return (
    <AppLayout showMobileNav hideHeader>
      <ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <div className="space-y-5 pb-3">
        <section className="-mx-4 rounded-b-[34px] bg-gradient-to-b from-[#10A64A] via-[#0C9A43] to-[#089143] px-4 pb-6 pt-5 text-white shadow-[0_20px_50px_rgba(8,160,69,0.28)] sm:-mx-5 sm:px-5">
          <div className="mx-auto max-w-screen-sm space-y-4">
            <div className="flex items-center justify-between">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <Menu size={20} />
              </button>
              <div className="text-center">
                <p className="text-[11px] font-medium text-emerald-100">Your location</p>
                <p className="text-sm font-semibold">Gaborone, Botswana</p>
              </div>
              <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-yellow-300" />
              </button>
            </div>

            <div>
              <p className="text-[13px] uppercase tracking-[0.25em] text-emerald-100">Pula Harvest</p>
              <h1 className="mt-2 text-[1.9rem] font-black leading-tight">Fresh farm produce, delivered with field visibility.</h1>
            </div>

            <label className="flex items-center gap-3 rounded-[28px] bg-white px-4 py-3 text-slate-900 shadow-lg">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What are you looking for today?"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="rounded-[30px] bg-white/14 p-1 backdrop-blur">
              <div className="grid grid-cols-[1.1fr_0.85fr] gap-3 rounded-[26px] bg-gradient-to-r from-[#066C31] to-[#0D8B3F] px-4 py-4 shadow-[0_18px_30px_rgba(0,0,0,0.18)]">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-100">Get Discount</p>
                  <p className="text-4xl font-black leading-none">25%</p>
                  <p className="max-w-[12rem] text-sm text-emerald-50">On Vegetables and Fruits</p>
                  <Link to="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#067A38]">
                    Shop Now
                    <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="flex items-end justify-end">
                  <div className="flex h-28 w-28 items-center justify-center rounded-[30px] bg-white/10 text-3xl font-black tracking-[0.2em] shadow-inner shadow-white/10">
                    PH
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[22px] bg-white/12 px-3 py-2">
                <p className="text-[11px] text-emerald-100">Ready now</p>
                <p className="text-lg font-bold">{readyNowCount}</p>
              </div>
              <div className="rounded-[22px] bg-white/12 px-3 py-2">
                <p className="text-[11px] text-emerald-100">Farmers</p>
                <p className="text-lg font-bold">{nearbyFarmers.length}</p>
              </div>
              <div className="rounded-[22px] bg-white/12 px-3 py-2">
                <p className="text-[11px] text-emerald-100">Categories</p>
                <p className="text-lg font-bold">{categoryOptions.length - 1}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Shop by Category</h2>
              <p className="text-xs text-slate-500">Browse fresh essentials and daily staples.</p>
            </div>
            <button type="button" onClick={() => setSelectedCategory('ALL')} className="text-xs font-semibold text-farm-green">
              View all
            </button>
          </div>
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleCategories.map((category) => {
              const active = selectedCategory === category || (category === 'Fresh Fruits' && selectedCategory === 'ALL');
              const visual = categoryVisuals[category] || { label: 'FM', tint: 'from-emerald-100 to-lime-100' };
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === category ? 'ALL' : category)}
                  className={`min-w-[96px] snap-start rounded-[26px] border px-3 py-3 text-left transition ${
                    active ? 'border-emerald-200 bg-white shadow-lg' : 'border-transparent bg-white/80 shadow-soft'
                  }`}
                >
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${visual.tint} text-[11px] font-black tracking-[0.18em] text-slate-700`}>
                    {visual.label}
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-slate-800">{category}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <Sparkles size={16} className="text-farm-green" />
              Most Popular Picks
            </h2>
            <Link to="/marketplace" className="text-xs font-semibold text-farm-green">See all</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-64 rounded-[28px]" />)}
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
              <button type="button" onClick={load} className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-red-700">
                Retry
              </button>
            </div>
          ) : trendingProducts.length ? (
            <div className="grid grid-cols-2 gap-3">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={mapProduct(product)} onAdd={() => onAdd(product)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No products available.</p>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <MapPin size={16} className="text-farm-green" />
              Nearby Farmers
            </h2>
            <Link to="/map" className="text-xs font-semibold text-farm-green">Open map</Link>
          </div>
          <div className="space-y-3">
            {nearbyFarmers.map((farmer) => (
              <FarmerCard key={`${farmer.name}-${farmer.location}`} farmer={farmer} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <Flame size={16} className="text-rose-500" />
              Flash Deals
            </h2>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600">Today only</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {flashDeals.map((product) => (
              <ProductCard
                key={`deal-${product.id}`}
                product={mapProduct(product, Number(product.price) * 1.18)}
                onAdd={() => onAdd(product)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <Tag size={16} className="text-farm-green" />
              Fresh Finds of the Day
            </h2>
            <span className="text-xs font-semibold text-slate-400">Updated live</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {freshFinds.map((product) => (
              <ProductCard key={`fresh-${product.id}`} product={mapProduct(product)} onAdd={() => onAdd(product)} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <CalendarClock size={16} className="text-farm-green" />
              Recommended Products
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recommendedProducts.map((product) => (
              <ProductCard key={`rec-${product.id}`} product={mapProduct(product)} onAdd={() => onAdd(product)} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
