import { Home, Search, Map, ClipboardList, User, LayoutDashboard, Package, CloudRain, Users, Settings, Truck, Route, History, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const roleNav = {
  BUYER: [
    { path: '/buyer/dashboard', label: 'Home', icon: Home },
    { path: '/marketplace', label: 'Market', icon: Search },
    { path: '/buyer/map', label: 'Map', icon: Map, center: true },
    { path: '/buyer/calendar', label: 'Calendar', icon: ClipboardList },
    { path: '/login', label: 'Profile', icon: User }
  ],
  FARMER: [
    { path: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/farmer/products', label: 'Produce', icon: Package },
    { path: '/farmer/calendar', label: 'Calendar', icon: ClipboardList },
    { path: '/farmer/weather', label: 'Weather', icon: CloudRain },
    { path: '/farmer/profile', label: 'Profile', icon: User }
  ],
  ADMIN: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/farmers', label: 'Farmers', icon: Users },
    { path: '/admin/products', label: 'Listings', icon: ClipboardList },
    { path: '/admin/alerts', label: 'Alerts', icon: Settings },
    { path: '/admin/dashboard', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/users', label: 'Settings', icon: User }
  ],
  DELIVERY_AGENT: [
    { path: '/delivery/dashboard', label: 'Deliveries', icon: Truck },
    { path: '/delivery/dashboard', label: 'Routes', icon: Route },
    { path: '/delivery/dashboard', label: 'History', icon: History },
    { path: '/login', label: 'Profile', icon: User }
  ]
};

export default function BottomNavigation({ role = 'BUYER' }) {
  const { pathname } = useLocation();
  const items = roleNav[role] || roleNav.BUYER;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className={`grid ${items.length === 4 ? 'grid-cols-4' : 'grid-cols-5'} items-center`}>
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
