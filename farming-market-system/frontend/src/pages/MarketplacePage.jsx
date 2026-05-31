import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastStack from '../components/ToastStack';
import { getApprovedMarketplaceFeed } from '../services/marketplaceService';
import { getCategories } from '../services/categoryService';
import { addToCart } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import { toMediaUrl } from '../utils/media';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({ categoryId: 'ALL', location: '', currency: 'ALL', availability: 'ALL', minPrice: '', maxPrice: '' });

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        keyword: q || undefined,
        categoryId: filters.categoryId !== 'ALL' ? Number(filters.categoryId) : undefined,
        location: filters.location || undefined,
        currency: filters.currency !== 'ALL' ? filters.currency : undefined,
        minPrice: filters.minPrice !== '' ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice !== '' ? Number(filters.maxPrice) : undefined
      };
      const [ps, cs] = await Promise.all([getApprovedMarketplaceFeed(params), getCategories()]);
      const publicProducts = ps || [];
      console.log('Public products loaded:', publicProducts);
      setProducts(publicProducts.filter((p) => filters.availability === 'ALL' ? true : (p.availabilityStatus || 'AVAILABLE') === filters.availability));
      setCategories(cs || []);
    } catch (err) {
      const friendly = getApiErrorMessage(err, 'Could not load products. Please try again.');
      setError(friendly || 'Could not load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [q, filters.categoryId, filters.location, filters.currency, filters.minPrice, filters.maxPrice, filters.availability]);

  const filtered = useMemo(() => products, [products]);

  const onAdd = async (p) => {
    try {
      await addToCart(p, 1);
      pushToast('success', 'Added to cart');
    } catch (err) {
      pushToast('error', getApiErrorMessage(err, 'Could not add to cart'));
    }
  };

  const onResetFilters = () => {
    setFilters({ categoryId: 'ALL', location: '', currency: 'ALL', availability: 'ALL', minPrice: '', maxPrice: '' });
    setQ('');
  };

  return <AppLayout title="Market" showSearch searchValue={q} onSearchChange={(e) => setQ(e.target.value)}><ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} /><div className="space-y-4">
    <div className="card p-4 grid gap-3 md:grid-cols-6">
      <select className="border rounded-xl px-3 py-2" value={filters.categoryId} onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}><option value="ALL">All Categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input className="border rounded-xl px-3 py-2" placeholder="Location" value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} />
      <select className="border rounded-xl px-3 py-2" value={filters.currency} onChange={(e) => setFilters((f) => ({ ...f, currency: e.target.value }))}><option value="ALL">Any Currency</option><option value="BWP">BWP</option></select>
      <select className="border rounded-xl px-3 py-2" value={filters.availability} onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}><option value="ALL">Any Availability</option><option value="AVAILABLE">AVAILABLE</option><option value="SOLD">SOLD</option><option value="OUT_OF_STOCK">OUT_OF_STOCK</option></select>
      <input className="border rounded-xl px-3 py-2" type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} />
      <div className="flex gap-2"><input className="border rounded-xl px-3 py-2 w-full" type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} /><button className="px-3 py-2 rounded-xl border" onClick={onResetFilters}>Reset</button></div>
    </div>
    {loading ? <LoadingSpinner /> : error ? <div className="space-y-3"><EmptyState title="Could not load products" subtitle="Could not load products. Please try again." /><div className="flex justify-center"><button type="button" className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={load}>Refresh</button></div></div> : filtered.length === 0 ? <EmptyState title="No products" subtitle="No products found." /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filtered.map((p) => <ProductCard key={p.id} product={{ ...p, stock: p.quantity, farmer: p.farmerName || 'Farmer', image: p.imageUrl ? toMediaUrl(p.imageUrl) : fallbackImage, location: p.pickupAddress || p.locationName || 'Unknown', availabilityStatus: p.availabilityStatus || 'AVAILABLE' }} onAdd={() => onAdd(p)} />)}</div>}
  </div></AppLayout>;
}
