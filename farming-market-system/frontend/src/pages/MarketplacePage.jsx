import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, ChevronRight, MapPinned, Search, Sprout } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastStack from '../components/ToastStack';
import MobileMenuButton from '../components/MobileMenuButton';
import BrandLogo from '../components/BrandLogo';
import { getApprovedMarketplaceFeed } from '../services/marketplaceService';
import { getCategories } from '../services/categoryService';
import { addToCart } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import { toMediaUrl } from '../utils/media';
import { CATEGORY_ORDER, CATEGORY_VISUALS } from '../data/categoryCatalog';

const promoImage = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({ categoryId: 'ALL', location: '', availability: 'ALL' });

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
        keyword: query || undefined,
        categoryId: filters.categoryId !== 'ALL' ? Number(filters.categoryId) : undefined,
        location: filters.location || undefined
      };
      const [productResponse, categoryResponse] = await Promise.all([getApprovedMarketplaceFeed(params), getCategories()]);
      const publicProducts = productResponse || [];
      setProducts(
        publicProducts.filter((product) => {
          if (filters.availability === 'ALL') return true;
          if (filters.availability === 'IN_FIELD') return (product.harvestStatus || '') === 'IN_FIELD';
          return (product.availabilityStatus || 'AVAILABLE') === filters.availability;
        })
      );
      setCategories(categoryResponse || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load products. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [query, filters.categoryId, filters.location, filters.availability]);

  const categoryCards = useMemo(
    () =>
      categories
        .filter((category) => CATEGORY_ORDER.includes(category.name))
        .sort((left, right) => CATEGORY_ORDER.indexOf(left.name) - CATEGORY_ORDER.indexOf(right.name))
        .map((category) => ({
        ...category,
        image: CATEGORY_VISUALS[category.name]?.image || ''
      })),
    [categories]
  );

  const counts = useMemo(
    () => ({
      all: products.length,
      ready: products.filter((p) => (p.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length,
      maturing: products.filter((p) => (p.harvestStatus || '') === 'IN_FIELD').length
    }),
    [products]
  );

  const onAdd = async (product) => {
    try {
      await addToCart(product, 1);
      pushToast('success', 'Added to cart');
    } catch (err) {
      pushToast('error', getApiErrorMessage(err, 'Could not add to cart'));
    }
  };

  const onResetFilters = () => {
    setFilters({ categoryId: 'ALL', location: '', availability: 'ALL' });
    setQuery('');
  };

  return (
    <AppLayout title="Marketplace" hideHeader>
      <ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <div className="space-y-4 pb-4">
        <section className="-mx-4 rounded-b-[32px] bg-gradient-to-b from-[#10A64A] to-[#0A8E3E] px-4 pb-5 pt-4 text-white shadow-[0_18px_44px_rgba(8,160,69,0.28)] sm:-mx-5 sm:px-5">
          <div className="mx-auto max-w-screen-sm space-y-3">
            <div className="rounded-[36px] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <div className="flex min-h-[70px] items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <BrandLogo priority className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black tracking-tight text-[#0A6B3A]">Marketplace</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">The neighborhood farm stand, online</p>
                  </div>
                </div>
                <MobileMenuButton className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F8F4] text-[#0A6B3A] shadow-[0_8px_18px_rgba(10,107,58,0.12)]" iconSize={20} />
              </div>
            </div>

            <div className="space-y-3 rounded-[30px] bg-white/12 p-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Community Marketplace</p>
                <h1 className="mt-2 text-[1.6rem] font-black leading-tight">The Neighborhood Farm Stand, Online</h1>
              </div>
              <p className="text-sm leading-6 text-emerald-50">
                Welcome to our digital community market! Every listing here represents the hard work of a local farmer right in your region.
              </p>
              <p className="text-sm leading-6 text-emerald-50">
                Filter your search by crop type, location, or harvest date to find the absolute freshest food available.
              </p>
            </div>

            <label className="flex items-center gap-3 rounded-[24px] bg-white px-4 py-3 text-slate-900 shadow-lg">
              <Search size={17} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fruits, vegetables, farmers"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="grid grid-cols-[1fr_118px] gap-3 rounded-[26px] bg-white p-3 text-slate-900 shadow-[0_18px_28px_rgba(0,0,0,0.12)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Get Discount</p>
                <p className="text-3xl font-black leading-none text-[#067A38]">25%</p>
                <p className="text-sm text-slate-600">On Vegetables & Fruits</p>
                <Link to="/cart" className="inline-flex items-center gap-1 rounded-full bg-farm-green px-4 py-2 text-xs font-bold text-white">
                  Shop Now
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="overflow-hidden rounded-[22px] bg-[#EAF7ED]">
                <img src={promoImage} alt="Vegetables" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-[28px] bg-white p-4 shadow-soft">
            <div className="flex items-center gap-2 text-farm-green">
              <Sprout size={18} />
              <h2 className="text-base font-bold text-slate-900">Freshly Picked</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Browse grains and veggies ready for immediate delivery or pickup today.</p>
          </article>
          <article className="rounded-[28px] bg-white p-4 shadow-soft">
            <div className="flex items-center gap-2 text-farm-green">
              <CalendarRange size={18} />
              <h2 className="text-base font-bold text-slate-900">Coming Soon</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Reserve your share of upcoming harvests before the crops leave the ground.</p>
          </article>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Browse Categories</h2>
            <Link to="/map" className="inline-flex items-center gap-1 text-xs font-semibold text-farm-green">
              <MapPinned size={13} />
              Open map
            </Link>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, categoryId: 'ALL' }))}
              className={`min-w-[98px] rounded-[24px] border p-2 text-left shadow-soft ${filters.categoryId === 'ALL' ? 'border-emerald-200 bg-white' : 'border-transparent bg-white/85'}`}
            >
              <div className="mb-2 h-16 rounded-[18px] bg-gradient-to-br from-emerald-100 to-lime-100" />
              <p className="text-xs font-semibold text-slate-800">All</p>
            </button>
            {categoryCards.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, categoryId: String(category.id) }))}
                className={`min-w-[98px] rounded-[24px] border p-2 text-left shadow-soft ${
                  String(filters.categoryId) === String(category.id) ? 'border-emerald-200 bg-white' : 'border-transparent bg-white/85'
                }`}
              >
                <img src={category.image} alt={category.name} className="mb-2 h-16 w-full rounded-[18px] object-cover" />
                <p className="line-clamp-2 text-xs font-semibold text-slate-800">{category.name}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-[22px] bg-white p-3 text-center shadow-soft">
            <p className="text-[11px] text-slate-500">All</p>
            <p className="text-lg font-black text-slate-900">{counts.all}</p>
          </div>
          <div className="rounded-[22px] bg-white p-3 text-center shadow-soft">
            <p className="text-[11px] text-slate-500">Ready now</p>
            <p className="text-lg font-black text-farm-green">{counts.ready}</p>
          </div>
          <div className="rounded-[22px] bg-white p-3 text-center shadow-soft">
            <p className="text-[11px] text-slate-500">Maturing</p>
            <p className="text-lg font-black text-amber-600">{counts.maturing}</p>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <button className={`rounded-full px-3 py-2 text-xs font-semibold ${filters.availability === 'ALL' ? 'bg-farm-green text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setFilters((f) => ({ ...f, availability: 'ALL' }))}>All produce</button>
            <button className={`rounded-full px-3 py-2 text-xs font-semibold ${filters.availability === 'AVAILABLE' ? 'bg-farm-green text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setFilters((f) => ({ ...f, availability: 'AVAILABLE' }))}>Ready now</button>
            <button className={`rounded-full px-3 py-2 text-xs font-semibold ${filters.availability === 'IN_FIELD' ? 'bg-farm-green text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setFilters((f) => ({ ...f, availability: 'IN_FIELD' }))}>Maturing soon</button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input className="rounded-[20px] border border-emerald-100 bg-[#F8FAF8] px-3 py-3 text-sm outline-none" placeholder="Filter by town" value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} />
            <button className="rounded-[20px] border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-600" onClick={onResetFilters}>Reset filters</button>
          </div>
        </section>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="space-y-3">
            <EmptyState title="Could not load products" subtitle={error} />
            <div className="flex justify-center">
              <button type="button" className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={load}>Refresh</button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No products" subtitle="No products found." />
        ) : (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Most Popular Picks</h2>
              <span className="text-xs font-semibold text-slate-400">Live marketplace</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    stock: product.quantity,
                    farmer: product.farmerName || 'Farmer',
                    image: product.imageUrl ? toMediaUrl(product.imageUrl) : '',
                    location: product.pickupAddress || product.locationName || 'Unknown',
                    availabilityStatus: product.availabilityStatus || 'AVAILABLE'
                  }}
                  onAdd={() => onAdd(product)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
