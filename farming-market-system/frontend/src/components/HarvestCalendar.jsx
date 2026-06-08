import { useMemo, useState } from 'react';
import { Bell, CalendarDays, ChevronLeft, ChevronRight, MapPin, PackageCheck, Plus, Store, Truck, X } from 'lucide-react';
import MobileMenuButton from './MobileMenuButton';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import Select from './Select';

const monthLabel = (value) =>
  value.toLocaleDateString('en-BW', { month: 'long', year: 'numeric' });

const typeConfig = {
  ALL: { label: 'All', accent: 'bg-farm-green text-white' },
  HARVEST: { label: 'Harvest', icon: PackageCheck, badge: 'bg-emerald-600 text-white', chip: 'bg-emerald-50 text-emerald-700' },
  DELIVERY: { label: 'Delivery', icon: Truck, badge: 'bg-sky-500 text-white', chip: 'bg-sky-50 text-sky-700' },
  MARKET: { label: 'Market', icon: Store, badge: 'bg-amber-500 text-white', chip: 'bg-amber-50 text-amber-700' },
  REMINDER: { label: 'Reminder', icon: CalendarDays, badge: 'bg-violet-500 text-white', chip: 'bg-violet-50 text-violet-700' }
};

const initialForm = {
  title: '',
  description: '',
  eventDate: '',
  type: 'REMINDER',
  productId: '',
  publicEvent: false
};

