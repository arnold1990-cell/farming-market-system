import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Trash2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getCart, updateCartItem, removeCartItem } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import { toMediaUrl } from '../utils/media';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
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

  const subtotal = useMemo(() => (cart?.items || []).reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0), [cart]);
  const tax = useMemo(() => subtotal * 0.14, [subtotal]);
  const delivery = useMemo(() => (cart?.items?.length ? 35 : 0), [cart]);
  const total = useMemo(() => subtotal + tax + delivery, [subtotal, tax, delivery]);
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

  return (
    <AppLayout title="Cart" hideHeader>
      <div className="space-y-4 pb-24">
        <section className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-soft"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-xs text-slate-500">Your basket</p>
            <h1 className="text-lg font-black text-slate-900">Cart</h1>
          </div>
          <div className="h-11 w-11" />
        </section>

        {grouped.map((group, idx) => (
          <section key={`${group.farmerName}-${idx}`} className="space-y-3 rounded-[30px] bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{group.farmerName}</h2>
                <p className="text-xs text-slate-500">{group.items.length} item{group.items.length === 1 ? '' : 's'}</p>
              </div>
              <span className="rounded-full bg-[#F1F8F3] px-3 py-1 text-[11px] font-semibold text-farm-green">
                BWP {group.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-[24px] bg-[#F8FAF8] p-3">
                  <img
                    src={item.imageUrl ? toMediaUrl(item.imageUrl) : 'https://images.unsplash.com/photo-1542838132-92c53300491e'}
                    className="h-20 w-20 rounded-[20px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="line-clamp-1 text-sm font-bold text-slate-900">{item.productName}</h3>
                        <p className="text-xs text-slate-500">{item.unit || 'unit'}</p>
                      </div>
                      <button type="button" onClick={() => onRemove(item.id)} className="text-slate-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-black text-farm-green">BWP {Number(item.unitPrice).toFixed(2)}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-emerald-100 bg-white px-1 py-1">
                        <button type="button" className="h-8 w-8 rounded-full text-slate-700" onClick={() => onUpdate(item.id, item.quantity - 1)}>-</button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                        <button type="button" className="h-8 w-8 rounded-full bg-farm-green text-white" onClick={() => onUpdate(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">BWP {(Number(item.unitPrice) * Number(item.quantity)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-[30px] bg-white p-4 shadow-soft">
          <label className="flex items-center gap-3 rounded-[22px] bg-[#F7FAF8] px-4 py-3">
            <Tag size={16} className="text-farm-green" />
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        </section>

        <section className="rounded-[30px] bg-gradient-to-br from-[#0A8E3E] to-[#067A38] p-5 text-white shadow-[0_18px_42px_rgba(8,160,69,0.28)]">
          <h2 className="text-base font-bold">Checkout Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-emerald-50">
              <span>Subtotal</span>
              <span>BWP {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-50">
              <span>Tax</span>
              <span>BWP {tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-50">
              <span>Delivery</span>
              <span>BWP {delivery.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex items-center justify-between text-lg font-black">
                <span>Total</span>
                <span>BWP {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-5 w-full rounded-[20px] bg-white px-4 py-3 text-sm font-bold text-[#067A38]"
          >
            Proceed To Checkout
          </button>
        </section>
      </div>
    </AppLayout>
  );
}
