export default function ToastStack({ toasts, onClose }) {
  if (!toasts?.length) return null;
  return (
    <div className="fixed top-20 right-4 z-[70] space-y-2">
      {toasts.map((t) => {
        const cls = t.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : t.type === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200';
        return (
          <div key={t.id} className={`border rounded-xl px-4 py-3 shadow-soft ${cls}`}>
            <div className="flex items-center gap-3">
              <span className="text-sm">{t.message}</span>
              <button className="text-xs opacity-70" onClick={() => onClose(t.id)}>x</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
