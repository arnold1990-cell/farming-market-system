export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-farm-green transition hover:bg-emerald-100 active:scale-[0.98]"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
