import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import FarmerMapView from '../components/FarmerMapView';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import CategoryChips from '../components/CategoryChips';
import { getApprovedMarketplaceFeed } from '../services/marketplaceService';
import { getApiErrorMessage } from '../utils/errorHandler';

export default function CustomerMapPage() {
  const [products, setProducts] = useState([]);
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
    <AppLayout title="Farmer Map">
      <div className="space-y-3">
        <SearchAndFilterBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search farmer or crop">
          <button onClick={() => setStatus('ALL')} className={`rounded-full px-3 py-1 text-xs ${status === 'ALL' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>All</button>
          <button onClick={() => setStatus('READY_NOW')} className={`rounded-full px-3 py-1 text-xs ${status === 'READY_NOW' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>Ready Now</button>
          <button onClick={() => setStatus('MATURING_SOON')} className={`rounded-full px-3 py-1 text-xs ${status === 'MATURING_SOON' ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>Maturing Soon</button>
        </SearchAndFilterBar>
        <CategoryChips categories={categories} active={category} onChange={setCategory} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <FarmerMapView products={visible.map((p) => ({ ...p, latitude: p.pickupLatitude ?? p.latitude, longitude: p.pickupLongitude ?? p.longitude }))} height={460} />
      </div>
    </AppLayout>
  );
}
