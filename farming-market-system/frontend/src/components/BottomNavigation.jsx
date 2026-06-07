import { Home, Search, ShoppingCart, ClipboardList, User, LayoutDashboard, Package, Users, Truck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../services/authService';

const publicNav = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/marketplace', label: 'Market', icon: Search },
  { path: '/cart', label: 'Cart', icon: ShoppingCart, center: true },
  { path: '/login', label: 'Sign In', icon: User }
];

const roleNav = {
  BUYER: [
    { path: '/buyer/dashboard', label: 'Home', icon: Home },
    { path: '/marketplace', label: 'Market', icon: Search },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, center: true },
    { path: '/orders', label: 'Orders', icon: ClipboardList }
  ],
  FARMER: [
    { path: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/farmer/products', label: 'Produce', icon: Package },
    { path: '/farmer/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/farmer/calendar', label: 'Calendar', icon: ClipboardList },
    { path: '/farmer/profile', label: 'Profile', icon: User }
  ],
  ADMIN: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/farmers', label: 'Farmers', icon: Users },
    { path: '/admin/products', label: 'Listings', icon: Package },
    { path: '/admin/users', label: 'Settings', icon: User }
  ],
  DELIVERY_AGENT: [
    { path: '/delivery/dashboard', label: 'Deliveries', icon: Truck }
  ]
};

export default function BottomNavigation({ role = 'BUYER' }) {
  const { pathname } = useLocation();
  const user = getCurrentUser();
  const items = isAuthenticated() && user ? (roleNav[role] || roleNav.BUYER) : publicNav;
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5'
  }[items.length] || 'grid-cols-4';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className={`grid ${gridColsClass} items-center`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <Link key={`${role}-${item.label}`} to={item.path} className="min-w-0 px-1 py-1">
              <span className={`flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-medium transition ${active ? 'bg-farm-mint text-farm-green' : 'text-gray-500'}`}>
                <span className={`${item.center ? 'rounded-full bg-farm-green p-2 text-white shadow-lg' : ''}`}><Icon size={17} /></span>
                <span className="mt-1 truncate">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
