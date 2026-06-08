import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';
import MobileMenuOverlay from './MobileMenuOverlay';
import { MobileShellContext } from './mobileShellContext';

export default function MobileAppShell({
  children,
  title = 'Pula Harvest',
  subtitle,
  showSearch = false,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  showBottomNav = true,
  hideHeader = false
}) {
  const user = getCurrentUser();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const shellValue = useMemo(
    () => ({
      menuOpen,
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
      toggleMenu: () => setMenuOpen((current) => !current)
    }),
    [menuOpen]
  );

  return (
    <MobileShellContext.Provider value={shellValue}>
      <div className="min-h-screen min-h-[100dvh] w-full overflow-x-clip overflow-y-auto bg-transparent [-webkit-overflow-scrolling:touch]">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-lime-100/60 blur-3xl" />
        </div>
        {!hideHeader ? (
          <MobileHeader
            title={title}
            subtitle={subtitle}
            showSearch={showSearch}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
            user={user}
          />
        ) : null}
        <main className="mx-auto w-full max-w-[480px] px-4 pb-28 pt-4">{children}</main>
        {showBottomNav ? <BottomNavigation role={user?.role || 'BUYER'} /> : null}
        <MobileMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </MobileShellContext.Provider>
  );
}
