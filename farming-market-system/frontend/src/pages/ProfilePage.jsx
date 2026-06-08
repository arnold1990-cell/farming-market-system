import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Mail, UserRound } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { getCurrentUser, isAuthenticated, logoutUser } from '../services/authService';

const roleLinks = {
  BUYER: [
    { label: 'My dashboard', to: '/buyer/dashboard' },
    { label: 'My orders', to: '/orders' }
  ],
  FARMER: [
    { label: 'Farm dashboard', to: '/farmer/dashboard' },
    { label: 'Farm profile', to: '/farmer/profile' }
  ],
  ADMIN: [
    { label: 'Admin dashboard', to: '/admin/dashboard' },
    { label: 'Manage users', to: '/admin/users' }
  ],
  DELIVERY_AGENT: [
    { label: 'Delivery dashboard', to: '/delivery/dashboard' }
  ]
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const authenticated = isAuthenticated() && user;
  const links = roleLinks[user?.role] || [];

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <AppLayout title="Profile" subtitle="Your Pula Harvest account">
      <div className="space-y-4">
        <section className="rounded-[30px] bg-white/90 p-5 shadow-soft">
          {authenticated ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-farm-green to-emerald-500 text-white shadow-soft">
                  <UserRound size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Account</p>
                  <h1 className="mt-1 text-2xl font-black text-slate-900">{user.email}</h1>
                  <p className="mt-1 text-sm text-slate-500">Role: {user.role.replaceAll('_', ' ')}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {links.map((item) => (
                  <Link key={item.to} to={item.to} className="rounded-[22px] border border-emerald-100 bg-[#f8fbf6] px-4 py-4 text-sm font-semibold text-slate-800">
                    {item.label}
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-50 text-emerald-700">
                <Mail size={28} />
              </div>
              <h1 className="mt-4 text-2xl font-black text-slate-900">Sign in to manage your profile.</h1>
              <p className="mt-2 text-sm text-slate-500">Access orders, farm tools, and saved account details from one place.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link to="/login" className="rounded-[22px] bg-farm-green px-4 py-3 text-center text-sm font-semibold text-white">
                  Login
                </Link>
                <Link to="/register" className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  Register
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
