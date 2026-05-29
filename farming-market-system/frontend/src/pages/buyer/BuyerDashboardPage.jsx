import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import OrderCard from '../../components/OrderCard';
import { Bell, ShoppingBag, Truck } from 'lucide-react';
import { getMyOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getCart } from '../../services/cartService';
import { getApiErrorMessage } from '../../utils/errorHandler';

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [myOrders, allProducts, cart] = await Promise.all([getMyOrders(), getProducts(), getCart()]);
        setOrders(myOrders || []);
        setProducts((allProducts || []).slice(0, 6));
        setCartCount((cart?.items || []).length);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <AppLayout title="Buyer Dashboard"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Buyer Dashboard"><EmptyState title="Error" subtitle={error} /></AppLayout>;

  return <AppLayout title="Buyer Dashboard"><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><StatCard label="Recent Orders" value={orders.length} icon={ShoppingBag} /><StatCard label="Cart Items" value={cartCount} icon={Truck} /><StatCard label="Notifications" value={0} icon={Bell} /></div><div className="space-y-3"><h3 className="text-sm font-semibold">Recent Orders</h3><DataTable columns={[{ key: 'id', title: 'Order' }, { key: 'status', title: 'Status' }, { key: 'totalAmount', title: 'Total' }]} rows={orders.map((o) => ({ ...o, id: `#${o.id}` }))} mobileRender={(r) => <OrderCard order={r} />} /></div><div className="rounded-2xl bg-white p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">Recommended Products</h3><div className="space-y-2">{products.map((p) => <div key={p.id} className="flex items-center justify-between text-sm"><span className="line-clamp-1">{p.name}</span><span className="font-semibold text-farm-green">BWP {Number(p.price).toFixed(2)}</span></div>)}</div></div></div></AppLayout>;
}
