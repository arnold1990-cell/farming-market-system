import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getCart, updateCartItem, removeCartItem } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import { toMediaUrl } from '../utils/media';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setCart(await getCart());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load cart'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const total = useMemo(() => (cart?.items || []).reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0), [cart]);
  const grouped = useMemo(() => {
    const map = new Map();
    (cart?.items || []).forEach((item) => {
      const key = item.farmerId || 'guest';
      if (!map.has(key)) map.set(key, { farmerName: item.farmerName || 'Unknown Farmer', items: [], subtotal: 0 });
      const row = map.get(key);
      row.items.push(item);
      row.subtotal += Number(item.unitPrice) * Number(item.quantity);
    });
    return Array.from(map.values());
  }, [cart]);

  const onUpdate = async (itemId, quantity) => {
    if (quantity < 1) return;
    await updateCartItem(itemId, quantity);
    load();
  };

  const onRemove = async (itemId) => {
    await removeCartItem(itemId);
    load();
  };

  if (loading) return <AppLayout title="Cart"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Cart"><EmptyState title="Error" subtitle={error} /></AppLayout>;
  if (!cart?.items?.length) return <AppLayout title="Cart"><EmptyState title="Your cart is empty" subtitle="Add products from the marketplace." /></AppLayout>;

  return <AppLayout title="Cart"><div className="space-y-4">{grouped.map((group, idx) => <div key={`${group.farmerName}-${idx}`} className="card p-4"><h3 className="mb-3 font-semibold">{group.farmerName}</h3><div className="space-y-3">{group.items.map((i) => <div key={i.id} className="flex gap-3"><img src={i.imageUrl ? toMediaUrl(i.imageUrl) : 'https://images.unsplash.com/photo-1542838132-92c53300491e'} className="h-16 w-16 rounded-xl object-cover" /><div className="flex-1"><h4 className="font-medium">{i.productName}</h4><p className="text-sm">BWP {Number(i.unitPrice).toFixed(2)} / {i.unit || 'unit'}</p><div className="mt-2 flex items-center gap-2"><button className="rounded-lg border px-3 py-1" onClick={() => onUpdate(i.id, i.quantity - 1)}>-</button><span className="min-w-5 text-center">{i.quantity}</span><button className="rounded-lg border px-3 py-1" onClick={() => onUpdate(i.id, i.quantity + 1)}>+</button><button className="ml-auto text-sm text-red-600" onClick={() => onRemove(i.id)}>Remove</button></div></div></div>)}</div><p className="mt-3 text-sm font-semibold">Farmer subtotal: BWP {group.subtotal.toFixed(2)}</p></div>)}<div className="card p-4"><h3 className="font-semibold">Order Summary</h3><p className="mt-2">Grand Total: BWP {total.toFixed(2)}</p><Button className="mt-4 w-full py-3" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button></div></div></AppLayout>;
}
