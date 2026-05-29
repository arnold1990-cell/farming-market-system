export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  const cls = type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : type === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200';
  return (
    <div className={`fixed top-20 right-4 z-[60] border rounded-xl px-4 py-3 shadow-soft ${cls}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm">{message}</span>
        <button className="text-xs opacity-70" onClick={onClose}>x</button>
      </div>
    </div>
  );
}
