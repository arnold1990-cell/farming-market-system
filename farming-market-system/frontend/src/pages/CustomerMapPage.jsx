import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import FarmerMapView from '../components/FarmerMapView';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import CategoryChips from '../components/CategoryChips';
import { getCategories } from '../services/categoryService';
import { getProductMapListings } from '../services/productService';
import { getApiErrorMessage } from '../utils/errorHandler';

export default function CustomerMapPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [location, setLocation] = useState('');
  const [radiusKm, setRadiusKm] = useState('25');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [mapProducts, categoryList] = await Promise.all([
          getProductMapListings({
            keyword: search || undefined,
            categoryId: category !== 'ALL' ? Number(category) : undefined,
            location: location || undefined,
            radiusKm: radiusKm ? Number(radiusKm) : undefined
          }),
          getCategories()
        ]);
        setProducts(mapProducts || []);
        setCategories(categoryList || []);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to load map listings'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, category, location, radiusKm]);

  const visible = useMemo(
    () =>
      products.filter((product) => {
        if (status === 'READY_NOW' && (product.availabilityStatus || 'AVAILABLE') !== 'AVAILABLE') return false;
        if (status === 'MATURING_SOON' && (product.harvestStatus || '') !== 'IN_FIELD') return false;
        return true;
      }),
    [products, status]
  );

  const categoryOptions = useMemo(() => ['ALL', ...categories.map((entry) => entry.name)], [categories]);

  return (
    <AppLayout title="Farm Map" subtitle="Find produce near you">
      <div className="space-y-4">
        <section className="rounded-[30px] bg-white/90 p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900">Nearby farmers and field stock</h1>
              <p className="mt-1 text-sm text-slate-500">Use location and harvest status to decide which farms can fulfil orders now.</p>
            </div>
            <Link to="/market" className="rounded-2xl bg-farm-mint px-3 py-2 text-xs font-semibold text-farm-green">
              View market
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-emerald-50 px-2 py-2">
              <p className="text-[11px] text-emerald-700">Farm pins</p>
              <p className="text-lg font-bold text-emerald-800">{visible.length}</p>
            </div>
            <div className="rounded-2xl bg-lime-50 px-2 py-2">
              <p className="text-[11px] text-lime-700">Ready now</p>
              <p className="text-lg font-bold text-lime-800">{visible.filter((product) => (product.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-2 py-2">
              <p className="text-[11px] text-amber-700">Maturing</p>
              <p className="text-lg font-bold text-amber-800">{visible.filter((product) => (product.harvestStatus || '') === 'IN_FIELD').length}</p>
            </div>
          </div>
        </section>

        <SearchAndFilterBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Gaborone, vegetables, tomatoes">
          <button onClick={() => setStatus('ALL')} className={`rounded-full px-3 py-1 text-xs ${status === 'ALL' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>All</button>
          <button onClick={() => setStatus('READY_NOW')} className={`rounded-full px-3 py-1 text-xs ${status === 'READY_NOW' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>Ready Now</button>
          <button onClick={() => setStatus('MATURING_SOON')} className={`rounded-full px-3 py-1 text-xs ${status === 'MATURING_SOON' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>Maturing Soon</button>
        </SearchAndFilterBar>

        <div className="rounded-[24px] bg-white/90 p-3 shadow-soft">
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-2xl border border-emerald-100 px-3 py-2.5 text-sm" placeholder="Location filter" value={location} onChange={(e) => setLocation(e.target.value)} />
            <input className="rounded-2xl border border-emerald-100 px-3 py-2.5 text-sm" type="number" min="1" placeholder="Radius km" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} />
          </div>
        </div>

        <CategoryChips
          categories={categoryOptions}
          active={category === 'ALL' ? 'ALL' : categories.find((entry) => String(entry.id) === category)?.name || 'ALL'}
          onChange={(label) => {
            if (label === 'ALL') {
              setCategory('ALL');
              return;
            }
            const match = categories.find((entry) => entry.name === label);
            setCategory(match ? String(match.id) : 'ALL');
          }}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="rounded-[28px] bg-white/90 p-3 shadow-soft">
          <FarmerMapView products={visible.map((product) => ({ ...product, latitude: product.latitude, longitude: product.longitude, name: product.productName, locationName: product.location }))} height={420} />
        </div>

        {loading ? null : (
          <div className="space-y-3">
            {visible.slice(0, 6).map((product) => (
              <div key={product.productId} className="rounded-[24px] bg-white/90 p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.productName}</p>
                    <p className="text-xs text-slate-500">{product.farmerName || 'Farmer'} - {product.location || 'Unknown location'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    {(product.harvestStatus || 'READY_NOW').replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-farm-green">BWP {Number(product.price || 0).toFixed(2)} / {product.unit || 'unit'}</p>
                <p className="mt-1 text-xs text-slate-500">Quantity: {product.quantity ?? 0} - Category: {product.categoryName || '-'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
