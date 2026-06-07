import { CalendarDays, Home, Map, Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';
import { getCartCount } from '../services/cartService';

const getHomePath = (user) => {
  if (!user) return '/';
  if (user.role === 'FARMER') return '/farmer/dashboard';
  if (user.role === 'ADMIN') return '/admin/dashboard';
  if (user.role === 'DELIVERY_AGENT') return '/delivery/dashboard';
  return '/buyer/dashboard';
};

const getCalendarPath = (user) => {
  if (!user) return '/calendar';
  if (user.role === 'FARMER') return '/farmer/calendar';
  if (user.role === 'ADMIN') return '/admin/dashboard';
  return '/calendar';
};

const getProfilePath = (user) => {
  if (!user) return '/login';
  if (user.role === 'FARMER') return '/farmer/profile';
  if (user.role === 'ADMIN') return '/admin/users';
  if (user.role === 'DELIVERY_AGENT') return '/delivery/dashboard';
  return '/login';
};

export default function BottomNavigation({ role = 'BUYER' }) {
  const { pathname } = useLocation();
  const user = getCurrentUser();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let active = true;

    const syncCart = async () => {
      try {
        const count = await getCartCount();
        if (active) setCartCount(count);
      } catch (_) {
        if (active) setCartCount(0);
      }
    };

    syncCart();
    window.addEventListener('cart-updated', syncCart);
    return () => {
      active = false;
      window.removeEventListener('cart-updated', syncCart);
    };
  }, []);

  const items = [
    { path: getHomePath(isAuthenticated() ? user : null), label: 'Home', icon: Home },
    { path: '/marketplace', label: 'Market', icon: Search },
    { path: '/map', label: 'Map', icon: Map, center: true },
    { path: getCalendarPath(isAuthenticated() ? user : null), label: 'Calendar', icon: CalendarDays },
    { path: getProfilePath(isAuthenticated() ? user : null), label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-10px_30px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-7 flex justify-center">
        <Link
          to="/cart"
          className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-farm-green text-white shadow-[0_16px_32px_rgba(8,160,69,0.35)]"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-amber-400 px-1.5 py-0.5 text-center text-[10px] font-bold text-slate-900">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          ) : null}
        </Link>
      </div>
      <div className="grid grid-cols-5 items-end pt-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link key={`${role}-${item.label}`} to={item.path} className="min-w-0 px-1 py-1">
              <span className={`flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-medium transition ${active && !item.center ? 'bg-farm-mint text-farm-green' : 'text-gray-500'}`}>
                <span className={`${item.center ? 'rounded-full bg-farm-green p-3 text-white shadow-lg -translate-y-3' : ''}`}><Icon size={17} /></span>
                <span className="mt-1 truncate">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
