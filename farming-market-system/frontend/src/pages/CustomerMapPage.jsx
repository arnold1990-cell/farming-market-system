import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import FarmerMapView from '../components/FarmerMapView';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import CategoryChips from '../components/CategoryChips';
import { getApprovedMarketplaceFeed } from '../services/marketplaceService';
import { getApiErrorMessage } from '../utils/errorHandler';

export default function CustomerMapPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setProducts(await getApprovedMarketplaceFeed());
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to load map listings'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(products.map((p) => p.categoryName).filter(Boolean)))], [products]);

  const visible = useMemo(() => products.filter((p) => {
    if (category !== 'ALL' && p.categoryName !== category) return false;
    if (status === 'READY_NOW' && (p.availabilityStatus || 'AVAILABLE') !== 'AVAILABLE') return false;
    if (status === 'MATURING_SOON' && (p.harvestStatus || '') !== 'IN_FIELD') return false;
    return `${p.name || ''} ${p.farmerName || ''}`.toLowerCase().includes(search.toLowerCase());
  }), [products, category, status, search]);

  return (
    <AppLayout title="Farm Map" subtitle="Find produce near you">
      <div className="space-y-4">
        <section className="rounded-[30px] bg-white/90 p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900">Nearby farmers and field stock</h1>
              <p className="mt-1 text-sm text-slate-500">Use location and harvest status to decide which farms can fulfil orders now.</p>
            </div>
            <Link to="/marketplace" className="rounded-2xl bg-farm-mint px-3 py-2 text-xs font-semibold text-farm-green">View market</Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-emerald-50 px-2 py-2"><p className="text-[11px] text-emerald-700">Farm pins</p><p className="text-lg font-bold text-emerald-800">{visible.length}</p></div>
            <div className="rounded-2xl bg-lime-50 px-2 py-2"><p className="text-[11px] text-lime-700">Ready now</p><p className="text-lg font-bold text-lime-800">{visible.filter((p) => (p.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length}</p></div>
            <div className="rounded-2xl bg-amber-50 px-2 py-2"><p className="text-[11px] text-amber-700">Maturing</p><p className="text-lg font-bold text-amber-800">{visible.filter((p) => (p.harvestStatus || '') === 'IN_FIELD').length}</p></div>
          </div>
        </section>
        <SearchAndFilterBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search farmer or crop">
          <button onClick={() => setStatus('ALL')} className={`rounded-full px-3 py-1 text-xs ${status === 'ALL' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>All</button>
          <button onClick={() => setStatus('READY_NOW')} className={`rounded-full px-3 py-1 text-xs ${status === 'READY_NOW' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>Ready Now</button>
          <button onClick={() => setStatus('MATURING_SOON')} className={`rounded-full px-3 py-1 text-xs ${status === 'MATURING_SOON' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>Maturing Soon</button>
        </SearchAndFilterBar>
        <CategoryChips categories={categories} active={category} onChange={setCategory} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="rounded-[28px] bg-white/90 p-3 shadow-soft">
          <FarmerMapView products={visible.map((p) => ({ ...p, latitude: p.pickupLatitude ?? p.latitude, longitude: p.pickupLongitude ?? p.longitude }))} height={420} />
        </div>
        {loading ? null : <div className="space-y-3">
          {visible.slice(0, 6).map((p) => (
            <div key={p.id} className="rounded-[24px] bg-white/90 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.farmerName || 'Farmer'} • {p.pickupAddress || p.locationName || 'Unknown location'}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{(p.harvestStatus || 'READY_NOW').replaceAll('_', ' ')}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-farm-green">BWP {Number(p.price || 0).toFixed(2)} / {p.unit || 'unit'}</p>
            </div>
          ))}
        </div>}
      </div>
    </AppLayout>
  );
}
