import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';

const menuItems = [
  { label: 'Home', to: '/home' },
  { label: 'About', to: '/home#about' },
  { label: 'Services', to: '/home#services' },
  { label: 'Marketplace', to: '/market' },
  { label: 'Contact', to: '/home#contact' },
  { label: 'FAQs', to: '/home#faqs' }
];

export default function MobileMenuOverlay({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0e3d1f]/30 px-4 py-5 backdrop-blur-xl" onClick={onClose}>
      <div className="mx-auto w-full max-w-screen-sm">
        <div
          className="overflow-hidden rounded-[34px] border border-white/70 bg-white/92 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.24)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-700/70">Pula Harvest</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Fresh farm produce for Botswana.</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-6 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className="flex items-center justify-between rounded-[24px] border border-emerald-100 bg-white px-4 py-4 text-base font-semibold text-slate-800 shadow-[0_10px_25px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/70"
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
