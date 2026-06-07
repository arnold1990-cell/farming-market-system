import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ProductCard from '../components/ProductCard';
import CategoryChip from '../components/CategoryChip';
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
  const [filters, setFilters] = useState({ categoryId: 'ALL', location: '', currency: 'BWP', availability: 'ALL', minPrice: '', maxPrice: '' });

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
      setProducts(publicProducts.filter((p) => {
        if (filters.availability === 'ALL') return true;
        if (filters.availability === 'IN_FIELD') return (p.harvestStatus || '') === 'IN_FIELD';
        return (p.availabilityStatus || 'AVAILABLE') === filters.availability;
      }));
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
  const readinessCount = useMemo(() => ({
    all: filtered.length,
    ready: filtered.filter((p) => (p.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length,
    maturing: filtered.filter((p) => (p.harvestStatus || '') === 'IN_FIELD').length
  }), [filtered]);

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

  return <AppLayout title="Market" subtitle="Browse fresh listings near you" showSearch searchValue={q} onSearchChange={(e) => setQ(e.target.value)}><ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} /><div className="space-y-4">
    <section className="rounded-[30px] bg-white/90 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Marketplace feed</h1>
          <p className="mt-1 text-sm text-slate-500">Track harvest readiness, compare BWP pricing, and locate farmers before ordering.</p>
        </div>
        <Link to="/map" className="rounded-2xl bg-farm-mint px-3 py-2 text-xs font-semibold text-farm-green">Open map</Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-emerald-50 px-2 py-2"><p className="text-[11px] text-emerald-700">Listings</p><p className="text-lg font-bold text-emerald-800">{readinessCount.all}</p></div>
        <div className="rounded-2xl bg-lime-50 px-2 py-2"><p className="text-[11px] text-lime-700">Ready now</p><p className="text-lg font-bold text-lime-800">{readinessCount.ready}</p></div>
        <div className="rounded-2xl bg-amber-50 px-2 py-2"><p className="text-[11px] text-amber-700">Maturing</p><p className="text-lg font-bold text-amber-800">{readinessCount.maturing}</p></div>
      </div>
    </section>
    <div className="rounded-[28px] bg-white/90 p-4 shadow-soft">
      <div className="flex flex-wrap gap-2">
        <button className={`rounded-full px-3 py-2 text-xs font-semibold ${filters.availability === 'ALL' ? 'bg-farm-green text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setFilters((f) => ({ ...f, availability: 'ALL' }))}>All produce</button>
        <button className={`rounded-full px-3 py-2 text-xs font-semibold ${filters.availability === 'AVAILABLE' ? 'bg-farm-green text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setFilters((f) => ({ ...f, availability: 'AVAILABLE' }))}>Ready now</button>
        <button className={`rounded-full px-3 py-2 text-xs font-semibold ${filters.availability === 'IN_FIELD' ? 'bg-farm-green text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setFilters((f) => ({ ...f, availability: 'IN_FIELD' }))}>Maturing soon</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <CategoryChip label="All" active={filters.categoryId === 'ALL'} onClick={() => setFilters((f) => ({ ...f, categoryId: 'ALL' }))} />
        {categories.map((c) => <CategoryChip key={c.id} label={c.name} active={String(filters.categoryId) === String(c.id)} onClick={() => setFilters((f) => ({ ...f, categoryId: String(c.id) }))} />)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <input className="rounded-2xl border border-emerald-100 px-3 py-2.5 text-sm" placeholder="Filter by town" value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} />
        <div className="flex gap-2">
          <input className="w-full rounded-2xl border border-emerald-100 px-3 py-2.5 text-sm" type="number" placeholder="Min BWP" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} />
          <input className="w-full rounded-2xl border border-emerald-100 px-3 py-2.5 text-sm" type="number" placeholder="Max BWP" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} />
        </div>
      </div>
      <button className="mt-3 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600" onClick={onResetFilters}>Reset filters</button>
    </div>
    {loading ? <LoadingSpinner /> : error ? <div className="space-y-3"><EmptyState title="Could not load products" subtitle="Could not load products. Please try again." /><div className="flex justify-center"><button type="button" className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={load}>Refresh</button></div></div> : filtered.length === 0 ? <EmptyState title="No products" subtitle="No products found." /> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{filtered.map((p) => <ProductCard key={p.id} product={{ ...p, stock: p.quantity, farmer: p.farmerName || 'Farmer', image: p.imageUrl ? toMediaUrl(p.imageUrl) : fallbackImage, location: p.pickupAddress || p.locationName || 'Unknown', availabilityStatus: filters.availability === 'IN_FIELD' ? 'AVAILABLE' : (p.availabilityStatus || 'AVAILABLE') }} onAdd={() => onAdd(p)} />)}</div>}
  </div></AppLayout>;
}
