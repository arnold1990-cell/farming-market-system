import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../services/authService';
import { getCartCount } from '../services/cartService';
import BrandLogo from './BrandLogo';

const roleHome = {
  BUYER: '/',
  FARMER: '/farmer/dashboard',
  ADMIN: '/admin/dashboard',
  DELIVERY_AGENT: '/agent/dashboard'
};

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const load = async () => setCartCount(await getCartCount());
    load();
    const onUpdate = () => load();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('cart-updated', onUpdate);
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('cart-updated', onUpdate);
    };
  }, []);

  const onLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 leading-tight">
          <BrandLogo priority className="shrink-0" />
          <span className="hidden text-[11px] text-gray-500 lg:block">Connecting Farmers & Buyers Across Botswana</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link className="hover:text-farm-green" to="/marketplace">Marketplace</Link>
          <Link className="hover:text-farm-green" to="/about">About</Link>
          <Link className="hover:text-farm-green inline-flex items-center gap-1" to="/cart"><ShoppingCart size={16} />Cart ({cartCount})</Link>
          <a className="hover:text-farm-green" href="#how-it-works">How it Works</a>
          <a className="hover:text-farm-green" href="#seller-cta">Become a Seller</a>
        </nav>

        <div className="hidden md:flex gap-2 items-center">
          {user ? (
            <>
              <button className="text-sm text-gray-700 hover:text-farm-green" onClick={() => navigate(roleHome[user.role] || '/')}>{user.email}</button>
              <button className="text-sm text-red-600 font-medium" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-farm-green text-white text-sm font-semibold hover:opacity-90">Register</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2 text-sm">
          <BrandLogo className="mx-auto shrink-0 pb-2" />
          <Link onClick={() => setOpen(false)} className="block py-2" to="/marketplace">Marketplace</Link>
          <Link onClick={() => setOpen(false)} className="block py-2" to="/about">About</Link>
          <Link onClick={() => setOpen(false)} className="block py-2" to="/cart">Cart ({cartCount})</Link>
          <a onClick={() => setOpen(false)} className="block py-2" href="#how-it-works">How it Works</a>
          <a onClick={() => setOpen(false)} className="block py-2" href="#seller-cta">Become a Seller</a>
          {!user ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link onClick={() => setOpen(false)} to="/login" className="py-2 text-center rounded-xl border border-gray-200">Login</Link>
              <Link onClick={() => setOpen(false)} to="/register" className="py-2 text-center rounded-xl bg-farm-green text-white">Register</Link>
            </div>
          ) : (
            <button onClick={() => { setOpen(false); onLogout(); }} className="text-red-600 py-2">Logout</button>
          )}
        </div>
      ) : null}
    </header>
  );
}
