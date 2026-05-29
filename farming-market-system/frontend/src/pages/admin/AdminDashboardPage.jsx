import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Users, Tractor, ShoppingCart, DollarSign } from 'lucide-react';
import { getDashboardStats, getAllOrdersAdmin, getMonetizationSummary, getRedFlags } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/errorHandler';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [s, o, m, f] = await Promise.all([getDashboardStats(), getAllOrdersAdmin(), getMonetizationSummary(), getRedFlags()]);
        setStats(s);
        setOrders(o || []);
        setSummary(m);
        setFlags(f || []);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to load admin dashboard'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <AppLayout title="Admin Dashboard"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Admin Dashboard"><EmptyState title="Error" subtitle={error} /></AppLayout>;

  const chartData = orders.slice(-7).map((o, i) => ({ name: `O${i + 1}`, value: Number(o.totalAmount || 0) }));
  const totalListings = stats?.products ?? 0;
  const pendingListings = stats?.pendingListings ?? 0;
  const approvedCount = stats?.approvedListings ?? 0;
  const rejectedListings = stats?.rejectedListings ?? 0;

  return <AppLayout title="Admin Dashboard"><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><StatCard label="Total Farmers" value={stats.farmers} icon={Tractor} /><StatCard label="Pending Farmers" value={stats.pendingFarmers ?? 0} icon={Users} /><StatCard label="Active Customers" value={stats.buyers} icon={Users} /><StatCard label="Total Listings" value={totalListings} icon={ShoppingCart} /><StatCard label="Pending Listings" value={pendingListings} icon={ShoppingCart} /><StatCard label="Approved Listings" value={approvedCount} icon={ShoppingCart} /><StatCard label="Rejected Listings" value={rejectedListings} icon={ShoppingCart} /><StatCard label="Weather Alerts Sent" value={0} icon={DollarSign} /></div><ChartCard title="Revenue" data={chartData.length ? chartData : [{ name: 'N/A', value: 0 }]} /><div className="rounded-2xl bg-white p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">Recent Orders</h3><DataTable columns={[{ key: 'id', title: 'Order' }, { key: 'status', title: 'Status' }]} rows={orders.slice(0, 8).map((o) => ({ ...o, id: `#${o.id}` }))} mobileRender={(r) => <div className="flex items-center justify-between text-sm"><span>{r.id}</span><span>{r.status}</span></div>} /></div><div className="rounded-2xl bg-white p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">Red Flags</h3><DataTable columns={[{ key: 'id', title: 'ID' }, { key: 'reason', title: 'Reason' }, { key: 'status', title: 'Status' }]} rows={flags.slice(0, 10)} mobileRender={(r) => <div className="text-sm">#{r.id} {r.reason} ({r.status})</div>} /></div></div></AppLayout>;
}
