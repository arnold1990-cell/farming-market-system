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
    <div className="space-y-4 pb-3">
      <section className="-mx-4 overflow-hidden rounded-b-[36px] bg-gradient-to-b from-[#0fa24a] via-[#0b9441] to-[#0a8b3d] px-4 pb-6 pt-5 text-white shadow-[0_22px_56px_rgba(8,160,69,0.28)] sm:-mx-5 sm:px-5">
        <div className="mx-auto max-w-screen-sm space-y-4">
          <div className="flex items-center justify-between">
            <MobileMenuButton />
            <div className="text-center">
              <p className="text-[11px] font-medium text-emerald-100">Your location</p>
              <p className="inline-flex items-center gap-1 text-sm font-semibold">
                <MapPin size={14} />
                Gaborone, Botswana
              </p>
            </div>
            <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-yellow-300" />
            </button>
          </div>

          <div className="rounded-[34px] bg-white px-4 pb-5 pt-4 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
            <div className="max-w-[15rem]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Pula Harvest</p>
              <h1 className="mt-2 text-[2.1rem] font-black leading-none text-slate-950">Harvest Calendar</h1>
              <p className="mt-2 text-base text-slate-600">Fresh produce, right on time.</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`rounded-[26px] border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${card.cardClass}`}>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}>
                      <Icon size={20} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-700">{card.label}</p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-4xl font-black leading-none text-slate-950">{card.value}</span>
                      <span className="pb-1 text-sm text-slate-500">{card.suffix}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {liveItemCount ? (
              <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                Live calendar feed loaded: {liveItemCount} items
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[2rem] font-black leading-none text-slate-950">June 2026</h2>
            <div className="flex items-center gap-1 text-slate-400">
              <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" aria-label="Previous dates">
                <ChevronLeft size={20} />
              </button>
              <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" aria-label="Next dates">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full border border-emerald-200 px-4 text-sm font-semibold text-farm-green">
            <CalendarDays size={18} />
            Today
          </button>
        </div>

        <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dateCards.map((card) => (
            <button
              key={`${card.day}-${card.date}`}
              type="button"
              className={`min-w-[74px] rounded-[22px] border px-3 py-3 text-center shadow-sm ${card.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-100 bg-white text-slate-700'}`}
            >
              <p className={`text-sm ${card.active ? 'text-emerald-50' : 'text-slate-500'}`}>{card.day}</p>
              <p className="mt-1 text-3xl font-black leading-none">{card.date}</p>
              <span className={`mt-2 inline-block h-2.5 w-2.5 rounded-full ${card.active ? 'bg-yellow-300' : 'bg-emerald-600'}`} />
            </button>
          ))}
        </div>
      </section>

      <section className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setSelectedCategory(chip)}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${selectedCategory === chip ? 'bg-farm-green text-white' : 'bg-white text-slate-700'}`}
          >
            {chip}
          </button>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Harvest schedule</h2>
            {showOwner ? <p className="text-sm text-slate-500">Farmer details are included below.</p> : null}
          </div>
          <button type="button" className="text-sm font-semibold text-farm-green">
            View all
          </button>
        </div>

        <div className="space-y-3">
          {visibleItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[28px] bg-white p-3 shadow-soft">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-24 w-24 shrink-0 rounded-[22px] object-cover" />
                <div className="min-w-0 flex-1">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeStyles[item.badge]}`}>
                    {item.badge}
                  </span>
                  <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">{item.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} />
                      {item.farm}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} />
                      {item.location}
                    </span>
                    {showOwner ? <span>{item.category}</span> : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-3">
                  <div className="rounded-[20px] bg-emerald-50 px-3 py-2 text-right">
                    <p className="text-xl font-black leading-none text-farm-green">{item.available}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">{item.unit}</p>
                  </div>
                  <button type="button" aria-label={`Open ${item.name}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-farm-green text-white">
                    <ChevronRight size={20} />
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
