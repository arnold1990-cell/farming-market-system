import { Bell, Search } from 'lucide-react';

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
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-farm-green">{title}</p>
            {subtitle ? <p className="truncate text-xs text-gray-500">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full border border-gray-200 bg-white p-2 text-gray-600" aria-label="Notifications">
              <Bell size={17} />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-farm-mint text-sm font-semibold text-farm-green">
              {user?.email?.[0]?.toUpperCase() || 'G'}
            </div>
          </div>
        </div>
        {showSearch ? (
          <form onSubmit={onSearchSubmit} className="mt-3">
            <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <Search size={17} className="text-gray-500" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search products, farmers"
                value={searchValue}
                onChange={onSearchChange}
              />
            </label>
          </form>
        ) : null}
      </div>
    </header>
  );
}
