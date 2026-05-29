import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { getAssignedDeliveries, updateDeliveryStatus } from '../../services/deliveryService';
import { getApiErrorMessage } from '../../utils/errorHandler';

const statuses = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

export default function DeliveryDashboardPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setDeliveries(await getAssignedDeliveries());
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load deliveries'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onUpdate = async (id, status) => {
    try {
      await updateDeliveryStatus(id, status);
      load();
    } catch (e) {
      alert(getApiErrorMessage(e, 'Could not update delivery status'));
    }
  };

  if (loading) return <AppLayout title="Delivery"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Delivery"><EmptyState title="Error" subtitle={error} /></AppLayout>;
  if (!deliveries.length) return <AppLayout title="Delivery"><EmptyState title="No assigned deliveries" subtitle="Assigned deliveries will appear here." /></AppLayout>;

  const rows = deliveries.map((d) => ({ ...d, pickup: `Order #${d.orderId} pickup`, dropoff: `Order #${d.orderId} destination` }));

  return <AppLayout title="Deliveries"><DataTable columns={[{ key: 'id', title: 'Delivery' }, { key: 'pickup', title: 'Pickup' }, { key: 'dropoff', title: 'Dropoff' }, { key: 'status', title: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'actions', title: 'Actions', render: (r) => <select className='rounded-xl border border-gray-200 px-2 py-2 text-sm' value={r.status} onChange={(e) => onUpdate(r.id, e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select> }]} rows={rows} mobileRender={(r) => <div className="space-y-1 text-sm"><p className="font-semibold">Delivery #{r.id}</p><p className="text-gray-500">{r.pickup}</p><StatusBadge status={r.status} /><select className='mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm' value={r.status} onChange={(e) => onUpdate(r.id, e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></div>} /></AppLayout>;
}
