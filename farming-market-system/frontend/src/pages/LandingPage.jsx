import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, ChevronRight, MessageCircle, Search, ShieldCheck, Sparkles, Sprout, Store, Truck } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import MobileMenuButton from '../components/MobileMenuButton';
import ToastStack from '../components/ToastStack';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getApprovedMarketplaceFeed } from '../services/marketplaceService';
import { addToCart } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import { toMediaUrl } from '../utils/media';
import { CATEGORY_ORDER, CATEGORY_VISUALS } from '../data/categoryCatalog';
import BrandLogo from '../components/BrandLogo';

const heroProduceImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';
const heroFarmImage = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80';
const discountProduceImage = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=700&q=80';

const serviceCards = [
  {
    title: 'Harvest Countdown',
    copy: 'Check real-time field updates to see exactly when crops will be ready for harvest.',
    icon: CalendarClock
  },
  {
    title: 'Flexible Delivery',
    copy: 'Get fresh food delivered to your door or choose farm pickup to meet your grower.',
    icon: Truck
  },
  {
    title: 'Direct Chat',
    copy: 'Talk directly with local farmers to ask questions, check quality, and build real relationships.',
    icon: MessageCircle
  },
  {
    title: 'Easy Farm Profiles',
    copy: 'Set up a digital farm stall in minutes to showcase your upcoming yields to neighbors.',
    icon: Store
  }
];

const faqItems = [
  {
    question: 'How do I buy from Pula Harvest?',
    answer: 'Browse the marketplace, choose what is ready now or reserve upcoming harvests, then select delivery or farm pickup.'
  },
  {
    question: 'Can farmers update harvest progress?',
    answer: 'Yes. Farmers can share crop availability in real time so neighbors know exactly what is ready and what is still growing.'
  },
  {
    question: 'Is Pula Harvest only for Gaborone?',
    answer: 'No. The platform is designed to support communities across Botswana as more local growers join.'
  }
];

