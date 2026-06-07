import { getCurrentUser } from '../services/authService';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';

export default function MobileAppShell({ children, title = 'Pula Harvest', subtitle, showSearch = false, searchValue, onSearchChange, onSearchSubmit, showBottomNav = true }) {
  const user = getCurrentUser();
  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-x-clip overflow-y-auto bg-transparent [-webkit-overflow-scrolling:touch]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-lime-100/60 blur-3xl" />
      </div>
      <MobileHeader
        title={title}
        subtitle={subtitle}
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        user={user}
      />
      <main className="mx-auto w-full max-w-screen-sm px-4 pb-28 pt-4 sm:px-5">{children}</main>
      {showBottomNav ? <BottomNavigation role={user?.role || 'BUYER'} /> : null}
    </div>
  );
}
