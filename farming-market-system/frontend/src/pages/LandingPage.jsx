import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Clock3, Flame, MapPin, Sparkles, Tag } from 'lucide-react';
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
  { title: 'Fresh Deals Today', subtitle: 'Up to 20% off selected produce', cta: '/marketplace' },
  { title: 'Support Local Farmers', subtitle: 'Buy direct from nearby growers', cta: '/marketplace' },
  { title: 'Fast Delivery Options', subtitle: 'Track orders in real time', cta: '/orders' }
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const products = await getApprovedMarketplaceFeed();
        setPublicProducts(products || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load products'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryOptions = useMemo(() => ['ALL', ...Array.from(new Set(publicProducts.map((p) => p.categoryName).filter(Boolean)))], [publicProducts]);

  const filtered = useMemo(() => {
    const byCategory = selectedCategory === 'ALL' ? publicProducts : publicProducts.filter((p) => p.categoryName === selectedCategory);
    if (!search) return byCategory;
    return byCategory.filter((p) => `${p.name || ''} ${p.farmerName || ''}`.toLowerCase().includes(search.toLowerCase()));
  }, [publicProducts, search, selectedCategory]);

  const trendingProducts = useMemo(() => filtered.slice(0, 8), [filtered]);
  const flashDeals = useMemo(() => filtered.filter((p, i) => i % 3 === 0).slice(0, 8), [filtered]);
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
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find produce, farmers, categories" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b.title} className="rounded-2xl bg-gradient-to-r from-farm-green to-emerald-600 p-4 text-white shadow-soft">
              <p className="text-lg font-bold">{b.title}</p>
              <p className="mt-1 text-sm text-green-100">{b.subtitle}</p>
              <Link to={b.cta} className="mt-3 inline-block rounded-xl bg-white px-3 py-2 text-xs font-semibold text-farm-green">Explore</Link>
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
          {loading ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="h-52" />)}</div> : error ? <p className="text-sm text-red-600">{error}</p> : trendingProducts.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{trendingProducts.map((p) => <ProductCard key={p.id} product={mapProduct(p)} onAdd={() => onAdd(p)} />)}</div> : <p className="text-sm text-gray-500">No products available.</p>}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold"><MapPin size={16} className="text-farm-green" />Nearby Farmers</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyFarmers.map((f) => <FarmerCard key={`${f.name}-${f.location}`} farmer={f} />)}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold"><Flame size={16} className="text-red-500" />Flash Deals</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600"><Clock3 size={12} />Limited time</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </AppLayout>
  );
}
