import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Select from '../components/Select';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import MobileFormField from '../components/MobileFormField';
import Input from '../components/Input';
import { getCart, clearCart } from '../services/cartService';
import { confirmOnlinePayment, initiateMyZaka, initiateOnlinePayment, initiateOrangeMoney, placeOrder } from '../services/orderService';
import { getApiErrorMessage } from '../utils/errorHandler';

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE_PAYMENT');
  const [onlineChannel, setOnlineChannel] = useState('CARD');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
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

  const onPlace = async () => {
    setSubmitting(true);
    setError('');
    try {
      const order = await placeOrder(paymentMethod);
      if (paymentMethod === 'ONLINE_PAYMENT') {
        if (onlineChannel === 'ORANGE_MONEY') {
          const p = await initiateOrangeMoney(order.id, customerPhone);
          setPaymentMessage(`Orange Money initiated. Complete the provider payment flow using reference ${p.transactionReference}.`);
        } else if (onlineChannel === 'MYZAKA') {
          const p = await initiateMyZaka(order.id, customerPhone);
          setPaymentMessage(`MyZaka initiated. Complete the provider payment flow using reference ${p.transactionReference}.`);
        } else {
          await initiateOnlinePayment(order.id);
          await confirmOnlinePayment(order.id);
        }
      }
      await clearCart().catch(() => {});
      navigate('/orders');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Checkout failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AppLayout title="Checkout"><LoadingSpinner /></AppLayout>;
  if (!cart?.items?.length) return <AppLayout title="Checkout"><EmptyState title="Cart is empty" subtitle="Add products first." /></AppLayout>;

  return <AppLayout title="Checkout"><div className="space-y-4"><div className="card space-y-3 p-4"><MobileFormField label="Delivery Address"><Input placeholder="Street / Address" value={address} onChange={(e) => setAddress(e.target.value)} /></MobileFormField><MobileFormField label="Payment Method"><Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="ONLINE_PAYMENT">Pay Online</option><option value="CASH_ON_DELIVERY">Cash on Delivery</option><option value="PAY_ON_PICKUP">Pay on Pickup</option></Select></MobileFormField>{paymentMethod === 'ONLINE_PAYMENT' ? <><MobileFormField label="Online Channel"><Select value={onlineChannel} onChange={(e) => setOnlineChannel(e.target.value)}><option value="CARD">Card / Online</option><option value="ORANGE_MONEY">Orange Money</option><option value="MYZAKA">MyZaka</option></Select></MobileFormField>{(onlineChannel === 'ORANGE_MONEY' || onlineChannel === 'MYZAKA') ? <MobileFormField label="Customer Phone" error={!customerPhone.trim() ? 'Phone required for mobile money.' : ''}><Input placeholder="7XXXXXXXX" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></MobileFormField> : null}</> : null}<p className="text-sm text-gray-600">{paymentMethod === 'ONLINE_PAYMENT' ? 'Card payments confirm immediately. Orange Money and MyZaka remain initiated until the provider callback marks them as paid.' : 'Farmer will confirm cash receipt before sale is finalized.'}</p>{paymentMessage ? <p className="text-sm text-green-700">{paymentMessage}</p> : null}{error ? <p className="text-sm text-red-600">{error}</p> : null}</div><div className="card p-4"><h3 className="font-semibold">Order Summary</h3><p className="mt-2 text-sm">Items: {cart.items.length}</p><p className="text-sm">Total: BWP {total.toFixed(2)}</p><Button className="mt-4 w-full py-3" onClick={onPlace} disabled={submitting || (paymentMethod === 'ONLINE_PAYMENT' && (onlineChannel === 'ORANGE_MONEY' || onlineChannel === 'MYZAKA') && !customerPhone.trim())}>{submitting ? 'Placing...' : 'Place Order'}</Button></div></div></AppLayout>;
}
