import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

const menuItems = [
  { label: 'Home', to: '/home' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/home#services' },
  { label: 'Marketplace', to: '/market' },
  { label: 'Contact', to: '/home#contact' },
  { label: 'FAQs', to: '/home#faqs' }
];

export default function MobileMenuOverlay({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0e3d1f]/30 px-4 py-5 backdrop-blur-xl" onClick={onClose}>
      <div className="mx-auto w-full max-w-[480px]">
        <div
          className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 p-4 shadow-[0_24px_72px_rgba(15,23,42,0.24)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <BrandLogo className="shrink-0" />
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">Fresh farm produce for Botswana.</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-5 space-y-2.5">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className="flex items-center justify-between rounded-[20px] border border-emerald-100 bg-white px-4 py-3 text-[15px] font-semibold text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/70"
              >
                <span>{item.label}</span>
                <ChevronRight size={18} className="text-emerald-600" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