export default function LandingPage() {
  const [publicProducts, setPublicProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toasts, setToasts] = useState([]);

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const products = await getApprovedMarketplaceFeed();
      setPublicProducts(products || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load products. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(publicProducts.map((p) => p.categoryName).filter(Boolean)))],
    [publicProducts]
  );

  const visibleCategories = useMemo(() => {
    const apiCategories = categoryOptions.filter((item) => item !== 'ALL' && CATEGORY_ORDER.includes(item));
    return CATEGORY_ORDER.filter((item) => apiCategories.includes(item));
  }, [categoryOptions]);

  const filtered = useMemo(() => {
    const byCategory =
      selectedCategory === 'ALL' ? publicProducts : publicProducts.filter((p) => p.categoryName === selectedCategory);
    if (!search) return byCategory;
    return byCategory.filter((p) =>
      `${p.name || ''} ${p.farmerName || ''} ${p.categoryName || ''} ${p.locationName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [publicProducts, search, selectedCategory]);

  const trendingProducts = useMemo(() => filtered.slice(0, 6), [filtered]);
  const freshFinds = useMemo(() => filtered.slice(2, 8), [filtered]);
  const upcomingHarvests = useMemo(() => filtered.filter((_, i) => i % 3 === 0).slice(0, 4), [filtered]);

  const readyNowCount = useMemo(
    () => filtered.filter((p) => (p.availabilityStatus || 'AVAILABLE') === 'AVAILABLE').length,
    [filtered]
  );

  const onAdd = async (product) => {
    try {
      await addToCart(product, 1);
      pushToast('success', 'Added to cart');
    } catch (err) {
      pushToast('error', getApiErrorMessage(err, 'Could not add to cart'));
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

  return (
    <AppLayout showMobileNav hideHeader>
      <ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <div className="space-y-5 pb-3">
        <section id="home" className="-mx-4 bg-gradient-to-b from-[#0F9E49] via-[#0B8D40] to-[#078039] px-4 pb-6 pt-5 sm:-mx-5 sm:px-5">
          <div className="mx-auto max-w-screen-sm space-y-4">
            <div className="rounded-[36px] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <div className="flex min-h-[70px] items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <BrandLogo priority className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-[1.3rem] font-bold tracking-tight text-[#0A6B3A]">Pula Harvest</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Our community&apos;s fresh farm connection</p>
                  </div>
                </div>
                <MobileMenuButton
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F8F4] text-[#0A6B3A] shadow-[0_8px_18px_rgba(10,107,58,0.12)]"
                  iconSize={20}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-[34px] bg-white p-3 shadow-[0_24px_52px_rgba(15,23,42,0.16)]">
              <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
                <div className="space-y-3 px-1 py-2">
                  <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A6B3A]">
                    Botswana Community Market
                  </div>
                  <div>
                    <h1 className="text-[1.9rem] font-black leading-tight text-slate-950">Welcome to Pula Harvest: Our Community&apos;s Fresh Farm Connection</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Growing together, eating fresher! Pula Harvest brings Botswana&apos;s farmers and families closer by putting the field right on your screen. Discover nearby crops, track when they will be harvested, and secure your food straight from the source. Whether you want convenient delivery to your doorstep or love the adventure of a farm pickup, we make supporting local agriculture easy and personal.
                    </p>
                  </div>
                </div>
                <div className="grid grid-rows-2 gap-3">
                  <div className="overflow-hidden rounded-[28px] bg-[#E8F7EC]">
                    <img src={heroProduceImage} alt="Fresh vegetables and fruit" className="h-full w-full object-cover" />
                  </div>
                  <div className="overflow-hidden rounded-[28px] bg-[#E6F3EC]">
                    <img src={heroFarmImage} alt="Modern farm landscape" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-[28px] bg-white/96 p-4 text-slate-900 shadow-[0_18px_34px_rgba(15,23,42,0.16)] transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-farm-green">Today&apos;s Harvests</p>
                <h2 className="mt-2 text-lg font-black">Love Fresh Food? Explore Today&apos;s Harvests</h2>
                <Link to="/marketplace" className="mt-4 inline-flex items-center gap-2 rounded-full bg-farm-green px-4 py-2 text-xs font-bold text-white">
                  Explore marketplace
                  <ChevronRight size={14} />
                </Link>
              </article>
              <article className="rounded-[28px] bg-white/12 p-4 text-white backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">For Growers</p>
                <h2 className="mt-2 text-lg font-black">Proud Local Farmer? Share Your Fields With Us</h2>
                <Link to="/register" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#067A38]">
                  Join now
                  <ChevronRight size={14} />
                </Link>
              </article>
            </div>

            <label className="flex items-center gap-3 rounded-[28px] bg-white px-4 py-3 text-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What are you looking for today?"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="rounded-[30px] bg-white/14 p-1 backdrop-blur">
              <div className="grid grid-cols-[1.05fr_0.95fr] gap-3 rounded-[28px] bg-gradient-to-r from-[#066C31] via-[#0B8C40] to-[#35A5DA] px-4 py-4 shadow-[0_18px_30px_rgba(0,0,0,0.18)]">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-100">Get Discount</p>
                  <p className="text-4xl font-black leading-none">25%</p>
                  <p className="max-w-[12rem] text-sm text-emerald-50">On vegetables, fruits, and farm-fresh seasonal picks.</p>
                  <Link to="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#067A38]">
                    Shop Now
                    <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="overflow-hidden rounded-[24px] bg-white/20 shadow-inner shadow-white/20">
                  <img src={discountProduceImage} alt="Fresh produce basket" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[22px] bg-white/12 px-3 py-2">
                <p className="text-[11px] text-emerald-100">Ready now</p>
                <p className="text-lg font-bold">{readyNowCount}</p>
              </div>
              <div className="rounded-[22px] bg-white/12 px-3 py-2">
                <p className="text-[11px] text-emerald-100">In view</p>
                <p className="text-lg font-bold">{filtered.length}</p>
              </div>
              <div className="rounded-[22px] bg-white/12 px-3 py-2">
                <p className="text-[11px] text-emerald-100">Categories</p>
                <p className="text-lg font-bold">{categoryOptions.length - 1}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Helping Our Neighbors Grow and Thrive</h2>
              <p className="text-xs text-slate-500">Simple, community-focused tools for buying and selling farm-fresh food.</p>
            </div>
            <button type="button" onClick={() => setSelectedCategory('ALL')} className="text-xs font-semibold text-farm-green">
              View all
            </button>
          </div>
          <article className="rounded-[28px] bg-white p-4 shadow-soft">
            <p className="text-sm leading-7 text-slate-600">We offer simple, community-focused tools to make buying and selling farm-fresh food a breeze:</p>
          </article>
          <div className="grid gap-3 sm:grid-cols-2">
            {serviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-[26px] border border-emerald-100 bg-white p-4 shadow-soft transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-farm-green">
                    <Icon size={18} />
                    <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.copy}</p>
                </article>
              );
            })}
          </div>
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleCategories.map((category) => {
              const active = selectedCategory === category;
              const visual = CATEGORY_VISUALS[category] || { label: 'FM', tint: 'from-emerald-100 to-lime-100' };
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === category ? 'ALL' : category)}
                  className={`min-w-[96px] snap-start rounded-[26px] border px-3 py-3 text-left transition ${
                    active ? 'border-emerald-200 bg-white shadow-lg' : 'border-transparent bg-white/80 shadow-soft'
                  }`}
                >
                  <div className="mb-3 overflow-hidden rounded-2xl">
                    <img src={visual.image} alt={category} className="h-12 w-full object-cover" />
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-slate-800">{category}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <Sparkles size={16} className="text-farm-green" />
              Today&apos;s Harvests
            </h2>
            <Link to="/marketplace" className="text-xs font-semibold text-farm-green">See all</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-64 rounded-[28px]" />)}
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
              <button type="button" onClick={load} className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-red-700">
                Retry
              </button>
            </div>
          ) : trendingProducts.length ? (
            <div className="grid grid-cols-2 gap-3">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={mapProduct(product)} onAdd={() => onAdd(product)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No products available.</p>
          )}
        </section>

        <section id="contact" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">Contact</h2>
            <Link to="/map" className="text-xs font-semibold text-farm-green">Open map</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-[28px] bg-white p-4 shadow-soft">
              <div className="flex items-center gap-2 text-farm-green">
                <ShieldCheck size={18} />
                <h3 className="text-sm font-bold text-slate-900">Reach the Pula Harvest team</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">Need help with a listing, delivery, or farmer onboarding? Use the marketplace chat tools or connect with nearby growers through the platform.</p>
            </article>
            <article className="rounded-[28px] bg-white p-4 shadow-soft">
              <div className="flex items-center gap-2 text-farm-green">
                <Truck size={18} />
                <h3 className="text-sm font-bold text-slate-900">Choose your handoff</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">Arrange doorstep delivery for convenience or coordinate a farm pickup when you want the full local market experience.</p>
            </article>
          </div>
        </section>

        <section id="faqs" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <Sprout size={16} className="text-farm-green" />
              FAQs
            </h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">Helpful answers</span>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[24px] bg-white p-4 shadow-soft">
                <h3 className="text-sm font-bold text-slate-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <CalendarClock size={16} className="text-farm-green" />
              Coming Soon
            </h2>
            <span className="text-xs font-semibold text-slate-400">Updated live</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {upcomingHarvests.map((product) => (
              <ProductCard key={`upcoming-${product.id}`} product={mapProduct(product, Number(product.price) * 1.18)} onAdd={() => onAdd(product)} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1 text-base font-bold text-slate-900">
              <Sparkles size={16} className="text-farm-green" />
              Fresh Finds of the Day
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {freshFinds.map((product) => (
              <ProductCard key={`fresh-${product.id}`} product={mapProduct(product)} onAdd={() => onAdd(product)} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
