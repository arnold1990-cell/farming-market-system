import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Flame, MapPin, Sparkles, Tag } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import ToastStack from '../components/ToastStack';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategoryChip from '../components/CategoryChip';
import FarmerCard from '../components/FarmerCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getApprovedMarketplaceFeed } from '../services/marketplaceService';
import { addToCart } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import { toMediaUrl } from '../utils/media';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

const banners = [
  { title: 'Fresh Deals Today', subtitle: 'Buy direct from growers with live stock counts and ready-to-harvest produce.', cta: '/marketplace' },
  { title: 'Support Local Farmers', subtitle: 'Track farmer location, pickup points, and harvest readiness in one place.', cta: '/map' },
  { title: 'Fast Delivery Options', subtitle: 'Keep browsing simple on mobile with one-tap ordering and pickup planning.', cta: '/orders' }
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

  const categoryOptions = useMemo(() => ['ALL', ...Array.from(new Set(publicProducts.map((p) => p.categoryName).filter(Boolean)))], [publicProducts]);

  const filtered = useMemo(() => {
    const byCategory = selectedCategory === 'ALL' ? publicProducts : publicProducts.filter((p) => p.categoryName === selectedCategory);
    if (!search) return byCategory;
    return byCategory.filter((p) => `${p.name || ''} ${p.farmerName || ''}`.toLowerCase().includes(search.toLowerCase()));
  }, [publicProducts, search, selectedCategory]);

  const trendingProducts = useMemo(() => filtered.slice(0, 8), [filtered]);
  const flashDeals = useMemo(() => filtered.filter((p, i) => i % 3 === 0).slice(0, 8), [filtered]);
  const hasRealFlashDealExpiry = useMemo(
    () => flashDeals.some((p) => p?.dealExpiryAt || p?.expiresAt || p?.discountEndsAt),
    [flashDeals]
  );
  const recommendedProducts = useMemo(() => filtered.slice(2, 10), [filtered]);
  const nearbyFarmers = useMemo(() => {
    const grouped = filtered.reduce((acc, p) => {
      const name = p.farmerName || 'Farmer';
      if (!acc[name]) {
        acc[name] = { name, products: 0, location: p.pickupAddress || p.locationName || 'Unknown' };
      }
      acc[name].products += 1;
      return acc;
    }, {});
    return Object.values(grouped).slice(0, 10);
  }, [filtered]);
  const readyNowCount = useMemo(() => filtered.filter((p) => (p.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length, [filtered]);
  const maturingSoonCount = useMemo(() => filtered.filter((p) => (p.harvestStatus || '') === 'IN_FIELD').length, [filtered]);
  const uniqueLocations = useMemo(() => new Set(filtered.map((p) => p.pickupAddress || p.locationName).filter(Boolean)).size, [filtered]);

  const onAdd = async (p) => {
    try {
      await addToCart(p, 1);
      pushToast('success', 'Added to cart');
    } catch (err) {
      pushToast('error', getApiErrorMessage(err, 'Could not add to cart'));
    }
  };

  const mapProduct = (p, oldPrice = null) => ({
    ...p,
    stock: p.quantity,
    farmer: p.farmerName || 'Farmer',
    image: p.imageUrl ? toMediaUrl(p.imageUrl) : fallbackImage,
    location: p.pickupAddress || p.locationName || 'Unknown',
    availabilityStatus: p.availabilityStatus || 'AVAILABLE',
    oldPrice
  });

  return (
    <AppLayout title="Pula Harvest" showSearch searchValue={search} onSearchChange={(e) => setSearch(e.target.value)}>
      <ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <div className="space-y-5 pb-2">
        <section className="rounded-[30px] bg-gradient-to-br from-farm-green via-emerald-600 to-lime-600 px-4 py-5 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Marketplace overview</p>
          <h1 className="mt-2 text-2xl font-black leading-tight">Buy fresh produce with real farm visibility.</h1>
          <p className="mt-2 text-sm text-emerald-50">Customers can see what is ready now, who is growing it, and where to collect from nearby farms.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/15 px-3 py-2">
              <p className="text-[11px] text-emerald-100">Ready now</p>
              <p className="text-lg font-bold">{readyNowCount}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2">
              <p className="text-[11px] text-emerald-100">Maturing</p>
              <p className="text-lg font-bold">{maturingSoonCount}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2">
              <p className="text-[11px] text-emerald-100">Locations</p>
              <p className="text-lg font-bold">{uniqueLocations}</p>
            </div>
          </div>
        </section>

        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find produce, farmers, categories" />

        <div className="grid grid-cols-1 gap-3">
          {banners.map((b) => (
            <div key={b.title} className="glass-card rounded-[28px] border border-white/80 p-4 text-slate-900 shadow-soft">
              <p className="text-lg font-bold">{b.title}</p>
              <p className="mt-1 text-sm text-gray-600">{b.subtitle}</p>
              <Link to={b.cta} className="mt-3 inline-block rounded-2xl bg-farm-green px-3 py-2 text-xs font-semibold text-white">Explore</Link>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => <CategoryChip key={category} label={category === 'ALL' ? 'All' : category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)} />)}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold"><Sparkles size={16} className="text-farm-green" />Trending Products</h2>
            <Link to="/marketplace" className="text-xs font-semibold text-farm-green">See all</Link>
          </div>
          {loading ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="h-52" />)}</div> : error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-700">{error}</p><button type="button" className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700" onClick={load}>Retry</button></div> : trendingProducts.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{trendingProducts.map((p) => <ProductCard key={p.id} product={mapProduct(p)} onAdd={() => onAdd(p)} />)}</div> : <p className="text-sm text-gray-500">No products available.</p>}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold"><MapPin size={16} className="text-farm-green" />Nearby Farmers</h2>
            <Link to="/map" className="text-xs font-semibold text-farm-green">Open map</Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {nearbyFarmers.map((f) => <FarmerCard key={`${f.name}-${f.location}`} farmer={f} />)}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold"><Flame size={16} className="text-red-500" />Flash Deals</h2>
            {hasRealFlashDealExpiry ? <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">Deal ending soon</span> : null}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {flashDeals.map((p) => <ProductCard key={`deal-${p.id}`} product={mapProduct(p, Number(p.price) * 1.18)} onAdd={() => onAdd(p)} />)}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold"><Tag size={16} className="text-farm-green" />Recommended</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedProducts.slice(0, 4).map((p) => <ProductCard key={`rec-${p.id}`} product={mapProduct(p)} onAdd={() => onAdd(p)} />)}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-farm-mint p-2 text-farm-green"><CalendarClock size={18} /></div>
            <div>
              <h2 className="section-title">Harvest visibility</h2>
              <p className="section-subtitle">Use the market and map screens to compare ready-now produce against crops still maturing in the field.</p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
