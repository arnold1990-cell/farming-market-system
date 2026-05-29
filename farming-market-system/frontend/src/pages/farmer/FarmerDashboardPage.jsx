import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import MapboxMarkersMap from '../../components/MapboxMarkersMap';
import { Boxes, DollarSign, ShoppingCart, Truck } from 'lucide-react';
import { getMyProducts, getFarmerDashboard } from '../../services/productService';
import { getFarmerOrders } from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/errorHandler';

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

  const totalSales = useMemo(() => dashboard?.totalSales ?? orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0), [orders, dashboard]);
  const pending = useMemo(() => dashboard?.pendingOrders ?? orders.filter((o) => ['PENDING', 'CONFIRMED', 'DELIVERING'].includes(o.status)).length, [orders, dashboard]);
  const lowStock = useMemo(() => products.filter((p) => (p.quantity || 0) <= 5), [products]);
  const salesSeries = orders.slice(-7).map((o, i) => ({ name: `O${i + 1}`, value: Number(o.totalAmount || 0) }));

  const byCategory = Object.values(products.reduce((acc, p) => {
    const key = String(p.categoryId || 'N/A');
    acc[key] = acc[key] || { name: `Cat ${key}`, value: 0 };
    acc[key].value += 1;
    return acc;
  }, {}));

  if (loading) return <AppLayout title="Farmer Dashboard"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Farmer Dashboard"><EmptyState title="Error" subtitle={error} /></AppLayout>;

  return <AppLayout title="Farmer Dashboard"><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><StatCard label="Total Products" value={dashboard?.totalProducts ?? products.length} icon={Boxes} /><StatCard label="Active Listings" value={dashboard?.activeListings ?? products.filter((p) => p.available).length} icon={ShoppingCart} /><StatCard label="Total Sales" value={`BWP ${Number(totalSales || 0).toFixed(2)}`} icon={DollarSign} /><StatCard label="Pending Orders" value={pending} icon={Truck} /></div><div className="grid gap-3"><ChartCard title="Sales Trend" data={salesSeries.length ? salesSeries : [{ name: 'N/A', value: 0 }]} /><ChartCard title="Products by Category" data={byCategory.length ? byCategory : [{ name: 'N/A', value: 0 }]} /></div><div className="rounded-2xl bg-white p-4 shadow-soft"><h3 className="mb-3 text-sm font-semibold">Low Stock</h3><DataTable columns={[{ key: 'name', title: 'Product' }, { key: 'quantity', title: 'Stock' }]} rows={lowStock} mobileRender={(r) => <div className="flex items-center justify-between text-sm"><span>{r.name}</span><span>{r.quantity}</span></div>} /></div><div className="rounded-2xl bg-white p-4 shadow-soft"><h3 className="mb-3 text-sm font-semibold">Product Locations</h3><MapboxMarkersMap markers={products} height={240} /></div></div></AppLayout>;
}
