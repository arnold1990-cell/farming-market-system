import { Search } from 'lucide-react';
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
        <div className="glass-card rounded-[36px] border border-white/80 px-4 py-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="logoContainer min-w-0">
              <BrandLogo priority className="shrink-0" />
              <div className="min-w-0">
                <p className="brandTitle truncate">{title}</p>
                {subtitle ? <p className="brandSubtitle mt-1">{subtitle}</p> : <p className="brandSubtitle mt-1">Fresh produce, harvest visibility, and trusted local farmers.</p>}
              </div>
            </div>
            <MobileMenuButton
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F8F4] text-[#0A6B3A] shadow-[0_8px_18px_rgba(10,107,58,0.12)]"
              iconSize={20}
            />
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
