import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import MapboxMarkersMap from '../../components/MapboxMarkersMap';
import { Boxes, DollarSign, ShoppingCart, Truck, CalendarDays } from 'lucide-react';
import { getMyProducts, getFarmerDashboard } from '../../services/productService';
import { getFarmerOrders } from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/errorHandler';
import BrandLogo from '../../components/BrandLogo';

export default function FarmerDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [ps, os, ds] = await Promise.all([getMyProducts(), getFarmerOrders(), getFarmerDashboard().catch(() => null)]);
        setProducts(ps || []);
        setOrders(os || []);
        setDashboard(ds);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to load farmer dashboard'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSales = useMemo(() => dashboard?.totalSales ?? orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0), [orders, dashboard]);
  const pending = useMemo(() => dashboard?.pendingOrders ?? orders.filter((order) => ['PENDING', 'CONFIRMED', 'DELIVERING'].includes(order.status)).length, [orders, dashboard]);
  const lowStock = useMemo(() => products.filter((product) => (product.quantity || 0) <= 5), [products]);
  const salesSeries = useMemo(() => orders.slice(-7).map((order, index) => ({ name: `O${index + 1}`, value: Number(order.totalAmount || 0) })), [orders]);
  const readyNow = useMemo(() => products.filter((product) => (product.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length, [products]);
  const maturingSoon = useMemo(() => products.filter((product) => (product.harvestStatus || '') === 'IN_FIELD').length, [products]);
  const upcomingHarvests = useMemo(() => products.filter((product) => product.harvestReadyDate).length, [products]);

  const byCategory = useMemo(() => Object.values(products.reduce((accumulator, product) => {
    const key = String(product.categoryName || product.categoryId || 'Uncategorised');
    accumulator[key] = accumulator[key] || { name: key, value: 0 };
    accumulator[key].value += 1;
    return accumulator;
  }, {})), [products]);

  if (loading) return <AppLayout title="Farmer Dashboard"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Farmer Dashboard"><EmptyState title="Error" subtitle={error} /></AppLayout>;

  return (
    <AppLayout title="Farmer Dashboard" subtitle="Manage field produce and harvest readiness">
      <div className="space-y-4">
        <section className="rounded-[30px] bg-gradient-to-br from-farm-green via-emerald-600 to-lime-600 p-4 text-white shadow-soft">
          <BrandLogo priority className="mb-3 shrink-0" />
          <h1 className="text-2xl font-black">Your farm operations</h1>
          <p className="mt-2 text-sm text-emerald-50">Update live produce availability, maintain pickup locations, and keep harvest plans visible to buyers.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/farmer/products" className="rounded-2xl bg-white px-3 py-3 text-center text-sm font-semibold text-farm-green">Add produce</Link>
            <Link to="/farmer/profile" className="rounded-2xl bg-white/15 px-3 py-3 text-center text-sm font-semibold text-white">Update farm profile</Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/15 px-2 py-2 text-center">
              <p className="text-[11px] text-emerald-100">Ready now</p>
              <p className="text-lg font-bold">{readyNow}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-2 py-2 text-center">
              <p className="text-[11px] text-emerald-100">Maturing</p>
              <p className="text-lg font-bold">{maturingSoon}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-2 py-2 text-center">
              <p className="text-[11px] text-emerald-100">Orders</p>
              <p className="text-lg font-bold">{orders.length}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Products" value={dashboard?.totalProducts ?? products.length} icon={Boxes} />
          <StatCard label="Active Listings" value={dashboard?.activeListings ?? products.filter((product) => product.available).length} icon={ShoppingCart} />
          <StatCard label="Total Sales" value={`BWP ${Number(totalSales || 0).toFixed(2)}`} icon={DollarSign} />
          <StatCard label="Pending Orders" value={pending} icon={Truck} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ChartCard title="Sales Trend" data={salesSeries.length ? salesSeries : [{ name: 'N/A', value: 0 }]} />
          <section className="rounded-[28px] bg-white/90 p-4 shadow-soft">
            <div className="flex items-center gap-2 text-slate-900">
              <CalendarDays size={18} />
              <h3 className="text-sm font-semibold">Harvest planning</h3>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Upcoming harvests</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{upcomingHarvests}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Low stock items</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{lowStock.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Template weather warnings were removed from this dashboard. Scheduling now lives in the API-backed calendar module.</p>
          </section>
        </div>

        <div className="grid gap-3">
          <ChartCard title="Products by Category" data={byCategory.length ? byCategory : [{ name: 'N/A', value: 0 }]} />
        </div>

        <section className="rounded-[28px] bg-white/90 p-4 shadow-soft">
          <h3 className="mb-3 text-sm font-semibold">Low Stock</h3>
          <DataTable
            columns={[{ key: 'name', title: 'Product' }, { key: 'quantity', title: 'Stock' }]}
            rows={lowStock}
            mobileRender={(row) => <div className="flex items-center justify-between text-sm"><span>{row.name}</span><span>{row.quantity}</span></div>}
          />
        </section>

        <section className="rounded-[28px] bg-white/90 p-4 shadow-soft">
          <h3 className="mb-3 text-sm font-semibold">Product Locations</h3>
          <MapboxMarkersMap markers={products} height={240} />
        </section>
      </div>
    </AppLayout>
  );
}
