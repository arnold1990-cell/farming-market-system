import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import OrderCard from '../components/OrderCard';
import { getMyOrders } from '../services/orderService';
import { getApiErrorMessage } from '../utils/errorHandler';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await getMyOrders());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <AppLayout title="Orders"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Orders"><EmptyState title="Error" subtitle={error} /></AppLayout>;
  if (!orders.length) return <AppLayout title="Orders"><EmptyState title="No orders yet" subtitle="Place your first order from marketplace." /></AppLayout>;

  const rows = orders.map((o) => ({
    ...o,
    products: (o.items || []).map((i) => `${i.productName} x${i.quantity}`).join(', '),
    totalAmount: Number(o.totalAmount || 0),
    createdAt: new Date(o.createdAt || Date.now()).toLocaleString()
  }));

  return <AppLayout title="Orders"><DataTable columns={[{ key: 'id', title: 'Order ID' }, { key: 'createdAt', title: 'Date' }, { key: 'products', title: 'Items' }, { key: 'totalAmount', title: 'Total' }, { key: 'status', title: 'Status', render: (r) => <StatusBadge status={r.status} /> }]} rows={rows} mobileRender={(r) => <OrderCard order={r} />} /></AppLayout>;
}
