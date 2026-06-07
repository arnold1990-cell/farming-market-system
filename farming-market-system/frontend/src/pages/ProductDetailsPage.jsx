import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Heart, MapPin, MoreHorizontal, Star, Truck } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
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
  const navigate = useNavigate();
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
        const [productResponse, reviewResponse] = await Promise.all([
          getPublicProductById(id),
          api.get(`/reviews/products/${id}`).then((r) => r.data).catch(() => [])
        ]);
        setProduct(productResponse);
        setReviews(reviewResponse || []);
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
    return [...product.images].sort(
      (a, b) => (order[a.imageType] ?? 99) - (order[b.imageType] ?? 99) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
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
  const harvestDateText = product.harvestReadyDate
    ? new Date(product.harvestReadyDate).toLocaleDateString('en-BW', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <AppLayout title="Product details" hideHeader>
      <ToastStack toasts={toasts} onClose={(tid) => setToasts((prev) => prev.filter((t) => t.id !== tid))} />
      <div className="space-y-4 pb-24">
        <section className="space-y-4 rounded-[32px] bg-white p-3 shadow-soft">
          <div className="flex items-center justify-between px-1 pt-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF8F1] text-slate-800"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF8F1] text-slate-700">
                <Heart size={18} />
              </button>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF8F1] text-slate-700">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-b from-[#EAF7ED] to-[#F7FBF8] p-3">
            <img
              src={activeImage || fallbackImage}
              onError={(e) => {
                e.currentTarget.src = fallbackImage;
              }}
              className="h-72 w-full rounded-[24px] object-cover"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(orderedImages.length ? orderedImages : [{ id: 'single', imageUrl: product.imageUrl }]).map((img) => (
              <button
                type="button"
                key={img.id}
                onClick={() => setActiveImage(toMediaUrl(img.imageUrl || fallbackImage))}
                className="rounded-[18px] bg-[#F5F8F6] p-1.5"
              >
                <img
                  src={toMediaUrl(img.imageUrl || fallbackImage)}
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                  className="h-14 w-full rounded-[14px] object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">Pula Harvest</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900">{product.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{product.farmerName || 'Farmer'} - {addressText}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <span className="inline-flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {product.averageRating ? Number(product.averageRating).toFixed(1) : '4.8'}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-black text-farm-green">BWP {Number(product.price).toFixed(2)}</p>
              <p className="text-xs text-slate-500">per {product.unit || 'unit'}</p>
            </div>
            <div className="flex items-center rounded-full border border-emerald-100 bg-[#F5FBF6] px-1 py-1">
              <button type="button" className="h-9 w-9 rounded-full text-lg text-slate-700" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span className="min-w-[2.5rem] text-center text-sm font-semibold text-slate-900">{quantity}</span>
              <button
                type="button"
                className="h-9 w-9 rounded-full bg-farm-green text-lg text-white"
                onClick={() => setQuantity((q) => Math.min(product.quantity || q + 1, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-2"><MapPin size={13} />{addressText}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-2"><Truck size={13} />{isAvailable ? 'Ready to order' : 'Unavailable'}</span>
            {harvestDateText ? <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-2"><CalendarClock size={13} />{harvestDateText}</span> : null}
          </div>

          <div className="mt-4 rounded-[24px] bg-[#F5FBF6] p-4">
            <h2 className="text-sm font-bold text-slate-900">Delivery and Pickup</h2>
            <p className="mt-1 text-sm text-slate-600">Collect directly from the farmer or coordinate delivery once your order is confirmed.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-farm-green">Call farmer</button>
              <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">Message</button>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-5 shadow-soft">
          <h2 className="text-base font-bold text-slate-900">Product description</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{product.description || 'Fresh produce from trusted local farmers.'}</p>
        </section>

        <section className="rounded-[30px] bg-white p-4 shadow-soft">
          <h2 className="mb-3 text-base font-bold text-slate-900">Pickup location</h2>
          {hasPickupCoords ? (
            <MapboxMarkersMap
              markers={[{ latitude: product.pickupLatitude, longitude: product.pickupLongitude, name: product.name, locationName: addressText }]}
              height={240}
            />
          ) : (
            <p className="text-sm text-amber-700">GPS coordinates missing.</p>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>{addressText}</span>
            {destinationUrl ? <a href={destinationUrl} target="_blank" rel="noreferrer" className="font-semibold text-farm-green">Get directions</a> : null}
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Reviews</h2>
            <Link to="/marketplace" className="text-xs font-semibold text-farm-green">Keep shopping</Link>
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-[22px] bg-[#F8FAF8] p-3">
                  <p className="text-sm font-semibold text-slate-900">Rating: {review.rating}/5</p>
                  <p className="mt-1 text-xs text-slate-600">{review.comment || 'No comment'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-3 lg:bottom-4">
        <div className="mx-auto flex max-w-screen-sm items-center gap-3 rounded-[26px] bg-white/96 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-black text-slate-900">BWP {(Number(product.price) * quantity).toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!isAvailable}
            className="flex-1 rounded-[18px] bg-farm-green px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {isAvailable ? 'Add To Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
