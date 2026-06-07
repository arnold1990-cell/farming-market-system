import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Users, Tractor, ShoppingCart, DollarSign } from 'lucide-react';
import { getDashboardStats, getAllOrdersAdmin, getMonetizationSummary, getRedFlags } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/errorHandler';
import WeatherAlertsPanel from '../../components/WeatherAlertsPanel';
import { adminWeatherAlertTemplates } from '../../data/weatherAlertTemplates';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draftAlert, setDraftAlert] = useState({ severity: 'WARNING', area: '', message: '' });
  const [draftPreview, setDraftPreview] = useState('');

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
  const pendingOrders = useMemo(() => orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status)).length, [orders]);

  return <AppLayout title="Admin Dashboard" subtitle="Control marketplace health"><div className="space-y-4"><section className="rounded-[30px] bg-white/90 p-4 shadow-soft"><h1 className="text-xl font-black text-slate-900">Super Admin control centre</h1><p className="mt-1 text-sm text-slate-500">Moderate users, review listings, monitor revenue, and prepare location-based severe weather messaging.</p><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-emerald-50 px-2 py-2"><p className="text-[11px] text-emerald-700">Farmers</p><p className="text-lg font-bold text-emerald-800">{stats.farmers}</p></div><div className="rounded-2xl bg-amber-50 px-2 py-2"><p className="text-[11px] text-amber-700">Pending orders</p><p className="text-lg font-bold text-amber-800">{pendingOrders}</p></div><div className="rounded-2xl bg-sky-50 px-2 py-2"><p className="text-[11px] text-sky-700">Listings</p><p className="text-lg font-bold text-sky-800">{totalListings}</p></div></div></section><div className="grid grid-cols-2 gap-3"><StatCard label="Total Farmers" value={stats.farmers} icon={Tractor} /><StatCard label="Pending Farmers" value={stats.pendingFarmers ?? 0} icon={Users} /><StatCard label="Active Customers" value={stats.buyers} icon={Users} /><StatCard label="Total Listings" value={totalListings} icon={ShoppingCart} /><StatCard label="Pending Listings" value={pendingListings} icon={ShoppingCart} /><StatCard label="Approved Listings" value={approvedCount} icon={ShoppingCart} /><StatCard label="Rejected Listings" value={rejectedListings} icon={ShoppingCart} /><StatCard label="Revenue Tracked" value={`BWP ${Number(summary?.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} /></div><WeatherAlertsPanel alerts={adminWeatherAlertTemplates} title="Weather alert broadcast drafts" subtitle="These are UI-ready templates only. No backend send action is triggered yet." /><div className="rounded-[28px] bg-white/90 p-4 shadow-soft"><h3 className="text-sm font-semibold">Draft severe weather broadcast</h3><p className="mt-1 text-xs text-slate-500">Prepare the alert content for future radius-based broadcast support.</p><div className="mt-3 space-y-2"><select className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm" value={draftAlert.severity} onChange={(e) => setDraftAlert((prev) => ({ ...prev, severity: e.target.value }))}><option value="SEVERE">SEVERE</option><option value="WARNING">WARNING</option><option value="WATCH">WATCH</option><option value="INFO">INFO</option></select><input className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Target district or radius description" value={draftAlert.area} onChange={(e) => setDraftAlert((prev) => ({ ...prev, area: e.target.value }))} /><textarea className="min-h-28 w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none" placeholder="Alert message for farmers" value={draftAlert.message} onChange={(e) => setDraftAlert((prev) => ({ ...prev, message: e.target.value }))} /><button className="rounded-2xl bg-farm-green px-4 py-2.5 text-sm font-semibold text-white" onClick={() => setDraftPreview(`Draft only: ${draftAlert.severity} alert for ${draftAlert.area || 'selected farms'} - ${draftAlert.message || 'No message entered yet.'}`)}>Prepare draft</button>{draftPreview ? <p className="rounded-2xl bg-farm-mint px-3 py-3 text-sm text-farm-green">{draftPreview}</p> : null}</div></div><ChartCard title="Revenue" data={chartData.length ? chartData : [{ name: 'N/A', value: 0 }]} /><div className="rounded-[28px] bg-white/90 p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">Recent Orders</h3><DataTable columns={[{ key: 'id', title: 'Order' }, { key: 'status', title: 'Status' }]} rows={orders.slice(0, 8).map((o) => ({ ...o, id: `#${o.id}` }))} mobileRender={(r) => <div className="flex items-center justify-between text-sm"><span>{r.id}</span><span>{r.status}</span></div>} /></div><div className="rounded-[28px] bg-white/90 p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">Red Flags</h3><DataTable columns={[{ key: 'id', title: 'ID' }, { key: 'reason', title: 'Reason' }, { key: 'status', title: 'Status' }]} rows={flags.slice(0, 10)} mobileRender={(r) => <div className="text-sm">#{r.id} {r.reason} ({r.status})</div>} /></div></div></AppLayout>;
}
