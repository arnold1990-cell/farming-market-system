import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { acceptCashPayment, getFarmerOrders, rejectCashPayment, updateOrderStatus } from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/errorHandler';

const statuses = ['PENDING', 'CONFIRMED', 'PAID', 'DELIVERING', 'COMPLETED', 'CANCELLED'];

export default function FarmerOrdersPage() {
  const links = [{ path: '/farmer/dashboard', label: 'Dashboard' }, { path: '/farmer/products', label: 'Products' }, { path: '/farmer/orders', label: 'Orders' }, { path: '/marketplace', label: 'Marketplace' }];
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await getFarmerOrders());
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load farmer orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      load();
    } catch (e) {
      alert(getApiErrorMessage(e, 'Status update failed'));
    }
  };

  if (loading) return <AppLayout links={links}><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout links={links}><EmptyState title="Error" subtitle={error} /></AppLayout>;
  if (!orders.length) return <AppLayout links={links}><EmptyState title="No orders" subtitle="Orders containing your products will appear here." /></AppLayout>;

  const rows = orders.map(o => ({
    ...o,
    buyer: `Buyer #${o.id}`,
    products: (o.items || []).map(i => `${i.productName} x${i.quantity}`).join(', ')
  }));

  return <AppLayout links={links}><DataTable columns={[{ key: 'id', title: 'Order' }, { key: 'products', title: 'Items' }, { key: 'totalAmount', title: 'Total' }, { key: 'status', title: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'cash', title: 'Cash Confirmation', render: (r) => <div className='flex flex-col gap-2'>{(r.items || []).filter((i) => i.status === 'AWAITING_FARMER_CONFIRMATION').map((i) => <div key={i.id} className='flex items-center gap-2 text-xs'><span>{i.productName}</span><button className='px-2 py-1 rounded bg-green-600 text-white' onClick={async () => { await acceptCashPayment(i.id); load(); }}>Accept Cash Received</button><button className='px-2 py-1 rounded bg-red-600 text-white' onClick={async () => { await rejectCashPayment(i.id); load(); }}>Reject Cash</button></div>)}{!(r.items || []).some((i) => i.status === 'AWAITING_FARMER_CONFIRMATION') ? <span className='text-xs text-gray-500'>No pending cash confirmations</span> : null}</div> }, { key: 'actions', title: 'Update', render: (r) => <select className='border rounded px-2 py-1' value={r.status} onChange={(e) => onStatusChange(r.id, e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select> }]} rows={rows} mobileRender={(r) => <div>{r.id} <StatusBadge status={r.status} /></div>} /></AppLayout>;
}
