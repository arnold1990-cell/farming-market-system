import { getCurrentUser } from '../services/authService';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';

export default function MobileAppShell({ children, title = 'Pula Harvest', subtitle, showSearch = false, searchValue, onSearchChange, onSearchSubmit, showBottomNav = true }) {
  const user = getCurrentUser();
  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-x-clip overflow-y-auto bg-farm-gray [-webkit-overflow-scrolling:touch]">
      <MobileHeader
        title={title}
        subtitle={subtitle}
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        user={user}
      />
      <main className="mx-auto w-full max-w-5xl px-3 pb-28 pt-4 sm:px-4">{children}</main>
      {showBottomNav ? <BottomNavigation role={user?.role || 'BUYER'} /> : null}
    </div>
  );
}