export default function HarvestCalendar({
  events = [],
  loading = false,
  error = '',
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  onCreate,
  onUpdate,
  onDelete,
  canManage = false
}) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const visibleEvents = useMemo(() => {
    if (selectedType === 'ALL') return events;
    return events.filter((event) => event.type === selectedType);
  }, [events, selectedType]);

  const stats = useMemo(() => ({
    HARVEST: events.filter((event) => event.type === 'HARVEST').length,
    DELIVERY: events.filter((event) => event.type === 'DELIVERY').length,
    MARKET: events.filter((event) => event.type === 'MARKET').length,
    REMINDER: events.filter((event) => event.type === 'REMINDER').length
  }), [events]);

  const dateCards = useMemo(() => {
    const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    return Array.from({ length: 8 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        key: date.toISOString(),
        day: date.toLocaleDateString('en-BW', { weekday: 'short' }),
        date: date.getDate(),
        active: date.toDateString() === new Date().toDateString()
      };
    });
  }, [selectedMonth]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...initialForm,
      eventDate: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).toISOString().slice(0, 10)
    });
    setOpen(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      eventDate: event.eventDate || '',
      type: event.type || 'REMINDER',
      productId: event.productId || '',
      publicEvent: !!event.publicEvent
    });
    setOpen(true);
  };

  const submit = async () => {
    const payload = {
      title: form.title,
      description: form.description || null,
      eventDate: form.eventDate,
      type: form.type,
      productId: form.productId ? Number(form.productId) : null,
      publicEvent: !!form.publicEvent
    };
    if (editing?.persistedId) {
      await onUpdate(editing.persistedId, payload);
    } else {
      await onCreate(payload);
    }
    setOpen(false);
    setEditing(null);
  };

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
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-[14rem]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Pula Harvest</p>
                <h1 className="mt-1.5 text-[2rem] font-black leading-none text-slate-950">Harvest Calendar</h1>
                <p className="mt-1 text-[15px] text-slate-600">Harvest, delivery, market, and reminder events from live APIs.</p>
              </div>
              {canManage ? (
                <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-farm-green px-3 text-xs font-semibold text-white">
                  <Plus size={15} />
                  Add
                </button>
              ) : null}
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 min-[430px]:grid-cols-4">
              {['HARVEST', 'DELIVERY', 'MARKET', 'REMINDER'].map((type) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                return (
                  <div key={type} className="rounded-[18px] border border-emerald-100 bg-[#f8fbf6] px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-farm-green">
                      <Icon size={15} />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold leading-tight text-slate-700">{config.label}</p>
                    <div className="mt-1">
                      <span className="text-[2rem] font-black leading-none text-slate-950">{stats[type]}</span>
                      <span className="block text-[11px] text-slate-500">events</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-3.5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[1.2rem] font-black leading-none text-slate-950 min-[390px]:text-[1.35rem]">{monthLabel(selectedMonth)}</h2>
            <div className="flex items-center gap-1 text-slate-400">
              <button type="button" className="rounded-full p-1 hover:bg-slate-100" aria-label="Previous month" onClick={onPreviousMonth}>
                <ChevronLeft size={17} />
              </button>
              <button type="button" className="rounded-full p-1 hover:bg-slate-100" aria-label="Next month" onClick={onNextMonth}>
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
          <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 px-3 text-xs font-semibold text-farm-green">
            <CalendarDays size={15} />
            {events.length} items
          </div>
        </div>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dateCards.map((card) => (
            <div
              key={card.key}
              className={`min-w-[58px] rounded-[16px] border px-2 py-2.5 text-center shadow-sm min-[390px]:min-w-[62px] ${card.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-100 bg-white text-slate-700'}`}
            >
              <p className={`text-xs ${card.active ? 'text-emerald-50' : 'text-slate-500'}`}>{card.day}</p>
              <p className="mt-1 text-[1.8rem] font-black leading-none">{card.date}</p>
              <span className={`mt-1.5 inline-block h-2 w-2 rounded-full ${card.active ? 'bg-yellow-300' : 'bg-emerald-600'}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Object.entries(typeConfig).map(([type, config]) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-sm transition ${selectedType === type ? 'bg-farm-green text-white' : 'bg-white text-slate-700'}`}
          >
            {config.label}
          </button>
        ))}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[1.7rem] font-black text-slate-950">Schedule</h2>
            <p className="text-xs text-slate-500">Only real backend events and generated product/order schedules are shown.</p>
          </div>
        </div>

        {error ? <div className="rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
        {loading ? <div className="rounded-[22px] bg-white p-4 text-sm text-slate-500 shadow-soft">Loading calendar events...</div> : null}
        {!loading && !visibleEvents.length ? <div className="rounded-[22px] bg-white p-4 text-sm text-slate-500 shadow-soft">No calendar events found for this month.</div> : null}

        <div className="space-y-2.5">
          {visibleEvents.map((event) => {
            const config = typeConfig[event.type] || typeConfig.REMINDER;
            const Icon = config.icon || CalendarDays;
            return (
              <article key={event.id} className="overflow-hidden rounded-[22px] bg-white p-3 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#f4f8f1] text-farm-green">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${config.badge || 'bg-slate-700 text-white'}`}>
                        {config.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{event.eventDate}</span>
                      {event.generated ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Generated</span> : null}
                    </div>
                    <h3 className="mt-1.5 text-[1.05rem] font-black leading-tight text-slate-950">{event.title}</h3>
                    {event.description ? <p className="mt-1 text-xs leading-5 text-slate-600">{event.description}</p> : null}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {event.productName ? <span className={`rounded-full px-2 py-1 ${config.chip || 'bg-slate-100 text-slate-700'}`}>{event.productName}</span> : null}
                      {event.categoryName ? <span>{event.categoryName}</span> : null}
                      {event.locationName ? <span className="inline-flex items-center gap-1"><MapPin size={12} />{event.locationName}</span> : null}
                    </div>
                  </div>
                  {event.editable && event.persistedId ? (
                    <div className="flex shrink-0 flex-col gap-2">
                      <button type="button" onClick={() => openEdit(event)} className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-farm-green">
                        Edit
                      </button>
                      <button type="button" onClick={() => onDelete(event.persistedId)} className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600">
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Event' : 'Create Event'}>
        <div className="space-y-3">
          <Input placeholder="Event title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <textarea
            className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <Input type="date" value={form.eventDate} onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))} />
          <Select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
            <option value="REMINDER">Reminder</option>
            <option value="MARKET">Market</option>
            <option value="HARVEST">Harvest</option>
            <option value="DELIVERY">Delivery</option>
          </Select>
          <Input placeholder="Related product ID (optional)" value={form.productId} onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.publicEvent} onChange={(event) => setForm((current) => ({ ...current, publicEvent: event.target.checked }))} />
            Public event (admin only)
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <Button onClick={submit}>{editing ? 'Save changes' : 'Create event'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
