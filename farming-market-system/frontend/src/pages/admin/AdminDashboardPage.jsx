import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Users, Tractor, ShoppingCart, DollarSign, AlertTriangle, Truck } from 'lucide-react';
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

  const chartData = useMemo(() => orders.slice(-7).map((order, index) => ({
    name: `O${index + 1}`,
    value: Number(order.totalAmount || 0),
  })), [orders]);
  const totalListings = stats?.products ?? 0;
  const pendingListings = stats?.pendingListings ?? 0;
  const approvedListings = stats?.approvedListings ?? 0;
  const rejectedListings = stats?.rejectedListings ?? 0;
  const pendingOrders = useMemo(() => orders.filter((order) => ['PENDING', 'CONFIRMED'].includes(order.status)).length, [orders]);
  const activeDeliveries = useMemo(() => orders.filter((order) => ['DELIVERING', 'READY_FOR_PICKUP'].includes(order.status)).length, [orders]);

  if (loading) return <AppLayout title="Admin Dashboard"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Admin Dashboard"><EmptyState title="Error" subtitle={error} /></AppLayout>;

  return (
    <AppLayout title="Admin Dashboard" subtitle="Control marketplace health">
      <div className="space-y-4">
        <section className="rounded-[30px] bg-white/90 p-4 shadow-soft">
          <h1 className="text-xl font-black text-slate-900">Marketplace operations</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor farmers, listings, orders, deliveries, and revenue from live system data only.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-emerald-50 px-2 py-2">
              <p className="text-[11px] text-emerald-700">Farmers</p>
              <p className="text-lg font-bold text-emerald-800">{stats.farmers}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-2 py-2">
              <p className="text-[11px] text-amber-700">Pending orders</p>
              <p className="text-lg font-bold text-amber-800">{pendingOrders}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 px-2 py-2">
              <p className="text-[11px] text-sky-700">Listings</p>
              <p className="text-lg font-bold text-sky-800">{totalListings}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Farmers" value={stats.farmers} icon={Tractor} />
          <StatCard label="Pending Farmers" value={stats.pendingFarmers ?? 0} icon={Users} />
          <StatCard label="Active Customers" value={stats.buyers} icon={Users} />
          <StatCard label="Total Listings" value={totalListings} icon={ShoppingCart} />
          <StatCard label="Pending Listings" value={pendingListings} icon={ShoppingCart} />
          <StatCard label="Approved Listings" value={approvedListings} icon={ShoppingCart} />
          <StatCard label="Rejected Listings" value={rejectedListings} icon={AlertTriangle} />
          <StatCard label="Revenue Tracked" value={`BWP ${Number(summary?.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ChartCard title="Revenue" data={chartData.length ? chartData : [{ name: 'N/A', value: 0 }]} />
          <section className="rounded-[28px] bg-white/90 p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-slate-900">Operational focus</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Truck size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Active deliveries</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{activeDeliveries}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Red flags</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{flags.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Draft-only alert broadcasting and template weather widgets were removed from the admin dashboard during the cleanup audit.</p>
          </section>
        </div>

        <section className="rounded-[28px] bg-white/90 p-4 shadow-soft">
          <h3 className="mb-2 text-sm font-semibold">Recent Orders</h3>
          <DataTable
            columns={[{ key: 'id', title: 'Order' }, { key: 'status', title: 'Status' }]}
            rows={orders.slice(0, 8).map((order) => ({ ...order, id: `#${order.id}` }))}
            mobileRender={(row) => <div className="flex items-center justify-between text-sm"><span>{row.id}</span><span>{row.status}</span></div>}
          />
        </section>

        <section className="rounded-[28px] bg-white/90 p-4 shadow-soft">
          <h3 className="mb-2 text-sm font-semibold">Red Flags</h3>
          <DataTable
            columns={[{ key: 'id', title: 'ID' }, { key: 'reason', title: 'Reason' }, { key: 'status', title: 'Status' }]}
            rows={flags.slice(0, 10)}
            mobileRender={(row) => <div className="text-sm">#{row.id} {row.reason} ({row.status})</div>}
          />
        </section>
      </div>
    </AppLayout>
  );
}
