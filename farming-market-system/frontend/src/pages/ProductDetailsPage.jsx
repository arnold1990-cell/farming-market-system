import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Star, Truck } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import MapboxMarkersMap from '../components/MapboxMarkersMap';
import ToastStack from '../components/ToastStack';
import { getPublicProductById } from '../services/productService';
import { addToCart } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import api from '../services/api';
import { toMediaUrl } from '../utils/media';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [activeImage, setActiveImage] = useState('');

  const pushToast = (type, message) => {
    const toastId = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id: toastId, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [pRes, reviewRes] = await Promise.all([
          getPublicProductById(id),
          api.get(`/reviews/products/${id}`).then((r) => r.data).catch(() => [])
        ]);
        setProduct(pRes);
        setReviews(reviewRes || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load product'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const orderedImages = useMemo(() => {
    if (!product?.images?.length) return [];
    const order = { PRODUCT: 0, FIELD: 1, HARVEST: 2, PACKAGING: 3 };
    return [...product.images].sort((a, b) => (order[a.imageType] ?? 99) - (order[b.imageType] ?? 99) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const first = orderedImages[0]?.imageUrl || product.imageUrl || fallbackImage;
    setActiveImage(toMediaUrl(first));
  }, [product, orderedImages]);

  const onAdd = async () => {
    try {
      await addToCart(product, quantity);
      pushToast('success', 'Added to cart');
    } catch (err) {
      pushToast('error', getApiErrorMessage(err, 'Could not add to cart'));
    }
  };

  if (loading) return <AppLayout title="Product"><LoadingSpinner /></AppLayout>;
  if (error || !product) return <AppLayout title="Product"><EmptyState title="Not Found" subtitle={error || 'Product not found'} /></AppLayout>;

  const hasPickupCoords = product.pickupLatitude != null && product.pickupLongitude != null;
  const destinationUrl = hasPickupCoords ? `https://www.google.com/maps/dir/?api=1&destination=${product.pickupLatitude},${product.pickupLongitude}` : null;
  const addressText = product.pickupAddress || product.locationName || '-';
  const isAvailable = (product.availabilityStatus || 'AVAILABLE') === 'AVAILABLE';

  return <AppLayout title="Product details"><ToastStack toasts={toasts} onClose={(tid) => setToasts((prev) => prev.filter((t) => t.id !== tid))} /><div className="space-y-4 pb-20"><div className="rounded-2xl bg-white p-3 shadow-soft"><img src={activeImage || fallbackImage} onError={(e) => { e.currentTarget.src = fallbackImage; }} className="h-64 w-full rounded-xl object-cover" /><div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">{(orderedImages.length ? orderedImages : [{ id: 'single', imageUrl: product.imageUrl }]).map((img) => <button type="button" key={img.id} onClick={() => setActiveImage(toMediaUrl(img.imageUrl || fallbackImage))} className="w-full"><img src={toMediaUrl(img.imageUrl || fallbackImage)} onError={(e) => { e.currentTarget.src = fallbackImage; }} className="h-14 w-full rounded-lg border object-cover" /></button>)}</div></div><div className="rounded-2xl bg-white p-4 shadow-soft"><h1 className="text-xl font-bold">{product.name}</h1><p className="mt-1 text-sm text-gray-600">{product.description}</p><p className="mt-2 text-2xl font-bold text-farm-green">BWP {Number(product.price).toFixed(2)}/{product.unit}</p><div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600"><span className="inline-flex items-center gap-1"><MapPin size={13} />{addressText}</span><span className="inline-flex items-center gap-1"><Star size={13} className="fill-yellow-400 text-yellow-400" />{product.averageRating ? Number(product.averageRating).toFixed(1) : 'N/A'}</span><span className="inline-flex items-center gap-1"><Truck size={13} />{isAvailable ? 'Available' : 'Unavailable'}</span></div><p className="mt-2 text-xs text-gray-500">Farmer: {product.farmerName || '-'} | Stock: {product.quantity}</p></div><div className="rounded-2xl bg-white p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">Pickup Location</h3>{hasPickupCoords ? <MapboxMarkersMap markers={[{ latitude: product.pickupLatitude, longitude: product.pickupLongitude, name: product.name, locationName: addressText }]} height={240} /> : <p className="text-sm text-amber-700">GPS coordinates missing.</p>}<div className="mt-2 flex items-center justify-between text-xs text-gray-600"><span>{addressText}</span>{destinationUrl ? <a href={destinationUrl} target="_blank" rel="noreferrer" className="font-semibold text-farm-green">Get Directions</a> : null}</div></div><div className="rounded-2xl bg-white p-4 shadow-soft"><h3 className="font-semibold">Reviews</h3>{reviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : <div className="mt-2 space-y-2">{reviews.map((r) => <div key={r.id} className="rounded-xl border border-gray-100 p-3"><p className="text-sm font-medium">Rating: {r.rating}/5</p><p className="text-xs text-gray-600">{r.comment || 'No comment'}</p></div>)}</div>}</div></div><div className="fixed bottom-16 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 p-3 backdrop-blur lg:bottom-0"><div className="mx-auto flex max-w-6xl items-center gap-2"><div className="flex items-center overflow-hidden rounded-xl border border-gray-200"><button className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button><input type="number" min="1" max={product.quantity || 1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} className="w-14 border-x border-gray-200 py-2 text-center text-sm" /><button className="px-3 py-2" onClick={() => setQuantity((q) => q + 1)}>+</button></div><Button className="flex-1" onClick={onAdd} disabled={!isAvailable}>{isAvailable ? 'Add to Cart' : 'Unavailable'}</Button></div></div></AppLayout>;
}
