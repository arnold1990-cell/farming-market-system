import { CalendarDays, Home, Map, Search, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/home', label: 'Home', icon: Home, matchers: ['/', '/home', '/buyer/dashboard', '/farmer/dashboard', '/delivery/dashboard', '/admin/dashboard'] },
  { path: '/market', label: 'Market', icon: Search, matchers: ['/market', '/marketplace'] },
  { path: '/map', label: 'Map', icon: Map, matchers: ['/map', '/buyer/map'], center: true },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays, matchers: ['/calendar', '/buyer/calendar', '/farmer/calendar'] },
  { path: '/profile', label: 'Profile', icon: User, matchers: ['/profile', '/farmer/profile', '/admin/users'] }
];

export default function BottomNavigation({ role = 'BUYER' }) {
  const { pathname } = useLocation();
  const isActive = (matchers) =>
    matchers.some((matcher) => pathname === matcher || (matcher !== '/' && pathname.startsWith(`${matcher}/`)));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/96 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_36px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto grid w-full max-w-screen-sm grid-cols-5 items-end gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.matchers);
          return (
            <Link key={`${role}-${item.label}`} to={item.path} className="min-w-0 px-1">
              {item.center ? (
                <span className="flex flex-col items-center justify-end">
                  <span className={`-mt-7 flex h-16 w-16 items-center justify-center rounded-[28px] border-4 border-[#f4f8f1] shadow-[0_18px_34px_rgba(8,160,69,0.25)] transition ${active ? 'bg-farm-green text-white' : 'bg-white text-farm-green'}`}>
                    <Icon size={24} />
                  </span>
                  <span className={`mt-1 text-[10px] font-semibold ${active ? 'text-farm-green' : 'text-slate-500'}`}>{item.label}</span>
                </span>
              ) : (
                <span className={`flex flex-col items-center justify-center rounded-[22px] px-1 py-2 text-[10px] font-semibold transition ${active ? 'bg-farm-mint text-farm-green' : 'text-slate-500'}`}>
                  <Icon size={18} />
                  <span className="mt-1 truncate">{item.label}</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
