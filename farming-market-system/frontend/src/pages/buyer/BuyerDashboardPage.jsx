import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Clock3, MapPin, Search, ShoppingBag } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import ProductCard from '../../components/ProductCard';
import FarmerCard from '../../components/FarmerCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import OrderCard from '../../components/OrderCard';
import MobileMenuButton from '../../components/MobileMenuButton';
import { getMyOrders } from '../../services/orderService';
import { getApprovedMarketplaceFeed } from '../../services/marketplaceService';
import { getCart, addToCart } from '../../services/cartService';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { toMediaUrl } from '../../utils/media';
import { CATEGORY_ORDER, CATEGORY_VISUALS } from '../../data/categoryCatalog';
import BrandLogo from '../../components/BrandLogo';

const promoImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [myOrders, allProducts, cart] = await Promise.all([getMyOrders(), getApprovedMarketplaceFeed(), getCart()]);
        setOrders(myOrders || []);
        setProducts(allProducts || []);
        setCartCount((cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0));
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const byCategory = selectedCategory === 'ALL' ? products : products.filter((p) => p.categoryName === selectedCategory);
    if (!search) return byCategory;
    return byCategory.filter((p) =>
      `${p.name || ''} ${p.farmerName || ''} ${p.categoryName || ''} ${p.locationName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search, selectedCategory]);

  const popularProducts = useMemo(() => filteredProducts.slice(0, 4), [filteredProducts]);
  const dailyProducts = useMemo(() => filteredProducts.slice(4, 8), [filteredProducts]);
  const categoryCards = useMemo(() => CATEGORY_ORDER.map((name) => ({ name, image: CATEGORY_VISUALS[name]?.image || '' })), []);
  const nearbyFarmers = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const name = product.farmerName || 'Farmer';
      if (!acc[name]) {
        acc[name] = { name, products: 0, location: product.pickupAddress || product.locationName || 'Unknown' };
      }
      acc[name].products += 1;
      return acc;
    }, {});
    return Object.values(grouped).slice(0, 3);
  }, [filteredProducts]);

  const onAdd = async (product) => {
    try {
      await addToCart(product, 1);
      setCartCount((count) => count + 1);
    } catch (_) {
    }
  };

  const mapProduct = (product, oldPrice = null) => ({
    ...product,
    stock: product.quantity,
    farmer: product.farmerName || 'Farmer',
    image: product.imageUrl ? toMediaUrl(product.imageUrl) : '',
    location: product.pickupAddress || product.locationName || 'Unknown',
    availabilityStatus: product.availabilityStatus || 'AVAILABLE',
    oldPrice
  });

  if (loading) return <AppLayout title="Buyer Dashboard"><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout title="Buyer Dashboard"><EmptyState title="Error" subtitle={error} /></AppLayout>;

  return (
    <AppLayout title="Buyer Dashboard" hideHeader>
      <div className="space-y-4 pb-4">
        <section className="-mx-4 rounded-b-[32px] bg-gradient-to-b from-[#0FA24A] to-[#0B8F40] px-4 pb-5 pt-4 text-white shadow-[0_18px_44px_rgba(8,160,69,0.28)] sm:-mx-5 sm:px-5">
          <div className="mx-auto max-w-screen-sm space-y-3">
            <div className="flex items-center justify-between">
              <MobileMenuButton className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur" iconSize={18} />
              <div className="text-center">
                <p className="text-[11px] text-emerald-100">Your location</p>
                <p className="text-sm font-semibold">Gaborone</p>
              </div>
              <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-yellow-300" />
              </button>
            </div>

            <div>
              <BrandLogo priority className="w-full max-w-[150px]" imgClassName="h-16 w-auto" />
              <h1 className="mt-1 text-[1.5rem] font-black leading-tight">Fresh groceries delivered fast</h1>
            </div>

            <label className="flex items-center gap-3 rounded-[24px] bg-white px-4 py-3 text-slate-900 shadow-lg">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What are you looking for today?"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="grid grid-cols-[1fr_118px] gap-3 rounded-[26px] bg-white p-3 text-slate-900 shadow-[0_18px_28px_rgba(0,0,0,0.12)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Get Discount</p>
                <p className="text-3xl font-black leading-none text-[#067A38]">25%</p>
                <p className="text-sm text-slate-600">On Vegetables & Fruits</p>
                <Link to="/marketplace" className="inline-flex items-center gap-1 rounded-full bg-farm-green px-4 py-2 text-xs font-bold text-white">
                  Shop Now
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="overflow-hidden rounded-[22px] bg-[#EAF7ED]">
                <img src={promoImage} className="h-full w-full object-cover" alt="Fresh produce" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Categories</h2>
            <Link to="/marketplace" className="text-xs font-semibold text-farm-green">See all</Link>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`min-w-[92px] rounded-[24px] border p-2 text-left shadow-soft ${selectedCategory === 'ALL' ? 'border-emerald-200 bg-white' : 'border-transparent bg-white/85'}`}
            >
              <div className="mb-2 h-16 rounded-[18px] bg-gradient-to-br from-emerald-100 to-lime-100" />
              <p className="text-xs font-semibold text-slate-800">All</p>
            </button>
            {categoryCards.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setSelectedCategory(category.name)}
                className={`min-w-[92px] rounded-[24px] border p-2 text-left shadow-soft ${
                  selectedCategory === category.name ? 'border-emerald-200 bg-white' : 'border-transparent bg-white/85'
                }`}
              >
                <img src={category.image} alt={category.name} className="mb-2 h-16 w-full rounded-[18px] object-cover" />
                <p className="line-clamp-2 text-xs font-semibold text-slate-800">{category.name}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Most Popular Picks</h2>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-soft">{cartCount} in cart</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={mapProduct(product)} onAdd={() => onAdd(product)} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Nearby Farmers</h2>
            <Link to="/map" className="text-xs font-semibold text-farm-green">Open map</Link>
          </div>
          <div className="space-y-3">
            {nearbyFarmers.map((farmer) => (
              <FarmerCard key={`${farmer.name}-${farmer.location}`} farmer={farmer} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Fresh Finds of the Day</h2>
            <Link to="/marketplace" className="text-xs font-semibold text-farm-green">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dailyProducts.map((product) => (
              <ProductCard key={`daily-${product.id}`} product={mapProduct(product, Number(product.price) * 1.18)} onAdd={() => onAdd(product)} />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Orders</h2>
              <p className="text-xs text-slate-500">Track recent purchases and delivery progress.</p>
            </div>
            <Link to="/orders" className="text-xs font-semibold text-farm-green">See all</Link>
          </div>
          {orders.length ? (
            <div className="space-y-3">
              {orders.slice(0, 2).map((order) => (
                <OrderCard key={order.id} order={{ ...order, id: `#${order.id}` }} />
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] bg-[#F7FAF8] p-4 text-sm text-slate-500">
              No orders yet. Start with the market and build your basket.
            </div>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-[18px] bg-[#F7FAF8] p-3 text-center">
              <ShoppingBag size={16} className="mx-auto text-farm-green" />
              <p className="mt-2 text-[11px] text-slate-500">Orders</p>
              <p className="text-sm font-bold text-slate-900">{orders.length}</p>
            </div>
            <div className="rounded-[18px] bg-[#F7FAF8] p-3 text-center">
              <Clock3 size={16} className="mx-auto text-farm-green" />
              <p className="mt-2 text-[11px] text-slate-500">Pending</p>
              <p className="text-sm font-bold text-slate-900">{orders.filter((order) => order.status !== 'DELIVERED').length}</p>
            </div>
            <div className="rounded-[18px] bg-[#F7FAF8] p-3 text-center">
              <MapPin size={16} className="mx-auto text-farm-green" />
              <p className="mt-2 text-[11px] text-slate-500">Pickup</p>
              <p className="text-sm font-bold text-slate-900">{nearbyFarmers.length}</p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
