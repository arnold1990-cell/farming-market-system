import { useMemo, useState } from 'react';
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Leaf, MapPin, Sprout } from 'lucide-react';
import MobileMenuButton from './MobileMenuButton';

const statCards = [
  { label: 'Ready Now', value: 6, suffix: 'items', icon: Leaf, cardClass: 'border-emerald-100 bg-emerald-50/70', iconClass: 'bg-emerald-100 text-emerald-700' },
  { label: 'This Week', value: 14, suffix: 'items', icon: CalendarDays, cardClass: 'border-amber-100 bg-amber-50/70', iconClass: 'bg-amber-100 text-amber-700' },
  { label: 'This Month', value: 37, suffix: 'items', icon: CalendarDays, cardClass: 'border-sky-100 bg-sky-50/80', iconClass: 'bg-sky-100 text-sky-700' },
  { label: 'Farmers', value: 8, suffix: 'active', icon: Sprout, cardClass: 'border-violet-100 bg-violet-50/80', iconClass: 'bg-violet-100 text-violet-700' }
];

const dateCards = [
  { day: 'Mon', date: 9 },
  { day: 'Tue', date: 10 },
  { day: 'Wed', date: 11 },
  { day: 'Thu', date: 12, active: true },
  { day: 'Fri', date: 13 },
  { day: 'Sat', date: 14 },
  { day: 'Sun', date: 15 },
  { day: 'Mon', date: 16 }
];

const categoryChips = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Poultry', 'Grains'];

const scheduleItems = [
  {
    id: 'apples',
    name: 'Red Apples',
    category: 'Fruits',
    badge: 'READY NOW',
    farm: 'Green Valley Farm',
    location: 'Gaborone',
    available: '150 kg',
    unit: 'Available',
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eggs',
    name: 'Free Range Eggs',
    category: 'Poultry',
    badge: 'READY NOW',
    farm: 'Happy Hen Farm',
    location: 'Gaborone',
    available: '80 trays',
    unit: 'Available',
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'spinach',
    name: 'Baby Spinach Bundle',
    category: 'Vegetables',
    badge: 'TOMORROW',
    farm: 'Fresh Fields Farm',
    location: 'Gaborone',
    available: '60 bundles',
    unit: 'Available',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'milk',
    name: 'Fresh Dairy Milk',
    category: 'Dairy',
    badge: 'THIS WEEK',
    farm: 'Moo Valley Dairy',
    location: 'Gaborone',
    available: '40 litres',
    unit: 'Available',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
  }
];

const badgeStyles = {
  'READY NOW': 'bg-emerald-600 text-white',
  TOMORROW: 'bg-sky-500 text-white',
  'THIS WEEK': 'bg-violet-500 text-white'
};

export default function HarvestCalendar({ items = [], showOwner = false }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'All') return scheduleItems;
    return scheduleItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const liveItemCount = items.length;

  return (
    <div className="space-y-3 pb-2">
      <section className="-mx-4 overflow-hidden rounded-b-[28px] bg-gradient-to-b from-[#0fa24a] via-[#0b9441] to-[#0a8b3d] px-4 pb-4 pt-4 text-white shadow-[0_18px_40px_rgba(8,160,69,0.24)]">
        <div className="mx-auto w-full max-w-[480px] space-y-3">
          <div className="flex items-center justify-between">
            <MobileMenuButton />
            <div className="text-center">
              <p className="text-[10px] font-medium text-emerald-100">Your location</p>
              <p className="inline-flex items-center gap-1 text-[13px] font-semibold">
                <MapPin size={12} />
                Gaborone, Botswana
              </p>
            </div>
            <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur" aria-label="Notifications">
              <Bell size={16} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-yellow-300" />
            </button>
          </div>

          <div className="rounded-[24px] bg-white px-3.5 pb-3.5 pt-3 text-slate-900 shadow-[0_14px_36px_rgba(0,0,0,0.14)]">
            <div className="max-w-[14rem]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Pula Harvest</p>
              <h1 className="mt-1.5 text-[2rem] font-black leading-none text-slate-950">Harvest Calendar</h1>
              <p className="mt-1 text-[15px] text-slate-600">Fresh produce, right on time.</p>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 min-[430px]:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`rounded-[18px] border px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.05)] ${card.cardClass}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.iconClass}`}>
                      <Icon size={15} />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold leading-tight text-slate-700">{card.label}</p>
                    <div className="mt-1">
                      <span className="text-[2rem] font-black leading-none text-slate-950">{card.value}</span>
                      <span className="block text-[11px] text-slate-500">{card.suffix}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {liveItemCount ? (
              <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                Live calendar feed loaded: {liveItemCount} items
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-3.5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[1.2rem] font-black leading-none text-slate-950 min-[390px]:text-[1.35rem]">June 2026</h2>
            <div className="flex items-center gap-1 text-slate-400">
              <button type="button" className="rounded-full p-1 hover:bg-slate-100" aria-label="Previous dates">
                <ChevronLeft size={17} />
              </button>
              <button type="button" className="rounded-full p-1 hover:bg-slate-100" aria-label="Next dates">
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
          <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 px-3 text-xs font-semibold text-farm-green">
            <CalendarDays size={15} />
            Today
          </button>
        </div>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dateCards.map((card) => (
            <button
              key={`${card.day}-${card.date}`}
              type="button"
              className={`min-w-[58px] rounded-[16px] border px-2 py-2.5 text-center shadow-sm min-[390px]:min-w-[62px] ${card.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-100 bg-white text-slate-700'}`}
            >
              <p className={`text-xs ${card.active ? 'text-emerald-50' : 'text-slate-500'}`}>{card.day}</p>
              <p className="mt-1 text-[1.8rem] font-black leading-none">{card.date}</p>
              <span className={`mt-1.5 inline-block h-2 w-2 rounded-full ${card.active ? 'bg-yellow-300' : 'bg-emerald-600'}`} />
            </button>
          ))}
        </div>
      </section>

      <section className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setSelectedCategory(chip)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-sm transition ${selectedCategory === chip ? 'bg-farm-green text-white' : 'bg-white text-slate-700'}`}
          >
            {chip}
          </button>
        ))}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[1.7rem] font-black text-slate-950">Harvest schedule</h2>
            {showOwner ? <p className="text-xs text-slate-500">Farmer details are included below.</p> : null}
          </div>
          <button type="button" className="text-[13px] font-semibold text-farm-green">
            View all
          </button>
        </div>

        <div className="space-y-2.5">
          {visibleItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[22px] bg-white p-2.5 shadow-soft">
              <div className="flex items-center gap-2.5">
                <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-[18px] object-cover" />
                <div className="min-w-0 flex-1">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeStyles[item.badge]}`}>
                    {item.badge}
                  </span>
                  <h3 className="mt-1.5 text-[1.05rem] font-black leading-tight text-slate-950">{item.name}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {item.farm}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {item.location}
                    </span>
                    {showOwner ? <span>{item.category}</span> : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="rounded-[16px] bg-emerald-50 px-2.5 py-2 text-right">
                    <p className="text-lg font-black leading-none text-farm-green">{item.available}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-emerald-700">{item.unit}</p>
                  </div>
                  <button type="button" aria-label={`Open ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-farm-green text-white">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
