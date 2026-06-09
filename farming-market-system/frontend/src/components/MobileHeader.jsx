import { Bell, Search } from 'lucide-react';
import MobileMenuButton from './MobileMenuButton';
import BrandLogo from './BrandLogo';

export default function MobileHeader({
  title = 'Pula Harvest',
  subtitle,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  showSearch = false,
  user,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[#f8fbf6]/90 backdrop-blur">
      <div className="mx-auto max-w-screen-sm px-4 pb-4 pt-4 sm:px-5">
        <div className="glass-card rounded-[28px] border border-white/80 px-4 py-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <MobileMenuButton
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-slate-700 shadow-sm"
                iconSize={18}
              />
              <div className="min-w-0">
                <BrandLogo className="w-full max-w-[100px]" imgClassName="h-12 w-auto" />
                <p className="mt-2 truncate text-lg font-black tracking-tight text-farm-green">{title}</p>
                {subtitle ? <p className="mt-1 truncate text-xs text-gray-500">{subtitle}</p> : <p className="mt-1 text-xs text-gray-500">Fresh produce, harvest visibility, and trusted local farmers.</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-full border border-emerald-100 bg-white p-2.5 text-gray-600 shadow-sm" aria-label="Notifications">
                <Bell size={17} />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-farm-green to-emerald-500 text-sm font-semibold text-white shadow-sm">
                {user?.email?.[0]?.toUpperCase() || 'G'}
              </div>
            </div>
          </div>
          {showSearch ? (
            <form onSubmit={onSearchSubmit} className="mt-4">
              <label className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-3 shadow-sm">
                <Search size={17} className="text-gray-500" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search produce, farmers, or categories"
                  value={searchValue}
                  onChange={onSearchChange}
                />
              </label>
            </form>
          ) : null}
        </div>
        <div className="px-1 pt-2">
          <div className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
            Live marketplace access
          </div>
        </div>
      </div>
    </header>
  );
}
