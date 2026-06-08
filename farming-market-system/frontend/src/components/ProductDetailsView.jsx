import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, ExternalLink, Heart, MapPin, Share2, ShoppingCart, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapboxMarkersMap from './MapboxMarkersMap';
import { toMediaUrl } from '../utils/media';

const notProvided = 'Not provided';

const toDisplay = (value) => {
  if (value == null) return notProvided;
  if (typeof value === 'string' && !value.trim()) return notProvided;
  return value;
};

const formatDate = (value) => {
  if (!value) return notProvided;
  try {
    return new Date(value).toLocaleDateString('en-BW', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
};

const formatStatus = (value) => {
  if (!value) return notProvided;
  return String(value).replaceAll('_', ' ');
};

export default function ProductDetailsView({
  product,
  reviews = [],
  onBack,
  onAdd,
  showPurchaseActions = true,
  actionPanel = null,
  footerPanel = null
}) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [favourite, setFavourite] = useState(false);
  const storageKey = `product-favourite-${product.id}`;

  useEffect(() => {
    setFavourite(window.localStorage.getItem(storageKey) === 'true');
  }, [storageKey]);

  useEffect(() => {
    const firstImage = orderedImages[0]?.imageUrl || product.imageUrl || product.image || '';
    setActiveImage(firstImage ? toMediaUrl(firstImage) : '');
    setQuantity(1);
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const orderedImages = useMemo(() => {
    const rawImages = Array.isArray(product.images) ? product.images : [];
    const order = { PRODUCT: 0, FIELD: 1, HARVEST: 2, PACKAGING: 3 };
    const normalized = rawImages
      .map((image) => ({ ...image, imageUrl: image.imageUrl ? toMediaUrl(image.imageUrl) : '' }))
      .filter((image) => image.imageUrl);
    if (!normalized.length && (product.imageUrl || product.image)) {
      return [{ id: 'primary-image', imageUrl: toMediaUrl(product.imageUrl || product.image) }];
    }
    return [...normalized].sort((left, right) => (order[left.imageType] ?? 99) - (order[right.imageType] ?? 99) || (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
  }, [product]);

  const reviewCount = reviews.length;
  const ratingLabel = reviewCount && product.averageRating ? Number(product.averageRating).toFixed(1) : notProvided;
  const isAvailable = (product.availabilityStatus || 'AVAILABLE') === 'AVAILABLE';
  const maxQuantity = Math.max(1, Number(product.quantity || product.stock || 1));
  const phoneNumber = product.farmerContactNumber || product.contactNumber || '';
  const normalizedPhone = phoneNumber ? String(phoneNumber).replace(/[^\d+]/g, '') : '';
  const whatsappHref = normalizedPhone ? `https://wa.me/${normalizedPhone.replace(/^\+/, '')}` : '';
  const callHref = normalizedPhone ? `tel:${normalizedPhone}` : '';
  const farmName = toDisplay(product.farmName);
  const farmLocation = [product.pickupAddress, product.locationName, product.farmLocation, product.farmerCity, product.farmerCountry]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(', ') || notProvided;
  const districtOrCity = toDisplay(product.farmerCity);
  const farmerBio = toDisplay(product.farmerBio);
  const mapRoute = `/map?productId=${product.id}`;
  const canShowMap = product.pickupLatitude != null && product.pickupLongitude != null;

  const toggleFavourite = () => {
    const next = !favourite;
    setFavourite(next);
    window.localStorage.setItem(storageKey, String(next));
  };

  const onShare = async () => {
    const shareUrl = `${window.location.origin}/products/${product.id}`;
    const payload = {
      title: product.name,
      text: `${product.name} on Pula Harvest`,
      url: shareUrl
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        return;
      }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <section className="space-y-4 rounded-[30px] bg-white p-3 shadow-soft">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF8F1] text-slate-800">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleFavourite} className={`flex h-11 w-11 items-center justify-center rounded-2xl ${favourite ? 'bg-rose-50 text-rose-600' : 'bg-[#EFF8F1] text-slate-700'}`}>
              <Heart size={18} className={favourite ? 'fill-rose-500' : ''} />
            </button>
            <button type="button" onClick={onShare} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF8F1] text-slate-700">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="rounded-[28px] bg-gradient-to-b from-[#EAF7ED] to-[#F7FBF8] p-3">
          {activeImage ? (
            <img src={activeImage} onError={() => setActiveImage('')} alt={product.name || 'Product image'} className="h-72 w-full rounded-[24px] object-cover" />
          ) : (
            <div className="grid h-72 w-full place-items-center rounded-[24px] bg-gradient-to-br from-emerald-100 to-lime-50 text-sm font-semibold text-emerald-800">
              No product image
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {orderedImages.map((image) => (
            <button key={image.id} type="button" onClick={() => setActiveImage(image.imageUrl)} className={`overflow-hidden rounded-[18px] bg-[#F5F8F6] p-1.5 ${activeImage === image.imageUrl ? 'ring-2 ring-emerald-500' : ''}`}>
              <img src={image.imageUrl} alt={product.name || 'Product'} className="h-14 w-full rounded-[14px] object-cover" />
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">Pula Harvest</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">{toDisplay(product.name)}</h1>
            <p className="mt-1 text-sm text-slate-500">{toDisplay(product.categoryName)} • {farmName}</p>
          </div>
          <div className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <span className="inline-flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {ratingLabel}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black text-farm-green">BWP {Number(product.price || 0).toFixed(2)}</p>
            <p className="text-xs text-slate-500">per {toDisplay(product.unit)}</p>
          </div>
          {showPurchaseActions ? (
            <div className="flex items-center rounded-full border border-emerald-100 bg-[#F5FBF6] px-1 py-1">
              <button type="button" className="h-9 w-9 rounded-full text-lg text-slate-700" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>-</button>
              <span className="min-w-[2.5rem] text-center text-sm font-semibold text-slate-900">{quantity}</span>
              <button type="button" className="h-9 w-9 rounded-full bg-farm-green text-lg text-white" onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}>+</button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-2"><Truck size={13} />{formatStatus(product.availabilityStatus)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-2"><CalendarClock size={13} />{formatDate(product.harvestReadyDate)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-2"><MapPin size={13} />{districtOrCity}</span>
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold text-slate-900">Product Information</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <InfoCard label="Category" value={toDisplay(product.categoryName)} />
          <InfoCard label="Quantity available" value={toDisplay(product.quantity)} />
          <InfoCard label="Availability status" value={formatStatus(product.availabilityStatus)} />
          <InfoCard label="Unit type" value={toDisplay(product.unit)} />
          <InfoCard label="Harvest date" value={formatDate(product.harvestReadyDate)} />
          <InfoCard label="Price" value={`BWP ${Number(product.price || 0).toFixed(2)}`} />
        </div>
        <div className="mt-3 rounded-[22px] bg-[#F7FAF8] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{toDisplay(product.description)}</p>
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Location Information</h2>
          <Link to={mapRoute} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-farm-green">
            View on Map
            <ExternalLink size={14} />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <InfoCard label="Farm name" value={farmName} />
          <InfoCard label="District / city" value={districtOrCity} />
        </div>
        <div className="mt-3 rounded-[22px] bg-[#F7FAF8] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full location</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{farmLocation}</p>
        </div>
        <div className="mt-3">
          {canShowMap ? (
            <MapboxMarkersMap
              markers={[{
                productId: product.id,
                latitude: product.pickupLatitude,
                longitude: product.pickupLongitude,
                name: product.name,
                farmerName: product.farmerName,
                price: product.price,
                quantity: product.quantity,
                unit: product.unit,
                locationName: farmLocation
              }]}
              height={240}
            />
          ) : (
            <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Map coordinates not provided.</div>
          )}
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold text-slate-900">Farmer Information</h2>
        <div className="mt-3 flex items-start gap-3 rounded-[22px] bg-[#F7FAF8] p-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
            {String(product.farmerName || 'PH').split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">{toDisplay(product.farmerName)}</p>
            <p className="text-sm text-slate-600">{farmName}</p>
            <p className="mt-2 text-xs text-slate-500">Profile photo: {notProvided}</p>
            <p className="text-xs text-slate-500">Verification status: {notProvided}</p>
          </div>
        </div>
        <div className="mt-3 rounded-[22px] bg-[#F7FAF8] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bio / description</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{farmerBio}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <InfoCard label="Rating" value={ratingLabel} />
          <InfoCard label="Reviews" value={reviewCount || notProvided} />
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold text-slate-900">Contact Information</h2>
        <div className="mt-3 rounded-[22px] bg-[#F7FAF8] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone number</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{toDisplay(phoneNumber)}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-[18px] bg-emerald-50 px-3 py-3 text-center text-xs font-semibold text-farm-green">WhatsApp</a>
          ) : (
            <button type="button" disabled className="rounded-[18px] bg-slate-100 px-3 py-3 text-xs font-semibold text-slate-400">WhatsApp</button>
          )}
          <button type="button" disabled className="rounded-[18px] bg-slate-100 px-3 py-3 text-xs font-semibold text-slate-400">In-app chat</button>
          {callHref ? (
            <a href={callHref} className="rounded-[18px] bg-emerald-50 px-3 py-3 text-center text-xs font-semibold text-farm-green">Call</a>
          ) : (
            <button type="button" disabled className="rounded-[18px] bg-slate-100 px-3 py-3 text-xs font-semibold text-slate-400">Call</button>
          )}
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold text-slate-900">Actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onBack} className="rounded-[18px] border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">Back</button>
          <Link to={mapRoute} className="rounded-[18px] bg-emerald-50 px-3 py-3 text-center text-sm font-semibold text-farm-green">View on Map</Link>
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-[18px] bg-emerald-50 px-3 py-3 text-center text-sm font-semibold text-farm-green">Chat with Farmer</a>
          ) : (
            <button type="button" disabled className="rounded-[18px] bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-400">Chat with Farmer</button>
          )}
          <button type="button" onClick={onShare} className="rounded-[18px] border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">Share Product</button>
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold text-slate-900">Reviews</h2>
        {reviewCount ? (
          <div className="mt-3 space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-[22px] bg-[#F7FAF8] p-4">
                <p className="text-sm font-semibold text-slate-900">Rating: {review.rating}/5</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{toDisplay(review.comment)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No reviews provided yet.</p>
        )}
      </section>

      {actionPanel}

      {showPurchaseActions ? (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-3 lg:bottom-4">
          <div className="mx-auto flex max-w-screen-sm items-center gap-3 rounded-[26px] bg-white/96 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-black text-slate-900">BWP {(Number(product.price || 0) * quantity).toFixed(2)}</p>
            </div>
            <button type="button" onClick={() => onAdd?.(quantity)} disabled={!isAvailable || !onAdd} className="flex-1 rounded-[18px] bg-farm-green px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
              <span className="inline-flex items-center gap-2">
                <ShoppingCart size={16} />
                {isAvailable ? 'Add to Cart' : 'Unavailable'}
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {footerPanel}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[#F7FAF8] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
